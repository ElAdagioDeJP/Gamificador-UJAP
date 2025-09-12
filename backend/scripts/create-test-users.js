require('dotenv').config();
const { Usuario, sequelize } = require('../models');

async function createTestUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Crear usuario administrador
    const admin = await Usuario.create({
      nombre_usuario: 'admin',
      nombre_completo: 'Administrador del Sistema',
      email_institucional: 'admin@edu.com',
      contrasena_hash: 'admin123',
      rol: 'admin',
      estado_verificacion: 'VERIFICADO'
    });
    console.log('✅ Usuario administrador creado:', admin.email_institucional);

    // Crear usuario estudiante
    const student = await Usuario.create({
      nombre_usuario: 'estudiante1',
      nombre_completo: 'Juan Pérez',
      email_institucional: 'juan@estudiante.com',
      contrasena_hash: 'estudiante123',
      rol: 'estudiante',
      estado_verificacion: 'VERIFICADO'
    });
    console.log('✅ Usuario estudiante creado:', student.email_institucional);

    // Crear usuario profesor pendiente
    const professorPending = await Usuario.create({
      nombre_usuario: 'profesor1',
      nombre_completo: 'María García',
      email_institucional: 'maria@profesor.com',
      contrasena_hash: 'profesor123',
      rol: 'profesor',
      estado_verificacion: 'PENDIENTE'
    });
    console.log('✅ Usuario profesor pendiente creado:', professorPending.email_institucional);

    // Crear usuario profesor aprobado
    const professorApproved = await Usuario.create({
      nombre_usuario: 'profesor2',
      nombre_completo: 'Carlos López',
      email_institucional: 'carlos@profesor.com',
      contrasena_hash: 'profesor123',
      rol: 'profesor',
      estado_verificacion: 'VERIFICADO'
    });
    console.log('✅ Usuario profesor aprobado creado:', professorApproved.email_institucional);

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

createTestUsers();
