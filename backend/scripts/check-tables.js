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

// Función para verificar tablas existentes
async function checkTables(config) {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    });

    // Verificar tablas existentes
    const [tables] = await connection.execute('SHOW TABLES');
    log(`\n${colors.cyan}Tablas existentes en ${config.database}:${colors.reset}`);
    
    if (tables.length === 0) {
      logWarning('No hay tablas en la base de datos');
    } else {
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        log(`  - ${tableName}`);
      });
    }

    // Verificar estructura de cada tabla
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      log(`\n${colors.yellow}Estructura de la tabla ${tableName}:${colors.reset}`);
      
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      columns.forEach(column => {
        log(`  ${column.Field} - ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
      });
    }

    await connection.end();
    return true;
  } catch (error) {
    logError(`Error al verificar tablas: ${error.message}`);
    return false;
  }
}

// Función principal
async function main() {
  log(`${colors.bright}${colors.blue}🔍 Verificando tablas en la base de datos...${colors.reset}\n`);

  const config = loadEnvConfig();
  
  if (await checkTables(config)) {
    log(`\n${colors.bright}${colors.green}✅ Verificación completada!${colors.reset}`);
  } else {
    logError('Error en la verificación');
    process.exit(1);
  }
}

main().catch(error => {
  logError(`Error: ${error.message}`);
  process.exit(1);
});
