const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, soloAdmin, usuarioController.listarUsuarios);
router.put('/:id/suspender', verificarToken, soloAdmin, usuarioController.suspenderUsuario);

module.exports = router;
