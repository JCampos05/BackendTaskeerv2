const express = require('express');
const router = express.Router();
const listaCompartidaController = require('../../controllers/compartir/ListaCompartida.controller');
const { verificarToken } = require('../../middlewares/Auth.middleware');
const { verificarAccesoLista } = require('../../middlewares/Permisos.middleware');

router.use(verificarToken);

router.get('/compartidas-conmigo', listaCompartidaController.obtenerListasCompartidasConmigo);
router.get('/compartiendose', listaCompartidaController.obtenerListasCompartiendose);
router.get('/:idLista/colaboradores', verificarAccesoLista(['leer']), listaCompartidaController.obtenerColaboradores);
router.get('/:idLista/permisos', verificarAccesoLista(['leer']), listaCompartidaController.obtenerPermisos);
router.put('/:idLista/colaboradores/:idUsuario/rol', verificarAccesoLista(['administrar']), listaCompartidaController.actualizarRol);
router.delete('/:idLista/colaboradores/:idUsuario', verificarAccesoLista(['administrar']), listaCompartidaController.removerColaborador);
router.post('/:idLista/abandonar', verificarAccesoLista(['leer']), listaCompartidaController.abandonarLista);

module.exports = router;