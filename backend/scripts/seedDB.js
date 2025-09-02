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
    await connection.query(dataSQL);
    console.log('Database seeded successfully.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Failed to seed database:', err.message || err);
  process.exit(1);
});
