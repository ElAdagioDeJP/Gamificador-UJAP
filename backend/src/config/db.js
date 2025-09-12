const models = require('../../models');
const { sequelize } = models;

async function ensureSchema() {
  const qi = sequelize.getQueryInterface();
  const dbName = sequelize.config && sequelize.config.database;
  if (!dbName) return;
  // Check and add missing columns for Usuarios: sexo, avatar_url
  const [rows] = await sequelize.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'Usuarios'`,
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
  if (alters.length) {
    await qi.sequelize.query(`ALTER TABLE Usuarios ${alters.join(', ')}`);
    // Backfill default avatars when possible
    await qi.sequelize.query(
      "UPDATE Usuarios SET avatar_url = CASE sexo WHEN 'M' THEN '/static/avatars/male.svg' WHEN 'F' THEN '/static/avatars/female.svg' ELSE avatar_url END WHERE avatar_url IS NULL"
    );
    console.log('Schema updated: Usuarios columns ensured ->', alters.map(a => a.split(' ')[2] || a).join(', '));
  }
}

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected via Sequelize');
    // No usar sync() cuando se usan migraciones
    // await sequelize.sync();
  } catch (err) {
    console.error('DB connection error:', err);
    throw err;
  }
}

module.exports = connectDB;
