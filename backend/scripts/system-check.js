#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
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

function logStep(step, message) {
  log(`\n${colors.cyan}[${step}]${colors.reset} ${message}`);
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

// Función para verificar archivos de configuración
function checkConfigFiles() {
  logStep('1', 'Verificando archivos de configuración...');
  
  const requiredFiles = [
    'package.json',
    'config/config.json',
    'src/server.js',
    'src/app.js',
    'models/index.js',
    'models/models.js'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      logSuccess(`Archivo encontrado: ${file}`);
    } else {
      logError(`Archivo faltante: ${file}`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Función para verificar variables de entorno
function checkEnvironmentVariables() {
  logStep('2', 'Verificando variables de entorno...');
  
  const requiredEnvVars = [
    'JWT_SECRET',
    'NODE_ENV'
  ];
  
  let allEnvVarsExist = true;
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      logSuccess(`Variable de entorno encontrada: ${envVar}`);
    } else {
      logWarning(`Variable de entorno faltante: ${envVar} (usando valor por defecto)`);
    }
  });
  
  // Verificar JWT_SECRET específicamente
  if (!process.env.JWT_SECRET) {
    logError('JWT_SECRET no está configurado. Esto causará errores de autenticación.');
    allEnvVarsExist = false;
  }
  
  return allEnvVarsExist;
}

// Función para verificar conexión a base de datos
async function checkDatabaseConnection() {
  logStep('3', 'Verificando conexión a base de datos...');
  
  try {
    const config = require('../config/config.json').development;
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password
    });
    
    await connection.execute(`USE ${config.database}`);
    logSuccess('Conexión a base de datos exitosa');
    
    await connection.end();
    return true;
  } catch (error) {
    logError(`Error de conexión a base de datos: ${error.message}`);
    return false;
  }
}

// Función para verificar estructura de base de datos
async function checkDatabaseStructure() {
  logStep('4', 'Verificando estructura de base de datos...');
  
  try {
    const config = require('../config/config.json').development;
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database
    });
    
    const requiredTables = [
      'usuarios',
      'solicitudes_profesores',
      'materias',
      'preguntaduelos',
      'respuestaduelos'
    ];
    
    let allTablesExist = true;
    
    for (const table of requiredTables) {
      const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        logSuccess(`Tabla encontrada: ${table}`);
      } else {
        logError(`Tabla faltante: ${table}`);
        allTablesExist = false;
      }
    }
    
    // Verificar usuario administrador
    const [adminRows] = await connection.execute(
      'SELECT id_usuario FROM usuarios WHERE rol = ?',
      ['admin']
    );
    
    if (adminRows.length > 0) {
      logSuccess('Usuario administrador encontrado');
    } else {
      logWarning('Usuario administrador no encontrado');
    }
    
    await connection.end();
    return allTablesExist;
  } catch (error) {
    logError(`Error verificando estructura: ${error.message}`);
    return false;
  }
}

// Función para verificar migraciones
function checkMigrations() {
  logStep('5', 'Verificando migraciones...');
  
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    logError('Directorio de migraciones no existe');
    return false;
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.js'));
  
  if (migrationFiles.length === 0) {
    logWarning('No se encontraron archivos de migración');
    return false;
  }
  
  logSuccess(`Encontradas ${migrationFiles.length} migraciones`);
  
  // Verificar migración estable
  const stableMigration = migrationFiles.find(file => file.includes('stable-database-setup'));
  if (stableMigration) {
    logSuccess('Migración estable encontrada');
  } else {
    logWarning('Migración estable no encontrada');
  }
  
  return true;
}

