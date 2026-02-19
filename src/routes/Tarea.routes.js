const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/Tarea.controller');
const { verificarToken } = require('../middlewares/Auth.middleware');

router.use(verificarToken);

router.post('/', tareaController.crear);
router.get('/mis-tareas', tareaController.obtenerMisTareas);
router.get('/lista/:idLista', tareaController.obtenerPorLista);

router.get('/lista/:idLista/usuarios-asignables', tareaController.obtenerUsuariosAsignables);

router.get('/:id', tareaController.obtenerPorId);
router.put('/:id', tareaController.actualizar);
router.put('/:id/estado', tareaController.cambiarEstado);
router.delete('/:id', tareaController.eliminar);

module.exports = router;