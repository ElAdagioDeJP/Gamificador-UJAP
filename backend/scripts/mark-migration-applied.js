#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

async function markMigrationApplied() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'studybooster_db'
  });

  try {
    // Insertar la migración como aplicada
    await connection.execute(
      'INSERT INTO SequelizeMeta (name) VALUES (?)',
      ['20250912T051126-regenerate-from-models.js']
    );
    
    console.log('✅ Migración marcada como aplicada exitosamente');
    
    // Verificar estado
    const [rows] = await connection.execute('SELECT * FROM SequelizeMeta ORDER BY name');
    console.log('\n📋 Estado actual de migraciones:');
    rows.forEach(row => {
      console.log(`  ✓ ${row.name}`);
    });
    
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️  La migración ya estaba marcada como aplicada');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await connection.end();
  }
}

markMigrationApplied();
