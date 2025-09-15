/**
 * MODELOS CENTRALIZADOS - SISTEMA TIPO DJANGO
 * 
 * Este archivo contiene TODOS los modelos de la base de datos en un solo lugar.
 * Para hacer cambios:
 * 1. Modifica los modelos aquí
 * 2. Ejecuta: npm run migrate:regenerate
 * 3. Ejecuta: npm run migrate
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// Función para crear todos los modelos
function createModels(sequelize) {
  const models = {};

  // ========================================
  // MODELO: USUARIOS
  // ========================================
  models.Usuario = sequelize.define('Usuario', {
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre_usuario: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    nombre_completo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email_institucional: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    sexo: {
      type: DataTypes.ENUM('M', 'F'),
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contrasena_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM('estudiante', 'profesor', 'admin'),
      allowNull: false,
      defaultValue: 'estudiante',
    },
    puntos_actuales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    experiencia_total: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    nivel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    racha_dias_consecutivos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    fecha_ultima_actividad: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    estado_verificacion: {
      type: DataTypes.ENUM('PENDIENTE', 'VERIFICADO', 'RECHAZADO'),
      defaultValue: 'VERIFICADO',
    },
    universidad: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    carrera: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tema: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'claro',
    },
  }, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
    hooks: {
      beforeCreate: async (user) => {
        if (user.changed('contrasena_hash')) {
          const salt = await bcrypt.genSalt(10);
          user.contrasena_hash = await bcrypt.hash(user.contrasena_hash, salt);
        }
        if (!user.avatar_url) {
          if (user.sexo === 'M') user.avatar_url = '/static/avatars/male.svg';
          else if (user.sexo === 'F') user.avatar_url = '/static/avatars/female.svg';
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('contrasena_hash')) {
          const salt = await bcrypt.genSalt(10);
          user.contrasena_hash = await bcrypt.hash(user.contrasena_hash, salt);
        }
      },
    }
  });

  // Métodos del modelo Usuario
  models.Usuario.prototype.comparePassword = function(candidate) {
    return bcrypt.compare(candidate, this.contrasena_hash);
  };

  models.Usuario.prototype.toSafeJSON = function() {
    const { contrasena_hash, ...rest } = this.toJSON();
    return rest;
  };

  // ========================================
  // MODELO: MATERIAS
  // ========================================
  models.Materia = sequelize.define('Materia', {
    id_materia: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre_materia: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'materias',
    timestamps: false,
  });

  // ========================================
  // MODELO: INSCRIPCIONES
  // ========================================
  models.Inscripcion = sequelize.define('Inscripcion', {
    id_inscripcion: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_materia: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    periodo_academico: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    calificacion_final: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
  }, {
    tableName: 'inscripciones',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_usuario', 'id_materia', 'periodo_academico']
      }
    ]
  });

  // ========================================
  // MODELO: MISIONES
  // ========================================
  models.Mision = sequelize.define('Mision', {
    id_mision: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipo_mision: {
      type: DataTypes.ENUM('DIARIA', 'TAREA'),
      allowNull: false,
    },
    dificultad: {
      type: DataTypes.ENUM('BASICA', 'AVANZADA', 'EPICA'),
      allowNull: true,
    },
    id_materia_asociada: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    id_profesor_creador: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    puntos_recompensa: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    experiencia_recompensa: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    peso_en_calificacion: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
    },
    bono_nota: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
    },
    req_nivel_minimo: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    req_racha_minima: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    req_puntos_minimos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'misiones',
    timestamps: false,
  });

  // ========================================
  // MODELO: USUARIO_MISIONES
  // ========================================
  models.UsuarioMision = sequelize.define('UsuarioMision', {
    id_usuario_mision: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_mision: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fecha_completada: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('ASIGNADA', 'EN_PROGRESO', 'COMPLETADA', 'VENCIDA'),
      defaultValue: 'ASIGNADA',
    },
    calificacion_obtenida: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
  }, {
    tableName: 'usuario_misiones',
    timestamps: false,
  });

  // ========================================
  // MODELO: DUELOS
  // ========================================
  models.Duelo = sequelize.define('Duelo', {
    id_duelo: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo_duelo: {
      type: DataTypes.ENUM('CLASICO', 'COOPERATIVO'),
      allowNull: false,
    },
    id_materia: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'EN_JUEGO', 'FINALIZADO', 'CANCELADO'),
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    id_ganador: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    puntos_apostados: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'duelos',
    timestamps: false,
  });

  // ========================================
  // MODELO: DUELO_PARTICIPANTES
  // ========================================
  models.DueloParticipante = sequelize.define('DueloParticipante', {
    id_participante_duelo: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_duelo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    equipo: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    puntuacion_final: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'duelo_participantes',
    timestamps: false,
  });

  // ========================================
  // MODELO: PREGUNTA_DUELO
  // ========================================
  models.PreguntaDuelo = sequelize.define('PreguntaDuelo', {
    id_pregunta: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_materia: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    enunciado: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dificultad: {
      type: DataTypes.ENUM('FACIL', 'NORMAL', 'DIFICIL'),
      allowNull: false,
    },
  }, {
    tableName: 'preguntas_duelo',
    timestamps: false,
  });

  // ========================================
  // MODELO: RESPUESTA_DUELO
  // ========================================
  models.RespuestaDuelo = sequelize.define('RespuestaDuelo', {
    id_respuesta: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_pregunta: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    texto_respuesta: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    es_correcta: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'respuestas_duelo',
    timestamps: false,
  });

  // ========================================
  // MODELO: PREGUNTA_DUELO (NUEVO SISTEMA)
  // ========================================
  models.PreguntaDueloNuevo = sequelize.define('PreguntaDueloNuevo', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    pregunta: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    opcion_a: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    opcion_b: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    opcion_c: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    opcion_d: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    respuesta_correcta: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D'),
      allowNull: false,
    },
    explicacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    materia: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dificultad: {
      type: DataTypes.ENUM('facil', 'medio', 'dificil'),
      allowNull: false,
      defaultValue: 'medio',
    },
    puntos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'preguntaduelos',
    timestamps: true,
  });

  // ========================================
  // MODELO: RESPUESTA_DUELO (NUEVO SISTEMA)
  // ========================================
  models.RespuestaDueloNuevo = sequelize.define('RespuestaDueloNuevo', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    pregunta_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    respuesta_elegida: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D'),
      allowNull: false,
    },
    es_correcta: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    tiempo_respuesta: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    puntos_obtenidos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'respuestaduelos',
    timestamps: true,
  });

  // ========================================
  // MODELO: PROFESOR_MATERIAS
  // ========================================
  models.ProfesorMateria = sequelize.define('ProfesorMateria', {
    id_profesor_materia: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_profesor: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_materia: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  }, {
    tableName: 'profesor_materias',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_profesor', 'id_materia']
      }
    ]
  });

  // ========================================
  // MODELO: INSIGNIAS
  // ========================================
  models.Insignia = sequelize.define('Insignia', {
    id_insignia: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icono_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    id_mision_desbloqueo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  }, {
    tableName: 'insignias',
    timestamps: false,
  });

  // ========================================
  // MODELO: USUARIO_INSIGNIAS
  // ========================================
  models.UsuarioInsignia = sequelize.define('UsuarioInsignia', {
    id_usuario_insignia: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_insignia: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fecha_obtencion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'usuario_insignias',
    timestamps: false,
  });

  // ========================================
  // MODELO: RECOMPENSAS_CANJEABLES
  // ========================================
  models.RecompensaCanjeable = sequelize.define('RecompensaCanjeable', {
    id_recompensa: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipo_recompensa: {
      type: DataTypes.ENUM('FISICA', 'ACADEMICA'),
      allowNull: false,
    },
    costo_en_puntos: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    requiere_aprobacion_docente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'recompensas_canjeables',
    timestamps: false,
  });

  // ========================================
  // MODELO: USUARIO_CANJES
  // ========================================
  models.UsuarioCanje = sequelize.define('UsuarioCanje', {
    id_canje: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_recompensa: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    puntos_gastados: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_canje: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    estado_aprobacion: {
      type: DataTypes.ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO'),
      defaultValue: 'APROBADO',
    },
  }, {
    tableName: 'usuario_canjes',
    timestamps: false,
  });

  // ========================================
  // MODELO: CODIGOS_QR
  // ========================================
  models.CodigoQR = sequelize.define('CodigoQR', {
    id_qr: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    codigo_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    puntos_recompensa: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    experiencia_recompensa: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_expiracion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usos_maximos: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usos_actuales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'codigos_qr',
    timestamps: false,
  });

  // ========================================
  // MODELO: USUARIO_ESCANEOS_QR
  // ========================================
  models.UsuarioEscaneoQR = sequelize.define('UsuarioEscaneoQR', {
    id_escaneo: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_qr: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fecha_escaneo: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'usuario_escaneos_qr',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_usuario', 'id_qr']
      }
    ]
  });

  // ========================================
  // MODELO: TAREAS_PERSONALES
  // ========================================
  models.TareaPersonal = sequelize.define('TareaPersonal', {
    id_tarea: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'COMPLETADA'),
      defaultValue: 'PENDIENTE',
    },
    google_calendar_event_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'tareas_personales',
    timestamps: false,
  });

  // ========================================
  // MODELO: SOLICITUDES_PROFESORES
  // ========================================
  models.SolicitudProfesor = sequelize.define('SolicitudProfesor', {
    id_solicitud: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    carnet_institucional_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA'),
      defaultValue: 'PENDIENTE',
    },
    motivo_rechazo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_revision: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    id_admin_revisor: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  }, {
    tableName: 'solicitudes_profesores',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
  });

  // ========================================
  // DEFINIR RELACIONES
  // ========================================
  
  // Usuario -> Inscripciones
  models.Usuario.hasMany(models.Inscripcion, { foreignKey: 'id_usuario' });
  models.Inscripcion.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });

  // Materia -> Inscripciones
  models.Materia.hasMany(models.Inscripcion, { foreignKey: 'id_materia' });
  models.Inscripcion.belongsTo(models.Materia, { foreignKey: 'id_materia' });

  // Usuario -> Misiones (como creador)
  models.Usuario.hasMany(models.Mision, { foreignKey: 'id_profesor_creador' });
  models.Mision.belongsTo(models.Usuario, { foreignKey: 'id_profesor_creador' });

  // Materia -> Misiones
  models.Materia.hasMany(models.Mision, { foreignKey: 'id_materia_asociada' });
  models.Mision.belongsTo(models.Materia, { foreignKey: 'id_materia_asociada' });

  // Usuario -> UsuarioMisiones
  models.Usuario.hasMany(models.UsuarioMision, { foreignKey: 'id_usuario' });
  models.UsuarioMision.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });

  // Mision -> UsuarioMisiones
  models.Mision.hasMany(models.UsuarioMision, { foreignKey: 'id_mision' });
  models.UsuarioMision.belongsTo(models.Mision, { foreignKey: 'id_mision' });

  // Duelo -> DueloParticipantes
  models.Duelo.hasMany(models.DueloParticipante, { foreignKey: 'id_duelo' });
  models.DueloParticipante.belongsTo(models.Duelo, { foreignKey: 'id_duelo' });

  // Usuario -> DueloParticipantes
  models.Usuario.hasMany(models.DueloParticipante, { foreignKey: 'id_usuario' });
  models.DueloParticipante.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });

  // Materia -> Duelos
  models.Materia.hasMany(models.Duelo, { foreignKey: 'id_materia' });
  models.Duelo.belongsTo(models.Materia, { foreignKey: 'id_materia' });

  // PreguntaDuelo -> RespuestaDuelo
  models.PreguntaDuelo.hasMany(models.RespuestaDuelo, { foreignKey: 'id_pregunta', as: 'opciones' });
  models.RespuestaDuelo.belongsTo(models.PreguntaDuelo, { foreignKey: 'id_pregunta', as: 'pregunta' });

  // Materia -> PreguntaDuelo
  models.Materia.hasMany(models.PreguntaDuelo, { foreignKey: 'id_materia' });
  models.PreguntaDuelo.belongsTo(models.Materia, { foreignKey: 'id_materia' });

  // Usuario -> RespuestaDueloNuevo
  models.Usuario.hasMany(models.RespuestaDueloNuevo, { foreignKey: 'usuario_id' });
  models.RespuestaDueloNuevo.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });

  // PreguntaDueloNuevo -> RespuestaDueloNuevo
  models.PreguntaDueloNuevo.hasMany(models.RespuestaDueloNuevo, { foreignKey: 'pregunta_id' });
  models.RespuestaDueloNuevo.belongsTo(models.PreguntaDueloNuevo, { foreignKey: 'pregunta_id' });

  // ProfesorMateria relaciones
  models.Usuario.hasMany(models.ProfesorMateria, { foreignKey: 'id_profesor' });
  models.ProfesorMateria.belongsTo(models.Usuario, { foreignKey: 'id_profesor' });

  models.Materia.hasMany(models.ProfesorMateria, { foreignKey: 'id_materia' });
  models.ProfesorMateria.belongsTo(models.Materia, { foreignKey: 'id_materia' });

  // Insignias relaciones
  models.Usuario.hasMany(models.UsuarioInsignia, { foreignKey: 'id_usuario' });
  models.UsuarioInsignia.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });

  models.Insignia.hasMany(models.UsuarioInsignia, { foreignKey: 'id_insignia' });
  models.UsuarioInsignia.belongsTo(models.Insignia, { foreignKey: 'id_insignia' });

  models.Mision.hasOne(models.Insignia, { foreignKey: 'id_mision_desbloqueo' });
  models.Insignia.belongsTo(models.Mision, { foreignKey: 'id_mision_desbloqueo' });

  // Recompensas relaciones
  models.Usuario.hasMany(models.UsuarioCanje, { foreignKey: 'id_usuario' });
  models.UsuarioCanje.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });

  models.RecompensaCanjeable.hasMany(models.UsuarioCanje, { foreignKey: 'id_recompensa' });
  models.UsuarioCanje.belongsTo(models.RecompensaCanjeable, { foreignKey: 'id_recompensa' });

  // QR relaciones
  models.Usuario.hasMany(models.UsuarioEscaneoQR, { foreignKey: 'id_usuario' });
  models.UsuarioEscaneoQR.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });

  models.CodigoQR.hasMany(models.UsuarioEscaneoQR, { foreignKey: 'id_qr' });
  models.UsuarioEscaneoQR.belongsTo(models.CodigoQR, { foreignKey: 'id_qr' });

  // Tareas personales
  models.Usuario.hasMany(models.TareaPersonal, { foreignKey: 'id_usuario' });
  models.TareaPersonal.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });

  // Solicitudes de profesores
  models.Usuario.hasOne(models.SolicitudProfesor, { foreignKey: 'id_usuario' });
  models.SolicitudProfesor.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });

  // Admin revisor de solicitudes
  models.Usuario.hasMany(models.SolicitudProfesor, { foreignKey: 'id_admin_revisor' });
  models.SolicitudProfesor.belongsTo(models.Usuario, { foreignKey: 'id_admin_revisor' });

  return models;
}

module.exports = { createModels };
