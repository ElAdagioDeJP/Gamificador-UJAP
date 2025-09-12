const models = require('./models');

console.log('✅ Modelos cargados correctamente:');
console.log('📊 Total de modelos:', Object.keys(models).filter(k => k !== 'sequelize' && k !== 'Sequelize').length);
console.log('\n📋 Lista de modelos:');
Object.keys(models)
  .filter(k => k !== 'sequelize' && k !== 'Sequelize')
  .forEach(k => console.log(`  - ${k}`));

console.log('\n🔗 Probando conexión a la base de datos...');
models.sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos exitosa');
    console.log('\n🎉 Sistema de modelos estilo Django funcionando correctamente!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  });
