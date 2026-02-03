const notificacionService = require('../services/Notificacion.service');
const sseService = require('../services/SSE.service');

exports.obtenerNotificaciones = async (req, res) => {
    try {
        const { leido, archivado, tipo, limite } = req.query;
        
        const filtros = {
            leido: leido !== undefined ? leido === 'true' : undefined,
            archivado: archivado !== undefined ? archivado === 'true' : undefined,
            tipo: tipo || undefined,
            limite: limite ? parseInt(limite) : 50
        };

        const notificaciones = await notificacionService.obtenerPorUsuario(
            req.usuario.idUsuario,
            filtros
        );

        res.status(200).json({
            exito: true,
            datos: notificaciones
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerNoLeidas = async (req, res) => {
    try {
        const notificaciones = await notificacionService.obtenerNoLeidas(req.usuario.idUsuario);
        
        res.status(200).json({
            exito: true,
            datos: notificaciones
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.contarNoLeidas = async (req, res) => {
    try {
        const cantidad = await notificacionService.contarNoLeidas(req.usuario.idUsuario);
        
        res.status(200).json({
            exito: true,
            datos: { cantidad }
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.marcarComoLeida = async (req, res) => {
    try {
        const notificacion = await notificacionService.marcarComoLeida(
            req.params.id,
            req.usuario.idUsuario
        );

        res.status(200).json({
            exito: true,
            mensaje: 'Notificación marcada como leída',
            datos: notificacion
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.marcarTodasComoLeidas = async (req, res) => {
    try {
        const resultado = await notificacionService.marcarTodasComoLeidas(req.usuario.idUsuario);

        res.status(200).json({
            exito: true,
            mensaje: resultado.mensaje
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.archivar = async (req, res) => {
    try {
        const notificacion = await notificacionService.archivar(
            req.params.id,
            req.usuario.idUsuario
        );

        res.status(200).json({
            exito: true,
            mensaje: 'Notificación archivada',
            datos: notificacion
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
        const resultado = await notificacionService.eliminar(
            req.params.id,
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

exports.eliminarLeidas = async (req, res) => {
    try {
        const resultado = await notificacionService.eliminarLeidas(req.usuario.idUsuario);

        res.status(200).json({
            exito: true,
            mensaje: resultado.mensaje
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.conectarSSE = async (req, res) => {
    const idUsuario = req.usuario.idUsuario;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.write(`data: ${JSON.stringify({ mensaje: 'Conectado al servidor SSE' })}\n\n`);

    const clienteId = sseService.agregarCliente(idUsuario, res);

    const intervaloKeepAlive = setInterval(() => {
        try {
            res.write(`:keep-alive\n\n`);
        } catch (error) {
            clearInterval(intervaloKeepAlive);
        }
    }, 30000);

    req.on('close', () => {
        clearInterval(intervaloKeepAlive);
        sseService.removerCliente(idUsuario, clienteId);
        res.end();
    });
};

exports.obtenerEstadisticasSSE = async (req, res) => {
    try {
        const estadisticas = sseService.obtenerEstadisticas();
        
        res.status(200).json({
            exito: true,
            datos: estadisticas
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};