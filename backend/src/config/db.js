const { sequelize } = require('../../models');

async function connectDB() {
  try {
    await sequelize.authenticate();
    // Sync only essential tables for now. In real projects, prefer migrations.
    await sequelize.sync();
    console.log('MySQL connected via Sequelize');
  } catch (err) {
    console.error('DB connection error:', err);
    throw err;
  }
}

module.exports = connectDB;
