const express = require('express');
const router = express.Router();
const tableroCompartidoController = require('../../controllers/compartir/TableroCompartido.controller');
const { verificarToken } = require('../../middlewares/Auth.middleware');
const { verificarAccesoTablero } = require('../../middlewares/Permisos.middleware');

router.use(verificarToken);

router.get('/compartidos-conmigo', tableroCompartidoController.obtenerTablerosCompartidosConmigo);
router.get('/compartiendose', tableroCompartidoController.obtenerTablerosCompartiendose);
router.get('/:idTablero/colaboradores', verificarAccesoTablero(['leer']), tableroCompartidoController.obtenerColaboradores);
router.get('/:idTablero/permisos', verificarAccesoTablero(['leer']), tableroCompartidoController.obtenerPermisos);
router.put('/:idTablero/colaboradores/:idUsuario/rol', verificarAccesoTablero(['administrar']), tableroCompartidoController.actualizarRol);
router.delete('/:idTablero/colaboradores/:idUsuario', verificarAccesoTablero(['administrar']), tableroCompartidoController.removerColaborador);
router.post('/:idTablero/abandonar', verificarAccesoTablero(['leer']), tableroCompartidoController.abandonarTablero);

module.exports = router;