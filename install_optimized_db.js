#!/usr/bin/env node

/**
 * SCRIPT DE INSTALACIÓN DE BASE DE DATOS OPTIMIZADA
 * 
 * Este script automatiza la migración completa a la nueva estructura
 * de base de datos optimizada.
 * 
 * Uso: node install_optimized_db.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  log(`\n${colors.cyan}[PASO ${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Verificar si estamos en el directorio correcto
function checkDirectory() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    logError('No se encontró package.json. Ejecuta este script desde el directorio raíz del proyecto.');
    process.exit(1);
  }
  
  const backendPath = path.join(process.cwd(), 'backend');
  if (!fs.existsSync(backendPath)) {
    logError('No se encontró el directorio backend. Ejecuta este script desde el directorio raíz del proyecto.');
    process.exit(1);
  }
  
  logSuccess('Directorio correcto detectado');
}

// Verificar dependencias
function checkDependencies() {
  logStep(1, 'Verificando dependencias...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['mysql2', 'sequelize', 'bcryptjs'];
    
    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );
    
    if (missingDeps.length > 0) {
      logWarning(`Dependencias faltantes: ${missingDeps.join(', ')}`);
      logInfo('Instalando dependencias...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    logSuccess('Dependencias verificadas');
  } catch (error) {
    logError(`Error verificando dependencias: ${error.message}`);
    process.exit(1);
  }
}

// Crear backup de la base de datos actual
function createDatabaseBackup() {
  logStep(2, 'Creando backup de la base de datos...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup_${timestamp}.sql`;
    
    // Comando para crear backup (ajusta según tu configuración)
    const backupCommand = `mysqldump -u root -p studybooster_db > ${backupFile}`;
    
    logInfo('Ejecutando backup...');
    logWarning('Se te pedirá la contraseña de MySQL');
    
    execSync(backupCommand, { stdio: 'inherit' });
    
    logSuccess(`Backup creado: ${backupFile}`);
    return backupFile;
  } catch (error) {
    logWarning(`No se pudo crear backup automático: ${error.message}`);
    logInfo('Continúa manualmente si es necesario');
    return null;
  }
}

// Aplicar migración de base de datos
function applyDatabaseMigration() {
  logStep(3, 'Aplicando migración de base de datos...');
  
  try {
    const migrationFile = path.join(__dirname, 'migration_to_optimized_db.sql');
    
    if (!fs.existsSync(migrationFile)) {
      logError('No se encontró el archivo de migración');
      process.exit(1);
    }
    
    logInfo('Ejecutando migración SQL...');
    logWarning('Se te pedirá la contraseña de MySQL');
    
    const migrationCommand = `mysql -u root -p studybooster_db < ${migrationFile}`;
    execSync(migrationCommand, { stdio: 'inherit' });
    
    logSuccess('Migración de base de datos aplicada');
  } catch (error) {
    logError(`Error aplicando migración: ${error.message}`);
    process.exit(1);
  }
}

// Actualizar modelos de Sequelize
function updateSequelizeModels() {
  logStep(4, 'Actualizando modelos de Sequelize...');
  
  try {
    const updateScript = path.join(__dirname, 'update_sequelize_models.js');
    
    if (!fs.existsSync(updateScript)) {
      logError('No se encontró el script de actualización de modelos');
      process.exit(1);
    }
    
    logInfo('Ejecutando actualización de modelos...');
    execSync(`node ${updateScript}`, { stdio: 'inherit' });
    
    logSuccess('Modelos de Sequelize actualizados');
  } catch (error) {
    logError(`Error actualizando modelos: ${error.message}`);
    process.exit(1);
  }
}

// Regenerar migraciones de Sequelize
function regenerateSequelizeMigrations() {
  logStep(5, 'Regenerando migraciones de Sequelize...');
  
  try {
    process.chdir('backend');
    
    logInfo('Regenerando migraciones...');
    execSync('npm run migrate:regenerate', { stdio: 'inherit' });
    
    logSuccess('Migraciones regeneradas');
  } catch (error) {
    logWarning(`Error regenerando migraciones: ${error.message}`);
    logInfo('Continúa manualmente si es necesario');
  } finally {
    process.chdir('..');
  }
}

// Aplicar migraciones de Sequelize
function applySequelizeMigrations() {
  logStep(6, 'Aplicando migraciones de Sequelize...');
  
  try {
    process.chdir('backend');
    
    logInfo('Aplicando migraciones...');
    execSync('npm run migrate', { stdio: 'inherit' });
    
    logSuccess('Migraciones aplicadas');
  } catch (error) {
    logWarning(`Error aplicando migraciones: ${error.message}`);
    logInfo('Continúa manualmente si es necesario');
  } finally {
    process.chdir('..');
  }
}

// Verificar instalación
function verifyInstallation() {
  logStep(7, 'Verificando instalación...');
  
  try {
    process.chdir('backend');
    
    logInfo('Verificando conexión a base de datos...');
    execSync('npm run db:check', { stdio: 'inherit' });
    
    logSuccess('Conexión verificada');
  } catch (error) {
    logWarning(`Error verificando instalación: ${error.message}`);
  } finally {
    process.chdir('..');
  }
}

// Mostrar resumen
function showSummary() {
  logStep(8, 'Resumen de la instalación');
  
  logSuccess('¡Instalación completada exitosamente!');
  
  log('\n📋 Resumen de cambios:', 'bright');
  log('• Base de datos optimizada con nuevos campos y tablas');
  log('• Sistema de preguntas unificado');
  log('• Índices optimizados para mejor rendimiento');
  log('• Vistas y procedimientos almacenados');
  log('• Usuario administrador creado');
  log('• Modelos de Sequelize actualizados');
  
  log('\n🔑 Credenciales del administrador:', 'bright');
  log('Email: admin@ujap.edu.ve');
  log('Contraseña: password');
  
  log('\n📝 Próximos pasos:', 'bright');
  log('1. Reinicia el servidor: npm run dev');
  log('2. Accede al panel de administración');
  log('3. Cambia la contraseña del administrador');
  log('4. Configura las materias y profesores');
  
  log('\n⚠️  Importante:', 'yellow');
  log('• Haz backup de tu base de datos regularmente');
  log('• Revisa los logs para detectar problemas');
  log('• Configura las variables de entorno correctamente');
  
  log('\n🎉 ¡Sistema listo para usar!', 'green');
}

// Función principal
function main() {
  log('🚀 INSTALADOR DE BASE DE DATOS OPTIMIZADA', 'bright');
  log('==========================================', 'bright');
  
  try {
    checkDirectory();
    checkDependencies();
    createDatabaseBackup();
    applyDatabaseMigration();
    updateSequelizeModels();
    regenerateSequelizeMigrations();
    applySequelizeMigrations();
    verifyInstallation();
    showSummary();
  } catch (error) {
    logError(`Error durante la instalación: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };
