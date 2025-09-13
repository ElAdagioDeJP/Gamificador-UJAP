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

async function createTestStudents() {
  try {
    log(`${colors.bright}${colors.blue}👨‍🎓 Creando estudiantes de prueba...${colors.reset}\n`);

    const config = require('../config/config.json').development;
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database
    });

    // Datos de los estudiantes
    const students = [
      {
        nombre_usuario: 'juan123',
        nombre_completo: 'Juan Pérez',
        email_institucional: 'juan.perez@estudiante.ujap.edu',
        sexo: 'M',
        avatar_url: '/static/avatars/male.svg',
        contrasena_hash: '$2a$10$NX94iTVCUrdF8WsDrR6L7uVkDzIkeZR1JMD39VFzrqi6MXAUo2bFy',
        rol: 'estudiante',
        estado_verificacion: 'VERIFICADO',
        puntos_actuales: 150,
        experiencia_total: 500,
        nivel: 2,
        racha_dias_consecutivos: 3
      },
      {
        nombre_usuario: 'maria456',
        nombre_completo: 'María González',
        email_institucional: 'maria.gonzalez@estudiante.ujap.edu',
        sexo: 'F',
        avatar_url: '/static/avatars/female.svg',
        contrasena_hash: '$2a$10$NX94iTVCUrdF8WsDrR6L7uVkDzIkeZR1JMD39VFzrqi6MXAUo2bFy',
        rol: 'estudiante',
        estado_verificacion: 'VERIFICADO',
        puntos_actuales: 200,
        experiencia_total: 750,
        nivel: 3,
        racha_dias_consecutivos: 5
      }
    ];

    // Verificar si ya existen
    for (const student of students) {
      const [existing] = await connection.execute(
        'SELECT id_usuario FROM usuarios WHERE email_institucional = ?',
        [student.email_institucional]
      );

      if (existing.length > 0) {
        log(`⚠️  Estudiante ${student.nombre_completo} ya existe, saltando...`);
        continue;
      }

      // Insertar estudiante
      await connection.execute(`
        INSERT INTO usuarios (
          nombre_usuario, 
          nombre_completo, 
          email_institucional, 
          sexo, 
          avatar_url, 
          contrasena_hash, 
          rol, 
          estado_verificacion, 
          puntos_actuales, 
          experiencia_total, 
          nivel, 
          racha_dias_consecutivos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        student.nombre_usuario,
        student.nombre_completo,
        student.email_institucional,
        student.sexo,
        student.avatar_url,
        student.contrasena_hash,
        student.rol,
        student.estado_verificacion,
        student.puntos_actuales,
        student.experiencia_total,
        student.nivel,
        student.racha_dias_consecutivos
      ]);

      logSuccess(`Estudiante ${student.nombre_completo} creado exitosamente`);
    }

    // Verificar estudiantes creados
    log('\n📋 Verificando estudiantes creados...');
    const [studentsList] = await connection.execute(`
      SELECT 
        id_usuario,
        nombre_usuario,
        nombre_completo,
        email_institucional,
        rol,
        estado_verificacion,
        puntos_actuales,
        nivel
      FROM usuarios 
      WHERE rol = 'estudiante'
      ORDER BY fecha_creacion DESC
    `);

    log(`\n👥 Total de estudiantes: ${studentsList.length}`);
    studentsList.forEach(student => {
      log(`  - ${student.nombre_completo} (${student.email_institucional}) - Nivel ${student.nivel} - ${student.puntos_actuales} pts`);
    });

    await connection.end();
    logSuccess('\n✅ Proceso completado exitosamente');
    
  } catch (error) {
    logError(`Error: ${error.message}`);
    process.exit(1);
  }
}

createTestStudents();
