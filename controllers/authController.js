const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

exports.registrarUsuario = async (req, res) => {
  const { nombre, correo, telefono, contrasena } = req.body;

  try {
    const [existe] = await db.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (existe.length > 0) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const token = uuidv4();

    await db.query(
      `INSERT INTO usuarios (nombre, correo, telefono, contrasena, token_confirmacion) 
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, correo, telefono, hash, token]
    );

    const confirmacionUrl = `http://localhost:3000/api/auth/confirmar/${token}`;
    const html = `<p>Hola ${nombre}, confirme su correo dando clic en el siguiente enlace:</p><a href="${confirmacionUrl}">${confirmacionUrl}</a>`;

    await sendEmail(correo, 'Confirme su cuenta', html);

    res.status(201).json({ mensaje: 'Usuario registrado. Revise su correo para confirmar.' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message || error });

  }
};

exports.confirmarCorreo = async (req, res) => {
  const { token } = req.params;

  try {
    const [usuario] = await db.query('SELECT * FROM usuarios WHERE token_confirmacion = ?', [token]);
    if (usuario.length === 0) return res.status(400).json({ mensaje: 'Token inválido' });

    await db.query(
      `UPDATE usuarios SET correo_confirmado = true, fecha_confirmacion = NOW(), token_confirmacion = NULL 
       WHERE id = ?`,
      [usuario[0].id]
    );

    // res.json({ mensaje: 'Correo confirmado exitosamente' });
    res.redirect('http://localhost:5173/');

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al confirmar correo', error });
  }
};

exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    const usuario = usuarios[0];

    if (!usuario || !usuario.correo_confirmado) {
      return res.status(401).json({ mensaje: 'Correo no confirmado o usuario inválido' });
    }

    const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValido) return res.status(401).json({ mensaje: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error });
  }
};

exports.solicitarRecuperacion = async (req, res) => {
  const { correo } = req.body;

  try {
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    const usuario = usuarios[0];

    if (!usuario) {
      return res.status(404).json({ mensaje: 'No se encontró usuario con ese correo' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await db.query(
      'UPDATE usuarios SET token_recuperacion = ?, token_expiracion = ? WHERE id = ?',
      [token, expiracion, usuario.id]
    );

    // const url = `http://localhost:3000/api/auth/restablecer/${token}`;
    const url = `http://localhost:5173/nueva-contrasena/${token}`;

    const html = `<p>Hola ${usuario.nombre}, haga clic en el siguiente enlace para restablecer su contraseña:</p>
                  <a href="${url}">${url}</a>`;

    await sendEmail(usuario.correo, 'Recuperación de contraseña', html);

    res.json({ mensaje: 'Se envió un enlace de recuperación a su correo' });
  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    res.status(500).json({ mensaje: 'Error al procesar solicitud' });
  }
};

exports.restablecerContrasena = async (req, res) => {
  const { token } = req.params;
  const { nuevaContrasena } = req.body;

  try {
    const [usuarios] = await db.query(
      'SELECT * FROM usuarios WHERE token_recuperacion = ? AND token_expiracion > NOW()',
      [token]
    );

    if (usuarios.length === 0) {
      return res.status(400).json({ mensaje: 'Token inválido o expirado' });
    }

    const hash = await bcrypt.hash(nuevaContrasena, 10);

    await db.query(
      `UPDATE usuarios 
       SET contrasena = ?, token_recuperacion = NULL, token_expiracion = NULL 
       WHERE id = ?`,
      [hash, usuarios[0].id]
    );

    res.json({ mensaje: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ mensaje: 'Error al restablecer contraseña' });
  }
};
