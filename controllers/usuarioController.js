const db = require('../db');

exports.listarUsuarios = async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT id, nombre, correo, telefono, rol, estado, fecha_creacion FROM usuarios'
    );
    res.json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
};

exports.suspenderUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `UPDATE usuarios 
       SET estado = CASE WHEN estado = 'activo' THEN 'suspendido' ELSE 'activo' END 
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Estado del usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al suspender usuario:', error);
    res.status(500).json({ mensaje: 'Error al suspender usuario' });
  }
};
