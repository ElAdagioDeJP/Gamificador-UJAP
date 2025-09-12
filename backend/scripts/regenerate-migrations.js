#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createModels } = require('../models');
const { Sequelize } = require('sequelize');

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

// Función para generar migración desde modelos
function generateMigrationFromModels() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const migrationFile = `migrations/${timestamp}-regenerate-from-models.js`;
  const migrationPath = path.join(__dirname, '..', migrationFile);

  // Crear instancia temporal de Sequelize para obtener la estructura
  const sequelize = new Sequelize('temp', 'temp', 'temp', {
    dialect: 'mysql',
    logging: false
  });

  const models = createModels(sequelize);
  const queryInterface = sequelize.getQueryInterface();

  // Generar contenido de la migración
  const migrationContent = `'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Esta migración se genera automáticamente desde models.js
    // NO EDITAR MANUALMENTE - Usar: npm run migrate:regenerate
    
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Crear tabla usuarios
      await queryInterface.createTable('usuarios', {
        id_usuario: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        nombre_usuario: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true
        },
        nombre_completo: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        email_institucional: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        },
        sexo: {
          type: Sequelize.ENUM('M', 'F'),
          allowNull: true
        },
        avatar_url: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        contrasena_hash: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        rol: {
          type: Sequelize.ENUM('estudiante', 'profesor', 'admin'),
          allowNull: false,
          defaultValue: 'estudiante'
        },
        puntos_actuales: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        experiencia_total: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: 0
        },
        nivel: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        racha_dias_consecutivos: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        fecha_ultima_actividad: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        fecha_creacion: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      }, { transaction });

      // Crear tabla materias
      await queryInterface.createTable('materias', {
        id_materia: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        nombre_materia: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        }
      }, { transaction });

      // Crear tabla inscripciones
      await queryInterface.createTable('inscripciones', {
        id_inscripcion: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        id_usuario: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id_usuario'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        id_materia: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'materias',
            key: 'id_materia'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        periodo_academico: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        calificacion_final: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true
        }
      }, { transaction });

      // Crear tabla misiones
      await queryInterface.createTable('misiones', {
        id_mision: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        titulo: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        tipo_mision: {
          type: Sequelize.ENUM('DIARIA', 'TAREA'),
          allowNull: false
        },
        dificultad: {
          type: Sequelize.ENUM('BASICA', 'AVANZADA', 'EPICA'),
          allowNull: true
        },
        id_materia_asociada: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: 'materias',
            key: 'id_materia'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        id_profesor_creador: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: 'usuarios',
            key: 'id_usuario'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        puntos_recompensa: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        experiencia_recompensa: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        peso_en_calificacion: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 0.00
        },
        bono_nota: {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: false,
          defaultValue: 0.00
        },
        req_nivel_minimo: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        req_racha_minima: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        req_puntos_minimos: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      }, { transaction });

      // Crear tabla usuario_misiones
      await queryInterface.createTable('usuario_misiones', {
        id_usuario_mision: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        id_usuario: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id_usuario'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        id_mision: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'misiones',
            key: 'id_mision'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        fecha_completada: {
          type: Sequelize.DATE,
          allowNull: true
        },
        estado: {
          type: Sequelize.ENUM('ASIGNADA', 'EN_PROGRESO', 'COMPLETADA', 'VENCIDA'),
          allowNull: false,
          defaultValue: 'ASIGNADA'
        },
        calificacion_obtenida: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true
        }
      }, { transaction });

      // Crear tabla duelos
      await queryInterface.createTable('duelos', {
        id_duelo: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        tipo_duelo: {
          type: Sequelize.ENUM('CLASICO', 'COOPERATIVO'),
          allowNull: false
        },
        id_materia: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: 'materias',
            key: 'id_materia'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        estado: {
          type: Sequelize.ENUM('PENDIENTE', 'EN_JUEGO', 'FINALIZADO', 'CANCELADO'),
          allowNull: false
        },
        fecha_creacion: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        id_ganador: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: 'usuarios',
            key: 'id_usuario'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        puntos_apostados: {
          type: Sequelize.INTEGER,
          allowNull: false
        }
      }, { transaction });

      // Crear tabla duelo_participantes
      await queryInterface.createTable('duelo_participantes', {
        id_participante_duelo: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        id_duelo: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'duelos',
            key: 'id_duelo'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        id_usuario: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id_usuario'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        equipo: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        puntuacion_final: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      }, { transaction });

      // Crear tabla preguntas_duelo
      await queryInterface.createTable('preguntas_duelo', {
        id_pregunta: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        id_materia: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: 'materias',
            key: 'id_materia'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        enunciado: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        dificultad: {
          type: Sequelize.ENUM('FACIL', 'NORMAL', 'DIFICIL'),
          allowNull: false
        }
      }, { transaction });

      // Crear tabla respuestas_duelo
      await queryInterface.createTable('respuestas_duelo', {
        id_respuesta: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        id_pregunta: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'preguntas_duelo',
            key: 'id_pregunta'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        texto_respuesta: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        es_correcta: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      }, { transaction });

      // Crear tabla preguntaduelos (nuevo sistema)
      await queryInterface.createTable('preguntaduelos', {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
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
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      }, { transaction });

      // Crear tabla respuestaduelos (nuevo sistema)
      await queryInterface.createTable('respuestaduelos', {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        usuario_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id_usuario'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        pregunta_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'preguntaduelos',
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
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      }, { transaction });

      // Crear tabla profesor_materias
      await queryInterface.createTable('profesor_materias', {
        id_profesor_materia: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        id_profesor: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id_usuario'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        id_materia: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'materias',
            key: 'id_materia'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      }, { transaction });

      // Crear tabla insignias
      await queryInterface.createTable('insignias', {
        id_insignia: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        nombre: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        icono_url: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        id_mision_desbloqueo: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: 'misiones',
            key: 'id_mision'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }
      }, { transaction });

      // Crear tabla usuario_insignias
      await queryInterface.createTable('usuario_insignias', {
        id_usuario_insignia: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        id_usuario: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id_usuario'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        id_insignia: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'insignias',
            key: 'id_insignia'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        fecha_obtencion: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      }, { transaction });

      // Crear tabla recompensas_canjeables
      await queryInterface.createTable('recompensas_canjeables', {
        id_recompensa: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        nombre: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        tipo_recompensa: {
          type: Sequelize.ENUM('FISICA', 'ACADEMICA'),
          allowNull: false
        },
        costo_en_puntos: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        stock: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        requiere_aprobacion_docente: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      }, { transaction });

      // Crear tabla usuario_canjes
      await queryInterface.createTable('usuario_canjes', {
        id_canje: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        id_usuario: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id_usuario'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        id_recompensa: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'recompensas_canjeables',
            key: 'id_recompensa'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        puntos_gastados: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        fecha_canje: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        estado_aprobacion: {
          type: Sequelize.ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO'),
          allowNull: false,
          defaultValue: 'APROBADO'
        }
      }, { transaction });

      // Crear tabla codigos_qr
      await queryInterface.createTable('codigos_qr', {
        id_qr: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        codigo_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        },
        descripcion: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        puntos_recompensa: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        experiencia_recompensa: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        fecha_expiracion: {
          type: Sequelize.DATE,
          allowNull: true
        },
        usos_maximos: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        usos_actuales: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      }, { transaction });

      // Crear tabla usuario_escaneos_qr
      await queryInterface.createTable('usuario_escaneos_qr', {
        id_escaneo: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        id_usuario: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id_usuario'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        id_qr: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'codigos_qr',
            key: 'id_qr'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        fecha_escaneo: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      }, { transaction });

      // Crear tabla tareas_personales
      await queryInterface.createTable('tareas_personales', {
        id_tarea: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        id_usuario: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id_usuario'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        titulo: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        fecha_vencimiento: {
          type: Sequelize.DATE,
          allowNull: true
        },
        estado: {
          type: Sequelize.ENUM('PENDIENTE', 'COMPLETADA'),
          allowNull: false,
          defaultValue: 'PENDIENTE'
        },
        google_calendar_event_id: {
          type: Sequelize.STRING(255),
          allowNull: true
        }
      }, { transaction });

      // Crear índices únicos
      await queryInterface.addIndex('inscripciones', ['id_usuario', 'id_materia', 'periodo_academico'], {
        unique: true,
        name: 'inscripciones_unique',
        transaction
      });

      await queryInterface.addIndex('profesor_materias', ['id_profesor', 'id_materia'], {
        unique: true,
        name: 'profesor_materias_unique',
        transaction
      });

      await queryInterface.addIndex('usuario_escaneos_qr', ['id_usuario', 'id_qr'], {
        unique: true,
        name: 'usuario_escaneos_qr_unique',
        transaction
      });

      // Crear índices para mejorar rendimiento
      await queryInterface.addIndex('usuarios', ['email_institucional'], { transaction });
      await queryInterface.addIndex('usuarios', ['rol'], { transaction });
      await queryInterface.addIndex('misiones', ['tipo_mision'], { transaction });
      await queryInterface.addIndex('misiones', ['dificultad'], { transaction });
      await queryInterface.addIndex('duelos', ['estado'], { transaction });
      await queryInterface.addIndex('preguntas_duelo', ['dificultad'], { transaction });
      await queryInterface.addIndex('preguntaduelos', ['materia'], { transaction });
      await queryInterface.addIndex('preguntaduelos', ['dificultad'], { transaction });
      await queryInterface.addIndex('respuestaduelos', ['usuario_id'], { transaction });
      await queryInterface.addIndex('respuestaduelos', ['pregunta_id'], { transaction });

      await transaction.commit();
      logSuccess('Migración regenerada exitosamente desde models.js');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Eliminar tablas en orden inverso
      await queryInterface.dropTable('tareas_personales', { transaction });
      await queryInterface.dropTable('usuario_escaneos_qr', { transaction });
      await queryInterface.dropTable('codigos_qr', { transaction });
      await queryInterface.dropTable('usuario_canjes', { transaction });
      await queryInterface.dropTable('recompensas_canjeables', { transaction });
      await queryInterface.dropTable('usuario_insignias', { transaction });
      await queryInterface.dropTable('insignias', { transaction });
      await queryInterface.dropTable('profesor_materias', { transaction });
      await queryInterface.dropTable('respuestaduelos', { transaction });
      await queryInterface.dropTable('preguntaduelos', { transaction });
      await queryInterface.dropTable('respuestas_duelo', { transaction });
      await queryInterface.dropTable('preguntas_duelo', { transaction });
      await queryInterface.dropTable('duelo_participantes', { transaction });
      await queryInterface.dropTable('duelos', { transaction });
      await queryInterface.dropTable('usuario_misiones', { transaction });
      await queryInterface.dropTable('misiones', { transaction });
      await queryInterface.dropTable('inscripciones', { transaction });
      await queryInterface.dropTable('materias', { transaction });
      await queryInterface.dropTable('usuarios', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};`;

  try {
    fs.writeFileSync(migrationPath, migrationContent);
    logSuccess(`Migración regenerada: ${migrationFile}`);
    return migrationFile;
  } catch (error) {
    logError(`Error al crear migración: ${error.message}`);
    throw error;
  }
}

