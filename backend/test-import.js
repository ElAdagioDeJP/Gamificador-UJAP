console.log('Testing imports...');

try {
  console.log('1. Testing Sequelize import...');
  const Sequelize = require('sequelize');
  console.log('✓ Sequelize imported successfully');

  console.log('2. Testing config import...');
  const config = require('./config/config.json');
  console.log('✓ Config imported successfully:', config.development.database);

  console.log('3. Testing models import...');
  const { createModels } = require('./models');
  console.log('✓ createModels imported successfully');

  console.log('4. Testing Sequelize instance creation...');
  const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, config.development);
  console.log('✓ Sequelize instance created successfully');

  console.log('5. Testing models creation...');
  const models = createModels(sequelize);
  console.log('✓ Models created successfully:', Object.keys(models).length, 'models');

  console.log('6. Testing sequelize property...');
  models.sequelize = sequelize;
  console.log('✓ Sequelize property added successfully');

  console.log('7. Testing authenticate...');
  sequelize.authenticate().then(() => {
    console.log('✓ Database connection successful');
    process.exit(0);
  }).catch(err => {
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
  });

} catch (error) {
  console.error('✗ Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