// Función para verificar dependencias
function checkDependencies() {
  logStep('6', 'Verificando dependencias...');
  
  try {
    const packageJson = require('../package.json');
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      logError('node_modules no encontrado. Ejecute: npm install');
      return false;
    }
    
    const requiredDeps = [
      'express',
      'sequelize',
      'mysql2',
      'bcryptjs',
      'jsonwebtoken',
      'cors',
      'helmet'
    ];
    
    let allDepsExist = true;
    
    requiredDeps.forEach(dep => {
      const depPath = path.join(nodeModulesPath, dep);
      if (fs.existsSync(depPath)) {
        logSuccess(`Dependencia encontrada: ${dep}`);
      } else {
        logError(`Dependencia faltante: ${dep}`);
        allDepsExist = false;
      }
    });
    
    return allDepsExist;
  } catch (error) {
    logError(`Error verificando dependencias: ${error.message}`);
    return false;
  }
}

// Función para generar reporte de salud del sistema
function generateHealthReport(results) {
  logStep('7', 'Generando reporte de salud del sistema...');
  
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(result => result === true).length;
  const healthPercentage = Math.round((passedChecks / totalChecks) * 100);
  
  log(`\n${colors.bright}📊 REPORTE DE SALUD DEL SISTEMA${colors.reset}`);
  log(`${colors.cyan}================================${colors.reset}`);
  
  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${status} ${check}: ${passed ? 'OK' : 'FALLO'}`, color);
  });
  
  log(`\n${colors.cyan}Puntuación general: ${healthPercentage}%${colors.reset}`);
  
  if (healthPercentage >= 90) {
    log(`${colors.green}🎉 Sistema en excelente estado!${colors.reset}`);
  } else if (healthPercentage >= 70) {
    log(`${colors.yellow}⚠️  Sistema en buen estado, pero con algunas advertencias${colors.reset}`);
  } else if (healthPercentage >= 50) {
    log(`${colors.yellow}⚠️  Sistema en estado regular, necesita atención${colors.reset}`);
  } else {
    log(`${colors.red}🚨 Sistema en mal estado, requiere intervención inmediata${colors.reset}`);
  }
  
  // Recomendaciones
  if (healthPercentage < 100) {
    log(`\n${colors.cyan}💡 RECOMENDACIONES:${colors.reset}`);
    
    if (!results.configFiles) {
      log(`${colors.yellow}  - Verificar archivos de configuración faltantes${colors.reset}`);
    }
    if (!results.environmentVariables) {
      log(`${colors.yellow}  - Configurar variables de entorno (.env)${colors.reset}`);
    }
    if (!results.databaseConnection) {
      log(`${colors.yellow}  - Verificar conexión a base de datos${colors.reset}`);
    }
    if (!results.databaseStructure) {
      log(`${colors.yellow}  - Ejecutar migraciones: npm run migrate:stable${colors.reset}`);
    }
    if (!results.migrations) {
      log(`${colors.yellow}  - Verificar archivos de migración${colors.reset}`);
    }
    if (!results.dependencies) {
      log(`${colors.yellow}  - Instalar dependencias: npm install${colors.reset}`);
    }
  }
}

// Función principal
async function main() {
  log(`${colors.bright}${colors.blue}🔍 Verificación del sistema StudyBooster${colors.reset}\n`);

  try {
    const results = {
      configFiles: checkConfigFiles(),
      environmentVariables: checkEnvironmentVariables(),
      databaseConnection: await checkDatabaseConnection(),
      databaseStructure: await checkDatabaseStructure(),
      migrations: checkMigrations(),
      dependencies: checkDependencies()
    };
    
    generateHealthReport(results);
    
    const allPassed = Object.values(results).every(result => result === true);
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    logError(`Error fatal durante la verificación: ${error.message}`);
    process.exit(1);
  }
}

// Manejo de argumentos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}Uso: node scripts/system-check.js [opciones]${colors.reset}\n`);
  log(`${colors.cyan}Opciones:${colors.reset}`);
  log(`${colors.yellow}  --help, -h${colors.reset}     Mostrar esta ayuda`);
  log(`\n${colors.cyan}Descripción:${colors.reset}`);
  log('Verifica el estado general del sistema StudyBooster');
  log('Incluye verificación de archivos, configuración, base de datos y dependencias');
  process.exit(0);
}

main();
