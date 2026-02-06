const { TableroCompartido, Tablero, Usuario, Lista, ListaCompartida, Tarea } = require('../../models/index.models');
const { Op } = require('sequelize');
const notificacionService = require('../Notificacion.service');
const sseService = require('../SSE.service');

class TableroCompartidoService {
    async obtenerColaboradores(idTablero, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        const tieneAcceso = await this.verificarAcceso(idTablero, idUsuario);
        if (!tieneAcceso) {
            throw new Error('No tienes acceso a este tablero');
        }

        const colaboradores = await TableroCompartido.findAll({
            where: {
                idTablero,
                activo: true
            },
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                },
                {
                    model: Usuario,
                    as: 'compartidoPorUsuario',
                    attributes: ['idUsuario', 'nombre', 'apellido']
                }
            ],
            order: [['esCreador', 'DESC'], ['fechaCompartido', 'ASC']]
        });

        const propietario = await Usuario.findByPk(tablero.idUsuario, {
            attributes: ['idUsuario', 'nombre', 'apellido', 'email']
        });

        return {
            propietario,
            colaboradores
        };
    }

    async actualizarRol(idTablero, idUsuarioColaborador, nuevoRol, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        const esOwner = tablero.idUsuario === idUsuario;
        if (!esOwner) {
            const permisoUsuario = await this.obtenerPermisos(idTablero, idUsuario);
            if (permisoUsuario.rol !== 'admin') {
                throw new Error('Solo el propietario o administradores pueden cambiar roles');
            }
        }

        const compartido = await TableroCompartido.findOne({
            where: {
                idTablero,
                idUsuario: idUsuarioColaborador,
                activo: true
            }
        });

        if (!compartido) {
            throw new Error('El usuario no es colaborador de este tablero');
        }

        if (compartido.esCreador) {
            throw new Error('No se puede cambiar el rol del creador del tablero');
        }

        if (idUsuarioColaborador === tablero.idUsuario) {
            throw new Error('No se puede cambiar el rol del propietario');
        }

        await compartido.update({ rol: nuevoRol });

        const listas = await Lista.findAll({
            where: { idTablero }
        });

        for (const lista of listas) {
            await ListaCompartida.update(
                { rol: nuevoRol },
                {
                    where: {
                        idLista: lista.idLista,
                        idUsuario: idUsuarioColaborador,
                        activo: true
                    }
                }
            );
        }

        const usuario = await Usuario.findByPk(idUsuarioColaborador);
        const notificacion = await notificacionService.crear({
            idUsuario: idUsuarioColaborador,
            tipo: 'cambio_estado',
            titulo: 'Rol actualizado',
            mensaje: `Tu rol en el tablero "${tablero.nombre}" ha sido cambiado a ${nuevoRol}`,
            datosAdicionales: {
                nombreTablero: tablero.nombre,
                nuevoRol
            },
            idRecurso: idTablero,
            tipoRecurso: 'tablero'
        });

        sseService.enviarNotificacion(idUsuarioColaborador, notificacion);

        // NUEVO: Enviar evento de cambio de permisos
        sseService.enviarCambioPermisos(idUsuarioColaborador, {
            tipo: 'tablero',
            idRecurso: idTablero,
            nombreRecurso: tablero.nombre,
            nuevoRol: nuevoRol,
            accion: 'rol_actualizado'
        });

        return compartido;
    }

    async removerColaborador(idTablero, idUsuarioColaborador, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        const esOwner = tablero.idUsuario === idUsuario;
        if (!esOwner) {
            const permisoUsuario = await this.obtenerPermisos(idTablero, idUsuario);
            if (permisoUsuario.rol !== 'admin') {
                throw new Error('Solo el propietario o administradores pueden remover colaboradores');
            }
        }

        const compartido = await TableroCompartido.findOne({
            where: {
                idTablero,
                idUsuario: idUsuarioColaborador,
                activo: true
            }
        });

        if (!compartido) {
            throw new Error('El usuario no es colaborador de este tablero');
        }

        if (compartido.esCreador) {
            throw new Error('No se puede remover al creador del tablero');
        }

        if (idUsuarioColaborador === tablero.idUsuario) {
            throw new Error('No se puede remover al propietario');
        }

        await compartido.update({ activo: false });

        const listas = await Lista.findAll({
            where: { idTablero }
        });

        for (const lista of listas) {
            await ListaCompartida.update(
                { activo: false },
                {
                    where: {
                        idLista: lista.idLista,
                        idUsuario: idUsuarioColaborador,
                        activo: true
                    }
                }
            );
        }

        const usuario = await Usuario.findByPk(idUsuarioColaborador);
        const notificacion = await notificacionService.crear({
            idUsuario: idUsuarioColaborador,
            tipo: 'otro',
            titulo: 'Acceso removido',
            mensaje: `Has sido removido del tablero "${tablero.nombre}"`,
            datosAdicionales: {
                nombreTablero: tablero.nombre
            },
            idRecurso: idTablero,
            tipoRecurso: 'tablero'
        });

        sseService.enviarNotificacion(idUsuarioColaborador, notificacion);

        // NUEVO: Enviar evento de acceso removido
        sseService.enviarAccesoRemovido(idUsuarioColaborador, {
            tipo: 'tablero',
            idRecurso: idTablero,
            nombreRecurso: tablero.nombre,
            accion: 'acceso_removido'
        });

        return { mensaje: 'Colaborador removido correctamente' };
    }

    async abandonarTablero(idTablero, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario === idUsuario) {
            throw new Error('El propietario no puede abandonar su propio tablero');
        }

        const compartido = await TableroCompartido.findOne({
            where: {
                idTablero,
                idUsuario,
                activo: true
            }
        });

        if (!compartido) {
            throw new Error('No eres colaborador de este tablero');
        }

        await compartido.update({ activo: false });

        const listas = await Lista.findAll({
            where: { idTablero }
        });

        for (const lista of listas) {
            await ListaCompartida.update(
                { activo: false },
                {
                    where: {
                        idLista: lista.idLista,
                        idUsuario,
                        activo: true
                    }
                }
            );
        }

        return { mensaje: 'Has abandonado el tablero correctamente' };
    }

    async obtenerTablerosCompartidosConmigo(idUsuario) {
        const compartidos = await TableroCompartido.findAll({
            where: {
                idUsuario,
                activo: true,
                aceptado: true,
                //esCreador: false
            },
            include: [
                {
                    model: Tablero,
                    as: 'tablero',
                    include: [
                        {
                            model: Usuario,
                            as: 'propietario',
                            attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                        },
                        {
                            model: Lista,
                            as: 'listas',
                            attributes: ['idLista', 'nombre', 'color', 'icono', 'orden']
                        }
                    ]
                },
                {
                    model: Usuario,
                    as: 'compartidoPorUsuario',
                    attributes: ['idUsuario', 'nombre', 'apellido']
                }
            ],
            order: [['fechaCompartido', 'DESC']]
        });

        return compartidos;
    }

    async obtenerTablerosCompartiendose(idUsuario) {
        const tableros = await Tablero.findAll({
            where: { 
                idUsuario,
                compartible: true
            },
            include: [
                {
                    model: Lista,
                    as: 'listas',
                    attributes: ['idLista', 'nombre', 'color', 'icono', 'orden', 'importante'],
                    include: [
                        {
                            model: Tarea,
                            as: 'tareas',
                            attributes: ['idTarea', 'estado']
                        }
                    ]
                }
            ],
            order: [['fechaCreacion', 'DESC']]
        });

        const tablerosConEstadisticas = await Promise.all(tableros.map(async tablero => {
            const tableroJSON = tablero.toJSON();
            
            const cantidadListas = tableroJSON.listas ? tableroJSON.listas.length : 0;
            
            let cantidadTareas = 0;
            let tareasCompletadas = 0;
            
            if (tableroJSON.listas) {
                tableroJSON.listas.forEach(lista => {
                    if (lista.tareas) {
                        cantidadTareas += lista.tareas.length;
                        tareasCompletadas += lista.tareas.filter(tarea => tarea.estado === 'C').length;
                    }
                });
            }

            const colaboradores = await TableroCompartido.count({
                where: {
                    idTablero: tablero.idTablero,
                    activo: true,
                    aceptado: true,
                    esCreador: false
                }
            });
            
            return {
                ...tableroJSON,
                cantidadListas,
                cantidadTareas,
                tareasCompletadas,
                cantidadColaboradores: colaboradores
            };
        }));

        return tablerosConEstadisticas;
    }

    async verificarAcceso(idTablero, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            return false;
        }

        if (tablero.idUsuario === idUsuario) {
            return true;
        }

        const compartido = await TableroCompartido.findOne({
            where: {
                idTablero,
                idUsuario,
                activo: true,
                aceptado: true
            }
        });

        return !!compartido;
    }

    async obtenerPermisos(idTablero, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario === idUsuario) {
            return {
                esOwner: true,
                rol: 'admin',
                permisos: {
                    leer: true,
                    crear: true,
                    editar: true,
                    eliminar: true,
                    compartir: true,
                    administrar: true
                }
            };
        }

        const compartido = await TableroCompartido.findOne({
            where: {
                idTablero,
                idUsuario,
                activo: true,
                aceptado: true
            }
        });

        if (!compartido) {
            return {
                esOwner: false,
                rol: null,
                permisos: {
                    leer: false,
                    crear: false,
                    editar: false,
                    eliminar: false,
                    compartir: false,
                    administrar: false
                }
            };
        }

        const permisosPorRol = {
            visor: {
                leer: true,
                crear: false,
                editar: false,
                eliminar: false,
                compartir: false,
                administrar: false
            },
            editor: {
                leer: true,
                crear: false,
                editar: true,
                eliminar: true,
                compartir: false,
                administrar: false
            },
            colaborador: {
                leer: true,
                crear: true,
                editar: true,
                eliminar: true,
                compartir: false,
                administrar: false
            },
            admin: {
                leer: true,
                crear: true,
                editar: true,
                eliminar: true,
                compartir: true,
                administrar: true
            }
        };

        return {
            esOwner: false,
            rol: compartido.rol,
            permisos: permisosPorRol[compartido.rol]
        };
    }
}

module.exports = new TableroCompartidoService();