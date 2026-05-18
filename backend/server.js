const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// ── Configuración de la conexión a PostgreSQL ──
const pool = new Pool({
  host: process.env.DB_HOST || 'sat_db',
  user: process.env.DB_USER || 'sat_agente',
  password: process.env.DB_PASSWORD || 'sat_password123',
  database: process.env.DB_NAME || 'sat_vehiculos',
  port: process.env.DB_PORT || 5432,
});

// ── 1. OBTENER TODOS LOS VEHÍCULOS (READ) ──
app.get('/api/vehiculos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, m.nombre_marca, l.nombre_linea 
      FROM Vehiculo v
      LEFT JOIN Linea_vehiculo l ON v.id_linea = l.id_linea
      LEFT JOIN Marca m ON l.id_marca = m.id_marca
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── 2. REGISTRAR UN NUEVO VEHÍCULO (CREATE) ──
app.post('/api/vehiculos', async (req, res) => {
  const { codigo_unico_vehiculo, placa_vehiculo, vin, id_color, id_uso, id_tipo, id_linea } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO Vehiculo (codigo_unico_vehiculo, placa_vehiculo, vin, id_color, id_uso, id_tipo, id_linea) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [codigo_unico_vehiculo, placa_vehiculo, vin, id_color, id_uso, id_tipo, id_linea]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Rechazado: El CUV, Placa o VIN ya existen en el sistema.' });
    }
    res.status(500).json({ error: 'Error al registrar el vehículo en la base de datos.' });
  }
});

// ── 3. ACTUALIZAR VEHÍCULO: motor, color y otros campos (UPDATE) ──
app.put('/api/vehiculos/:codigo', async (req, res) => {
  const codigo = parseInt(req.params.codigo, 10);
  const { placa_vehiculo, vin, id_color, id_uso, id_tipo, id_linea, motor, serie, asientos, cilindros, cc, ejes, toneladas } = req.body;
  try {
    const result = await pool.query(`
      UPDATE Vehiculo
      SET placa_vehiculo = COALESCE($1,  placa_vehiculo),
          vin            = COALESCE($2,  vin),
          id_color       = COALESCE($3,  id_color),
          id_uso         = COALESCE($4,  id_uso),
          id_tipo        = COALESCE($5,  id_tipo),
          id_linea       = COALESCE($6,  id_linea),
          motor          = COALESCE($7,  motor),
          serie          = COALESCE($8,  serie),
          asientos       = COALESCE($9,  asientos),
          cilindros      = COALESCE($10, cilindros),
          cc             = COALESCE($11, cc),
          ejes           = COALESCE($12, ejes),
          toneladas      = COALESCE($13, toneladas)
      WHERE codigo_unico_vehiculo = $14
      RETURNING *
    `, [placa_vehiculo, vin, id_color, id_uso, id_tipo, id_linea, motor, serie, asientos, cilindros, cc, ejes, toneladas, codigo]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    if (error.code === '23505') return res.status(400).json({ error: 'Rechazado: la placa o el VIN ya existen en el sistema.' });
    res.status(500).json({ error: 'Error interno al actualizar el vehículo.' });
  }
});

// ── OBTENER METADATOS (CATÁLOGOS) ──
app.get('/api/metadata', async (req, res) => {
  try {
    const [marcas, lineas, colores, usos, tipos] = await Promise.all([
      pool.query('SELECT id_marca, nombre_marca FROM Marca ORDER BY nombre_marca'),
      pool.query('SELECT id_linea, nombre_linea, id_marca FROM Linea_vehiculo ORDER BY nombre_linea'),
      pool.query('SELECT id_color, nombre_color FROM Color ORDER BY nombre_color'),
      pool.query('SELECT id_uso, descripcion_de_uso FROM Uso ORDER BY descripcion_de_uso'),
      pool.query('SELECT id_tipo, descripcion_de_tipo FROM Tipo ORDER BY descripcion_de_tipo'),
    ]);
    res.json({
      marcas: marcas.rows,
      lineas: lineas.rows,
      colores: colores.rows,
      usos: usos.rows,
      tipos: tipos.rows,
    });
  } catch (error) {
    console.error('Error al obtener metadata:', error);
    res.status(500).json({ error: 'Error interno al obtener catálogos' });
  }
});

// ── OBTENER TODAS LAS TARJETAS (ordenadas por nombre del propietario) ──
app.get('/api/tarjetas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.codigo_unico_de_tarjeta_de_circulacion AS tarjeta,
        p.nombre_razon_social                     AS propietario,
        p.nit,
        v.placa_vehiculo                          AS placa,
        m.nombre_marca,
        l.nombre_linea,
        c.nombre_color,
        v.modelo,
        v.motor,
        v.codigo_unico_vehiculo                   AS cuv,
        t.fecha_de_impresion,
        t.fecha_de_vencimiento,
        t.fecha_de_registro,
        t.estado
      FROM Tarjeta_de_circulacion t
      JOIN Propietario    p ON t.nit = p.nit
      JOIN Vehiculo       v ON t.codigo_unico_vehiculo = v.codigo_unico_vehiculo
      JOIN Linea_vehiculo l ON v.id_linea = l.id_linea
      JOIN Marca          m ON l.id_marca = m.id_marca
      JOIN Color          c ON v.id_color = c.id_color
      ORDER BY p.nombre_razon_social ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tarjetas:', error);
    res.status(500).json({ error: 'Error interno al obtener tarjetas' });
  }
});

