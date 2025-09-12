#!/usr/bin/env node

const mysql = require('mysql2/promise');

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

function logWarning(message) {
  log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

async function testConnection() {
  log(`${colors.bright}${colors.blue}🔍 Probando conexión a MySQL...${colors.reset}\n`);

  const configs = [
    { name: 'Sin contraseña', password: '' },
    { name: 'Con contraseña jJUNIOR*27', password: 'jJUNIOR*27' },
    { name: 'Con contraseña root', password: 'root' },
    { name: 'Con contraseña 123456', password: '123456' }
  ];

  for (const config of configs) {
    try {
      log(`Probando: ${config.name}...`);
      
      const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: config.password
      });

      await connection.execute('SELECT 1 as test');
      await connection.end();
      
      logSuccess(`¡Conexión exitosa con: ${config.name}`);
      log(`${colors.cyan}💡 Usa esta contraseña en config/config.json${colors.reset}`);
      return config.password;
      
    } catch (error) {
      logError(`Falló con: ${config.name} - ${error.message}`);
    }
  }

  logError('No se pudo conectar con ninguna configuración');
  log(`${colors.yellow}💡 Posibles soluciones:${colors.reset}`);
  log(`${colors.yellow}  1. Verificar que MySQL esté ejecutándose${colors.reset}`);
  log(`${colors.yellow}  2. Verificar la contraseña de root${colors.reset}`);
  log(`${colors.yellow}  3. Crear usuario con permisos apropiados${colors.reset}`);
  
  return null;
}

async function createDatabaseIfNotExists(password) {
  try {
    log(`\n${colors.cyan}Creando base de datos si no existe...${colors.reset}`);
    
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: password
    });

    await connection.execute('CREATE DATABASE IF NOT EXISTS studybooster_db');
    await connection.execute('CREATE DATABASE IF NOT EXISTS studybooster_db_test');
    await connection.end();
    
    logSuccess('Bases de datos creadas exitosamente');
    return true;
  } catch (error) {
    logError(`Error creando bases de datos: ${error.message}`);
    return false;
  }
}

async function main() {
  const password = await testConnection();
  
  if (password !== null) {
    await createDatabaseIfNotExists(password);
    
    log(`\n${colors.bright}${colors.green}✅ Configuración encontrada!${colors.reset}`);
    log(`${colors.cyan}Ahora puedes ejecutar: npm run migrate:stable${colors.reset}`);
  } else {
    log(`\n${colors.bright}${colors.red}❌ No se pudo establecer conexión${colors.reset}`);
    log(`${colors.yellow}Por favor, verifica tu instalación de MySQL${colors.reset}`);
  }
}

main().catch(console.error);
