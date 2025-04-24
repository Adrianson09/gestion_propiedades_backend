const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registro de usuario
router.post('/registro', authController.registrarUsuario);

// Confirmación de correo
router.get('/confirmar/:token', authController.confirmarCorreo);

// Login
router.post('/login', authController.login);

// Recuperación de contraseña
router.post('/recuperar', authController.solicitarRecuperacion);

// Restablecimiento de contraseña
router.post('/restablecer/:token', authController.restablecerContrasena);


module.exports = router;
