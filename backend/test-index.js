console.log('Testing models/index.js simulation...');

try {
  console.log('1. Testing Sequelize import...');
  const Sequelize = require('sequelize');
  console.log('✓ Sequelize imported successfully');

  console.log('2. Testing config import...');
  const config = require('./config/config.json');
  console.log('✓ Config imported successfully');

  console.log('3. Testing createModels import...');
  const { createModels } = require('./models');
  console.log('✓ createModels imported successfully');

  console.log('4. Testing Sequelize instance creation...');
  const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, config.development);
  console.log('✓ Sequelize instance created successfully');

  console.log('5. Testing models creation...');
  const models = createModels(sequelize);
  console.log('✓ Models created successfully:', Object.keys(models).length, 'models');

  console.log('6. Testing adding sequelize to models...');
  models.sequelize = sequelize;
  models.Sequelize = Sequelize;
  console.log('✓ Sequelize added to models');

  console.log('7. Testing models export...');
  console.log('Models keys:', Object.keys(models));
  console.log('Has sequelize:', 'sequelize' in models);
  console.log('Sequelize type:', typeof models.sequelize);

  console.log('8. Testing require from models/index.js...');
  const modelsFromIndex = require('./models');
  console.log('✓ Models from index imported successfully:', Object.keys(modelsFromIndex));
  console.log('Has sequelize:', 'sequelize' in modelsFromIndex);
  console.log('Sequelize type:', typeof modelsFromIndex.sequelize);

  console.log('9. Testing authenticate...');
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
