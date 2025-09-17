'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar si la columna estado_verificacion ya existe
    const tableDescription = await queryInterface.describeTable('Usuarios');
    if (!tableDescription.estado_verificacion) {
      // Agregar columna estado_verificacion a la tabla Usuarios
      await queryInterface.addColumn('Usuarios', 'estado_verificacion', {
        type: Sequelize.ENUM('PENDIENTE', 'VERIFICADO', 'RECHAZADO'),
        allowNull: false,
        defaultValue: 'VERIFICADO'
      });
    }

    // Verificar si la tabla solicitudes_profesores ya existe
    const tableExists = await queryInterface.tableExists('solicitudes_profesores');
    if (!tableExists) {
      // Alinea el tipo de la columna id_usuario en la tabla usuarios para evitar incompatibilidades
      try {
        if (tableDescription && tableDescription.id_usuario) {
          const currentType = (tableDescription.id_usuario.type || '').toString().toLowerCase();
          // Si no contiene 'unsigned', intentamos convertirla a UNSIGNED para que coincida con FK
          if (!currentType.includes('unsigned')) {
            // Cambiar columna a INTEGER.UNSIGNED manteniendo autoIncrement y not null
            await queryInterface.changeColumn('Usuarios', 'id_usuario', {
              type: Sequelize.INTEGER.UNSIGNED,
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
            });
          }
        }
      } catch (err) {
        // Si no podemos cambiar la columna por cualquier razón, registramos y seguimos; la adición de FK fallará si son incompatibles
        console.warn('Advertencia: no se pudo convertir usuarios.id_usuario a UNSIGNED:', err.message || err);
      }

      // Crear tabla solicitudes_profesores
  await queryInterface.createTable('solicitudes_profesores', {
      id_solicitud: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      carnet_institucional_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA'),
        allowNull: false,
        defaultValue: 'PENDIENTE'
      },
      motivo_rechazo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fecha_revision: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      id_admin_revisor: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      fecha_actualizacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Agregar claves foráneas
    await queryInterface.addConstraint('solicitudes_profesores', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_solicitudes_usuario',
      references: {
        table: 'Usuarios',
        field: 'id_usuario'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('solicitudes_profesores', {
      fields: ['id_admin_revisor'],
      type: 'foreign key',
      name: 'fk_solicitudes_admin',
      references: {
        table: 'Usuarios',
        field: 'id_usuario'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

      // Crear índices
      await queryInterface.addIndex('solicitudes_profesores', ['id_usuario']);
      await queryInterface.addIndex('solicitudes_profesores', ['estado']);
      await queryInterface.addIndex('solicitudes_profesores', ['fecha_creacion']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar tabla solicitudes_profesores
    await queryInterface.dropTable('solicitudes_profesores');
    
    // Eliminar columna estado_verificacion de la tabla Usuarios
    await queryInterface.removeColumn('Usuarios', 'estado_verificacion');
  }
};
