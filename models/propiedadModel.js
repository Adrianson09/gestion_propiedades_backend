const db = require('../db');

const crearPropiedad = async (datos) => {
  const sql = `
    INSERT INTO propiedades 
    (usuario_id, nombre, ubicacion, foto_principal, numero_finca, prestamo, banco, numero_cuenta_prestamo, cuota,
     frecuencia_pago, estado, inquilino_nombre, inquilino_telefono, inquilino_correo, monto_arriendo,
     inicio_contrato, fecha_pago, fecha_pago_banco, municipalidad, codigo_pago_municipalidad, contrato_electricidad,
     contrato_agua, contrato_cable, contrato_internet, contrato_otros, correos_referencia, notas, cuenta_bancaria_deposito)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(sql, datos);
  return result.insertId;
};

const listarPorUsuario = async (usuario_id) => {
  const [rows] = await db.query('SELECT * FROM propiedades WHERE usuario_id = ?', [usuario_id]);
  return rows;
};

const listarTodas = async () => {
  const [rows] = await db.query('SELECT * FROM propiedades');
  return rows;
};

const obtenerPorId = async (id) => {
  const [rows] = await db.query('SELECT * FROM propiedades WHERE id = ?', [id]);
  return rows[0];
};

const actualizarPropiedad = async (id, datos) => {
  const [result] = await db.query('UPDATE propiedades SET ? WHERE id = ?', [datos, id]);
  return result;
};

module.exports = {
  crearPropiedad,
  listarPorUsuario,
  listarTodas,
  obtenerPorId,
  actualizarPropiedad
};
