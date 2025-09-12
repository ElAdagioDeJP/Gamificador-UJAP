'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar columna estado_verificacion a la tabla usuarios si no existe
    try {
      await queryInterface.addColumn('usuarios', 'estado_verificacion', {
        type: Sequelize.ENUM('PENDIENTE', 'VERIFICADO', 'RECHAZADO'),
        allowNull: false,
        defaultValue: 'VERIFICADO'
      });
    } catch (error) {
      // La columna ya existe, continuar
      console.log('Columna estado_verificacion ya existe o error:', error.message);
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

    // Crear índices
    await queryInterface.addIndex('solicitudes_profesores', ['id_usuario']);
    await queryInterface.addIndex('solicitudes_profesores', ['estado']);
    await queryInterface.addIndex('solicitudes_profesores', ['fecha_creacion']);
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar tabla solicitudes_profesores
    await queryInterface.dropTable('solicitudes_profesores');
    
    // Eliminar columna estado_verificacion de la tabla usuarios
    try {
      await queryInterface.removeColumn('usuarios', 'estado_verificacion');
    } catch (error) {
      console.log('Error eliminando columna estado_verificacion:', error.message);
    }
  }
};
