const { Notificacion, Usuario, Tarea, Lista, Tablero } = require('../models/index.models');
const { Op } = require('sequelize');

class NotificacionService {
    async crear(datos) {
        const { idUsuario, tipo, titulo, mensaje, datosAdicionales, idRecurso, tipoRecurso } = datos;

        const notificacion = await Notificacion.create({
            idUsuario,
            tipo,
            titulo,
            mensaje,
            datosAdicionales,
            idRecurso,
            tipoRecurso,
            leido: false,
            archivado: false
        });

        return notificacion;
    }

    async crearMultiples(notificaciones) {
        return await Notificacion.bulkCreate(notificaciones);
    }

    async obtenerPorUsuario(idUsuario, filtros = {}) {
        const whereClause = { idUsuario };

        if (filtros.leido !== undefined) {
            whereClause.leido = filtros.leido;
        }

        if (filtros.archivado !== undefined) {
            whereClause.archivado = filtros.archivado;
        }

        if (filtros.tipo) {
            whereClause.tipo = filtros.tipo;
        }

        const notificaciones = await Notificacion.findAll({
            where: whereClause,
            order: [['fechaCreacion', 'DESC']],
            limit: filtros.limite || 50
        });

        return notificaciones;
    }

    async obtenerNoLeidas(idUsuario) {
        return await Notificacion.findAll({
            where: {
                idUsuario,
                leido: false,
                archivado: false
            },
            order: [['fechaCreacion', 'DESC']]
        });
    }

    async contarNoLeidas(idUsuario) {
        return await Notificacion.count({
            where: {
                idUsuario,
                leido: false,
                archivado: false
            }
        });
    }

    async marcarComoLeida(idNotificacion, idUsuario) {
        const notificacion = await Notificacion.findOne({
            where: { idNotificacion, idUsuario }
        });

        if (!notificacion) {
            throw new Error('Notificación no encontrada');
        }

        await notificacion.update({
            leido: true,
            fechaLeido: new Date()
        });

        return notificacion;
    }

    async marcarTodasComoLeidas(idUsuario) {
        await Notificacion.update(
            {
                leido: true,
                fechaLeido: new Date()
            },
            {
                where: {
                    idUsuario,
                    leido: false
                }
            }
        );

        return { mensaje: 'Todas las notificaciones marcadas como leídas' };
    }

    async archivar(idNotificacion, idUsuario) {
        const notificacion = await Notificacion.findOne({
            where: { idNotificacion, idUsuario }
        });

        if (!notificacion) {
            throw new Error('Notificación no encontrada');
        }

        await notificacion.update({ archivado: true });
        return notificacion;
    }

    async eliminar(idNotificacion, idUsuario) {
        const notificacion = await Notificacion.findOne({
            where: { idNotificacion, idUsuario }
        });

        if (!notificacion) {
            throw new Error('Notificación no encontrada');
        }

        await notificacion.destroy();
        return { mensaje: 'Notificación eliminada correctamente' };
    }

    async eliminarLeidas(idUsuario) {
        await Notificacion.destroy({
            where: {
                idUsuario,
                leido: true
            }
        });

        return { mensaje: 'Notificaciones leídas eliminadas' };
    }

    async crearNotificacionTarea(tipo, idTarea, idUsuarioDestino, datosExtra = {}) {
        const tarea = await Tarea.findByPk(idTarea, {
            include: [
                {
                    model: Lista,
                    as: 'lista',
                    attributes: ['nombre']
                }
            ]
        });

        if (!tarea) {
            throw new Error('Tarea no encontrada');
        }

        const titulos = {
            'recordatorio': `Recordatorio: ${tarea.nombre}`,
            'tarea_repetir': `Tarea repetida: ${tarea.nombre}`,
            'tarea_asignada': `Nueva tarea asignada: ${tarea.nombre}`,
            'cambio_estado': `Estado actualizado: ${tarea.nombre}`
        };

        const mensajes = {
            'recordatorio': `Tienes un recordatorio para la tarea "${tarea.nombre}" en la lista "${tarea.lista.nombre}"`,
            'tarea_repetir': `Se ha creado una nueva instancia de la tarea repetida "${tarea.nombre}"`,
            'tarea_asignada': `Se te ha asignado la tarea "${tarea.nombre}" en la lista "${tarea.lista.nombre}"`,
            'cambio_estado': `El estado de la tarea "${tarea.nombre}" ha sido actualizado`
        };

        return await this.crear({
            idUsuario: idUsuarioDestino,
            tipo,
            titulo: titulos[tipo] || 'Nueva notificación',
            mensaje: mensajes[tipo] || '',
            datosAdicionales: {
                nombreTarea: tarea.nombre,
                nombreLista: tarea.lista.nombre,
                prioridad: tarea.prioridad,
                fechaVencimiento: tarea.fechaVencimiento,
                ...datosExtra
            },
            idRecurso: idTarea,
            tipoRecurso: 'tarea'
        });
    }
}

module.exports = new NotificacionService();