// Modelo RespuestaDuelo.js
module.exports = (sequelize, DataTypes) => {
  const RespuestaDuelo = sequelize.define('RespuestaDuelo', {
    id_respuesta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_pregunta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    texto_respuesta: {
      type: DataTypes.STRING,
      allowNull: false
    },
    es_correcta: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'Respuestas_Duelo',
    timestamps: false
  });

  RespuestaDuelo.associate = function(models) {
    RespuestaDuelo.belongsTo(models.PreguntaDuelo, {
      foreignKey: 'id_pregunta'
    });
  };

  return RespuestaDuelo;
};
