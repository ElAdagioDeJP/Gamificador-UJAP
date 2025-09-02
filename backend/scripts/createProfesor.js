const { Usuario } = require('../models');
const db = require('../models');

async function createProfesor() {
  try {
    await db.sequelize.authenticate();
    const exists = await Usuario.findOne({ where: { email_institucional: 'profesor@university.edu' } });
    if (exists) {
      console.log('El usuario profesor ya existe.');
      process.exit(0);
    }
    const user = await Usuario.create({
      nombre_usuario: 'profesor',
      nombre_completo: 'Venecia Miranda',
      email_institucional: 'profesor@university.edu',
      contrasena_hash: 'profesor123', // Se hashea automáticamente por el modelo
      rol: 'profesor',
    });
    console.log('Usuario profesor creado:', user.toJSON());
    process.exit(0);
  } catch (err) {
    console.error('Error creando el usuario profesor:', err);
    process.exit(1);
  }
}

createProfesor();
