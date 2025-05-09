const db = require('../db');
const path = require('path');
const fs = require('fs');

exports.crearPropiedad = async (req, res) => {
  const {
    nombre,
    ubicacion = null,
  numero_finca = null,
  prestamo = false,
  banco = null,
  numero_cuenta_prestamo = null,
  cuota = null,
  frecuencia_pago = null,
  estado = null,
  inquilino_nombre = null,
  inquilino_telefono = null,
  inquilino_correo = null,
  monto_arriendo = null,
  inicio_contrato = null,
  fecha_pago = null,
  fecha_pago_banco = null,
  municipalidad = null,
  codigo_pago_municipalidad = null,
  contrato_electricidad = null,
  contrato_agua = null,
  contrato_cable = null,
  contrato_internet = null,
  contrato_otros = null,
  correos_referencia = null,
  notas = null,
  cuenta_bancaria_deposito = null
  } = req.body;

  const usuario_id = req.usuario.id;
  const foto_principal = req.files?.foto_principal?.[0]?.filename || null;

  try {
    // Inserción en la tabla propiedades. Se ignora la columna fecha_creacion porque se asigna por defecto.
    const [result] = await db.query(
      `INSERT INTO propiedades 
      (usuario_id, nombre, ubicacion, foto_principal, numero_finca, prestamo, banco, numero_cuenta_prestamo, cuota,
       frecuencia_pago, estado, inquilino_nombre, inquilino_telefono, inquilino_correo, monto_arriendo,
       inicio_contrato, fecha_pago, fecha_pago_banco, municipalidad, codigo_pago_municipalidad, contrato_electricidad,
       contrato_agua, contrato_cable, contrato_internet, contrato_otros, correos_referencia, notas, cuenta_bancaria_deposito)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id,
        nombre,
        ubicacion,
        foto_principal,
        numero_finca,
        prestamo,
        banco,
        numero_cuenta_prestamo,
        cuota,
        frecuencia_pago,
        estado,
        inquilino_nombre,
        inquilino_telefono,
        inquilino_correo,
        monto_arriendo,
        inicio_contrato,
        fecha_pago,
        fecha_pago_banco,
        municipalidad,
        codigo_pago_municipalidad,
        contrato_electricidad,
        contrato_agua,
        contrato_cable,
        contrato_internet,
        contrato_otros,
        correos_referencia,
        notas,
        cuenta_bancaria_deposito
      ]
    );

    const propiedadId = result.insertId;

    if (req.files && req.files.adjuntos) {
      for (const archivo of req.files.adjuntos) {
        await db.query(
          `INSERT INTO adjuntos_propiedad (propiedad_id, nombre_archivo, ruta_archivo, tipo_archivo)
           VALUES (?, ?, ?, ?)`,
          [propiedadId, archivo.originalname, `uploads/${archivo.filename}`, archivo.mimetype]
        );
      }
    }

    res.status(201).json({ mensaje: 'Propiedad creada correctamente', id: propiedadId });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear propiedad', error });
  }
};

/**
 * Lista todas las propiedades.
 * - Si el usuario es administrador, muestra todas las propiedades.
 * - Si no, solo muestra aquellas registradas por el usuario.
 */
exports.listarPropiedades = async (req, res) => {
  const usuario = req.usuario;

  try {
    const query =
      usuario.rol === 'admin'
        ? 'SELECT * FROM propiedades'
        : 'SELECT * FROM propiedades WHERE usuario_id = ?';

    const [propiedades] = await db.query(query, usuario.rol === 'admin' ? [] : [usuario.id]);

    res.json(propiedades);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener propiedades', error });
  }
};

/**
 * Obtiene el detalle de una propiedad en función de su id.
 */
exports.obtenerPropiedad = async (req, res) => {
  const { id } = req.params;

  try {
    const [propiedades] = await db.query('SELECT * FROM propiedades WHERE id = ?', [id]);

    if (propiedades.length === 0) {
      return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
    }

    res.json(propiedades[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la propiedad', error });
  }
};

/**
 * Edita los datos de una propiedad.
 * Se actualizan todos los campos que se envíen en el body,
 * y si se envía una nueva foto principal se reemplaza la existente.
 */
exports.editarPropiedad = async (req, res) => {
  const { id } = req.params;
  const campos = req.body;
  const nuevaFoto = req.file ? req.file.filename : null;

  if (nuevaFoto) {
    campos.foto_principal = nuevaFoto;
  }

  try {
    await db.query('UPDATE propiedades SET ? WHERE id = ?', [campos, id]);
    res.json({ mensaje: 'Propiedad actualizada correctamente' });
  } catch (error) {
    console.error('Error al editar propiedad:', error);
    res.status(500).json({ mensaje: 'Error al editar propiedad', error });
  }
};

/**
 * Permite la carga de archivos adjuntos para una propiedad ya existente.
 * Se espera que se envíen varios archivos; cada uno se inserta en la tabla "adjuntos_propiedad".
 */
exports.subirAdjuntos = async (req, res) => {
  const { id } = req.params; // id de la propiedad
  const archivos = req.files;

  if (!archivos || archivos.length === 0) {
    return res.status(400).json({ mensaje: 'No se subieron archivos' });
  }

  try {
    for (const archivo of archivos) {
      await db.query(
        `INSERT INTO adjuntos_propiedad (propiedad_id, nombre_archivo, ruta_archivo, tipo_archivo)
         VALUES (?, ?, ?, ?)`,
        [id, archivo.originalname, `uploads/${archivo.filename}`, archivo.mimetype]
      );
    }

    res.status(201).json({ mensaje: 'Archivos adjuntos guardados exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar adjuntos', error });
  }
};

/**
 * Obtiene los archivos adjuntos asociados a una propiedad.
 */
exports.obtenerAdjuntos = async (req, res) => {
  const { id } = req.params;

  try {
    const [adjuntos] = await db.query(
      'SELECT * FROM adjuntos_propiedad WHERE propiedad_id = ?',
      [id]
    );
    res.json(adjuntos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener adjuntos', error });
  }
};


exports.eliminarAdjunto = async (req, res) => {
  const { id } = req.params;

  try {
    // Consultar la ruta del archivo antes de eliminarlo de la BD
    const [[adjunto]] = await db.query('SELECT ruta_archivo FROM adjuntos_propiedad WHERE id = ?', [id]);

    if (!adjunto) {
      return res.status(404).json({ mensaje: 'Adjunto no encontrado' });
    }

    // Eliminar archivo del disco
    const rutaFisica = path.join(__dirname, '..', adjunto.ruta_archivo);
    if (fs.existsSync(rutaFisica)) {
      fs.unlinkSync(rutaFisica);
    }

    // Eliminar de la base de datos
    await db.query('DELETE FROM adjuntos_propiedad WHERE id = ?', [id]);

    res.json({ mensaje: 'Archivo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar archivo', error });
  }
};



exports.eliminarPropiedad = async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar adjuntos primero
    const [adjuntos] = await db.query('SELECT ruta_archivo FROM adjuntos_propiedad WHERE propiedad_id = ?', [id]);

    for (const adjunto of adjuntos) {
      const rutaFisica = path.join(__dirname, '..', adjunto.ruta_archivo);
      if (fs.existsSync(rutaFisica)) {
        fs.unlinkSync(rutaFisica);
      }
    }

    await db.query('DELETE FROM adjuntos_propiedad WHERE propiedad_id = ?', [id]);
    await db.query('DELETE FROM propiedades WHERE id = ?', [id]);

    res.json({ mensaje: 'Propiedad eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    res.status(500).json({ mensaje: 'Error al eliminar propiedad', error });
  }
};