// ── OBTENER DETALLE COMPLETO DE UNA TARJETA POR SU CÓDIGO ──
app.get('/api/tarjetas/:tarjeta', async (req, res) => {
  const tarjeta = req.params.tarjeta;
  try {
    const result = await pool.query(`
      SELECT
        t.codigo_unico_de_tarjeta_de_circulacion AS tarjeta,
        t.prefijo_formulario,
        t.fecha_de_impresion,
        t.fecha_de_vencimiento,
        t.fecha_de_registro,
        t.estado,
        p.nombre_razon_social  AS propietario,
        p.nit,
        p.tipo_contribuyente,
        p.cui,
        p.nombre_representante,
        p.direccion,
        p.telefono,
        p.correo,
        v.placa_vehiculo       AS placa,
        v.codigo_unico_vehiculo AS cuv,
        v.vin,
        v.serie,
        v.motor,
        v.asientos,
        v.cilindros,
        v.cc,
        v.modelo               AS anio,
        v.ejes,
        v.toneladas,
        v.id_color,
        v.id_uso,
        v.id_tipo,
        v.id_linea,
        m.nombre_marca         AS marca,
        l.nombre_linea         AS linea,
        c.nombre_color         AS color,
        u.descripcion_de_uso   AS uso,
        tp.descripcion_de_tipo AS tipo
      FROM Tarjeta_de_circulacion t
      JOIN Propietario    p  ON t.nit = p.nit
      JOIN Vehiculo       v  ON t.codigo_unico_vehiculo = v.codigo_unico_vehiculo
      JOIN Linea_vehiculo l  ON v.id_linea = l.id_linea
      JOIN Marca          m  ON l.id_marca = m.id_marca
      JOIN Color          c  ON v.id_color = c.id_color
      JOIN Uso            u  ON v.id_uso = u.id_uso
      JOIN Tipo           tp ON v.id_tipo = tp.id_tipo
      WHERE t.codigo_unico_de_tarjeta_de_circulacion = $1
    `, [tarjeta]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Tarjeta no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener detalle de tarjeta:', error);
    res.status(500).json({ error: 'Error interno al obtener detalle de tarjeta' });
  }
});

// ── MANTENIMIENTO: CAMBIO DE PROPIETARIO ──
app.put('/api/tarjetas/:tarjeta/propietario', async (req, res) => {
  const tarjeta = req.params.tarjeta;
  const { nit, nombre_razon_social, tipo_contribuyente, cui, nombre_representante, direccion, telefono, correo } = req.body;

  if (!nit || !nombre_razon_social) {
    return res.status(400).json({ error: 'NIT y nombre son obligatorios' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      INSERT INTO Propietario (nit, tipo_contribuyente, nombre_razon_social, cui, nombre_representante, direccion, telefono, correo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (nit) DO UPDATE SET
        tipo_contribuyente   = EXCLUDED.tipo_contribuyente,
        nombre_razon_social  = EXCLUDED.nombre_razon_social,
        cui                  = EXCLUDED.cui,
        nombre_representante = EXCLUDED.nombre_representante,
        direccion            = EXCLUDED.direccion,
        telefono             = EXCLUDED.telefono,
        correo               = EXCLUDED.correo
    `, [nit, tipo_contribuyente || 'Individual', nombre_razon_social, cui || null, nombre_representante || null, direccion || null, telefono || null, correo || null]);

    const result = await client.query(`
      UPDATE Tarjeta_de_circulacion
      SET nit = $1
      WHERE codigo_unico_de_tarjeta_de_circulacion = $2
      RETURNING *
    `, [nit, tarjeta]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Propietario actualizado correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al cambiar propietario:', error);
    res.status(500).json({ error: 'Error interno al cambiar el propietario' });
  } finally {
    client.release();
  }
});

// ── MANTENIMIENTO: CAMBIO DE MOTOR ──
app.put('/api/tarjetas/:tarjeta/motor', async (req, res) => {
  const tarjeta = req.params.tarjeta;
  const { motor } = req.body;

  if (!motor) return res.status(400).json({ error: 'El número de motor es obligatorio' });

  try {
    const result = await pool.query(`
      UPDATE Vehiculo
      SET motor = $1
      WHERE codigo_unico_vehiculo = (
        SELECT codigo_unico_vehiculo FROM Tarjeta_de_circulacion
        WHERE codigo_unico_de_tarjeta_de_circulacion = $2
      )
      RETURNING motor
    `, [motor, tarjeta]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Tarjeta o vehículo no encontrado' });
    res.json({ success: true, message: 'Motor actualizado correctamente', motor: result.rows[0].motor });
  } catch (error) {
    console.error('Error al cambiar motor:', error);
    res.status(500).json({ error: 'Error interno al cambiar el motor' });
  }
});

// ── MANTENIMIENTO: CAMBIO DE COLOR ──
app.put('/api/tarjetas/:tarjeta/color', async (req, res) => {
  const tarjeta = req.params.tarjeta;
  const { id_color } = req.body;

  if (!id_color) return res.status(400).json({ error: 'El color es obligatorio' });

  try {
    const result = await pool.query(`
      UPDATE Vehiculo
      SET id_color = $1
      WHERE codigo_unico_vehiculo = (
        SELECT codigo_unico_vehiculo FROM Tarjeta_de_circulacion
        WHERE codigo_unico_de_tarjeta_de_circulacion = $2
      )
      RETURNING id_color
    `, [id_color, tarjeta]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Tarjeta o vehículo no encontrado' });
    res.json({ success: true, message: 'Color actualizado correctamente' });
  } catch (error) {
    console.error('Error al cambiar color:', error);
    res.status(500).json({ error: 'Error interno al cambiar el color' });
  }
});

// ── DESACTIVACIÓN / REACTIVACIÓN DE TARJETA ──
// Estados válidos: 'ACTIVA', 'INACTIVA_IMPAGO', 'INACTIVA_VENCIMIENTO'
app.put('/api/tarjetas/:tarjeta/estado', async (req, res) => {
  const tarjeta = req.params.tarjeta;
  const { estado } = req.body;

  const VALID = ['ACTIVA', 'INACTIVA_IMPAGO', 'INACTIVA_VENCIMIENTO'];
  if (!VALID.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Permitidos: ${VALID.join(', ')}` });
  }

  try {
    const result = await pool.query(`
      UPDATE Tarjeta_de_circulacion
      SET estado = $1
      WHERE codigo_unico_de_tarjeta_de_circulacion = $2
      RETURNING *
    `, [estado, tarjeta]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Tarjeta no encontrada' });
    res.json({ success: true, message: `Tarjeta actualizada a: ${estado}`, data: result.rows[0] });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: 'Error interno al cambiar el estado de la tarjeta' });
  }
});

// ── AGREGAR NUEVO ELEMENTO A CATÁLOGO ──
app.post('/api/metadata/:type', async (req, res) => {
  const { type } = req.params;
  const { name, id_marca } = req.body;

  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    let query, values;
    switch (type) {
      case 'marca':
        query = 'INSERT INTO Marca (nombre_marca) VALUES ($1) RETURNING id_marca as id, nombre_marca as name';
        values = [name];
        break;
      case 'linea':
        if (!id_marca) return res.status(400).json({ error: 'Se requiere la marca para agregar una línea' });
        query = 'INSERT INTO Linea_vehiculo (nombre_linea, id_marca) VALUES ($1, $2) RETURNING id_linea as id, nombre_linea as name, id_marca as "marcaId"';
        values = [name, id_marca];
        break;
      case 'color':
        query = 'INSERT INTO Color (nombre_color) VALUES ($1) RETURNING id_color as id, nombre_color as name';
        values = [name];
        break;
      case 'uso':
        query = 'INSERT INTO Uso (descripcion_de_uso) VALUES ($1) RETURNING id_uso as id, descripcion_de_uso as name';
        values = [name];
        break;
      case 'tipo':
        query = 'INSERT INTO Tipo (descripcion_de_tipo) VALUES ($1) RETURNING id_tipo as id, descripcion_de_tipo as name';
        values = [name];
        break;
      default:
        return res.status(400).json({ error: 'Tipo de catálogo inválido' });
    }
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`Error al agregar a ${type}:`, error);
    res.status(500).json({ error: 'Error interno al agregar al catálogo' });
  }
});

