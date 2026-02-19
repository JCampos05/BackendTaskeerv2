const { ListaCompartida, Lista, Usuario, Tablero, TableroCompartido, Tarea } = require('../../models/index.models');
const notificacionService = require('../Notificacion.service');
const sseService = require('../SSE.service');

class ListaCompartidaService {
    async obtenerColaboradores(idLista, idUsuario) {
        const lista = await Lista.findByPk(idLista, {
            include: [
                {
                    model: Tablero,
                    as: 'tablero',
                    attributes: ['idTablero', 'nombre', 'compartible']
                }
            ]
        });
        
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        const tieneAcceso = await this.verificarAcceso(idLista, idUsuario);
        if (!tieneAcceso) {
            throw new Error('No tienes acceso a esta lista');
        }

        const colaboradores = await ListaCompartida.findAll({
            where: {
                idLista,
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

        const propietario = await Usuario.findByPk(lista.idUsuario, {
            attributes: ['idUsuario', 'nombre', 'apellido', 'email']
        });

        const permisos = await this.obtenerPermisos(idLista, idUsuario);
        
        const rolUsuarioActual = colaboradores.find(c => c.idUsuario === idUsuario);

        return {
            propietario,
            colaboradores,
            infoLista: {
                idLista: lista.idLista,
                nombre: lista.nombre,
                compartible: lista.compartible,
                claveCompartir: lista.claveCompartir,
                idTablero: lista.idTablero,
                tablero: lista.tablero
            },
            usuarioActual: {
                idUsuario: idUsuario,
                esOwner: permisos.esOwner,
                rol: permisos.rol,
                permisos: permisos.permisos,
                esColaborador: !!rolUsuarioActual,
                datosColaboracion: rolUsuarioActual || null
            }
        };
    }

    async actualizarRol(idLista, idUsuarioColaborador, nuevoRol, idUsuario) {
        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        const esOwner = lista.idUsuario === idUsuario;
        if (!esOwner) {
            const permisoUsuario = await this.obtenerPermisos(idLista, idUsuario);
            if (permisoUsuario.rol !== 'admin') {
                throw new Error('Solo el propietario o administradores pueden cambiar roles');
            }
        }

        const compartido = await ListaCompartida.findOne({
            where: {
                idLista,
                idUsuario: idUsuarioColaborador,
                activo: true
            }
        });

        if (!compartido) {
            throw new Error('El usuario no es colaborador de esta lista');
        }

        if (compartido.esCreador) {
            throw new Error('No se puede cambiar el rol del creador de la lista');
        }

        if (idUsuarioColaborador === lista.idUsuario) {
            throw new Error('No se puede cambiar el rol del propietario');
        }

        await compartido.update({ rol: nuevoRol });

        const usuario = await Usuario.findByPk(idUsuarioColaborador);
        const notificacion = await notificacionService.crear({
            idUsuario: idUsuarioColaborador,
            tipo: 'cambio_estado',
            titulo: 'Rol actualizado',
            mensaje: `Tu rol en la lista "${lista.nombre}" ha sido cambiado a ${nuevoRol}`,
            datosAdicionales: {
                nombreLista: lista.nombre,
                nuevoRol
            },
            idRecurso: idLista,
            tipoRecurso: 'lista'
        });

        sseService.enviarNotificacion(idUsuarioColaborador, notificacion);

        sseService.enviarCambioRolLista(idUsuarioColaborador, {
            tipo: 'lista',
            idRecurso: idLista,
            nombreRecurso: lista.nombre,
            nuevoRol: nuevoRol,
            accion: 'rol_actualizado'
        });

        return compartido;
    }

    async removerColaborador(idLista, idUsuarioColaborador, idUsuario) {
        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        const esOwner = lista.idUsuario === idUsuario;
        if (!esOwner) {
            const permisoUsuario = await this.obtenerPermisos(idLista, idUsuario);
            if (permisoUsuario.rol !== 'admin') {
                throw new Error('Solo el propietario o administradores pueden remover colaboradores');
            }
        }

        const compartido = await ListaCompartida.findOne({
            where: {
                idLista,
                idUsuario: idUsuarioColaborador,
                activo: true
            }
        });

        if (!compartido) {
            throw new Error('El usuario no es colaborador de esta lista');
        }

        if (compartido.esCreador) {
            throw new Error('No se puede remover al creador de la lista');
        }

        if (idUsuarioColaborador === lista.idUsuario) {
            throw new Error('No se puede remover al propietario');
        }

        await compartido.update({ activo: false });

        const usuario = await Usuario.findByPk(idUsuarioColaborador);
        const notificacion = await notificacionService.crear({
            idUsuario: idUsuarioColaborador,
            tipo: 'otro',
            titulo: 'Acceso removido',
            mensaje: `Has sido removido de la lista "${lista.nombre}"`,
            datosAdicionales: {
                nombreLista: lista.nombre
            },
            idRecurso: idLista,
            tipoRecurso: 'lista'
        });

        sseService.enviarNotificacion(idUsuarioColaborador, notificacion);

        sseService.enviarAccesoRemovido(idUsuarioColaborador, {
            tipo: 'lista',
            idRecurso: idLista,
            nombreRecurso: lista.nombre,
            accion: 'acceso_removido'
        });

        return { mensaje: 'Colaborador removido correctamente' };
    }

    async abandonarLista(idLista, idUsuario) {
        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        if (lista.idUsuario === idUsuario) {
            throw new Error('El propietario no puede abandonar su propia lista');
        }

        const compartido = await ListaCompartida.findOne({
            where: {
                idLista,
                idUsuario,
                activo: true
            }
        });

        if (!compartido) {
            throw new Error('No eres colaborador de esta lista');
        }

        await compartido.update({ activo: false });

        return { mensaje: 'Has abandonado la lista correctamente' };
    }

    async obtenerListasCompartidasConmigo(idUsuario) {
        const compartidos = await ListaCompartida.findAll({
            where: {
                idUsuario,
                activo: true,
                aceptado: true
            },
            include: [
                {
                    model: Lista,
                    as: 'lista',
                    include: [
                        {
                            model: Usuario,
                            as: 'propietario',
                            attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                        },
                        {
                            model: Tablero,
                            as: 'tablero',
                            attributes: ['idTablero', 'nombre', 'color', 'icono']
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

    async verificarAcceso(idLista, idUsuario) {
        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            return false;
        }

        if (lista.idUsuario === idUsuario) {
            return true;
        }

        if (lista.idTablero) {
            const tablero = await Tablero.findByPk(lista.idTablero);
            if (tablero && tablero.idUsuario === idUsuario) {
                return true;
            }

            const tableroCompartido = await TableroCompartido.findOne({
                where: {
                    idTablero: lista.idTablero,
                    idUsuario,
                    activo: true,
                    aceptado: true
                }
            });

            if (tableroCompartido) {
                return true;
            }
        }

        const compartido = await ListaCompartida.findOne({
            where: {
                idLista,
                idUsuario,
                activo: true,
                aceptado: true
            }
        });

        return !!compartido;
    }

    async obtenerPermisos(idLista, idUsuario) {
        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        // 1. Verificar si es propietario de la lista
        if (lista.idUsuario === idUsuario) {
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
                },
                origen: 'propietario_lista'
            };
        }

        // 2. Verificar si es propietario del tablero (si la lista pertenece a un tablero)
        if (lista.idTablero) {
            const tablero = await Tablero.findByPk(lista.idTablero);
            if (tablero && tablero.idUsuario === idUsuario) {
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
                    },
                    origen: 'propietario_tablero'
                };
            }
        }

        // 3. PRIORIDAD: Buscar permisos específicos de la lista primero
        const compartidoLista = await ListaCompartida.findOne({
            where: {
                idLista,
                idUsuario,
                activo: true,
                aceptado: true
            }
        });

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

        // Si tiene permisos específicos de lista, usarlos
        if (compartidoLista) {
            return {
                esOwner: false,
                rol: compartidoLista.rol,
                permisos: permisosPorRol[compartidoLista.rol],
                origen: 'lista'
            };
        }

        // 4. FALLBACK: Si no tiene permisos de lista pero la lista pertenece a un tablero compartido
        if (lista.idTablero) {
            const tableroCompartido = await TableroCompartido.findOne({
                where: {
                    idTablero: lista.idTablero,
                    idUsuario,
                    activo: true,
                    aceptado: true
                }
            });

            if (tableroCompartido) {
                return {
                    esOwner: false,
                    rol: tableroCompartido.rol,
                    permisos: permisosPorRol[tableroCompartido.rol],
                    origen: 'tablero'
                };
            }
        }

        // 5. Sin acceso
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
            },
            origen: 'sin_acceso'
        };
    }

    async obtenerListasCompartiendose(idUsuario) {
        const { Op } = require('sequelize');
        
        // Obtener IDs de listas donde el usuario es creador en lista_compartida
        const listasComoCreador = await ListaCompartida.findAll({
            where: {
                idUsuario,
                esCreador: true,
                activo: true
            },
            attributes: ['idLista']
        });
        
        const idsListasCreador = listasComoCreador.map(lc => lc.idLista);
        
        // Buscar listas donde:
        // 1. El usuario es propietario Y la lista es compartible
        // 2. O el usuario es creador en lista_compartida (para listas de tableros compartidos)
        const listas = await Lista.findAll({
            where: {
                [Op.or]: [
                    {
                        idUsuario,
                        compartible: true
                    },
                    {
                        idLista: {
                            [Op.in]: idsListasCreador.length > 0 ? idsListasCreador : [0]
                        }
                    }
                ]
            },
            include: [
                {
                    model: Tablero,
                    as: 'tablero',
                    attributes: ['idTablero', 'nombre']
                },
                {
                    model: Tarea,
                    as: 'tareas',
                    attributes: ['idTarea', 'estado']
                }
            ],
            order: [['fechaCreacion', 'DESC']]
        });

        const listasConEstadisticas = await Promise.all(listas.map(async lista => {
            const listaJSON = lista.toJSON();
            
            const cantidadTareas = listaJSON.tareas ? listaJSON.tareas.length : 0;
            const tareasCompletadas = listaJSON.tareas 
                ? listaJSON.tareas.filter(tarea => tarea.estado === 'C').length 
                : 0;

            const colaboradores = await ListaCompartida.count({
                where: {
                    idLista: lista.idLista,
                    activo: true,
                    aceptado: true,
                    esCreador: false
                }
            });
            
            return {
                ...listaJSON,
                cantidadTareas,
                tareasCompletadas,
                cantidadColaboradores: colaboradores
            };
        }));

        return listasConEstadisticas;
    }
}

module.exports = new ListaCompartidaService();