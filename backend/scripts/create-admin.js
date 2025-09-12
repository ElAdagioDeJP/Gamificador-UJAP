#!/usr/bin/env node

const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    console.log('🔧 Creando usuario administrador...');
    
    // Verificar si ya existe un admin
    const existingAdmin = await Usuario.findOne({
      where: { rol: 'admin' }
    });
    
    if (existingAdmin) {
      console.log('✅ Ya existe un usuario administrador:', existingAdmin.email_institucional);
      return;
    }
    
    // Crear admin
    const admin = await Usuario.create({
      nombre_usuario: 'admin',
      nombre_completo: 'Administrador del Sistema',
      email_institucional: 'admin@ujap.edu',
      contrasena_hash: 'admin123', // Se hasheará automáticamente
      rol: 'admin',
      sexo: 'M',
      estado_verificacion: 'VERIFICADO'
    });
    
    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('📧 Email: admin@ujap.edu');
    console.log('🔑 Contraseña: admin123');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error.message);
  }
}

createAdmin();
