const invitacionService = require('../../services/compartir/Invitacion.service');

exports.crear = async (req, res) => {
    try {
        const invitacion = await invitacionService.crear(req.body, req.usuario.idUsuario);
        res.status(201).json({
            exito: true,
            mensaje: 'Invitación enviada correctamente',
            datos: invitacion
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.crearMultiples = async (req, res) => {
    try {
        const resultados = await invitacionService.crearMultiples(req.body, req.usuario.idUsuario);
        res.status(201).json({
            exito: true,
            mensaje: 'Invitaciones procesadas',
            datos: resultados
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.aceptar = async (req, res) => {
    try {
        const { token } = req.params;
        const invitacion = await invitacionService.aceptar(token, req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            mensaje: 'Invitación aceptada correctamente',
            datos: invitacion
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.rechazar = async (req, res) => {
    try {
        const { token } = req.params;
        const resultado = await invitacionService.rechazar(token, req.usuario.idUsuario);
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

exports.cancelar = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await invitacionService.cancelar(id, req.usuario.idUsuario);
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

exports.obtenerPendientes = async (req, res) => {
    try {
        const invitaciones = await invitacionService.obtenerPendientes(req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: invitaciones
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerEnviadas = async (req, res) => {
    try {
        const invitaciones = await invitacionService.obtenerEnviadas(req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: invitaciones
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.aceptarPorNotificacion = async (req, res) => {
    try {
        const { idNotificacion } = req.params;
        const resultado = await invitacionService.aceptarPorNotificacion(
            parseInt(idNotificacion),
            req.usuario.idUsuario
        );
        res.status(200).json({
            exito: true,
            mensaje: 'Invitación aceptada correctamente',
            datos: resultado
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.rechazarPorNotificacion = async (req, res) => {
    try {
        const { idNotificacion } = req.params;
        const resultado = await invitacionService.rechazarPorNotificacion(
            parseInt(idNotificacion),
            req.usuario.idUsuario
        );
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