const express = require('express');
const router = express.Router();
const invitacionController = require('../../controllers/compartir/Invitacion.controller');
const { verificarToken } = require('../../middlewares/Auth.middleware');

router.use(verificarToken);

router.post('/', invitacionController.crear);
router.post('/multiples', invitacionController.crearMultiples);

// NUEVOS endpoints para aceptar/rechazar por ID de notificación
router.post('/:idNotificacion/aceptar', invitacionController.aceptarPorNotificacion);
router.post('/:idNotificacion/rechazar', invitacionController.rechazarPorNotificacion);

// Endpoints originales con token (mantener para compatibilidad)
router.post('/token/:token/aceptar', invitacionController.aceptar);
router.post('/token/:token/rechazar', invitacionController.rechazar);

router.delete('/:id/cancelar', invitacionController.cancelar);
router.get('/pendientes', invitacionController.obtenerPendientes);
router.get('/enviadas', invitacionController.obtenerEnviadas);

module.exports = router;