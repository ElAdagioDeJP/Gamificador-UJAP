const models = require('../../models');
const { sequelize } = models;

async function ensureSchema() {
  try {
    const qi = sequelize.getQueryInterface();
    const dbName = sequelize.config && sequelize.config.database;
    if (!dbName) {
      console.warn('⚠️  No se pudo obtener el nombre de la base de datos');
      return;
    }

    // Verificar si la tabla usuarios existe
    const [tables] = await sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'usuarios'`,
      { replacements: { db: dbName } }
    );

    if (tables.length === 0) {
      console.warn('⚠️  Tabla usuarios no existe. Ejecute las migraciones primero.');
      return;
    }

    // Check and add missing columns for usuarios: sexo, avatar_url
    const [rows] = await sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'usuarios'`,
      { replacements: { db: dbName } }
    );
    
    const cols = new Set(rows.map(r => r.COLUMN_NAME));
    const alters = [];
    
    if (!cols.has('sexo')) {
      alters.push("ADD COLUMN sexo ENUM('M','F') NULL AFTER email_institucional");
    }
    if (!cols.has('avatar_url')) {
      alters.push("ADD COLUMN avatar_url VARCHAR(255) NULL AFTER sexo");
    }
    if (!cols.has('estado_verificacion')) {
      alters.push("ADD COLUMN estado_verificacion ENUM('PENDIENTE', 'VERIFICADO', 'RECHAZADO') NOT NULL DEFAULT 'VERIFICADO' AFTER rol");
    }
    // Add academic fields if missing
    if (!cols.has('universidad')) {
      alters.push("ADD COLUMN universidad VARCHAR(255) NULL AFTER estado_verificacion");
    }
    if (!cols.has('carrera')) {
      alters.push("ADD COLUMN carrera VARCHAR(255) NULL AFTER universidad");
    }
    if (!cols.has('tema')) {
      alters.push("ADD COLUMN tema VARCHAR(100) NULL DEFAULT 'claro' AFTER carrera");
    }
    
    if (alters.length) {
      await qi.sequelize.query(`ALTER TABLE usuarios ${alters.join(', ')}`);
      
      // Backfill default avatars when possible
      await qi.sequelize.query(
        "UPDATE usuarios SET avatar_url = CASE sexo WHEN 'M' THEN '/static/avatars/male.svg' WHEN 'F' THEN '/static/avatars/female.svg' ELSE avatar_url END WHERE avatar_url IS NULL"
      );

      // Ensure tema has a sensible default when newly added
      try {
        await qi.sequelize.query("UPDATE usuarios SET tema = 'claro' WHERE tema IS NULL OR tema = ''");
      } catch (e) {
        // Ignore if column not present yet in some weird race
      }
      
      console.log('✅ Schema actualizado: Columnas añadidas ->', alters.map(a => a.split(' ')[2] || a).join(', '));
    } else {
      console.log('✅ Schema ya está actualizado');
    }
  } catch (error) {
    console.error('❌ Error verificando schema:', error.message);
    // No lanzar error para no interrumpir el inicio del servidor
  }
}

async function connectDB() {
  let retries = 3;
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('✅ MySQL conectado via Sequelize');
      
      // Verificar schema después de conectar
      await ensureSchema();
      
      return;
    } catch (err) {
      retries--;
      console.error(`❌ Error de conexión a DB (intentos restantes: ${retries}):`, err.message);
      
      if (retries === 0) {
        console.error('💥 No se pudo conectar a la base de datos después de 3 intentos');
        throw err;
      }
      
      console.log(`⏳ Reintentando en 2 segundos...`);
      await delay(2000);
    }
  }
}

module.exports = connectDB;
