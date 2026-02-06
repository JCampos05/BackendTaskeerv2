const express = require('express');
const router = express.Router();
const tableroController = require('../controllers/Tablero.controller');
const { verificarToken } = require('../middlewares/Auth.middleware');

router.use(verificarToken);

router.post('/', tableroController.crear);
router.get('/mis-tableros', tableroController.obtenerMisTableros);
router.post('/unirse-con-clave', tableroController.unirseConClave);

// IMPORTANTE: Rutas específicas ANTES de rutas con parámetros
router.get('/:id/completo', tableroController.obtenerCompleto);
router.put('/:id/generar-clave', tableroController.generarNuevaClave);

// Rutas con parámetros al final
router.get('/:id', tableroController.obtenerPorId);
router.put('/:id', tableroController.actualizar);
router.delete('/:id', tableroController.eliminar);

module.exports = router;