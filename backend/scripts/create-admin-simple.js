require('dotenv').config();
const { Usuario, sequelize } = require('../models');

async function createAdminSimple() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Crear usuario administrador simple
    const admin = await Usuario.create({
      nombre_usuario: 'admin_simple',
      nombre_completo: 'Admin Simple',
      email_institucional: 'admin@edu.com',
      contrasena_hash: 'admin123',
      rol: 'admin',
      estado_verificacion: 'VERIFICADO'
    });

    console.log('✅ Usuario administrador creado:', admin.toSafeJSON());

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

createAdminSimple();
