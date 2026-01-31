const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/Usuario.controller');
const { verificarToken } = require('../middlewares/Auth.middleware');

router.post('/registrar', usuarioController.registrar);
router.post('/login', usuarioController.login);

router.get('/perfil', verificarToken, usuarioController.obtenerPerfil);
router.get('/todos', verificarToken, usuarioController.obtenerTodos);
router.get('/:id', verificarToken, usuarioController.obtenerPorId);

router.put('/actualizar', verificarToken, usuarioController.actualizar);
router.delete('/eliminar', verificarToken, usuarioController.eliminar);

module.exports = router;