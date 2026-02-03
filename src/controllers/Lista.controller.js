const listaService = require('../services/Lista.service');

exports.crear = async (req, res) => {
    try {
        const lista = await listaService.crear(req.body, req.usuario.idUsuario);
        res.status(201).json({
            exito: true,
            mensaje: 'Lista creada correctamente',
            datos: lista
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
        const lista = await listaService.obtenerPorId(req.params.id, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: lista
        });
    } catch (error) {
        res.status(404).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerMisListas = async (req, res) => {
    try {
        const listas = await listaService.obtenerPorUsuario(req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: listas
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerPorTablero = async (req, res) => {
    try {
        const listas = await listaService.obtenerPorTablero(req.params.idTablero, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: listas
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerConTareas = async (req, res) => {
    try {
        const lista = await listaService.obtenerConTareas(req.params.id, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: lista
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
        const lista = await listaService.actualizar(req.params.id, req.body, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            mensaje: 'Lista actualizada correctamente',
            datos: lista
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
        const resultado = await listaService.eliminar(req.params.id, req.usuario.idUsuario);
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
        const { idTablero, ordenListas } = req.body;
        const resultado = await listaService.reordenar(idTablero, ordenListas, req.usuario.idUsuario);
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
exports.marcarImportante = async (req, res) => {
    try {
        const { importante } = req.body;
        const lista = await listaService.actualizar(req.params.id, { importante }, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            mensaje: importante ? 'Lista marcada como importante' : 'Lista desmarcada como importante',
            datos: lista
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};