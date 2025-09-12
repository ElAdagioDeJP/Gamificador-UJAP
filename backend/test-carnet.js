const { Usuario, SolicitudProfesor } = require('./models');

async function testCarnet() {
  try {
    console.log('🔍 Probando consulta de carnet...');
    
    // Buscar un profesor con solicitud
    const professor = await Usuario.findOne({
      where: { rol: 'profesor' },
      include: [
        {
          model: SolicitudProfesor,
          as: 'SolicitudProfesor',
          required: false,
          attributes: ['carnet_institucional_url', 'estado', 'motivo_rechazo', 'fecha_revision']
        }
      ],
      attributes: [
        'id_usuario',
        'nombre_usuario',
        'nombre_completo',
        'email_institucional',
        'rol',
        'estado_verificacion',
        'sexo',
        'fecha_creacion'
      ]
    });

    if (professor) {
      console.log('✅ Profesor encontrado:');
      console.log('ID:', professor.id_usuario);
      console.log('Nombre:', professor.nombre_completo);
      console.log('Email:', professor.email_institucional);
      console.log('Estado:', professor.estado_verificacion);
      
      if (professor.SolicitudProfesor) {
        console.log('📄 Solicitud encontrada:');
        console.log('Carnet URL:', professor.SolicitudProfesor.carnet_institucional_url);
        console.log('Estado solicitud:', professor.SolicitudProfesor.estado);
        console.log('Motivo rechazo:', professor.SolicitudProfesor.motivo_rechazo);
      } else {
        console.log('❌ No se encontró solicitud asociada');
      }
    } else {
      console.log('❌ No se encontraron profesores');
    }

    // Listar todas las solicitudes
    console.log('\n📋 Todas las solicitudes:');
    const solicitudes = await SolicitudProfesor.findAll({
      attributes: ['id_usuario', 'carnet_institucional_url', 'estado', 'motivo_rechazo']
    });
    
    solicitudes.forEach(sol => {
      console.log(`Usuario ${sol.id_usuario}: ${sol.carnet_institucional_url || 'Sin carnet'} (${sol.estado})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testCarnet();
