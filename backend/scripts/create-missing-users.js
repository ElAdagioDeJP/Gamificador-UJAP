require('dotenv').config();
const { Usuario, sequelize } = require('../models');

async function createMissingUsers() {
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

    // Verificar si estudiante existe
    let student = await Usuario.findOne({ where: { email_institucional: 'juan@estudiante.com' } });
    if (!student) {
      student = await Usuario.create({
        nombre_usuario: 'estudiante1',
        nombre_completo: 'Juan Pérez',
        email_institucional: 'juan@estudiante.com',
        contrasena_hash: 'estudiante123',
        rol: 'estudiante',
        estado_verificacion: 'VERIFICADO'
      });
      console.log('✅ Usuario estudiante creado');
    } else {
      console.log('ℹ️ Usuario estudiante ya existe');
    }

    // Verificar si profesor pendiente existe
    let professorPending = await Usuario.findOne({ where: { email_institucional: 'maria@profesor.com' } });
    if (!professorPending) {
      professorPending = await Usuario.create({
        nombre_usuario: 'profesor1',
        nombre_completo: 'María García',
        email_institucional: 'maria@profesor.com',
        contrasena_hash: 'profesor123',
        rol: 'profesor',
        estado_verificacion: 'PENDIENTE'
      });
      console.log('✅ Usuario profesor pendiente creado');
    } else {
      console.log('ℹ️ Usuario profesor pendiente ya existe');
    }

    // Verificar si profesor aprobado existe
    let professorApproved = await Usuario.findOne({ where: { email_institucional: 'carlos@profesor.com' } });
    if (!professorApproved) {
      professorApproved = await Usuario.create({
        nombre_usuario: 'profesor2',
        nombre_completo: 'Carlos López',
        email_institucional: 'carlos@profesor.com',
        contrasena_hash: 'profesor123',
        rol: 'profesor',
        estado_verificacion: 'VERIFICADO'
      });
      console.log('✅ Usuario profesor aprobado creado');
    } else {
      console.log('ℹ️ Usuario profesor aprobado ya existe');
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

createMissingUsers();
