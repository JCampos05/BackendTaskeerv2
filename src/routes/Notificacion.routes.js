const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/Notificacion.controller');
const { verificarToken } = require('../middlewares/Auth.middleware');
const { verificarTokenSSE } = require('../middlewares/SSE.middleware');

// Ruta SSE con middleware específico (debe ir ANTES del router.use)
router.get('/sse', verificarTokenSSE, notificacionController.conectarSSE);

// Todas las demás rutas usan el middleware normal
router.use(verificarToken);

router.get('/', notificacionController.obtenerNotificaciones);
router.get('/no-leidas', notificacionController.obtenerNoLeidas);
router.get('/contar-no-leidas', notificacionController.contarNoLeidas);

router.put('/marcar-todas-leidas', notificacionController.marcarTodasComoLeidas);
router.put('/:id/marcar-leida', notificacionController.marcarComoLeida);
router.put('/:id/archivar', notificacionController.archivar);

router.delete('/limpiar-leidas', notificacionController.eliminarLeidas);
router.delete('/:id', notificacionController.eliminar);

router.get('/estadisticas-sse', notificacionController.obtenerEstadisticasSSE);

module.exports = router;