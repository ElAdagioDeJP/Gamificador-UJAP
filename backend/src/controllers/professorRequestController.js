const { Usuario, SolicitudProfesor } = require('../../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/carnets');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `carnet-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos JPEG, JPG, PNG o PDF'));
    }
  }
});

// Middleware para manejar la subida de archivos
exports.uploadCarnet = upload.single('carnetInstitucional');

// Crear solicitud de profesor
exports.createProfessorRequest = async (req, res, next) => {
  try {
    const { nombre_usuario, nombre_completo, email_institucional, sexo, contrasena } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Debe subir una imagen del carnet institucional'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await Usuario.findOne({
      where: { email_institucional }
    });

    if (existingUser) {
      // Eliminar archivo subido si el usuario ya existe
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'El email institucional ya está registrado'
      });
    }

    // Crear usuario con estado pendiente de verificación
    const usuario = await Usuario.create({
      nombre_usuario,
      nombre_completo,
      email_institucional,
      sexo,
      contrasena_hash: contrasena, // Se hasheará automáticamente en el hook
      rol: 'profesor',
      estado_verificacion: 'PENDIENTE'
    });

    // Crear solicitud de profesor
    const solicitud = await SolicitudProfesor.create({
      id_usuario: usuario.id_usuario,
      carnet_institucional_url: `/static/uploads/carnets/${req.file.filename}`,
      estado: 'PENDIENTE'
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud de profesor enviada correctamente. Debe esperar la aprobación de un administrador.',
      data: {
        usuario: usuario.toSafeJSON(),
        solicitud: {
          id: solicitud.id_solicitud,
          estado: solicitud.estado,
          fecha_creacion: solicitud.fecha_creacion
        }
      }
    });

  } catch (error) {
    // Eliminar archivo si hay error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error eliminando archivo:', unlinkError);
      }
    }
    next(error);
  }
};

// Obtener todas las solicitudes pendientes (para admin)
exports.getPendingRequests = async (req, res, next) => {
  try {
    const solicitudes = await SolicitudProfesor.findAll({
      where: { estado: 'PENDIENTE' },
      include: [{
        model: Usuario,
        attributes: ['id_usuario', 'nombre_usuario', 'nombre_completo', 'email_institucional', 'sexo', 'fecha_creacion']
      }],
      order: [['fecha_creacion', 'ASC']]
    });

    res.json({
      success: true,
      data: solicitudes
    });
  } catch (error) {
    next(error);
  }
};

// Aprobar solicitud de profesor
exports.approveRequest = async (req, res, next) => {
  try {
    const { solicitudId } = req.params;
    const adminId = req.user.id;

    const solicitud = await SolicitudProfesor.findByPk(solicitudId, {
      include: [Usuario]
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (solicitud.estado !== 'PENDIENTE') {
      return res.status(400).json({
        success: false,
        message: 'La solicitud ya ha sido procesada'
      });
    }

    // Actualizar solicitud
    await solicitud.update({
      estado: 'APROBADA',
      fecha_revision: new Date(),
      id_admin_revisor: adminId
    });

    // Actualizar usuario
    await solicitud.Usuario.update({
      estado_verificacion: 'VERIFICADO'
    });

    res.json({
      success: true,
      message: 'Solicitud aprobada correctamente',
      data: {
        solicitud: {
          id: solicitud.id_solicitud,
          estado: solicitud.estado,
          fecha_revision: solicitud.fecha_revision
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Rechazar solicitud de profesor
exports.rejectRequest = async (req, res, next) => {
  try {
    const { solicitudId } = req.params;
    const { motivo_rechazo } = req.body;
    const adminId = req.user.id;

    const solicitud = await SolicitudProfesor.findByPk(solicitudId, {
      include: [Usuario]
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (solicitud.estado !== 'PENDIENTE') {
      return res.status(400).json({
        success: false,
        message: 'La solicitud ya ha sido procesada'
      });
    }

    // Actualizar solicitud
    await solicitud.update({
      estado: 'RECHAZADA',
      motivo_rechazo,
      fecha_revision: new Date(),
      id_admin_revisor: adminId
    });

    // Actualizar usuario
    await solicitud.Usuario.update({
      estado_verificacion: 'RECHAZADO'
    });

    res.json({
      success: true,
      message: 'Solicitud rechazada correctamente',
      data: {
        solicitud: {
          id: solicitud.id_solicitud,
          estado: solicitud.estado,
          motivo_rechazo: solicitud.motivo_rechazo,
          fecha_revision: solicitud.fecha_revision
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Obtener estado de solicitud del usuario actual
exports.getUserRequestStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const solicitud = await SolicitudProfesor.findOne({
      where: { id_usuario: userId },
      include: [Usuario]
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró solicitud para este usuario'
      });
    }

    res.json({
      success: true,
      data: {
        solicitud: {
          id: solicitud.id_solicitud,
          estado: solicitud.estado,
          fecha_creacion: solicitud.fecha_creacion,
          fecha_revision: solicitud.fecha_revision,
          motivo_rechazo: solicitud.motivo_rechazo
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