// ── REGISTRAR TRANSACCIÓN COMPLETA (PROPIETARIO + VEHÍCULO + TARJETA) ──
app.post('/api/registro', async (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'Datos no proporcionados' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Upsert Propietario — todos los campos
    await client.query(`
      INSERT INTO Propietario (nit, tipo_contribuyente, nombre_razon_social, cui, nombre_representante, direccion, telefono, correo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (nit) DO UPDATE SET
        tipo_contribuyente   = EXCLUDED.tipo_contribuyente,
        nombre_razon_social  = EXCLUDED.nombre_razon_social,
        cui                  = EXCLUDED.cui,
        nombre_representante = EXCLUDED.nombre_representante,
        direccion            = EXCLUDED.direccion,
        telefono             = EXCLUDED.telefono,
        correo               = EXCLUDED.correo
    `, [data.ownerNit, data.tipoContribuyente, data.ownerName,
        data.cui || null, data.nombreRepresentante || null, data.direccion || null,
        data.ownerPhone || null, data.ownerEmail || null]);

    // 2. Código único del vehículo (simulado)
    const codigoUnicoVehiculo = Date.now() % 100000000;

    // 3. Insertar Vehículo — todos los campos
    await client.query(`
      INSERT INTO Vehiculo
        (codigo_unico_vehiculo, placa_vehiculo, vin, serie, motor, modelo,
         asientos, cilindros, cc, ejes, toneladas, id_color, id_uso, id_tipo, id_linea)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [codigoUnicoVehiculo, data.plate, data.vin,
        data.serie || null, data.motor || null,
        Number(data.modelYear),
        data.asientos  ? Number(data.asientos)  : null,
        data.cilindros ? Number(data.cilindros) : null,
        data.cc        ? Number(data.cc)        : null,
        data.ejes      ? Number(data.ejes)      : null,
        data.toneladas ? parseFloat(data.toneladas) : null,
        Number(data.colorId), Number(data.usoId), Number(data.tipoId), Number(data.lineaId)]);

    // 4. Insertar Tarjeta con estado ACTIVA
    await client.query(`
      INSERT INTO Tarjeta_de_circulacion
        (codigo_unico_de_tarjeta_de_circulacion, prefijo_formulario, fecha_de_impresion, fecha_de_vencimiento, estado, codigo_unico_vehiculo, nit)
      VALUES ($1, $2, $3, $4, 'ACTIVA', $5, $6)
    `, [data.cardCode, data.prefijo, data.fechaImpresion || null, data.fechaVencimiento, codigoUnicoVehiculo, data.ownerNit]);

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Registro completado exitosamente', codigoUnicoVehiculo });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en la transacción de registro:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Rechazado: La placa, VIN o código de tarjeta ya existen en el sistema.' });
    }
    res.status(500).json({ error: 'Error al procesar el registro completo.' });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚖️  Servidor SAT (Postgres) corriendo en el puerto ${PORT}`);
});