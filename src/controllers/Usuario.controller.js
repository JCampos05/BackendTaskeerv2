const usuarioService = require('../services/Usuario.service');

exports.registrar = async (req, res) => {
    try {
        const usuario = await usuarioService.registrar(req.body);
        res.status(201).json({
            exito: true,
            mensaje: 'Usuario registrado correctamente',
            datos: usuario
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const resultado = await usuarioService.login(email, password);
        res.status(200).json({
            exito: true,
            mensaje: 'Login exitoso',
            datos: resultado
        });
    } catch (error) {
        res.status(401).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerPerfil = async (req, res) => {
    try {
        const usuario = await usuarioService.obtenerPorId(req.usuario.idUsuario);
        res.status(200).json({
            exito: true,
            datos: usuario
        });
    } catch (error) {
        res.status(404).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerPorId = async (req, res) => {
    try {
        const usuario = await usuarioService.obtenerPorId(req.params.id);
        res.status(200).json({
            exito: true,
            datos: usuario
        });
    } catch (error) {
        res.status(404).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.obtenerTodos = async (req, res) => {
    try {
        const usuarios = await usuarioService.obtenerTodos();
        res.status(200).json({
            exito: true,
            datos: usuarios
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

exports.actualizar = async (req, res) => {
    try {
        const usuario = await usuarioService.actualizar(req.usuario.idUsuario, req.body);
        res.status(200).json({
            exito: true,
            mensaje: 'Usuario actualizado correctamente',
            datos: usuario
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
        const resultado = await usuarioService.eliminar(req.usuario.idUsuario);
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