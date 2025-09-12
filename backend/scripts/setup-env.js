#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

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

// Función para obtener la IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Función para crear o actualizar archivo .env
function setupEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const localIP = getLocalIP();
  
  // Cargar configuración existente si existe
  let existingConfig = {};
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        existingConfig[key.trim()] = value.trim();
      }
    });
  }
  
  const envContent = `# Configuración de Base de Datos
DATABASE_URL=mysql://root:${existingConfig.MYSQL_PASSWORD || ''}@127.0.0.1:3306/studybooster_db
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=${existingConfig.MYSQL_PASSWORD || ''}
MYSQL_DATABASE=studybooster_db

# Configuración del Servidor
NODE_ENV=development
PORT=5000
SERVER_IP=${localIP}

# JWT
JWT_SECRET=${existingConfig.JWT_SECRET || generateJWTSecret()}
JWT_EXPIRES_IN=24h

# Socket.io
SOCKET_PORT=5001

# Configuración de desarrollo
FRONTEND_URL=http://${localIP}:3000
BACKEND_URL=http://${localIP}:5000`;

  try {
    fs.writeFileSync(envPath, envContent);
    logSuccess(`Archivo .env creado/actualizado con IP: ${localIP}`);
    return true;
  } catch (error) {
    logError(`Error al crear archivo .env: ${error.message}`);
    return false;
  }
}

// Función para generar JWT secret seguro
function generateJWTSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Función para verificar si el archivo .env ya existe
function checkExistingEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    if (content.includes('SERVER_IP=')) {
      logWarning('El archivo .env ya existe y contiene SERVER_IP');
      return true;
    }
  }
  return false;
}

// Función principal
function main() {
  log(`${colors.bright}${colors.blue}🔧 Configurando archivo .env...${colors.reset}\n`);

  if (checkExistingEnv()) {
    log(`${colors.yellow}¿Deseas sobrescribir el archivo .env existente? (y/N)${colors.reset}`);
    // En un entorno interactivo, podrías usar readline aquí
    // Por ahora, simplemente creamos el archivo
  }

  if (setupEnvFile()) {
    log(`\n${colors.bright}${colors.green}✅ Configuración completada!${colors.reset}`);
    log(`${colors.cyan}💡 Variables configuradas:${colors.reset}`);
    log(`${colors.yellow}  SERVER_IP=${getLocalIP()}${colors.reset}`);
    log(`${colors.yellow}  FRONTEND_URL=http://${getLocalIP()}:3000${colors.reset}`);
    log(`${colors.yellow}  BACKEND_URL=http://${getLocalIP()}:5000${colors.reset}`);
    log(`\n${colors.cyan}🚀 Ahora puedes ejecutar:${colors.reset}`);
    log(`${colors.yellow}  npm run migrate${colors.reset} - Para migrar la base de datos`);
    log(`${colors.yellow}  npm run dev${colors.reset} - Para iniciar el servidor en modo desarrollo`);
  } else {
    logError('No se pudo configurar el archivo .env');
    process.exit(1);
  }
}

// Manejo de argumentos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}Uso: node scripts/setup-env.js [opciones]${colors.reset}\n`);
  log(`${colors.cyan}Opciones:${colors.reset}`);
  log(`${colors.yellow}  --help, -h${colors.reset}     Mostrar esta ayuda`);
  log(`${colors.yellow}  --force${colors.reset}        Sobrescribir archivo .env existente`);
  process.exit(0);
}

if (args.includes('--force')) {
  main();
} else {
  main();
}
