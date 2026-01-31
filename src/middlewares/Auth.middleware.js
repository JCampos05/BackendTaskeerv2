const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

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

const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                exito: false,
                mensaje: 'No autenticado'
            });
        }

        if (rolesPermitidos.includes(req.usuario.rol)) {
            next();
        } else {
            return res.status(403).json({
                exito: false,
                mensaje: 'No tienes permisos para realizar esta acción'
            });
        }
    };
};

module.exports = {
    verificarToken,
    verificarRol
};