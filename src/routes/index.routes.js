const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./Usuario.routes');
const tareaRoutes = require('./Tarea.routes');
const listaRoutes = require('./Lista.routes');
const tableroRoutes = require('./Tablero.routes');
const columnaRoutes = require('./Columna.routes');

router.use('/usuarios', usuarioRoutes);
router.use('/tareas', tareaRoutes);
router.use('/listas', listaRoutes);
router.use('/tableros', tableroRoutes);
router.use('/columnas', columnaRoutes);

module.exports = router;