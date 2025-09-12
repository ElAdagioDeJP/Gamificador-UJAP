require('dotenv').config();
const { Usuario, sequelize } = require('../models');

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Contar usuarios
    const totalUsers = await Usuario.count();
    console.log(`📊 Total de usuarios: ${totalUsers}`);

    // Mostrar todos los usuarios
    const users = await Usuario.findAll({
      attributes: ['id_usuario', 'nombre_usuario', 'email_institucional', 'rol', 'estado_verificacion']
    });

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
    } else {
      console.log('\n📋 Usuarios en la base de datos:');
      users.forEach(user => {
        console.log(`- ID: ${user.id_usuario} | ${user.nombre_usuario} | ${user.email_institucional} | Rol: ${user.rol} | Estado: ${user.estado_verificacion || 'NULL'}`);
      });
    }

    await sequelize.close();
    console.log('\n✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
