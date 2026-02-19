const { Lista, Tablero, Tarea, Usuario, ListaCompartida } = require('../models/index.models');
const crypto = require('crypto');

class ListaService {
    async crear(datos, idUsuario) {
        const { nombre, color, icono, importante, idTablero, compartible, orden } = datos;

        if (idTablero) {
            const tablero = await Tablero.findByPk(idTablero);
            if (!tablero) {
                throw new Error('Tablero no encontrado');
            }
            
            const esOwner = tablero.idUsuario === idUsuario;
            
            if (!esOwner) {
                const tableroCompartidoService = require('./compartir/TableroCompartido.service');
                const permisos = await tableroCompartidoService.obtenerPermisos(idTablero, idUsuario);
                
                if (!permisos.permisos.crear) {
                    throw new Error('No tienes permiso para agregar listas a este tablero');
                }
            }
        }

        let ordenFinal = orden;
        if (idTablero && (ordenFinal === undefined || ordenFinal === null)) {
            const ultimaLista = await Lista.findOne({
                where: { idTablero },
                order: [['orden', 'DESC']]
            });
            ordenFinal = ultimaLista ? ultimaLista.orden + 1 : 0;
        } else if (!idTablero) {
            ordenFinal = 0;
        }

        // NUEVO: Si la lista pertenece a un tablero, verificar si el tablero es compartible
        let compartibleFinal = compartible || false;
        let claveCompartir = null;
        
        if (idTablero) {
            const tablero = await Tablero.findByPk(idTablero);
            if (tablero && tablero.compartible) {
                // Si el tablero es compartible, la lista también debe serlo automáticamente
                compartibleFinal = true;
            }
        }
        
        if (compartibleFinal) {
            claveCompartir = crypto.randomBytes(6).toString('hex');
        }

        const nuevaLista = await Lista.create({
            nombre,
            color,
            icono,
            importante: importante || false,
            orden: ordenFinal,
            idTablero,
            idUsuario,
            compartible: compartibleFinal,
            claveCompartir
        });

        // NUEVO: Si la lista es compartible, crear registro en lista_compartida para el propietario
        if (compartibleFinal) {
            await ListaCompartida.create({
                idLista: nuevaLista.idLista,
                idUsuario: idUsuario,
                rol: 'admin',
                esCreador: true,
                compartidoPor: idUsuario,
                aceptado: true,
                activo: true
            });
        }

        // NUEVO: Si la lista pertenece a un tablero compartido, compartirla con los colaboradores
        if (idTablero && compartibleFinal) {
            const TableroCompartido = require('../models/index.models').TableroCompartido;
            const colaboradores = await TableroCompartido.findAll({
                where: {
                    idTablero,
                    activo: true,
                    aceptado: true,
                    idUsuario: {
                        [require('sequelize').Op.ne]: idUsuario // Excluir al creador de la lista
                    }
                }
            });

            for (const colaborador of colaboradores) {
                await ListaCompartida.create({
                    idLista: nuevaLista.idLista,
                    idUsuario: colaborador.idUsuario,
                    rol: colaborador.rol,
                    esCreador: false, // Los colaboradores del tablero NO son creadores de la lista
                    compartidoPor: idUsuario,
                    aceptado: true,
                    activo: true
                });
            }
        }

        return nuevaLista;
    }

    async obtenerPorId(idLista, idUsuario) {
        const lista = await Lista.findOne({
            where: { idLista },
            include: [
                {
                    model: Tablero,
                    as: 'tablero',
                    attributes: ['idTablero', 'nombre', 'color', 'icono']
                },
                {
                    model: Usuario,
                    as: 'propietario',
                    attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                }
            ]
        });

        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        // CAMBIO: Verificar acceso usando el servicio compartido
        const listaCompartidaService = require('./compartir/ListaCompartida.service');
        const tieneAcceso = await listaCompartidaService.verificarAcceso(idLista, idUsuario);

        if (!tieneAcceso) {
            throw new Error('No tienes permiso para ver esta lista');
        }

        return lista;
    }

    async obtenerPorUsuario(idUsuario) {
        // Obtener IDs de listas compartidas donde NO es creador
        const listasCompartidasIds = await ListaCompartida.findAll({
            where: {
                idUsuario,
                esCreador: false,
                activo: true
            },
            attributes: ['idLista']
        });

        const idsExcluir = listasCompartidasIds.map(lc => lc.idLista);

        const listas = await Lista.findAll({
            where: {
                idUsuario,
                // Excluir listas compartidas donde NO es creador
                ...(idsExcluir.length > 0 && {
                    idLista: {
                        [require('sequelize').Op.notIn]: idsExcluir
                    }
                })
            },
            include: [
                {
                    model: Tablero,
                    as: 'tablero',
                    attributes: ['idTablero', 'nombre', 'color', 'icono']
                },
                {
                    model: Tarea,
                    as: 'tareas',
                    attributes: ['idTarea', 'estado']
                }
            ],
            order: [['importante', 'DESC'], ['fechaCreacion', 'DESC']]
        });

        const listasConEstadisticas = listas.map(lista => {
            const listaJSON = lista.toJSON();

            const cantidadTareas = listaJSON.tareas ? listaJSON.tareas.length : 0;
            const tareasCompletadas = listaJSON.tareas
                ? listaJSON.tareas.filter(tarea => tarea.estado === 'C').length
                : 0;

            delete listaJSON.tareas;

            return {
                ...listaJSON,
                cantidadTareas,
                tareasCompletadas
            };
        });

        return listasConEstadisticas;
    }

