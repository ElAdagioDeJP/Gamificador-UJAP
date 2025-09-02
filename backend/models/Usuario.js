'use strict';

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre_usuario: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    nombre_completo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email_institucional: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    contrasena_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM('estudiante', 'profesor'),
      allowNull: false,
      defaultValue: 'estudiante',
    },
    puntos_actuales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    experiencia_total: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    nivel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    racha_dias_consecutivos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    fecha_ultima_actividad: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    tableName: 'Usuarios',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
    hooks: {
      beforeCreate: async (user) => {
        if (user.changed('contrasena_hash')) {
          const salt = await bcrypt.genSalt(10);
          user.contrasena_hash = await bcrypt.hash(user.contrasena_hash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('contrasena_hash')) {
          const salt = await bcrypt.genSalt(10);
          user.contrasena_hash = await bcrypt.hash(user.contrasena_hash, salt);
        }
      },
    }
  });

  Usuario.prototype.comparePassword = function(candidate) {
    return bcrypt.compare(candidate, this.contrasena_hash);
  };

  Usuario.prototype.toSafeJSON = function() {
    const { contrasena_hash, ...rest } = this.toJSON();
    return rest;
  };

  return Usuario;
};
