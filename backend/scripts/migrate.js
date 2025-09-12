#!/usr/bin/env node

const { execSync } = require('child_process');
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

// Función para verificar si existe un archivo .env
function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    logWarning('No se encontró archivo .env. Creando archivo de ejemplo...');
    createEnvExample();
    return false;
  }
  return true;
}

// Función para crear archivo .env de ejemplo
function createEnvExample() {
  const envContent = `# Configuración de Base de Datos
DATABASE_URL=mysql://root:@127.0.0.1:3306/studybooster_db
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=studybooster_db

# Configuración del Servidor
NODE_ENV=development
PORT=5000
SERVER_IP=192.168.1.100

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# Socket.io
SOCKET_PORT=5001`;

  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);
  logSuccess('Archivo .env creado. Por favor, configura las variables según tu entorno.');
}

// Función para ejecutar migraciones
function runMigrations() {
  try {
    logStep('1', 'Ejecutando migraciones de Sequelize...');
    execSync('npx sequelize-cli db:migrate', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    logSuccess('Migraciones ejecutadas correctamente');
  } catch (error) {
    logError('Error al ejecutar migraciones:');
    console.error(error.message);
    return false;
  }
  return true;
}

// Función para sincronizar modelos (desarrollo)
function syncModels() {
  try {
    logStep('2', 'Sincronizando modelos de Sequelize...');
    execSync('node -e "require(\'./src/config/db.js\')()"', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    logSuccess('Modelos sincronizados correctamente');
  } catch (error) {
    logError('Error al sincronizar modelos:');
    console.error(error.message);
    return false;
  }
  return true;
}

// Función para ejecutar seeders
function runSeeders() {
  try {
    logStep('3', 'Ejecutando seeders...');
    execSync('npx sequelize-cli db:seed:all', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    logSuccess('Seeders ejecutados correctamente');
  } catch (error) {
    logWarning('No se pudieron ejecutar seeders (puede ser normal si no existen)');
    return true;
  }
  return true;
}

// Función para crear migración inicial
function createInitialMigration() {
  try {
    logStep('4', 'Creando migración inicial...');
    
    const migrationContent = `'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla de usuarios si no existe
    await queryInterface.createTable('Usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      email_institucional: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      sexo: {
        type: Sequelize.ENUM('M', 'F'),
        allowNull: true
      },
      avatar_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      rol: {
        type: Sequelize.ENUM('estudiante', 'profesor', 'admin'),
        allowNull: false,
        defaultValue: 'estudiante'
      },
      puntos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      nivel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      experiencia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Crear tabla de preguntas de duelo
    await queryInterface.createTable('PreguntaDuelos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pregunta: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      opcion_a: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      opcion_b: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      opcion_c: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      opcion_d: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      respuesta_correcta: {
        type: Sequelize.ENUM('A', 'B', 'C', 'D'),
        allowNull: false
      },
      explicacion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      materia: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      dificultad: {
        type: Sequelize.ENUM('facil', 'medio', 'dificil'),
        allowNull: false,
        defaultValue: 'medio'
      },
      puntos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Crear tabla de respuestas de duelo
    await queryInterface.createTable('RespuestaDuelos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pregunta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PreguntaDuelos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      respuesta_elegida: {
        type: Sequelize.ENUM('A', 'B', 'C', 'D'),
        allowNull: false
      },
      es_correcta: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      tiempo_respuesta: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      puntos_obtenidos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Crear índices para mejorar rendimiento
    await queryInterface.addIndex('Usuarios', ['email']);
    await queryInterface.addIndex('Usuarios', ['email_institucional']);
    await queryInterface.addIndex('Usuarios', ['rol']);
    await queryInterface.addIndex('PreguntaDuelos', ['materia']);
    await queryInterface.addIndex('PreguntaDuelos', ['dificultad']);
    await queryInterface.addIndex('RespuestaDuelos', ['usuario_id']);
    await queryInterface.addIndex('RespuestaDuelos', ['pregunta_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RespuestaDuelos');
    await queryInterface.dropTable('PreguntaDuelos');
    await queryInterface.dropTable('Usuarios');
  }
};`;

    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const migrationFile = `migrations/${timestamp}-create-initial-tables.js`;
    const migrationPath = path.join(__dirname, '..', migrationFile);
    
    fs.writeFileSync(migrationPath, migrationContent);
    logSuccess(`Migración inicial creada: ${migrationFile}`);
  } catch (error) {
    logError('Error al crear migración inicial:');
    console.error(error.message);
    return false;
  }
  return true;
}

// Función principal
async function main() {
  log(`${colors.bright}${colors.blue}🚀 Iniciando migración de base de datos...${colors.reset}\n`);

  // Verificar archivo .env
  if (!checkEnvFile()) {
    logError('Por favor, configura el archivo .env antes de continuar');
    process.exit(1);
  }

  // Crear migración inicial si no existe
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.js'));
  
  if (migrationFiles.length === 0) {
    if (!createInitialMigration()) {
      process.exit(1);
    }
  }

  // Ejecutar migraciones
  if (!runMigrations()) {
    process.exit(1);
  }

  // Sincronizar modelos (para desarrollo)
  if (!syncModels()) {
    logWarning('Continuando sin sincronización de modelos...');
  }

  // Ejecutar seeders
  runSeeders();

  log(`\n${colors.bright}${colors.green}✅ Migración completada exitosamente!${colors.reset}`);
  log(`${colors.cyan}💡 Comandos útiles:${colors.reset}`);
  log(`${colors.yellow}  npm run migrate:reset${colors.reset} - Resetear base de datos`);
  log(`${colors.yellow}  npm run migrate:status${colors.reset} - Ver estado de migraciones`);
  log(`${colors.yellow}  npm run seed:admin${colors.reset} - Crear usuario administrador`);
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}Uso: node scripts/migrate.js [opciones]${colors.reset}\n`);
  log(`${colors.cyan}Opciones:${colors.reset}`);
  log(`${colors.yellow}  --help, -h${colors.reset}     Mostrar esta ayuda`);
  log(`${colors.yellow}  --reset${colors.reset}        Resetear base de datos completamente`);
  log(`${colors.yellow}  --status${colors.reset}       Mostrar estado de migraciones`);
  process.exit(0);
}

if (args.includes('--reset')) {
  log(`${colors.bright}${colors.red}🔄 Reseteando base de datos...${colors.reset}\n`);
  try {
    execSync('npx sequelize-cli db:migrate:undo:all', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    logSuccess('Base de datos reseteada');
    main();
  } catch (error) {
    logError('Error al resetear base de datos:');
    console.error(error.message);
    process.exit(1);
  }
} else if (args.includes('--status')) {
  try {
    execSync('npx sequelize-cli db:migrate:status', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  } catch (error) {
    logError('Error al verificar estado:');
    console.error(error.message);
    process.exit(1);
  }
} else {
  main();
}
