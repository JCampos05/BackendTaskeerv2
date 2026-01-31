const express = require('express');
const router = express.Router();
const listaController = require('../controllers/Lista.controller');
const { verificarToken } = require('../middlewares/Auth.middleware');

router.use(verificarToken);

router.post('/', listaController.crear);
router.get('/mis-listas', listaController.obtenerMisListas);
router.get('/tablero/:idTablero', listaController.obtenerPorTablero);
router.get('/:id', listaController.obtenerPorId);
router.get('/:id/tareas', listaController.obtenerConTareas);

router.put('/:id', listaController.actualizar);
router.delete('/:id', listaController.eliminar);

module.exports = router;