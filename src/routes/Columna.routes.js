const express = require('express');
const router = express.Router();
const columnaController = require('../controllers/Columna.controller');
const { verificarToken } = require('../middlewares/Auth.middleware');

router.use(verificarToken);

router.post('/', columnaController.crear);
router.get('/tablero/:idTablero', columnaController.obtenerPorTablero);
router.get('/:id', columnaController.obtenerPorId);

router.put('/:id', columnaController.actualizar);
router.put('/reordenar', columnaController.reordenar);
router.delete('/:id', columnaController.eliminar);

module.exports = router;