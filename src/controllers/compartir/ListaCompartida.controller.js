const listaCompartidaService = require('../../services/compartir/ListaCompartida.service');

exports.obtenerColaboradores = async (req, res) => {
    try {
        const { idLista } = req.params;
        const colaboradores = await listaCompartidaService.obtenerColaboradores(
            idLista,
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
        const { idLista, idUsuario } = req.params;
        const { rol } = req.body;
        
        const compartido = await listaCompartidaService.actualizarRol(
            idLista,
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
        const { idLista, idUsuario } = req.params;
        
        const resultado = await listaCompartidaService.removerColaborador(
            idLista,
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

exports.abandonarLista = async (req, res) => {
    try {
        const { idLista } = req.params;
        
        const resultado = await listaCompartidaService.abandonarLista(
            idLista,
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

exports.obtenerListasCompartidasConmigo = async (req, res) => {
    try {
        const listas = await listaCompartidaService.obtenerListasCompartidasConmigo(
            req.usuario.idUsuario
        );
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

exports.obtenerPermisos = async (req, res) => {
    try {
        const { idLista } = req.params;
        
        const permisos = await listaCompartidaService.obtenerPermisos(
            idLista,
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

exports.obtenerListasCompartiendose = async (req, res) => {
    try {
        const listas = await listaCompartidaService.obtenerListasCompartiendose(
            req.usuario.idUsuario
        );
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