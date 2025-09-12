const { Usuario, SolicitudProfesor } = require('../../models');
const { Op } = require('sequelize');

// Obtener todos los profesores (aceptados, rechazados y pendientes)
exports.getAllProfessors = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Construir filtros
    const whereClause = { rol: 'profesor' };
    if (status && status !== 'all') {
      whereClause.estado_verificacion = status.toUpperCase();
    }

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Obtener profesores con paginación
    const { count, rows: professors } = await Usuario.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: SolicitudProfesor,
          as: 'SolicitudProfesor',
          required: false
        }
      ],
      attributes: [
        'id_usuario',
        'nombre_usuario',
        'nombre_completo',
        'email_institucional',
        'rol',
        'estado_verificacion',
        'fecha_creacion'
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['fecha_creacion', 'DESC']]
    });

    // Obtener estadísticas
    const stats = await Usuario.findAll({
      where: { rol: 'profesor' },
      attributes: [
        'estado_verificacion',
        [Usuario.sequelize.fn('COUNT', Usuario.sequelize.col('id_usuario')), 'count']
      ],
      group: ['estado_verificacion'],
      raw: true
    });

    const statistics = {
      total: count,
      pendientes: 0,
      verificados: 0,
      rechazados: 0
    };

    stats.forEach(stat => {
      const status = stat.estado_verificacion;
      const count = parseInt(stat.count);
      if (status === 'PENDIENTE') statistics.pendientes = count;
      else if (status === 'VERIFICADO') statistics.verificados = count;
      else if (status === 'RECHAZADO') statistics.rechazados = count;
    });

    res.json({
      success: true,
      data: {
        professors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        },
        statistics
      }
    });
  } catch (error) {
    console.error('Error getting professors:', error);
    next(error);
  }
};

// Obtener detalles de un profesor específico
exports.getProfessorDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const professor = await Usuario.findOne({
      where: { 
        id_usuario: id,
        rol: 'profesor'
      },
      include: [
        {
          model: SolicitudProfesor,
          as: 'SolicitudProfesor',
          required: false
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

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: 'Profesor no encontrado'
      });
    }

    res.json({
      success: true,
      data: { professor }
    });
  } catch (error) {
    console.error('Error getting professor details:', error);
    next(error);
  }
};

// Cambiar estado de verificación de un profesor
exports.updateProfessorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, motivo_rechazo } = req.body;
    const adminId = req.user.id;

    // Validar estado
    if (!['VERIFICADO', 'RECHAZADO'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser VERIFICADO o RECHAZADO'
      });
    }

    // Validar motivo de rechazo si es necesario
    if (status === 'RECHAZADO' && !motivo_rechazo) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un motivo de rechazo'
      });
    }

    const professor = await Usuario.findOne({
      where: { 
        id_usuario: id,
        rol: 'profesor'
      }
    });

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: 'Profesor no encontrado'
      });
    }

    // Actualizar estado del profesor
    await professor.update({
      estado_verificacion: status
    });

    // Actualizar o crear solicitud de profesor
    const solicitud = await SolicitudProfesor.findOne({
      where: { id_usuario: id }
    });

    if (solicitud) {
      await solicitud.update({
        estado: status === 'VERIFICADO' ? 'APROBADA' : 'RECHAZADA',
        motivo_rechazo: status === 'RECHAZADO' ? motivo_rechazo : null,
        fecha_revision: new Date(),
        id_admin_revisor: adminId
      });
    } else {
      // Crear solicitud si no existe
      await SolicitudProfesor.create({
        id_usuario: id,
        carnet_institucional_url: '', // URL vacía para solicitudes creadas por admin
        estado: status === 'VERIFICADO' ? 'APROBADA' : 'RECHAZADA',
        motivo_rechazo: status === 'RECHAZADO' ? motivo_rechazo : null,
        fecha_revision: new Date(),
        id_admin_revisor: adminId
      });
    }

    res.json({
      success: true,
      message: `Profesor ${status === 'VERIFICADO' ? 'aprobado' : 'rechazado'} correctamente`,
      data: {
        professor: {
          id: professor.id_usuario,
          nombre: professor.nombre_completo,
          email: professor.email_institucional,
          estado: professor.estado_verificacion
        }
      }
    });
  } catch (error) {
    console.error('Error updating professor status:', error);
    next(error);
  }
};
