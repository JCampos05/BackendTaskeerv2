const { Tarea, Lista, Usuario, ListaCompartida } = require('../models/index.models');
const { Op } = require('sequelize');
const notificacionService = require('./Notificacion.service');
const sseService = require('./SSE.service');

class TareaService {
    async crear(datos, idUsuario) {
        const { nombre, descripcion, prioridad, estado, fechaVencimiento, miDia, pasos, notas,
            recordatorio, repetir, tipoRepeticion, configRepeticion, idLista, idUsuarioAsignado } = datos;

        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        // CAMBIO: Verificar permisos usando el servicio de listas compartidas
        const esOwner = lista.idUsuario === idUsuario;
        if (!esOwner) {
            const listaCompartidaService = require('./compartir/ListaCompartida.service');
            const permisos = await listaCompartidaService.obtenerPermisos(idLista, idUsuario);
            
            if (!permisos.permisos.crear) {
                throw new Error('No tienes permiso para crear tareas en esta lista');
            }
        }

        const nuevaTarea = await Tarea.create({
            nombre,
            descripcion,
            prioridad: prioridad || 'N',
            estado: estado || 'N',
            fechaVencimiento,
            miDia: miDia || false,
            pasos,
            notas,
            recordatorio,
            repetir: repetir || false,
            tipoRepeticion,
            configRepeticion,
            idLista,
            idUsuario,
            idUsuarioAsignado
        });

        if (idUsuarioAsignado && idUsuarioAsignado !== idUsuario) {
            const usuarioCreador = await Usuario.findByPk(idUsuario, {
                attributes: ['nombre', 'apellido', 'email']
            });

            const notificacion = await notificacionService.crear({
                idUsuario: idUsuarioAsignado,
                tipo: 'tarea_asignada',
                titulo: 'Nueva tarea asignada',
                mensaje: `${usuarioCreador.nombre} ${usuarioCreador.apellido || ''} te ha asignado la tarea "${nombre}" en la lista "${lista.nombre}"`,
                datosAdicionales: {
                    nombreTarea: nombre,
                    nombreLista: lista.nombre,
                    prioridad: prioridad || 'N',
                    fechaVencimiento,
                    asignadoPor: {
                        idUsuario,
                        nombre: usuarioCreador.nombre,
                        apellido: usuarioCreador.apellido,
                        email: usuarioCreador.email
                    }
                },
                idRecurso: nuevaTarea.idTarea,
                tipoRecurso: 'tarea'
            });

            // Enviar notificación SSE
            sseService.enviarNotificacion(idUsuarioAsignado, notificacion);
            sseService.enviarTareaAsignada(idUsuarioAsignado, {
                idTarea: nuevaTarea.idTarea,
                nombre: nuevaTarea.nombre,
                descripcion: nuevaTarea.descripcion,
                prioridad: nuevaTarea.prioridad,
                estado: nuevaTarea.estado,
                fechaVencimiento: nuevaTarea.fechaVencimiento,
                lista: {
                    idLista: lista.idLista,
                    nombre: lista.nombre,
                    color: lista.color,
                    icono: lista.icono
                },
                asignadoPor: {
                    idUsuario,
                    nombre: usuarioCreador.nombre,
                    apellido: usuarioCreador.apellido
                }
            });
        }

        return nuevaTarea;
    }

    async obtenerPorId(idTarea, idUsuario) {
        const tarea = await Tarea.findOne({
            where: { idTarea },
            include: [
                {
                    model: Lista,
                    as: 'lista',
                    attributes: ['idLista', 'nombre', 'color', 'icono']
                },
                {
                    model: Usuario,
                    as: 'creador',
                    attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                },
                {
                    model: Usuario,
                    as: 'usuarioAsignado',
                    attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                }
            ]
        });

        if (!tarea) {
            throw new Error('Tarea no encontrada');
        }

        if (tarea.idUsuario !== idUsuario && tarea.idUsuarioAsignado !== idUsuario) {
            throw new Error('No tienes permiso para ver esta tarea');
        }

        return tarea;
    }

    async obtenerPorLista(idLista, idUsuario) {
        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        // CAMBIO: Verificar acceso usando el servicio de listas compartidas
        const esOwner = lista.idUsuario === idUsuario;
        if (!esOwner) {
            const listaCompartidaService = require('./compartir/ListaCompartida.service');
            const permisos = await listaCompartidaService.obtenerPermisos(idLista, idUsuario);
            
            if (!permisos.permisos.leer) {
                throw new Error('No tienes permiso para ver las tareas de esta lista');
            }
        }

        const tareas = await Tarea.findAll({
            where: { idLista },
            include: [
                {
                    model: Usuario,
                    as: 'creador',
                    attributes: ['idUsuario', 'nombre', 'apellido']
                },
                {
                    model: Usuario,
                    as: 'usuarioAsignado',
                    attributes: ['idUsuario', 'nombre', 'apellido']
                }
            ],
            order: [['fechaCreacion', 'DESC']]
        });

        return tareas;
    }

