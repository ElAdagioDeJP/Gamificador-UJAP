'use strict';

const Sequelize = require('sequelize');
const process = require('process');

// Prefer env-driven database config that reads .env (src/config/database.js)
let config;
try {
  // src/config/database.js exports an object { development, test, production }
  config = require(__dirname + '/../src/config/database.js')[process.env.NODE_ENV || 'development'];
} catch (e) {
  // Fallback to legacy config.json
  config = require(__dirname + '/../config/config.json')[process.env.NODE_ENV || 'development'];
}

// Crear instancia de Sequelize usando la configuración encontrada
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Importar y crear modelos
const { createModels } = require('./models');
const models = createModels(sequelize);

// Agregar sequelize y Sequelize a los modelos
models.sequelize = sequelize;
models.Sequelize = Sequelize;

// Exportar modelos individuales para facilitar el uso
const { Usuario, SolicitudProfesor, Materia, Inscripcion, Mision, UsuarioMision, Duelo, DueloParticipante, PreguntaDuelo, RespuestaDuelo, PreguntaDueloNuevo, RespuestaDueloNuevo, ProfesorMateria, Insignia, UsuarioInsignia, RecompensaCanjeable, UsuarioCanje, CodigoQR, UsuarioEscaneoQR, TareaPersonal } = models;

module.exports = {
  ...models,
  Usuario,
  SolicitudProfesor,
  Materia,
  Inscripcion,
  Mision,
  UsuarioMision,
  Duelo,
  DueloParticipante,
  PreguntaDuelo,
  RespuestaDuelo,
  PreguntaDueloNuevo,
  RespuestaDueloNuevo,
  ProfesorMateria,
  Insignia,
  UsuarioInsignia,
  RecompensaCanjeable,
  UsuarioCanje,
  CodigoQR,
  UsuarioEscaneoQR,
  TareaPersonal
};
