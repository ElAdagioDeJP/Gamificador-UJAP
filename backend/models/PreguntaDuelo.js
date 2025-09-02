// Modelo PreguntaDuelo.js
module.exports = (sequelize, DataTypes) => {
  const PreguntaDuelo = sequelize.define('PreguntaDuelo', {
    id_pregunta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_materia: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    enunciado: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dificultad: {
      type: DataTypes.ENUM('FACIL', 'NORMAL', 'DIFICIL'),
      allowNull: false
    }
  }, {
    tableName: 'Preguntas_Duelo',
    timestamps: false
  });

  PreguntaDuelo.associate = function(models) {
    PreguntaDuelo.hasMany(models.RespuestaDuelo, {
      as: 'opciones',
      foreignKey: 'id_pregunta'
    });
  };

  return PreguntaDuelo;
};
