const express = require('express');
const router = express.Router();
const listaController = require('../controllers/Lista.controller');
const { verificarToken } = require('../middlewares/Auth.middleware');
const { verificarAccesoLista } = require('../middlewares/Permisos.middleware');

router.use(verificarToken);

router.post('/', listaController.crear);
router.get('/mis-listas', listaController.obtenerMisListas);
router.get('/tablero/:idTablero', listaController.obtenerPorTablero);
router.put('/reordenar', listaController.reordenar);

router.post('/unirse-con-clave', listaController.unirseConClave);

router.get('/:id', verificarAccesoLista(['leer']), listaController.obtenerPorId);
router.get('/:id/tareas', verificarAccesoLista(['leer']), listaController.obtenerConTareas);
router.put('/:id/importante', verificarAccesoLista(['editar']), listaController.marcarImportante);
router.put('/:id', verificarAccesoLista(['editar']), listaController.actualizar);
router.delete('/:id', verificarAccesoLista(['eliminar']), listaController.eliminar);

module.exports = router;