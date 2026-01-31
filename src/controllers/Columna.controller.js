const columnaService = require('../services/Columna.service');

exports.crear = async (req, res) => {
    try {
        const columna = await columnaService.crear(req.body, req.usuario.idUsuario);
        res.status(201).json({
            exito: true,
            mensaje: 'Columna creada correctamente',
            datos: columna
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
        const columna = await columnaService.obtenerPorId(req.params.id, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: columna
        });
    } catch (error) {
        res.status(404).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerPorTablero = async (req, res) => {
    try {
        const columnas = await columnaService.obtenerPorTablero(req.params.idTablero, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: columnas
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.actualizar = async (req, res) => {
    try {
        const columna = await columnaService.actualizar(req.params.id, req.body, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            mensaje: 'Columna actualizada correctamente',
            datos: columna
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
        const resultado = await columnaService.eliminar(req.params.id, req.usuario.idUsuario);
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

exports.reordenar = async (req, res) => {
    try {
        const { idTablero, ordenColumnas } = req.body;
        const resultado = await columnaService.reordenar(idTablero, ordenColumnas, req.usuario.idUsuario);
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