// Función principal
function main() {
  log(`${colors.bright}${colors.blue}🔄 Regenerando migraciones desde models.js...${colors.reset}\n`);

  try {
    // Limpiar migraciones existentes
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const existingMigrations = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.js'));
    
    if (existingMigrations.length > 0) {
      logWarning(`Encontradas ${existingMigrations.length} migraciones existentes`);
      log('Eliminando migraciones anteriores...');
      
      existingMigrations.forEach(file => {
        const filePath = path.join(migrationsDir, file);
        fs.unlinkSync(filePath);
        log(`  Eliminado: ${file}`);
      });
    }

    // Generar nueva migración
    const migrationFile = generateMigrationFromModels();
    
    log(`\n${colors.bright}${colors.green}✅ Migración regenerada exitosamente!${colors.reset}`);
    log(`${colors.cyan}📁 Archivo creado: ${migrationFile}${colors.reset}`);
    log(`\n${colors.cyan}💡 Próximos pasos:${colors.reset}`);
    log(`${colors.yellow}  npm run migrate:reset${colors.reset} - Resetear base de datos`);
    log(`${colors.yellow}  npm run migrate${colors.reset} - Aplicar nueva migración`);
    log(`\n${colors.magenta}🎯 Sistema tipo Django configurado!${colors.reset}`);
    log(`${colors.cyan}   - Modifica models.js para cambiar la estructura${colors.reset}`);
    log(`${colors.cyan}   - Ejecuta npm run migrate:regenerate para regenerar${colors.reset}`);
    log(`${colors.cyan}   - Ejecuta npm run migrate para aplicar cambios${colors.reset}`);

  } catch (error) {
    logError(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Manejo de argumentos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}Uso: node scripts/regenerate-migrations.js [opciones]${colors.reset}\n`);
  log(`${colors.cyan}Opciones:${colors.reset}`);
  log(`${colors.yellow}  --help, -h${colors.reset}     Mostrar esta ayuda`);
  log(`\n${colors.cyan}Descripción:${colors.reset}`);
  log('Regenera todas las migraciones desde el archivo models.js centralizado');
  log('Esto permite trabajar como Django: modificar modelos y migrar todo de una vez');
  process.exit(0);
}

main();
