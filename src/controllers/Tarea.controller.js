const tareaService = require('../services/tarea.service');

exports.crear = async (req, res) => {
    try {
        const tarea = await tareaService.crear(req.body, req.usuario.idUsuario);
        res.status(201).json({
            exito: true,
            mensaje: 'Tarea creada correctamente',
            datos: tarea
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerPorId = async (req, res) => {
    try {
        const tarea = await tareaService.obtenerPorId(req.params.id, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: tarea
        });
    } catch (error) {
        res.status(404).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerPorLista = async (req, res) => {
    try {
        const tareas = await tareaService.obtenerPorLista(req.params.idLista, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: tareas
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerMisTareas = async (req, res) => {
    try {
        const filtros = {
            estado: req.query.estado,
            prioridad: req.query.prioridad,
            fechaVencimiento: req.query.fechaVencimiento
        };

        const tareas = await tareaService.obtenerPorUsuario(req.usuario.idUsuario, filtros);
        res.status(200).json({
            exito: true,
            datos: tareas
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.actualizar = async (req, res) => {
    try {
        const tarea = await tareaService.actualizar(req.params.id, req.body, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            mensaje: 'Tarea actualizada correctamente',
            datos: tarea
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.eliminar = async (req, res) => {
    try {
        const resultado = await tareaService.eliminar(req.params.id, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            mensaje: resultado.mensaje
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.cambiarEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        const tarea = await tareaService.cambiarEstado(req.params.id, estado, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            mensaje: 'Estado actualizado correctamente',
            datos: tarea
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};