'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🚀 Iniciando migración simple de base de datos...');

      // 1. Crear tabla usuarios si no existe
      const tableExists = await queryInterface.tableExists('usuarios');
      if (!tableExists) {
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
          estado_verificacion: {
            type: Sequelize.ENUM('PENDIENTE', 'VERIFICADO', 'RECHAZADO'),
            allowNull: false,
            defaultValue: 'VERIFICADO'
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
          },
          fecha_actualizacion: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            onUpdate: Sequelize.NOW
          }
        }, { transaction });
        console.log('✅ Tabla usuarios creada');
      } else {
        console.log('ℹ️  Tabla usuarios ya existe');
      }

      // 2. Crear tabla solicitudes_profesores si no existe
      const solicitudesExists = await queryInterface.tableExists('solicitudes_profesores');
      if (!solicitudesExists) {
        await queryInterface.createTable('solicitudes_profesores', {
          id_solicitud: {
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
          carnet_institucional_url: {
            type: Sequelize.STRING(500),
            allowNull: true
          },
          estado: {
            type: Sequelize.ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA'),
            allowNull: false,
            defaultValue: 'PENDIENTE'
          },
          motivo_rechazo: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          fecha_revision: {
            type: Sequelize.DATE,
            allowNull: true
          },
          id_admin_revisor: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
              model: 'usuarios',
              key: 'id_usuario'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          fecha_creacion: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          fecha_actualizacion: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            onUpdate: Sequelize.NOW
          }
        }, { transaction });
        console.log('✅ Tabla solicitudes_profesores creada');
      } else {
        console.log('ℹ️  Tabla solicitudes_profesores ya existe');
      }

      // 3. Crear tabla materias si no existe
      const materiasExists = await queryInterface.tableExists('materias');
      if (!materiasExists) {
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
          },
          codigo_materia: {
            type: Sequelize.STRING(20),
            allowNull: true,
            unique: true
          },
          descripcion: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          creditos: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 3
          },
          activa: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
          },
          fecha_creacion: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        }, { transaction });
        console.log('✅ Tabla materias creada');
      } else {
        console.log('ℹ️  Tabla materias ya existe');
      }

      // 4. Crear tabla preguntaduelos si no existe
      const preguntasExists = await queryInterface.tableExists('preguntaduelos');
      if (!preguntasExists) {
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
        console.log('✅ Tabla preguntaduelos creada');
      } else {
        console.log('ℹ️  Tabla preguntaduelos ya existe');
      }

      // 5. Crear tabla respuestaduelos si no existe
      const respuestasExists = await queryInterface.tableExists('respuestaduelos');
      if (!respuestasExists) {
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
        console.log('✅ Tabla respuestaduelos creada');
      } else {
        console.log('ℹ️  Tabla respuestaduelos ya existe');
      }

      await transaction.commit();
      console.log('✅ Migración simple completada exitosamente');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Revirtiendo migración simple...');
      
      // Eliminar tablas en orden inverso
      await queryInterface.dropTable('respuestaduelos', { transaction });
      await queryInterface.dropTable('preguntaduelos', { transaction });
      await queryInterface.dropTable('materias', { transaction });
      await queryInterface.dropTable('solicitudes_profesores', { transaction });
      await queryInterface.dropTable('usuarios', { transaction });

      await transaction.commit();
      console.log('✅ Migración revertida exitosamente');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al revertir migración:', error.message);
      throw error;
    }
  }
};
