const { Tarea, Lista, Usuario } = require('../models/index.models');
const { Op } = require('sequelize');

class TareaService {
    async crear(datos, idUsuario) {
        const { nombre, descripcion, prioridad, estado, fechaVencimiento, pasos, notas, 
                recordatorio, repetir, tipoRepeticion, configRepeticion, idLista, idUsuarioAsignado } = datos;

        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        if (lista.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para agregar tareas a esta lista');
        }

        const nuevaTarea = await Tarea.create({
            nombre,
            descripcion,
            prioridad: prioridad || 'N',
            estado: estado || 'N',
            fechaVencimiento,
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

        if (lista.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para ver las tareas de esta lista');
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
        const tarea = await Tarea.findByPk(idTarea);
        if (!tarea) {
            throw new Error('Tarea no encontrada');
        }

        if (tarea.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para actualizar esta tarea');
        }

        await tarea.update(datos);
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
}

module.exports = new TareaService();