const express = require('express');
const router = express.Router();
const paisController = require('../controllers/Pais.controller');
const { verificarToken } = require('../middlewares/Auth.middleware');

router.get('/todos', verificarToken, paisController.obtenerTodos);
router.get('/codigo/:codigo', verificarToken, paisController.obtenerPorCodigo);
router.get('/:id', verificarToken, paisController.obtenerPorId);

module.exports = router;