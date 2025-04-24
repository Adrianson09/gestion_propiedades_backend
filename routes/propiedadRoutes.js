const express = require('express');
const router = express.Router();
const propiedadesController = require('../controllers/propiedadesController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); // Configuración de Multer

// Crear propiedad (un archivo único para foto_principal y varios para adjuntos)
router.post(
  '/',
  verificarToken,
  upload.fields([
    { name: 'foto_principal', maxCount: 1 },
    { name: 'adjuntos', maxCount: 10 }
  ]),
  propiedadesController.crearPropiedad
);

// Listar propiedades (admin: todas / usuario: propias)
router.get('/', verificarToken, propiedadesController.listarPropiedades);

// Obtener propiedad por ID
router.get('/:id', verificarToken, propiedadesController.obtenerPropiedad);

// Editar propiedad (opcionalmente actualizar foto_principal)
router.put(
  '/:id',
  verificarToken,
  upload.single('foto_principal'),
  propiedadesController.editarPropiedad
);

// Subir archivos adjuntos a una propiedad existente
router.post(
  '/:id/adjuntos',
  verificarToken,
  upload.array('adjuntos'),
  propiedadesController.subirAdjuntos
);

// Obtener archivos adjuntos de una propiedad
router.get('/:id/adjuntos', verificarToken, propiedadesController.obtenerAdjuntos);

// Eliminar un archivo adjunto de una propiedad
router.delete('/adjuntos/:id', verificarToken, propiedadesController.eliminarAdjunto);

router.delete('/:id', verificarToken, propiedadesController.eliminarPropiedad);


module.exports = router;
