#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  log(`${colors.red}✗${colors.reset} ${message}`);
}

async function createAdminUser() {
  try {
    log(`${colors.bright}${colors.blue}👤 Creando usuario administrador...${colors.reset}\n`);

    const config = require('../config/config.json').development;
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database
    });

    // Verificar si ya existe un admin
    const [existingAdmin] = await connection.execute(
      'SELECT id_usuario FROM usuarios WHERE rol = ? LIMIT 1',
      ['admin']
    );

    if (existingAdmin.length > 0) {
      logSuccess('Usuario administrador ya existe');
      await connection.end();
      return;
    }

    // Crear hash de contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const now = new Date();

    // Insertar usuario administrador
    await connection.execute(`
      INSERT INTO usuarios (
        nombre_usuario, 
        nombre_completo, 
        email_institucional, 
        contrasena_hash, 
        rol, 
        estado_verificacion,
        puntos_actuales, 
        experiencia_total, 
        nivel, 
        racha_dias_consecutivos,
        fecha_creacion,
        fecha_actualizacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'admin',
      'Administrador del Sistema',
      'admin@studybooster.com',
      hashedPassword,
      'admin',
      'VERIFICADO',
      0,
      0,
      1,
      0,
      now,
      now
    ]);

    logSuccess('Usuario administrador creado exitosamente');
    log(`${colors.cyan}📧 Email: admin@studybooster.com${colors.reset}`);
    log(`${colors.cyan}🔑 Contraseña: admin123${colors.reset}`);
    log(`${colors.cyan}👤 Rol: admin${colors.reset}`);

    await connection.end();
  } catch (error) {
    logError(`Error creando administrador: ${error.message}`);
    process.exit(1);
  }
}

createAdminUser();
