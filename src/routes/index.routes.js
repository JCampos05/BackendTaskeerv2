const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./Usuario.routes');
const tareaRoutes = require('./Tarea.routes');
const listaRoutes = require('./Lista.routes');
const tableroRoutes = require('./Tablero.routes');
const paises = require('./Pais.routes');
const zonaHoraria = require('./Zonahoraria.routes');

router.use('/usuarios', usuarioRoutes);
router.use('/tareas', tareaRoutes);
router.use('/listas', listaRoutes);
router.use('/tableros', tableroRoutes);
router.use('/paises',paises);
router.use('/zonas-horarias',zonaHoraria);

module.exports = router;