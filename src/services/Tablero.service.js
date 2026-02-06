const { Tablero, Lista, Usuario, Tarea, TableroCompartido } = require('../models/index.models');
const crypto = require('crypto');

class TableroService {
    async crear(datos, idUsuario) {
        const { nombre, descripcion, color, icono, compartible } = datos;

        let claveCompartir = null;
        if (compartible) {
            claveCompartir = crypto.randomBytes(6).toString('hex');
        }

        const nuevoTablero = await Tablero.create({
            nombre,
            descripcion,
            color,
            icono,
            idUsuario,
            compartible: compartible || false,
            claveCompartir
        });

        // NUEVO: Si el tablero es compartible, crear registro en tablero_compartido para el propietario
        if (compartible) {
            await TableroCompartido.create({
                idTablero: nuevoTablero.idTablero,
                idUsuario: idUsuario,
                rol: 'admin',
                esCreador: true,
                compartidoPor: idUsuario,
                aceptado: true,
                activo: true
            });
        }

        return nuevoTablero;
    }

    async obtenerPorId(idTablero, idUsuario) {
        const tablero = await Tablero.findOne({
            where: { idTablero },
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
            ],
            order: [[{ model: Lista, as: 'listas' }, 'orden', 'ASC']]
        });

        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para ver este tablero');
        }

        return tablero;
    }

    async obtenerPorUsuario(idUsuario) {
        // Obtener IDs de tableros compartidos donde NO es creador
        const tablerosCompartidosIds = await TableroCompartido.findAll({
            where: {
                idUsuario,
                esCreador: false,
                activo: true
            },
            attributes: ['idTablero']
        });

        const idsExcluir = tablerosCompartidosIds.map(tc => tc.idTablero);

        const tableros = await Tablero.findAll({
            where: { 
                idUsuario,
                // Excluir tableros compartidos donde NO es creador
                ...(idsExcluir.length > 0 && {
                    idTablero: {
                        [require('sequelize').Op.notIn]: idsExcluir
                    }
                })
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

        const tablerosConEstadisticas = tableros.map(tablero => {
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

            return {
                ...tableroJSON,
                cantidadListas,
                cantidadTareas,
                tareasCompletadas
            };
        });

        return tablerosConEstadisticas;
    }

    async obtenerCompleto(idTablero, idUsuario) {
        const tablero = await Tablero.findOne({
            where: { idTablero },
            include: [
                {
                    model: Lista,
                    as: 'listas',
                    attributes: ['idLista', 'nombre', 'color', 'icono', 'orden'],
                    include: [
                        {
                            model: Usuario,
                            as: 'propietario',
                            attributes: ['idUsuario', 'nombre', 'apellido']
                        }
                    ]
                },
                {
                    model: Usuario,
                    as: 'propietario',
                    attributes: ['idUsuario', 'nombre', 'apellido']
                }
            ],
            order: [[{ model: Lista, as: 'listas' }, 'orden', 'ASC']]
        });

        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        // CAMBIO: Permitir acceso si es owner O tiene acceso compartido
        const esOwner = tablero.idUsuario === idUsuario;

        if (!esOwner) {
            // Verificar si tiene acceso compartido
            const compartido = await TableroCompartido.findOne({
                where: {
                    idTablero,
                    idUsuario,
                    activo: true,
                    aceptado: true
                }
            });

            if (!compartido) {
                throw new Error('No tienes permiso para ver este tablero');
            }
        }

        return tablero;
    }

    async actualizar(idTablero, datos, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        // CAMBIO: Verificar permisos usando el servicio compartido
        const tableroCompartidoService = require('./compartir/TableroCompartido.service');
        const permisos = await tableroCompartidoService.obtenerPermisos(idTablero, idUsuario);

        if (!permisos.permisos.editar) {
            throw new Error('No tienes permiso para actualizar este tablero');
        }

        // Si se está activando compartible y no tiene clave
        if (datos.compartible && !tablero.claveCompartir) {
            datos.claveCompartir = crypto.randomBytes(6).toString('hex');

            // NUEVO: Crear registro en tablero_compartido si no existe
            const compartidoExiste = await TableroCompartido.findOne({
                where: {
                    idTablero,
                    idUsuario,
                    esCreador: true
                }
            });

            if (!compartidoExiste) {
                await TableroCompartido.create({
                    idTablero,
                    idUsuario,
                    rol: 'admin',
                    esCreador: true,
                    compartidoPor: idUsuario,
                    aceptado: true,
                    activo: true
                });
            }
        }

        // Si se está desactivando compartible
        if (datos.compartible === false) {
            datos.claveCompartir = null;

            // NUEVO: Desactivar todos los registros compartidos excepto el del creador
            await TableroCompartido.update(
                { activo: false },
                {
                    where: {
                        idTablero,
                        esCreador: false
                    }
                }
            );
        }

        await tablero.update(datos);
        return tablero;
    }

    async eliminar(idTablero, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        // CAMBIO: Verificar permisos usando el servicio compartido
        const tableroCompartidoService = require('./compartir/TableroCompartido.service');
        const permisos = await tableroCompartidoService.obtenerPermisos(idTablero, idUsuario);

        // Validar permiso de eliminar (propietario, admin, colaborador, editor)
        if (!permisos.permisos.eliminar) {
            throw new Error('No tienes permiso para eliminar este tablero');
        }

        await tablero.destroy();
        return { mensaje: 'Tablero eliminado correctamente' };
    }

    async generarNuevaClave(idTablero, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para generar una nueva clave');
        }

        const nuevaClave = crypto.randomBytes(6).toString('hex');
        await tablero.update({ claveCompartir: nuevaClave, compartible: true });

        // Asegurar que el propietario tiene su registro en tablero_compartido
        const compartidoExiste = await TableroCompartido.findOne({
            where: {
                idTablero,
                idUsuario,
                esCreador: true
            }
        });

        if (!compartidoExiste) {
            await TableroCompartido.create({
                idTablero,
                idUsuario,
                rol: 'admin',
                esCreador: true,
                compartidoPor: idUsuario,
                aceptado: true,
                activo: true
            });
        }

        return { claveCompartir: nuevaClave };
    }

    // NUEVO: Método para unirse a un tablero con clave
    async unirseConClave(claveCompartir, idUsuario) {
        const tablero = await Tablero.findOne({
            where: { claveCompartir },
            include: [
                {
                    model: Usuario,
                    as: 'propietario',
                    attributes: ['idUsuario', 'nombre', 'apellido']
                }
            ]
        });

        if (!tablero) {
            throw new Error('Clave de acceso inválida');
        }

        if (!tablero.compartible) {
            throw new Error('Este tablero no está habilitado para compartir');
        }

        if (tablero.idUsuario === idUsuario) {
            throw new Error('No puedes unirte a tu propio tablero');
        }

        // Verificar si ya está compartido
        const yaCompartido = await TableroCompartido.findOne({
            where: {
                idTablero: tablero.idTablero,
                idUsuario,
                activo: true
            }
        });

        if (yaCompartido) {
            throw new Error('Ya eres miembro de este tablero');
        }

        // Crear registro en tablero_compartido
        const nuevoCompartido = await TableroCompartido.create({
            idTablero: tablero.idTablero,
            idUsuario,
            rol: 'colaborador',
            esCreador: false,
            compartidoPor: tablero.idUsuario,
            aceptado: true,
            activo: true
        });

        // Compartir también todas las listas del tablero
        const listas = await Lista.findAll({
            where: { idTablero: tablero.idTablero }
        });

        const ListaCompartida = require('../models/index.models').ListaCompartida;
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
                    rol: 'colaborador',
                    esCreador: false,
                    compartidoPor: tablero.idUsuario,
                    aceptado: true,
                    activo: true
                });
            }
        }

        return {
            compartido: nuevoCompartido,
            tablero: {
                idTablero: tablero.idTablero,
                nombre: tablero.nombre,
                descripcion: tablero.descripcion,
                color: tablero.color,
                icono: tablero.icono,
                propietario: tablero.propietario
            }
        };
    }
}

module.exports = new TableroService();