const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./Usuario.routes');
const tareaRoutes = require('./Tarea.routes');
const listaRoutes = require('./Lista.routes');
const tableroRoutes = require('./Tablero.routes');
const paises = require('./Pais.routes');
const zonaHoraria = require('./Zonahoraria.routes');
const notificacionRoutes = require('./Notificacion.routes');
const invitacionroutes = require('./compartir/Invitacion.routes');
const listacompartida = require('./compartir/ListaCompartida.routes');
const tablerocompartido = require('./compartir/TableroCompartido.routes');

router.use('/usuarios', usuarioRoutes);
router.use('/tareas', tareaRoutes);
router.use('/listas', listaRoutes);
router.use('/tableros', tableroRoutes);
router.use('/paises',paises);
router.use('/zonas-horarias',zonaHoraria);
router.use('/notificaciones', notificacionRoutes);
router.use('/invitaciones', invitacionroutes);
router.use('/listas-compartidas',listacompartida);
router.use('/tableros-compartidos',tablerocompartido);

module.exports = router;