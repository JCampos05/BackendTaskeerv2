const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación específico para SSE
 * Como EventSource no permite enviar headers personalizados,
 * el token se recibe como query parameter
 */
const verificarTokenSSE = (req, res, next) => {
    const token = req.query.token;

    if (!token) {
        return res.status(401).json({
            exito: false,
            mensaje: 'Token no proporcionado'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            exito: false,
            mensaje: 'Token inválido o expirado'
        });
    }
};

module.exports = {
    verificarTokenSSE
};