    async obtenerPorTablero(idTablero, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        const esOwner = tablero.idUsuario === idUsuario;
        
        if (!esOwner) {
            const tableroCompartidoService = require('./compartir/TableroCompartido.service');
            const permisos = await tableroCompartidoService.obtenerPermisos(idTablero, idUsuario);
            
            if (!permisos.permisos.leer) {
                throw new Error('No tienes permiso para ver las listas de este tablero');
            }
        }

        const listas = await Lista.findAll({
            where: { idTablero },
            include: [
                {
                    model: Tarea,
                    as: 'tareas',
                    attributes: ['idTarea', 'nombre', 'estado', 'prioridad']
                }
            ],
            order: [['orden', 'ASC']]
        });

        return listas;
    }

    async obtenerConTareas(idLista, idUsuario) {
        const lista = await Lista.findOne({
            where: { idLista },
            include: [
                {
                    model: Tarea,
                    as: 'tareas',
                    include: [
                        {
                            model: Usuario,
                            as: 'usuarioAsignado',
                            attributes: ['idUsuario', 'nombre', 'apellido']
                        }
                    ],
                    order: [['fechaVencimiento', 'ASC']]
                }
            ]
        });

        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        // CAMBIO: Verificar acceso usando el servicio compartido
        const listaCompartidaService = require('./compartir/ListaCompartida.service');
        const tieneAcceso = await listaCompartidaService.verificarAcceso(idLista, idUsuario);

        if (!tieneAcceso) {
            throw new Error('No tienes permiso para ver esta lista');
        }

        return lista;
    }

    async actualizar(idLista, datos, idUsuario) {
        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        // CAMBIO: Verificar permisos usando el servicio compartido
        const listaCompartidaService = require('./compartir/ListaCompartida.service');
        const permisos = await listaCompartidaService.obtenerPermisos(idLista, idUsuario);

        if (!permisos.permisos.editar) {
            throw new Error('No tienes permiso para actualizar esta lista');
        }

        // Si se está activando compartible y no tiene clave
        if (datos.compartible && !lista.claveCompartir) {
            datos.claveCompartir = crypto.randomBytes(6).toString('hex');

            // NUEVO: Crear registro en lista_compartida si no existe
            const compartidoExiste = await ListaCompartida.findOne({
                where: {
                    idLista,
                    idUsuario,
                    esCreador: true
                }
            });

            if (!compartidoExiste) {
                await ListaCompartida.create({
                    idLista,
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
            await ListaCompartida.update(
                { activo: false },
                {
                    where: {
                        idLista,
                        esCreador: false
                    }
                }
            );
        }

        await lista.update(datos);
        return lista;
    }

    async eliminar(idLista, idUsuario) {
        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        // CAMBIO: Verificar permisos usando el servicio compartido
        const listaCompartidaService = require('./compartir/ListaCompartida.service');
        const permisos = await listaCompartidaService.obtenerPermisos(idLista, idUsuario);

        // Validar permiso de eliminar (propietario, admin, colaborador, editor)
        if (!permisos.permisos.eliminar) {
            throw new Error('No tienes permiso para eliminar esta lista');
        }

        await lista.destroy();
        return { mensaje: 'Lista eliminada correctamente' };
    }

    async reordenar(idTablero, ordenListas, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        const esOwner = tablero.idUsuario === idUsuario;
        
        if (!esOwner) {
            const tableroCompartidoService = require('./compartir/TableroCompartido.service');
            const permisos = await tableroCompartidoService.obtenerPermisos(idTablero, idUsuario);
            
            if (!permisos.permisos.editar) {
                throw new Error('No tienes permiso para reordenar listas en este tablero');
            }
        }

        const promesas = ordenListas.map(({ idLista, orden }) => {
            return Lista.update({ orden }, { where: { idLista, idTablero } });
        });

        await Promise.all(promesas);

        return { mensaje: 'Listas reordenadas correctamente' };
    }

    // NUEVO: Método para unirse a una lista con clave
    async unirseConClave(claveCompartir, idUsuario) {
        const lista = await Lista.findOne({
            where: { claveCompartir },
            include: [
                {
                    model: Usuario,
                    as: 'propietario',
                    attributes: ['idUsuario', 'nombre', 'apellido']
                },
                {
                    model: Tablero,
                    as: 'tablero',
                    attributes: ['idTablero', 'nombre']
                }
            ]
        });

        if (!lista) {
            throw new Error('Clave de acceso inválida');
        }

        if (!lista.compartible) {
            throw new Error('Esta lista no está habilitada para compartir');
        }

        if (lista.idUsuario === idUsuario) {
            throw new Error('No puedes unirte a tu propia lista');
        }

        // Verificar si ya está compartida
        const yaCompartida = await ListaCompartida.findOne({
            where: {
                idLista: lista.idLista,
                idUsuario,
                activo: true
            }
        });

        if (yaCompartida) {
            throw new Error('Ya eres miembro de esta lista');
        }

        // Crear registro en lista_compartida
        const nuevoCompartido = await ListaCompartida.create({
            idLista: lista.idLista,
            idUsuario,
            rol: 'colaborador',
            esCreador: false,
            compartidoPor: lista.idUsuario,
            aceptado: true,
            activo: true
        });

        return {
            compartido: nuevoCompartido,
            lista: {
                idLista: lista.idLista,
                nombre: lista.nombre,
                color: lista.color,
                icono: lista.icono,
                propietario: lista.propietario,
                tablero: lista.tablero
            }
        };
    }
}

module.exports = new ListaService();