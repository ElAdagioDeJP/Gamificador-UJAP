'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const config = require(__dirname + '/../config/config.json')[process.env.NODE_ENV || 'development'];

// Crear instancia de Sequelize
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Importar y crear modelos
const { createModels } = require('../models-definitions');
const models = createModels(sequelize);

// Agregar sequelize y Sequelize a los modelos
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
