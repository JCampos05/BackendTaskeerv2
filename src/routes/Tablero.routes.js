const express = require('express');
const router = express.Router();
const tableroController = require('../controllers/Tablero.controller');
const { verificarToken } = require('../middlewares/Auth.middleware');

router.use(verificarToken);

router.post('/', tableroController.crear);
router.get('/mis-tableros', tableroController.obtenerMisTableros);
router.get('/:id', tableroController.obtenerPorId);
router.get('/:id/completo', tableroController.obtenerCompleto);

router.put('/:id', tableroController.actualizar);
router.put('/:id/generar-clave', tableroController.generarNuevaClave);
router.delete('/:id', tableroController.eliminar);

module.exports = router;