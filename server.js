const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const propiedadRoutes = require('./routes/propiedadRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

// Crear app
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/propiedades', propiedadRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Gestión de Propiedades corriendo correctamente.');
});

// Manejo de errores genérico
app.use((err, req, res, next) => {
  console.error('Error interno:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor', error: err.message });
});

// Rutas de usuario
app.use('/api/usuarios', usuarioRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
