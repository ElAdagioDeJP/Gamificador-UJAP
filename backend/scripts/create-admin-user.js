require('dotenv').config();
const { Usuario, sequelize } = require('../models');

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Verificar si admin existe
    let admin = await Usuario.findOne({ where: { email_institucional: 'admin@edu.com' } });
    if (!admin) {
      admin = await Usuario.create({
        nombre_usuario: 'admin',
        nombre_completo: 'Administrador del Sistema',
        email_institucional: 'admin@edu.com',
        contrasena_hash: 'admin123',
        rol: 'admin',
        estado_verificacion: 'VERIFICADO'
      });
      console.log('✅ Usuario administrador creado');
    } else {
      console.log('ℹ️ Usuario administrador ya existe');
    }

    // Mostrar todos los usuarios
    const users = await Usuario.findAll({
      attributes: ['id_usuario', 'nombre_usuario', 'email_institucional', 'rol', 'estado_verificacion']
    });

    console.log('\n📋 Todos los usuarios en la base de datos:');
    users.forEach(user => {
      console.log(`- ID: ${user.id_usuario} | ${user.nombre_usuario} | ${user.email_institucional} | Rol: ${user.rol} | Estado: ${user.estado_verificacion}`);
    });

    await sequelize.close();
    console.log('\n✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminUser();
