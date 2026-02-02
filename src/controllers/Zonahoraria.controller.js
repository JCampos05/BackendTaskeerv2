const zonaHorariaService = require('../services/Zonahoraria.service');

exports.obtenerTodas = async (req, res) => {
    try {
        const zonas = await zonaHorariaService.obtenerTodas();
        res.status(200).json({
            exito: true,
            datos: zonas
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
        const zona = await zonaHorariaService.obtenerPorId(req.params.id);
        res.status(200).json({
            exito: true,
            datos: zona
        });
    } catch (error) {
        res.status(404).json({
            exito: false,
            mensaje: error.message
        });
    }
};