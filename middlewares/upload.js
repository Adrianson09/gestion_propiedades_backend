const multer = require('multer');
const path = require('path');

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Se guarda en la carpeta 'uploads' dentro del proyecto
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Genera un nombre único para el archivo, preservando la extensión original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de archivos: aquí puedes validar tipos MIME si es necesario.
const fileFilter = (req, file, cb) => {
  // Por defecto se aceptan todos los archivos; ajusta si lo requieres.
  cb(null, true);
};

const limits = {
  fileSize: 10 * 1024 * 1024 // Máximo 5 MB por archivo
};

// Inicialización de multer con la configuración anterior
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

module.exports = upload;
