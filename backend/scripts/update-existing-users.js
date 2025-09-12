require('dotenv').config();
const { Usuario, sequelize } = require('../models');

async function updateExistingUsers() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos');

    // Actualizar todos los usuarios existentes que no tengan estado_verificacion
    const [updatedCount] = await Usuario.update(
      { estado_verificacion: 'VERIFICADO' },
      { 
        where: { 
          estado_verificacion: null 
        } 
      }
    );

    console.log(`✅ Actualizados ${updatedCount} usuarios con estado_verificacion = 'VERIFICADO'`);

    // Mostrar todos los usuarios
    const users = await Usuario.findAll({
      attributes: ['id_usuario', 'nombre_usuario', 'email_institucional', 'rol', 'estado_verificacion']
    });

    console.log('\n📋 Usuarios en la base de datos:');
    users.forEach(user => {
      console.log(`- ${user.nombre_usuario} (${user.email_institucional}) - Rol: ${user.rol} - Estado: ${user.estado_verificacion || 'NULL'}`);
    });

    await sequelize.close();
    console.log('\n✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateExistingUsers();
