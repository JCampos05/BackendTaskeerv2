const tableroCompartidoService = require('../services/compartir/TableroCompartido.service');
const listaCompartidaService = require('../services/compartir/ListaCompartida.service');

const verificarAccesoTablero = (permisosRequeridos = []) => {
    return async (req, res, next) => {
        try {
            const idTablero = req.params.id || req.params.idTablero || req.body.idTablero;
            const idUsuario = req.usuario.idUsuario;

            if (!idTablero) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'ID de tablero no proporcionado'
                });
            }

            const tieneAcceso = await tableroCompartidoService.verificarAcceso(idTablero, idUsuario);
            
            if (!tieneAcceso) {
                return res.status(403).json({
                    exito: false,
                    mensaje: 'No tienes acceso a este tablero'
                });
            }

            if (permisosRequeridos.length > 0) {
                const permisos = await tableroCompartidoService.obtenerPermisos(idTablero, idUsuario);
                
                const tienePermisosRequeridos = permisosRequeridos.every(
                    permiso => permisos.permisos[permiso] === true
                );

                if (!tienePermisosRequeridos) {
                    return res.status(403).json({
                        exito: false,
                        mensaje: 'No tienes los permisos necesarios para esta acción'
                    });
                }

                req.permisos = permisos;
            }

            next();
        } catch (error) {
            return res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    };
};

const verificarAccesoLista = (permisosRequeridos = []) => {
    return async (req, res, next) => {
        try {
            const idLista = req.params.id || req.params.idLista || req.body.idLista;
            const idUsuario = req.usuario.idUsuario;

            if (!idLista) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'ID de lista no proporcionado'
                });
            }

            const tieneAcceso = await listaCompartidaService.verificarAcceso(idLista, idUsuario);
            
            if (!tieneAcceso) {
                return res.status(403).json({
                    exito: false,
                    mensaje: 'No tienes acceso a esta lista'
                });
            }

            if (permisosRequeridos.length > 0) {
                const permisos = await listaCompartidaService.obtenerPermisos(idLista, idUsuario);
                
                const tienePermisosRequeridos = permisosRequeridos.every(
                    permiso => permisos.permisos[permiso] === true
                );

                if (!tienePermisosRequeridos) {
                    return res.status(403).json({
                        exito: false,
                        mensaje: 'No tienes los permisos necesarios para esta acción'
                    });
                }

                req.permisos = permisos;
            }

            next();
        } catch (error) {
            return res.status(500).json({
                exito: false,
                mensaje: error.message
            });
        }
    };
};

const esOwnerTablero = async (req, res, next) => {
    try {
        const idTablero = req.params.id || req.params.idTablero;
        const idUsuario = req.usuario.idUsuario;

        const permisos = await tableroCompartidoService.obtenerPermisos(idTablero, idUsuario);

        if (!permisos.esOwner) {
            return res.status(403).json({
                exito: false,
                mensaje: 'Solo el propietario puede realizar esta acción'
            });
        }

        req.permisos = permisos;
        next();
    } catch (error) {
        return res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

const esOwnerLista = async (req, res, next) => {
    try {
        const idLista = req.params.id || req.params.idLista;
        const idUsuario = req.usuario.idUsuario;

        const permisos = await listaCompartidaService.obtenerPermisos(idLista, idUsuario);

        if (!permisos.esOwner) {
            return res.status(403).json({
                exito: false,
                mensaje: 'Solo el propietario puede realizar esta acción'
            });
        }

        req.permisos = permisos;
        next();
    } catch (error) {
        return res.status(500).json({
            exito: false,
            mensaje: error.message
        });
    }
};

module.exports = {
    verificarAccesoTablero,
    verificarAccesoLista,
    esOwnerTablero,
    esOwnerLista
};