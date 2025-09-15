const path = require('path');
// Load .env specifically from the backend folder so running scripts from workspace root
// still pick up backend's environment (MYSQL_PASSWORD, etc).
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  development: {
    username: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "studybooster_db",
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: (process.env.MYSQL_DATABASE || "studybooster_db") + "_test",
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    dialect: "mysql",
    logging: false
  },
  production: {
    username: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "studybooster_db",
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    dialect: "mysql",
    logging: false
  }
};

module.exports = config;
