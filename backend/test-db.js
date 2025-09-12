console.log('Testing db.js...');

try {
  console.log('1. Testing models import...');
  const models = require('./models');
  console.log('✓ Models imported successfully:', Object.keys(models));

  console.log('2. Testing sequelize property...');
  const { sequelize } = models;
  console.log('✓ Sequelize extracted:', !!sequelize);

  if (sequelize) {
    console.log('3. Testing authenticate...');
    sequelize.authenticate().then(() => {
      console.log('✓ Database connection successful');
      process.exit(0);
    }).catch(err => {
      console.error('✗ Database connection failed:', err.message);
      process.exit(1);
    });
  } else {
    console.error('✗ Sequelize is undefined');
    process.exit(1);
  }

} catch (error) {
  console.error('✗ Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
