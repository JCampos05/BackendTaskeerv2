const paisService = require('../services/Pais.service');

exports.obtenerTodos = async (req, res) => {
    try {
        const paises = await paisService.obtenerTodos();
        res.status(200).json({
            exito: true,
            datos: paises
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerPorId = async (req, res) => {
    try {
        const pais = await paisService.obtenerPorId(req.params.id);
        res.status(200).json({
            exito: true,
            datos: pais
        });
    } catch (error) {
        res.status(404).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerPorCodigo = async (req, res) => {
    try {
        const pais = await paisService.obtenerPorCodigo(req.params.codigo);
        res.status(200).json({
            exito: true,
            datos: pais
        });
    } catch (error) {
        res.status(404).json({
            exito: false,
            mensaje: error.message
        });
    }
};