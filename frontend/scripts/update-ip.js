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

// Función para actualizar el archivo .env del frontend
function updateFrontendEnv(ip) {
  const envPath = path.join(__dirname, '..', '.env');
  
  const envContent = `# Configuración del Backend
REACT_APP_API_URL=http://${ip}:5000/api
REACT_APP_SOCKET_URL=http://${ip}:5000

# Configuración del Frontend
REACT_APP_FRONTEND_URL=http://${ip}:3000`;

  try {
    fs.writeFileSync(envPath, envContent);
    logSuccess(`Archivo .env del frontend actualizado con IP: ${ip}`);
    return true;
  } catch (error) {
    logError(`Error al actualizar .env del frontend: ${error.message}`);
    return false;
  }
}

// Función para actualizar el archivo .env del backend
function updateBackendEnv(ip) {
  const envPath = path.join(__dirname, '..', '..', 'backend', '.env');
  
  const envContent = `# Configuración de Base de Datos
DATABASE_URL=mysql://root:jJUNIOR*27@127.0.0.1:3306/studybooster_db
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=jJUNIOR*27
MYSQL_DATABASE=studybooster_db

# Configuración del Servidor
NODE_ENV=development
PORT=5000
SERVER_IP=${ip}

# JWT
JWT_SECRET=lTYB6xQJPIZs8b5j^A2E&wsguCyIhtAC2d&NXdn8M&czfuThCuc@OUhS&Mm!d&u7
JWT_EXPIRES_IN=24h

# Socket.io
SOCKET_PORT=5001

# Configuración de desarrollo
FRONTEND_URL=http://${ip}:3000
BACKEND_URL=http://${ip}:5000`;

  try {
    fs.writeFileSync(envPath, envContent);
    logSuccess(`Archivo .env del backend actualizado con IP: ${ip}`);
    return true;
  } catch (error) {
    logError(`Error al actualizar .env del backend: ${error.message}`);
    return false;
  }
}

// Función principal
function main() {
  log(`${colors.bright}${colors.blue}🔄 Actualizando configuración de IP...${colors.reset}\n`);

  const ip = getLocalIP();
  log(`IP detectada: ${colors.cyan}${ip}${colors.reset}\n`);

  // Actualizar frontend
  log('Actualizando configuración del frontend...');
  if (updateFrontendEnv(ip)) {
    logSuccess('Frontend configurado correctamente');
  } else {
    logError('Error al configurar frontend');
    process.exit(1);
  }

  // Actualizar backend
  log('Actualizando configuración del backend...');
  if (updateBackendEnv(ip)) {
    logSuccess('Backend configurado correctamente');
  } else {
    logError('Error al configurar backend');
    process.exit(1);
  }

  log(`\n${colors.bright}${colors.green}✅ Configuración actualizada exitosamente!${colors.reset}`);
  log(`${colors.cyan}💡 URLs configuradas:${colors.reset}`);
  log(`${colors.yellow}  Frontend: http://${ip}:3000${colors.reset}`);
  log(`${colors.yellow}  Backend: http://${ip}:5000${colors.reset}`);
  log(`\n${colors.cyan}🚀 Ahora puedes ejecutar:${colors.reset}`);
  log(`${colors.yellow}  cd backend && npm run dev${colors.reset} - Para iniciar el backend`);
  log(`${colors.yellow}  cd frontend && npm start${colors.reset} - Para iniciar el frontend`);
}

// Manejo de argumentos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}Uso: node scripts/update-ip.js [opciones]${colors.reset}\n`);
  log(`${colors.cyan}Opciones:${colors.reset}`);
  log(`${colors.yellow}  --help, -h${colors.reset}     Mostrar esta ayuda`);
  log(`${colors.yellow}  --ip IP${colors.reset}        Usar IP específica en lugar de detectar automáticamente`);
  process.exit(0);
}

if (args.includes('--ip')) {
  const ipIndex = args.indexOf('--ip');
  const customIP = args[ipIndex + 1];
  if (customIP) {
    log(`${colors.bright}${colors.blue}🔄 Actualizando configuración con IP personalizada: ${customIP}${colors.reset}\n`);
    updateFrontendEnv(customIP);
    updateBackendEnv(customIP);
    log(`\n${colors.bright}${colors.green}✅ Configuración actualizada con IP: ${customIP}${colors.reset}`);
  } else {
    logError('Debes proporcionar una IP después de --ip');
    process.exit(1);
  }
} else {
  main();
}
