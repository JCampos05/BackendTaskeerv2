const tableroCompartidoService = require('../../services/compartir/TableroCompartido.service');

exports.obtenerColaboradores = async (req, res) => {
    try {
        const { idTablero } = req.params;
        const colaboradores = await tableroCompartidoService.obtenerColaboradores(
            idTablero,
            req.usuario.idUsuario
        );
        res.status(200).json({
            exito: true,
            datos: colaboradores
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.actualizarRol = async (req, res) => {
    try {
        const { idTablero, idUsuario } = req.params;
        const { rol } = req.body;
        
        const compartido = await tableroCompartidoService.actualizarRol(
            idTablero,
            idUsuario,
            rol,
            req.usuario.idUsuario
        );
        
        res.status(200).json({
            exito: true,
            mensaje: 'Rol actualizado correctamente',
            datos: compartido
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.removerColaborador = async (req, res) => {
    try {
        const { idTablero, idUsuario } = req.params;
        
        const resultado = await tableroCompartidoService.removerColaborador(
            idTablero,
            idUsuario,
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

exports.abandonarTablero = async (req, res) => {
    try {
        const { idTablero } = req.params;
        
        const resultado = await tableroCompartidoService.abandonarTablero(
            idTablero,
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

exports.obtenerTablerosCompartidosConmigo = async (req, res) => {
    try {
        const tableros = await tableroCompartidoService.obtenerTablerosCompartidosConmigo(
            req.usuario.idUsuario
        );
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

exports.obtenerTablerosCompartiendose = async (req, res) => {
    try {
        const tableros = await tableroCompartidoService.obtenerTablerosCompartiendose(
            req.usuario.idUsuario
        );
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

exports.obtenerPermisos = async (req, res) => {
    try {
        const { idTablero } = req.params;
        
        const permisos = await tableroCompartidoService.obtenerPermisos(
            idTablero,
            req.usuario.idUsuario
        );
        
        res.status(200).json({
            exito: true,
            datos: permisos
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};