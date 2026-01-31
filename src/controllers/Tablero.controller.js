const tableroService = require('../services/Tablero.service');

exports.crear = async (req, res) => {
    try {
        const tablero = await tableroService.crear(req.body, req.usuario.idUsuario);
        res.status(201).json({
            exito: true,
            mensaje: 'Tablero creado correctamente',
            datos: tablero
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
        const tablero = await tableroService.obtenerPorId(req.params.id, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: tablero
        });
    } catch (error) {
        res.status(404).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerMisTableros = async (req, res) => {
    try {
        const tableros = await tableroService.obtenerPorUsuario(req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: tableros
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerCompleto = async (req, res) => {
    try {
        const tablero = await tableroService.obtenerCompleto(req.params.id, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: tablero
        });
    } catch (error) {
        res.status(404).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.actualizar = async (req, res) => {
    try {
        const tablero = await tableroService.actualizar(req.params.id, req.body, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            mensaje: 'Tablero actualizado correctamente',
            datos: tablero
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
        const resultado = await tableroService.eliminar(req.params.id, req.usuario.idUsuario);
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

exports.generarNuevaClave = async (req, res) => {
    try {
        const resultado = await tableroService.generarNuevaClave(req.params.id, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            mensaje: 'Nueva clave generada correctamente',
            datos: resultado
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};