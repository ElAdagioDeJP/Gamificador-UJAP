#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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

// Función para cargar configuración desde .env
function loadEnvConfig() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    logError('Archivo .env no encontrado. Ejecuta: npm run setup:env');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const config = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      config[key.trim()] = value.trim();
    }
  });

  return {
    host: config.MYSQL_HOST || '127.0.0.1',
    port: parseInt(config.MYSQL_PORT) || 3306,
    user: config.MYSQL_USER || 'root',
    password: config.MYSQL_PASSWORD || '',
    database: config.MYSQL_DATABASE || 'studybooster_db'
  };
}

// Función para probar conexión a MySQL
async function testConnection(config) {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    });
    
    await connection.ping();
    await connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

// Función para crear base de datos
async function createDatabase(config) {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.end();
    return true;
  } catch (error) {
    logError(`Error al crear base de datos: ${error.message}`);
    return false;
  }
}

// Función para verificar si la base de datos existe
async function databaseExists(config) {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    });

    const [rows] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [config.database]
    );
    
    await connection.end();
    return rows.length > 0;
  } catch (error) {
    return false;
  }
}

// Función principal
async function main() {
  log(`${colors.bright}${colors.blue}🔍 Verificando conexión a MySQL...${colors.reset}\n`);

  const config = loadEnvConfig();
  
  log(`Configuración detectada:`);
  log(`  Host: ${config.host}`);
  log(`  Puerto: ${config.port}`);
  log(`  Usuario: ${config.user}`);
  log(`  Base de datos: ${config.database}`);
  log(`  Contraseña: ${config.password ? '***' : '(vacía)'}\n`);

  // Probar conexión
  log('Probando conexión a MySQL...');
  if (!(await testConnection(config))) {
    logError('No se puede conectar a MySQL. Verifica que:');
    log('  1. MySQL esté ejecutándose');
    log('  2. Las credenciales sean correctas');
    log('  3. El puerto 3306 esté disponible');
    process.exit(1);
  }
  logSuccess('Conexión a MySQL exitosa');

  // Verificar si la base de datos existe
  log('Verificando base de datos...');
  if (!(await databaseExists(config))) {
    logWarning(`La base de datos '${config.database}' no existe`);
    log('Creando base de datos...');
    if (await createDatabase(config)) {
      logSuccess(`Base de datos '${config.database}' creada exitosamente`);
    } else {
      logError('No se pudo crear la base de datos');
      process.exit(1);
    }
  } else {
    logSuccess(`Base de datos '${config.database}' existe`);
  }

  log(`\n${colors.bright}${colors.green}✅ Base de datos lista para migraciones!${colors.reset}`);
  log(`${colors.cyan}💡 Ahora puedes ejecutar:${colors.reset}`);
  log(`${colors.yellow}  npm run migrate${colors.reset} - Para ejecutar migraciones`);
}

// Manejo de errores
process.on('unhandledRejection', (error) => {
  logError(`Error inesperado: ${error.message}`);
  process.exit(1);
});

main().catch(error => {
  logError(`Error: ${error.message}`);
  process.exit(1);
});
