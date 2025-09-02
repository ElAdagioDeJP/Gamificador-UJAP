require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const host = process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);
  const user = process.env.DB_USER || process.env.MYSQL_USER || 'root';
  const password = (process.env.DB_PASS ?? process.env.MYSQL_PASSWORD) ?? '';

  // Read SQL files from repo root
  const baseSQLPath = path.resolve(__dirname, '..', '..', 'DataBase.SQL');
  const dataSQLPath = path.resolve(__dirname, '..', '..', 'DataForDB.SQL');

  const baseSQL = fs.readFileSync(baseSQLPath, 'utf8');
  const dataSQL = fs.readFileSync(dataSQLPath, 'utf8');

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  try {
    console.log('Seeding database...');
    try {
      await connection.query(baseSQL);
    } catch (err) {
      if (err && (err.code === 'ER_TABLE_EXISTS_ERROR' || /already exists/i.test(err.message))) {
        console.warn('Schema already exists. Skipping CREATE TABLE steps.');
      } else {
        throw err;
      }
    }
    // Ensure we are using the right DB (in case baseSQL didn't include USE)
    await connection.query("USE studybooster_db;");

    // Ensure new columns exist (idempotent) - MySQL pre-8 doesn't support IF NOT EXISTS for columns
    const [cols] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Usuarios'`,
      ['studybooster_db']
    );
    const set = new Set(cols.map(r => r.COLUMN_NAME));
    const alters = [];
    if (!set.has('sexo')) alters.push("ADD COLUMN sexo ENUM('M','F') NULL AFTER email_institucional");
    if (!set.has('avatar_url')) alters.push("ADD COLUMN avatar_url VARCHAR(255) NULL AFTER sexo");
    if (alters.length) {
      await connection.query(`ALTER TABLE Usuarios ${alters.join(', ')}`);
    }

    // Populate sample data
    await connection.query(dataSQL);

    // Optional: set default avatar_url for existing users if sexo is set and avatar_url is NULL
    await connection.query(`
      UPDATE Usuarios SET avatar_url = CASE sexo WHEN 'M' THEN '/static/avatars/male.svg' WHEN 'F' THEN '/static/avatars/female.svg' ELSE avatar_url END
      WHERE avatar_url IS NULL;
    `);
    console.log('Database seeded successfully.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Failed to seed database:', err.message || err);
  process.exit(1);
});