    async obtenerPorUsuario(idUsuario, filtros = {}) {
        const whereClause = {
            [Op.or]: [
                { idUsuario },
                { idUsuarioAsignado: idUsuario }
            ]
        };

        if (filtros.estado) {
            whereClause.estado = filtros.estado;
        }

        if (filtros.prioridad) {
            whereClause.prioridad = filtros.prioridad;
        }

        if (filtros.fechaVencimiento) {
            whereClause.fechaVencimiento = {
                [Op.lte]: filtros.fechaVencimiento
            };
        }

        const tareas = await Tarea.findAll({
            where: whereClause,
            include: [
                {
                    model: Lista,
                    as: 'lista',
                    attributes: ['idLista', 'nombre', 'color', 'icono']
                },
                {
                    model: Usuario,
                    as: 'usuarioAsignado',
                    attributes: ['idUsuario', 'nombre', 'apellido']
                }
            ],
            order: [['fechaVencimiento', 'ASC'], ['prioridad', 'ASC']]
        });

        return tareas;
    }

    async actualizar(idTarea, datos, idUsuario) {
        const tarea = await Tarea.findByPk(idTarea, {
            include: [{
                model: Lista,
                as: 'lista',
                attributes: ['idLista', 'nombre', 'color', 'icono']
            }]
        });
        
        if (!tarea) {
            throw new Error('Tarea no encontrada');
        }

        if (tarea.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para actualizar esta tarea');
        }

        const idUsuarioAsignadoAnterior = tarea.idUsuarioAsignado;
        await tarea.update(datos);

        if (datos.idUsuarioAsignado !== undefined && 
            datos.idUsuarioAsignado !== idUsuarioAsignadoAnterior &&
            datos.idUsuarioAsignado !== idUsuario) {
            
            const usuarioCreador = await Usuario.findByPk(idUsuario, {
                attributes: ['nombre', 'apellido', 'email']
            });

            const notificacion = await notificacionService.crear({
                idUsuario: datos.idUsuarioAsignado,
                tipo: 'tarea_asignada',
                titulo: 'Tarea asignada',
                mensaje: `${usuarioCreador.nombre} ${usuarioCreador.apellido || ''} te ha asignado la tarea "${tarea.nombre}" en la lista "${tarea.lista.nombre}"`,
                datosAdicionales: {
                    nombreTarea: tarea.nombre,
                    nombreLista: tarea.lista.nombre,
                    prioridad: tarea.prioridad,
                    fechaVencimiento: tarea.fechaVencimiento,
                    asignadoPor: {
                        idUsuario,
                        nombre: usuarioCreador.nombre,
                        apellido: usuarioCreador.apellido,
                        email: usuarioCreador.email
                    }
                },
                idRecurso: idTarea,
                tipoRecurso: 'tarea'
            });

            sseService.enviarNotificacion(datos.idUsuarioAsignado, notificacion);
            sseService.enviarTareaAsignada(datos.idUsuarioAsignado, {
                idTarea: tarea.idTarea,
                nombre: tarea.nombre,
                descripcion: tarea.descripcion,
                prioridad: tarea.prioridad,
                estado: tarea.estado,
                fechaVencimiento: tarea.fechaVencimiento,
                lista: {
                    idLista: tarea.lista.idLista,
                    nombre: tarea.lista.nombre,
                    color: tarea.lista.color,
                    icono: tarea.lista.icono
                },
                asignadoPor: {
                    idUsuario,
                    nombre: usuarioCreador.nombre,
                    apellido: usuarioCreador.apellido
                }
            });
        }

        return tarea;
    }

    async eliminar(idTarea, idUsuario) {
        const tarea = await Tarea.findByPk(idTarea);
        if (!tarea) {
            throw new Error('Tarea no encontrada');
        }

        if (tarea.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para eliminar esta tarea');
        }

        await tarea.destroy();
        return { mensaje: 'Tarea eliminada correctamente' };
    }

    async cambiarEstado(idTarea, nuevoEstado, idUsuario) {
        const tarea = await Tarea.findByPk(idTarea);
        if (!tarea) {
            throw new Error('Tarea no encontrada');
        }

        if (tarea.idUsuario !== idUsuario && tarea.idUsuarioAsignado !== idUsuario) {
            throw new Error('No tienes permiso para cambiar el estado de esta tarea');
        }

        await tarea.update({ estado: nuevoEstado });
        return tarea;
    }

    // NUEVO: Método para obtener usuarios asignables en una lista compartida
    async obtenerUsuariosAsignables(idLista, idUsuario) {
        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        // Verificar acceso
        const listaCompartidaService = require('./compartir/ListaCompartida.service');
        const tieneAcceso = await listaCompartidaService.verificarAcceso(idLista, idUsuario);
        
        if (!tieneAcceso) {
            throw new Error('No tienes acceso a esta lista');
        }

        // Obtener colaboradores activos con roles que permiten ser asignados
        const colaboradores = await ListaCompartida.findAll({
            where: {
                idLista,
                activo: true,
                aceptado: true,
                rol: {
                    [Op.in]: ['colaborador', 'admin', 'editor']
                }
            },
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                }
            ]
        });

        // Incluir al propietario
        const propietario = await Usuario.findByPk(lista.idUsuario, {
            attributes: ['idUsuario', 'nombre', 'apellido', 'email']
        });

        const usuariosAsignables = [propietario];
        
        colaboradores.forEach(colab => {
            if (colab.usuario && colab.usuario.idUsuario !== propietario.idUsuario) {
                usuariosAsignables.push(colab.usuario);
            }
        });

        return usuariosAsignables;
    }
}

module.exports = new TareaService();