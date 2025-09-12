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

async function fixFechaActualizacion() {
  try {
    log(`${colors.bright}${colors.blue}🔧 Arreglando campo fecha_actualizacion...${colors.reset}\n`);

    const config = require('../config/config.json').development;
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database
    });

    // Verificar estructura actual
    log('📋 Verificando estructura actual de la tabla usuarios...');
    const [columns] = await connection.execute('DESCRIBE usuarios');
    
    const fechaActualizacionColumn = columns.find(col => col.Field === 'fecha_actualizacion');
    
    if (fechaActualizacionColumn) {
      log(`Campo fecha_actualizacion encontrado:`);
      log(`  - Tipo: ${fechaActualizacionColumn.Type}`);
      log(`  - Null: ${fechaActualizacionColumn.Null}`);
      log(`  - Default: ${fechaActualizacionColumn.Default}`);
      log(`  - Extra: ${fechaActualizacionColumn.Extra}`);
      
      // Si no tiene DEFAULT CURRENT_TIMESTAMP, lo agregamos
      if (!fechaActualizacionColumn.Default || fechaActualizacionColumn.Default !== 'CURRENT_TIMESTAMP') {
        log('\n🔧 Actualizando campo fecha_actualizacion...');
        
        await connection.execute(`
          ALTER TABLE usuarios 
          MODIFY COLUMN fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);
        
        logSuccess('Campo fecha_actualizacion actualizado correctamente');
      } else {
        logSuccess('Campo fecha_actualizacion ya está configurado correctamente');
      }
    } else {
      logError('Campo fecha_actualizacion no encontrado en la tabla');
    }

    // Verificar estructura final
    log('\n📋 Verificando estructura final...');
    const [finalColumns] = await connection.execute('DESCRIBE usuarios');
    const finalFechaColumn = finalColumns.find(col => col.Field === 'fecha_actualizacion');
    
    if (finalFechaColumn) {
      log(`Campo fecha_actualizacion final:`);
      log(`  - Tipo: ${finalFechaColumn.Type}`);
      log(`  - Null: ${finalFechaColumn.Null}`);
      log(`  - Default: ${finalFechaColumn.Default}`);
      log(`  - Extra: ${finalFechaColumn.Extra}`);
    }

    await connection.end();
    logSuccess('\n✅ Proceso completado exitosamente');
    
  } catch (error) {
    logError(`Error: ${error.message}`);
    process.exit(1);
  }
}

fixFechaActualizacion();
