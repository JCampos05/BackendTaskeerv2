const express = require('express');
const router = express.Router();
const zonaHorariaController = require('../controllers/Zonahoraria.controller');
const { verificarToken } = require('../middlewares/Auth.middleware');

router.get('/todas', verificarToken, zonaHorariaController.obtenerTodas);
router.get('/:id', verificarToken, zonaHorariaController.obtenerPorId);

module.exports = router;