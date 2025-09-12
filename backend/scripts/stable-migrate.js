#!/usr/bin/env node

const { execSync } = require('child_process');
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

// Función para verificar conexión a la base de datos
async function checkDatabaseConnection() {
  try {
    const config = require('../config/config.json').development;
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password
    });
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
    await connection.execute(`USE \`${config.database}\``);
    await connection.end();
    
    logSuccess('Conexión a base de datos verificada');
    return true;
  } catch (error) {
    logError(`Error de conexión a base de datos: ${error.message}`);
    return false;
  }
}

// Función para limpiar migraciones problemáticas
function cleanProblematicMigrations() {
  try {
    logStep('1', 'Limpiando migraciones problemáticas...');
    
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const problematicFiles = [
      '20241201000000-add-professor-requests.js',
      '20241201000001-add-professor-requests-simple.js'
    ];
    
    problematicFiles.forEach(file => {
      const filePath = path.join(migrationsDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logSuccess(`Eliminado: ${file}`);
      }
    });
    
    return true;
  } catch (error) {
    logError(`Error limpiando migraciones: ${error.message}`);
    return false;
  }
}

// Función para ejecutar migraciones de forma segura
async function runStableMigrations() {
  try {
    logStep('2', 'Ejecutando migraciones estables...');
    
    // Verificar que existe la migración estable
    const stableMigration = path.join(__dirname, '..', 'migrations', '20241201000002-stable-database-setup.js');
    if (!fs.existsSync(stableMigration)) {
      throw new Error('Migración estable no encontrada');
    }
    
    // Ejecutar migraciones
    execSync('npx sequelize-cli db:migrate', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    logSuccess('Migraciones ejecutadas correctamente');
    return true;
  } catch (error) {
    logError(`Error ejecutando migraciones: ${error.message}`);
    return false;
  }
}

// Función para crear usuario administrador por defecto
async function createDefaultAdmin() {
  try {
    logStep('3', 'Creando usuario administrador por defecto...');
    
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
      logWarning('Usuario administrador ya existe');
      await connection.end();
      return true;
    }
    
    // Crear admin por defecto
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.execute(`
      INSERT INTO usuarios (
        nombre_usuario, nombre_completo, email_institucional, 
        contrasena_hash, rol, estado_verificacion, 
        puntos_actuales, nivel, fecha_creacion, fecha_actualizacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      'admin',
      'Administrador del Sistema',
      'admin@studybooster.com',
      hashedPassword,
      'admin',
      'VERIFICADO',
      0,
      1
    ]);
    
    logSuccess('Usuario administrador creado: admin@studybooster.com / admin123');
    await connection.end();
    return true;
  } catch (error) {
    logError(`Error creando administrador: ${error.message}`);
    return false;
  }
}

// Función para verificar la integridad de la base de datos
async function verifyDatabaseIntegrity() {
  try {
    logStep('4', 'Verificando integridad de la base de datos...');
    
    const config = require('../config/config.json').development;
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database
    });
    
    // Verificar tablas principales
    const tables = ['usuarios', 'solicitudes_profesores', 'materias', 'preguntaduelos', 'respuestaduelos'];
    
    for (const table of tables) {
      const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
      if (rows.length === 0) {
        throw new Error(`Tabla ${table} no existe`);
      }
      logSuccess(`Tabla ${table} verificada`);
    }
    
    // Verificar usuario admin
    const [adminRows] = await connection.execute(
      'SELECT id_usuario FROM usuarios WHERE rol = ?',
      ['admin']
    );
    
    if (adminRows.length === 0) {
      throw new Error('Usuario administrador no encontrado');
    }
    
    logSuccess('Integridad de base de datos verificada');
    await connection.end();
    return true;
  } catch (error) {
    logError(`Error verificando integridad: ${error.message}`);
    return false;
  }
}

// Función principal
async function main() {
  log(`${colors.bright}${colors.blue}🚀 Iniciando migración estable del sistema...${colors.reset}\n`);

  try {
    // 1. Verificar conexión a base de datos
    if (!(await checkDatabaseConnection())) {
      process.exit(1);
    }

    // 2. Limpiar migraciones problemáticas
    if (!cleanProblematicMigrations()) {
      process.exit(1);
    }

    // 3. Ejecutar migraciones estables
    if (!(await runStableMigrations())) {
      process.exit(1);
    }

    // 4. Crear usuario administrador
    if (!(await createDefaultAdmin())) {
      process.exit(1);
    }

    // 5. Verificar integridad
    if (!(await verifyDatabaseIntegrity())) {
      process.exit(1);
    }

    log(`\n${colors.bright}${colors.green}✅ Sistema migrado exitosamente!${colors.reset}`);
    log(`${colors.cyan}🎯 Base de datos estable y lista para usar${colors.reset}`);
    log(`${colors.yellow}👤 Admin: admin@studybooster.com / admin123${colors.reset}`);
    log(`\n${colors.cyan}💡 Comandos útiles:${colors.reset}`);
    log(`${colors.yellow}  npm start${colors.reset} - Iniciar servidor`);
    log(`${colors.yellow}  npm run dev${colors.reset} - Modo desarrollo`);
    log(`${colors.yellow}  npm run migrate:status${colors.reset} - Ver estado de migraciones`);

  } catch (error) {
    logError(`Error fatal: ${error.message}`);
    process.exit(1);
  }
}

// Manejo de argumentos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}Uso: node scripts/stable-migrate.js [opciones]${colors.reset}\n`);
  log(`${colors.cyan}Opciones:${colors.reset}`);
  log(`${colors.yellow}  --help, -h${colors.reset}     Mostrar esta ayuda`);
  log(`${colors.yellow}  --reset${colors.reset}        Resetear base de datos completamente`);
  log(`\n${colors.cyan}Descripción:${colors.reset}`);
  log('Migración estable y robusta del sistema StudyBooster');
  log('Incluye limpieza de migraciones problemáticas y verificación de integridad');
  process.exit(0);
}

if (args.includes('--reset')) {
  log(`${colors.bright}${colors.red}🔄 Reseteando base de datos completamente...${colors.reset}\n`);
  try {
    execSync('npx sequelize-cli db:migrate:undo:all', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    logSuccess('Base de datos reseteada');
    main();
  } catch (error) {
    logError('Error al resetear base de datos');
    process.exit(1);
  }
} else {
  main();
}
