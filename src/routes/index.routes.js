const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./Usuario.routes');
const tareaRoutes = require('./Tarea.routes');
const listaRoutes = require('./Lista.routes');
const tableroRoutes = require('./Tablero.routes');

router.use('/usuarios', usuarioRoutes);
router.use('/tareas', tareaRoutes);
router.use('/listas', listaRoutes);
router.use('/tableros', tableroRoutes);

module.exports = router;