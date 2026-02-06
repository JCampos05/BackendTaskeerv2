const { Invitacion, Usuario, Tablero, Lista, TableroCompartido, ListaCompartida } = require('../../models/index.models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const notificacionService = require('../Notificacion.service');
const sseService = require('../SSE.service');

class InvitacionService {
    async crear(datos, idUsuarioOrigen) {
        const { emailDestino, tipo, idRecurso, rol, mensaje } = datos;

        const usuarioOrigen = await Usuario.findByPk(idUsuarioOrigen);
        if (!usuarioOrigen) {
            throw new Error('Usuario origen no encontrado');
        }

        let recurso;
        if (tipo === 'tablero') {
            recurso = await Tablero.findByPk(idRecurso);
            if (!recurso) {
                throw new Error('Tablero no encontrado');
            }
            if (recurso.idUsuario !== idUsuarioOrigen) {
                throw new Error('No tienes permiso para compartir este tablero');
            }
            if (!recurso.compartible) {
                throw new Error('Este tablero no está habilitado para compartir');
            }
        } else if (tipo === 'lista') {
            recurso = await Lista.findByPk(idRecurso);
            if (!recurso) {
                throw new Error('Lista no encontrada');
            }
            if (recurso.idUsuario !== idUsuarioOrigen) {
                throw new Error('No tienes permiso para compartir esta lista');
            }
            if (!recurso.compartible) {
                throw new Error('Esta lista no está habilitada para compartir');
            }
        } else {
            throw new Error('Tipo de invitación no válido');
        }

        const usuarioDestino = await Usuario.findOne({ where: { email: emailDestino } });
        if (!usuarioDestino) {
            throw new Error('No existe un usuario registrado con ese email');
        }

        if (usuarioDestino.idUsuario === idUsuarioOrigen) {
            throw new Error('No puedes enviarte una invitación a ti mismo');
        }

        const invitacionExistente = await Invitacion.findOne({
            where: {
                emailDestino,
                tipo,
                idRecurso,
                estado: 'pendiente'
            }
        });

        if (invitacionExistente) {
            throw new Error('Ya existe una invitación pendiente para este usuario');
        }

        let yaCompartido = false;
        if (tipo === 'tablero') {
            yaCompartido = await TableroCompartido.findOne({
                where: {
                    idTablero: idRecurso,
                    idUsuario: usuarioDestino.idUsuario,
                    activo: true
                }
            });
        } else {
            yaCompartido = await ListaCompartida.findOne({
                where: {
                    idLista: idRecurso,
                    idUsuario: usuarioDestino.idUsuario,
                    activo: true
                }
            });
        }

        if (yaCompartido) {
            throw new Error('Este recurso ya está compartido con ese usuario');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

        const invitacion = await Invitacion.create({
            emailDestino,
            idUsuarioOrigen,
            tipo,
            idRecurso,
            rol: rol || 'colaborador',
            token,
            fechaExpiracion,
            estado: 'pendiente',
            mensaje
        });

        const tipoNotificacion = tipo === 'tablero' ? 'invitacion_tablero' : 'invitacion_lista';
        const nombreRecurso = recurso.nombre;

        const notificacion = await notificacionService.crear({
            idUsuario: usuarioDestino.idUsuario,
            tipo: tipoNotificacion,
            titulo: `Nueva invitación a ${tipo}`,
            mensaje: `${usuarioOrigen.nombre} ${usuarioOrigen.apellido || ''} te ha invitado a colaborar en ${tipo === 'tablero' ? 'el tablero' : 'la lista'} "${nombreRecurso}"`,
            datosAdicionales: {
                idInvitacion: invitacion.idInvitacion,
                nombreRecurso,
                emailOrigen: usuarioOrigen.email,
                nombreOrigen: `${usuarioOrigen.nombre} ${usuarioOrigen.apellido || ''}`,
                rol: invitacion.rol,
                mensajePersonalizado: mensaje
            },
            idRecurso: idRecurso,
            tipoRecurso: tipo
        });

        sseService.enviarNotificacion(usuarioDestino.idUsuario, notificacion);

        return invitacion;
    }

    async crearMultiples(datos, idUsuarioOrigen) {
        const { emails, tipo, idRecurso, rol, mensaje } = datos;

        if (!Array.isArray(emails) || emails.length === 0) {
            throw new Error('Debes proporcionar al menos un email');
        }

        const resultados = {
            exitosas: [],
            fallidas: []
        };

        for (const email of emails) {
            try {
                const invitacion = await this.crear({
                    emailDestino: email,
                    tipo,
                    idRecurso,
                    rol,
                    mensaje
                }, idUsuarioOrigen);

                resultados.exitosas.push({
                    email,
                    invitacion
                });
            } catch (error) {
                resultados.fallidas.push({
                    email,
                    error: error.message
                });
            }
        }

        return resultados;
    }

    async aceptar(token, idUsuario) {
        const invitacion = await Invitacion.findOne({
            where: { token },
            include: [
                {
                    model: Usuario,
                    as: 'usuarioOrigen',
                    attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                }
            ]
        });

        if (!invitacion) {
            throw new Error('Invitación no encontrada');
        }

        if (invitacion.estado !== 'pendiente') {
            throw new Error(`Esta invitación ya fue ${invitacion.estado}`);
        }

        if (new Date() > new Date(invitacion.fechaExpiracion)) {
            await invitacion.update({ estado: 'expirado' });
            throw new Error('Esta invitación ha expirado');
        }

        const usuario = await Usuario.findByPk(idUsuario);
        if (usuario.email !== invitacion.emailDestino) {
            throw new Error('Esta invitación no está dirigida a tu cuenta');
        }

        if (invitacion.tipo === 'tablero') {
            const tablero = await Tablero.findByPk(invitacion.idRecurso);
            if (!tablero) {
                throw new Error('El tablero ya no existe');
            }

            await TableroCompartido.create({
                idTablero: invitacion.idRecurso,
                idUsuario,
                rol: invitacion.rol,
                esCreador: false,
                compartidoPor: invitacion.idUsuarioOrigen,
                aceptado: true,
                activo: true
            });

            const listas = await Lista.findAll({
                where: { idTablero: invitacion.idRecurso }
            });

            for (const lista of listas) {
                const yaCompartida = await ListaCompartida.findOne({
                    where: {
                        idLista: lista.idLista,
                        idUsuario,
                        activo: true
                    }
                });

                if (!yaCompartida) {
                    await ListaCompartida.create({
                        idLista: lista.idLista,
                        idUsuario,
                        rol: invitacion.rol,
                        esCreador: false,
                        compartidoPor: invitacion.idUsuarioOrigen,
                        aceptado: true,
                        activo: true
                    });
                }
            }
        } else if (invitacion.tipo === 'lista') {
            const lista = await Lista.findByPk(invitacion.idRecurso);
            if (!lista) {
                throw new Error('La lista ya no existe');
            }

            await ListaCompartida.create({
                idLista: invitacion.idRecurso,
                idUsuario,
                rol: invitacion.rol,
                esCreador: false,
                compartidoPor: invitacion.idUsuarioOrigen,
                aceptado: true,
                activo: true
            });
        }

        await invitacion.update({
            estado: 'aceptado',
            fechaAceptado: new Date()
        });

        const notificacion = await notificacionService.crear({
            idUsuario: invitacion.idUsuarioOrigen,
            tipo: 'otro',
            titulo: 'Invitación aceptada',
            mensaje: `${usuario.nombre} ${usuario.apellido || ''} ha aceptado tu invitación`,
            datosAdicionales: {
                emailUsuario: usuario.email,
                nombreUsuario: `${usuario.nombre} ${usuario.apellido || ''}`,
                tipo: invitacion.tipo,
                idRecurso: invitacion.idRecurso
            }
        });

        sseService.enviarNotificacion(invitacion.idUsuarioOrigen, notificacion);

        return invitacion;
    }

    async rechazar(token, idUsuario) {
        const invitacion = await Invitacion.findOne({
            where: { token }
        });

        if (!invitacion) {
            throw new Error('Invitación no encontrada');
        }

        if (invitacion.estado !== 'pendiente') {
            throw new Error(`Esta invitación ya fue ${invitacion.estado}`);
        }

        const usuario = await Usuario.findByPk(idUsuario);
        if (usuario.email !== invitacion.emailDestino) {
            throw new Error('Esta invitación no está dirigida a tu cuenta');
        }

        await invitacion.update({ estado: 'rechazado' });

        const notificacion = await notificacionService.crear({
            idUsuario: invitacion.idUsuarioOrigen,
            tipo: 'otro',
            titulo: 'Invitación rechazada',
            mensaje: `${usuario.nombre} ${usuario.apellido || ''} ha rechazado tu invitación`,
            datosAdicionales: {
                emailUsuario: usuario.email,
                nombreUsuario: `${usuario.nombre} ${usuario.apellido || ''}`,
                tipo: invitacion.tipo,
                idRecurso: invitacion.idRecurso
            }
        });

        sseService.enviarNotificacion(invitacion.idUsuarioOrigen, notificacion);

        return { mensaje: 'Invitación rechazada correctamente' };
    }

    async cancelar(idInvitacion, idUsuario) {
        const invitacion = await Invitacion.findByPk(idInvitacion);

        if (!invitacion) {
            throw new Error('Invitación no encontrada');
        }

        if (invitacion.idUsuarioOrigen !== idUsuario) {
            throw new Error('No tienes permiso para cancelar esta invitación');
        }

        if (invitacion.estado !== 'pendiente') {
            throw new Error(`No se puede cancelar una invitación ${invitacion.estado}`);
        }

        await invitacion.update({ estado: 'cancelado' });

        return { mensaje: 'Invitación cancelada correctamente' };
    }

    async obtenerPendientes(idUsuario) {
        const usuario = await Usuario.findByPk(idUsuario);

        const invitaciones = await Invitacion.findAll({
            where: {
                emailDestino: usuario.email,
                estado: 'pendiente',
                fechaExpiracion: {
                    [Op.gt]: new Date()
                }
            },
            include: [
                {
                    model: Usuario,
                    as: 'usuarioOrigen',
                    attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                }
            ],
            order: [['fechaCreacion', 'DESC']]
        });

        const invitacionesConRecurso = await Promise.all(
            invitaciones.map(async (inv) => {
                const invJSON = inv.toJSON();

                if (inv.tipo === 'tablero') {
                    const tablero = await Tablero.findByPk(inv.idRecurso, {
                        attributes: ['idTablero', 'nombre', 'descripcion', 'color', 'icono']
                    });
                    invJSON.recurso = tablero;
                } else if (inv.tipo === 'lista') {
                    const lista = await Lista.findByPk(inv.idRecurso, {
                        attributes: ['idLista', 'nombre', 'color', 'icono'],
                        include: [
                            {
                                model: Tablero,
                                as: 'tablero',
                                attributes: ['nombre']
                            }
                        ]
                    });
                    invJSON.recurso = lista;
                }

                return invJSON;
            })
        );

        return invitacionesConRecurso;
    }

    async obtenerEnviadas(idUsuario) {
        const invitaciones = await Invitacion.findAll({
            where: { idUsuarioOrigen: idUsuario },
            order: [['fechaCreacion', 'DESC']]
        });

        const invitacionesConRecurso = await Promise.all(
            invitaciones.map(async (inv) => {
                const invJSON = inv.toJSON();

                if (inv.tipo === 'tablero') {
                    const tablero = await Tablero.findByPk(inv.idRecurso, {
                        attributes: ['idTablero', 'nombre', 'descripcion', 'color', 'icono']
                    });
                    invJSON.recurso = tablero;
                } else if (inv.tipo === 'lista') {
                    const lista = await Lista.findByPk(inv.idRecurso, {
                        attributes: ['idLista', 'nombre', 'color', 'icono']
                    });
                    invJSON.recurso = lista;
                }

                return invJSON;
            })
        );

        return invitacionesConRecurso;
    }

    async limpiarExpiradas() {
        const ahora = new Date();

        const resultado = await Invitacion.update(
            { estado: 'expirado' },
            {
                where: {
                    estado: 'pendiente',
                    fechaExpiracion: {
                        [Op.lt]: ahora
                    }
                }
            }
        );

        return {
            mensaje: 'Invitaciones expiradas actualizadas',
            cantidad: resultado[0]
        };
    }

    async aceptarPorNotificacion(idNotificacion, idUsuario) {
        const { Notificacion } = require('../../models/index.models');

        const notificacion = await Notificacion.findByPk(idNotificacion);

        if (!notificacion) {
            throw new Error('Notificación no encontrada');
        }

        if (notificacion.idUsuario !== idUsuario) {
            throw new Error('Esta notificación no te pertenece');
        }

        const idInvitacion = notificacion.datosAdicionales?.idInvitacion;

        if (!idInvitacion) {
            throw new Error('No se encontró la invitación asociada a esta notificación');
        }

        const invitacion = await Invitacion.findByPk(idInvitacion, {
            include: [
                {
                    model: Usuario,
                    as: 'usuarioOrigen',
                    attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                }
            ]
        });

        if (!invitacion) {
            throw new Error('Invitación no encontrada');
        }

        if (invitacion.estado !== 'pendiente') {
            throw new Error(`Esta invitación ya fue ${invitacion.estado}`);
        }

        if (new Date() > new Date(invitacion.fechaExpiracion)) {
            await invitacion.update({ estado: 'expirado' });
            throw new Error('Esta invitación ha expirado');
        }

        const usuario = await Usuario.findByPk(idUsuario);
        if (usuario.email !== invitacion.emailDestino) {
            throw new Error('Esta invitación no está dirigida a tu cuenta');
        }

        if (invitacion.tipo === 'tablero') {
            const tablero = await Tablero.findByPk(invitacion.idRecurso);
            if (!tablero) {
                throw new Error('El tablero ya no existe');
            }

            const yaCompartido = await TableroCompartido.findOne({
                where: {
                    idTablero: invitacion.idRecurso,
                    idUsuario,
                    activo: true
                }
            });

            if (!yaCompartido) {
                await TableroCompartido.create({
                    idTablero: invitacion.idRecurso,
                    idUsuario,
                    rol: invitacion.rol,
                    esCreador: false,
                    compartidoPor: invitacion.idUsuarioOrigen,
                    aceptado: true,
                    activo: true
                });

                const listas = await Lista.findAll({
                    where: { idTablero: invitacion.idRecurso }
                });

                for (const lista of listas) {
                    const listaYaCompartida = await ListaCompartida.findOne({
                        where: {
                            idLista: lista.idLista,
                            idUsuario,
                            activo: true
                        }
                    });

                    if (!listaYaCompartida) {
                        await ListaCompartida.create({
                            idLista: lista.idLista,
                            idUsuario,
                            rol: invitacion.rol,
                            esCreador: false,
                            compartidoPor: invitacion.idUsuarioOrigen,
                            aceptado: true,
                            activo: true
                        });
                    }
                }
            }
        } else if (invitacion.tipo === 'lista') {
            const lista = await Lista.findByPk(invitacion.idRecurso);
            if (!lista) {
                throw new Error('La lista ya no existe');
            }

            const yaCompartida = await ListaCompartida.findOne({
                where: {
                    idLista: invitacion.idRecurso,
                    idUsuario,
                    activo: true
                }
            });

            if (!yaCompartida) {
                await ListaCompartida.create({
                    idLista: invitacion.idRecurso,
                    idUsuario,
                    rol: invitacion.rol,
                    esCreador: false,
                    compartidoPor: invitacion.idUsuarioOrigen,
                    aceptado: true,
                    activo: true
                });
            }
        }

        await invitacion.update({
            estado: 'aceptado',
            fechaAceptado: new Date()
        });

        await notificacion.update({
            leido: true,
            fechaLeido: new Date(),
            datosAdicionales: {
                ...notificacion.datosAdicionales,
                estadoInvitacion: 'aceptado'
            }
        });

        const notificacionOrigen = await notificacionService.crear({
            idUsuario: invitacion.idUsuarioOrigen,
            tipo: 'otro',
            titulo: 'Invitación aceptada',
            mensaje: `${usuario.nombre} ${usuario.apellido || ''} ha aceptado tu invitación`,
            datosAdicionales: {
                emailUsuario: usuario.email,
                nombreUsuario: `${usuario.nombre} ${usuario.apellido || ''}`,
                tipo: invitacion.tipo,
                idRecurso: invitacion.idRecurso
            }
        });

        sseService.enviarNotificacion(invitacion.idUsuarioOrigen, notificacionOrigen);

        return {
            invitacion,
            tablero: invitacion.tipo === 'tablero' ? await Tablero.findByPk(invitacion.idRecurso) : null,
            lista: invitacion.tipo === 'lista' ? await Lista.findByPk(invitacion.idRecurso) : null
        };
    }

    async rechazarPorNotificacion(idNotificacion, idUsuario) {
        const { Notificacion } = require('../../models/index.models');

        const notificacion = await Notificacion.findByPk(idNotificacion);

        if (!notificacion) {
            throw new Error('Notificación no encontrada');
        }

        if (notificacion.idUsuario !== idUsuario) {
            throw new Error('Esta notificación no te pertenece');
        }

        const idInvitacion = notificacion.datosAdicionales?.idInvitacion;

        if (!idInvitacion) {
            throw new Error('No se encontró la invitación asociada a esta notificación');
        }

        const invitacion = await Invitacion.findByPk(idInvitacion);

        if (!invitacion) {
            throw new Error('Invitación no encontrada');
        }

        if (invitacion.estado !== 'pendiente') {
            throw new Error(`Esta invitación ya fue ${invitacion.estado}`);
        }

        const usuario = await Usuario.findByPk(idUsuario);
        if (usuario.email !== invitacion.emailDestino) {
            throw new Error('Esta invitación no está dirigida a tu cuenta');
        }

        await invitacion.update({ estado: 'rechazado' });

        await notificacion.update({
            leido: true,
            fechaLeido: new Date(),
            datosAdicionales: {
                ...notificacion.datosAdicionales,
                estadoInvitacion: 'rechazado'
            }
        });

        const notificacionOrigen = await notificacionService.crear({
            idUsuario: invitacion.idUsuarioOrigen,
            tipo: 'otro',
            titulo: 'Invitación rechazada',
            mensaje: `${usuario.nombre} ${usuario.apellido || ''} ha rechazado tu invitación`,
            datosAdicionales: {
                emailUsuario: usuario.email,
                nombreUsuario: `${usuario.nombre} ${usuario.apellido || ''}`,
                tipo: invitacion.tipo,
                idRecurso: invitacion.idRecurso
            }
        });

        sseService.enviarNotificacion(invitacion.idUsuarioOrigen, notificacionOrigen);

        return { mensaje: 'Invitación rechazada correctamente' };
    }
}

module.exports = new InvitacionService();