'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable && process.env[config.use_env_variable]) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
// Prefer DATABASE_URL (or a named env variable) if available
const envVarKey = config.use_env_variable || 'DATABASE_URL';
const url = process.env[envVarKey];
if (url) {
  sequelize = new Sequelize(url, config);
} else {
  // Allow env overrides for discrete params
  const username = process.env.MYSQL_USER || process.env.DB_USER || config.username;
  const password = (process.env.MYSQL_PASSWORD ?? process.env.DB_PASS) ?? config.password;
  const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || config.database;
  const host = process.env.MYSQL_HOST || process.env.DB_HOST || config.host;
  const port = Number(process.env.MYSQL_PORT || process.env.DB_PORT) || config.port;
  const dialect = process.env.DB_DIALECT || config.dialect || 'mysql';
  const ssl = (process.env.DB_SSL || '').toString().toLowerCase() === 'true';
  sequelize = new Sequelize(database, username, password, { ...config, host, port, dialect, dialectOptions: ssl ? { ssl: { require: true, rejectUnauthorized: false } } : config.dialectOptions });
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
