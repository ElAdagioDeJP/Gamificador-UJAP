require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const host = process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);
  const user = process.env.DB_USER || process.env.MYSQL_USER || 'root';
  const password = (process.env.DB_PASS ?? process.env.MYSQL_PASSWORD) ?? 'jJUNIOR*27';

  const baseSQLPath = path.resolve(__dirname, '..', '..', 'DataBase.SQL');
  const sql = fs.readFileSync(baseSQLPath, 'utf8');

  const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  try {
    console.log('Applying base SQL schema...');
    await connection.query(sql);
    console.log('Base SQL applied successfully.');
  } catch (err) {
    console.error('Failed to apply base SQL:', err.message || err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main().catch(err=>{console.error(err);process.exit(1);});
