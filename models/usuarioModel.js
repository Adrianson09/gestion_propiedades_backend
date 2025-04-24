const db = require('../db');

const crearUsuario = async ({ nombre, correo, telefono, contrasena, token }) => {
  const sql = `
    INSERT INTO usuarios (nombre, correo, telefono, contrasena, token_confirmacion) 
    VALUES (?, ?, ?, ?, ?)`;
  const valores = [nombre, correo, telefono, contrasena, token];
  const [result] = await db.query(sql, valores);
  return result.insertId;
};

const buscarPorCorreo = async (correo) => {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
  return rows[0];
};

const buscarPorToken = async (token) => {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE token_confirmacion = ?', [token]);
  return rows[0];
};

const confirmarCorreo = async (id) => {
  await db.query(`
    UPDATE usuarios SET correo_confirmado = true, fecha_confirmacion = NOW(), token_confirmacion = NULL
    WHERE id = ?`, [id]);
};

module.exports = {
  crearUsuario,
  buscarPorCorreo,
  buscarPorToken,
  confirmarCorreo
};
