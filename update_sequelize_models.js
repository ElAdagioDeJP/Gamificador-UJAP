/**
 * SCRIPT PARA ACTUALIZAR MODELOS DE SEQUELIZE
 * 
 * Este script actualiza el archivo models.js para que coincida
 * con la nueva estructura de base de datos optimizada.
 * 
 * Ejecutar después de aplicar la migración de base de datos.
 */

const fs = require('fs');
const path = require('path');

// Nuevo contenido del archivo models.js actualizado
const updatedModelsContent = `/**
 * MODELOS CENTRALIZADOS - SISTEMA OPTIMIZADO
 * 
 * Este archivo contiene TODOS los modelos de la base de datos optimizada.
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
  // MODELO: USUARIOS (OPTIMIZADO)
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
      type: DataTypes.STRING(500),
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
    estado_verificacion: {
      type: DataTypes.ENUM('PENDIENTE', 'VERIFICADO', 'RECHAZADO'),
      defaultValue: 'VERIFICADO',
    },
    // Información académica
    universidad: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    carrera: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    semestre: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Sistema de gamificación
    puntos_actuales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    experiencia_total: {
      type: DataTypes.BIGINT.UNSIGNED,
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
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
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
  // MODELO: MATERIAS (OPTIMIZADO)
  // ========================================
  models.Materia = sequelize.define('Materia', {
    id_materia: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    codigo_materia: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    nombre_materia: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creditos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    semestre_recomendado: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'materias',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
  });

  // ========================================
  // MODELO: INSCRIPCIONES (OPTIMIZADO)
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
      allowNull: false,
    },
    calificacion_final: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('ACTIVA', 'FINALIZADA', 'CANCELADA'),
      defaultValue: 'ACTIVA',
    },
    fecha_inscripcion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_finalizacion: {
      type: DataTypes.DATE,
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
  // MODELO: MISIONES (OPTIMIZADO)
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
      type: DataTypes.ENUM('DIARIA', 'TAREA', 'EVENTO'),
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
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'misiones',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
  });

  // ========================================
  // MODELO: USUARIO_MISIONES (OPTIMIZADO)
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
    estado: {
      type: DataTypes.ENUM('ASIGNADA', 'EN_PROGRESO', 'COMPLETADA', 'VENCIDA', 'RECHAZADA'),
      defaultValue: 'ASIGNADA',
    },
    fecha_completada: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    calificacion_obtenida: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    comentarios: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'usuario_misiones',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
  });

  // ========================================
  // MODELO: PREGUNTAS (SISTEMA UNIFICADO)
  // ========================================
  models.Pregunta = sequelize.define('Pregunta', {
    id_pregunta: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_materia: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    id_mision: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    enunciado: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo_pregunta: {
      type: DataTypes.ENUM('OPCION_MULTIPLE', 'VERDADERO_FALSO', 'RESPUESTA_CORTA'),
      defaultValue: 'OPCION_MULTIPLE',
    },
    dificultad: {
      type: DataTypes.ENUM('FACIL', 'NORMAL', 'DIFICIL'),
      allowNull: false,
    },
    puntos: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    tiempo_limite: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    explicacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'preguntas',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
  });

  // ========================================
  // MODELO: OPCIONES_RESPUESTA
  // ========================================
  models.OpcionRespuesta = sequelize.define('OpcionRespuesta', {
    id_opcion: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_pregunta: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    texto_opcion: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    es_correcta: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    orden: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  }, {
    tableName: 'opciones_respuesta',
    timestamps: true,
    createdAt: 'fecha_creacion',
  });

  // ========================================
  // MODELO: RESPUESTAS_USUARIO
  // ========================================
  models.RespuestaUsuario = sequelize.define('RespuestaUsuario', {
    id_respuesta: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_pregunta: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_opcion_elegida: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    respuesta_texto: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    es_correcta: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    puntos_obtenidos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tiempo_respuesta: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'respuestas_usuario',
    timestamps: true,
    createdAt: 'fecha_respuesta',
  });

  // ========================================
  // MODELO: DUELOS (OPTIMIZADO)
  // ========================================
  models.Duelo = sequelize.define('Duelo', {
    id_duelo: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo_duelo: {
      type: DataTypes.ENUM('CLASICO', 'COOPERATIVO', 'TORNEO'),
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
    puntos_apostados: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    id_ganador: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    duracion_minutos: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'duelos',
    timestamps: true,
    createdAt: 'fecha_creacion',
  });

  // ========================================
  // MODELO: DUELO_PARTICIPANTES (OPTIMIZADO)
  // ========================================
  models.DueloParticipante = sequelize.define('DueloParticipante', {
    id_participante: {
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
    posicion: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'duelo_participantes',
    timestamps: true,
    createdAt: 'fecha_inscripcion',
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
    fecha_asignacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
  // MODELO: INSIGNIAS (OPTIMIZADO)
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
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    tipo_insignia: {
      type: DataTypes.ENUM('NIVEL', 'RACHA', 'MISION', 'DUELO', 'ESPECIAL'),
      allowNull: false,
    },
    requisito_valor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_mision_desbloqueo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'insignias',
    timestamps: true,
    createdAt: 'fecha_creacion',
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
  // MODELO: RECOMPENSAS_CANJEABLES (OPTIMIZADO)
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
      type: DataTypes.ENUM('FISICA', 'ACADEMICA', 'DIGITAL'),
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
    stock_ilimitado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    requiere_aprobacion_docente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'recompensas_canjeables',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
  });

  // ========================================
  // MODELO: USUARIO_CANJES (OPTIMIZADO)
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
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    estado_aprobacion: {
      type: DataTypes.ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'ENTREGADO'),
      defaultValue: 'APROBADO',
    },
    fecha_aprobacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    id_admin_aprobador: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    comentarios: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'usuario_canjes',
    timestamps: true,
    createdAt: 'fecha_canje',
  });

  // ========================================
  // MODELO: CODIGOS_QR (OPTIMIZADO)
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
    tipo_qr: {
      type: DataTypes.ENUM('EVENTO', 'UBICACION', 'MISION', 'BONUS'),
      allowNull: false,
    },
    puntos_recompensa: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    experiencia_recompensa: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'codigos_qr',
    timestamps: true,
    createdAt: 'fecha_creacion',
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
    puntos_obtenidos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    experiencia_obtenida: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'usuario_escaneos_qr',
    timestamps: true,
    createdAt: 'fecha_escaneo',
  });

  // ========================================
  // MODELO: TAREAS_PERSONALES (OPTIMIZADO)
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
      type: DataTypes.ENUM('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'),
      defaultValue: 'PENDIENTE',
    },
    prioridad: {
      type: DataTypes.ENUM('BAJA', 'MEDIA', 'ALTA'),
      defaultValue: 'MEDIA',
    },
    google_calendar_event_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'tareas_personales',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
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
  // MODELO: CONFIGURACION_SISTEMA
  // ========================================
  models.ConfiguracionSistema = sequelize.define('ConfiguracionSistema', {
    id_config: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    clave: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    valor: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON'),
      defaultValue: 'STRING',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'configuracion_sistema',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
  });

  // ========================================
  // MODELO: LOGS_ACTIVIDAD
  // ========================================
  models.LogActividad = sequelize.define('LogActividad', {
    id_log: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    accion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tabla_afectada: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    id_registro_afectado: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    datos_anteriores: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    datos_nuevos: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'logs_actividad',
    timestamps: true,
    createdAt: 'fecha_creacion',
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

  // Pregunta -> OpcionesRespuesta
  models.Pregunta.hasMany(models.OpcionRespuesta, { foreignKey: 'id_pregunta' });
  models.OpcionRespuesta.belongsTo(models.Pregunta, { foreignKey: 'id_pregunta' });

  // Usuario -> RespuestaUsuario
  models.Usuario.hasMany(models.RespuestaUsuario, { foreignKey: 'id_usuario' });
  models.RespuestaUsuario.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });

  // Pregunta -> RespuestaUsuario
  models.Pregunta.hasMany(models.RespuestaUsuario, { foreignKey: 'id_pregunta' });
  models.RespuestaUsuario.belongsTo(models.Pregunta, { foreignKey: 'id_pregunta' });

  // OpcionRespuesta -> RespuestaUsuario
  models.OpcionRespuesta.hasMany(models.RespuestaUsuario, { foreignKey: 'id_opcion_elegida' });
  models.RespuestaUsuario.belongsTo(models.OpcionRespuesta, { foreignKey: 'id_opcion_elegida' });

  // Materia -> Pregunta
  models.Materia.hasMany(models.Pregunta, { foreignKey: 'id_materia' });
  models.Pregunta.belongsTo(models.Materia, { foreignKey: 'id_materia' });

  // Mision -> Pregunta
  models.Mision.hasMany(models.Pregunta, { foreignKey: 'id_mision' });
  models.Pregunta.belongsTo(models.Mision, { foreignKey: 'id_mision' });

  // Duelo -> DueloParticipantes
  models.Duelo.hasMany(models.DueloParticipante, { foreignKey: 'id_duelo' });
  models.DueloParticipante.belongsTo(models.Duelo, { foreignKey: 'id_duelo' });

  // Usuario -> DueloParticipantes
  models.Usuario.hasMany(models.DueloParticipante, { foreignKey: 'id_usuario' });
  models.DueloParticipante.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });

  // Materia -> Duelos
  models.Materia.hasMany(models.Duelo, { foreignKey: 'id_materia' });
  models.Duelo.belongsTo(models.Materia, { foreignKey: 'id_materia' });

  // Usuario -> Duelos (como ganador)
  models.Usuario.hasMany(models.Duelo, { foreignKey: 'id_ganador' });
  models.Duelo.belongsTo(models.Usuario, { foreignKey: 'id_ganador' });

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

  // Admin aprobador de canjes
  models.Usuario.hasMany(models.UsuarioCanje, { foreignKey: 'id_admin_aprobador' });
  models.UsuarioCanje.belongsTo(models.Usuario, { foreignKey: 'id_admin_aprobador' });

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

  // Logs de actividad
  models.Usuario.hasMany(models.LogActividad, { foreignKey: 'id_usuario' });
  models.LogActividad.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });

  return models;
}

module.exports = { createModels };
`;

// Función para actualizar el archivo models.js
function updateModelsFile() {
  const modelsPath = path.join(__dirname, 'backend', 'models', 'models.js');
  
  try {
    // Crear backup del archivo actual
    const backupPath = modelsPath + '.backup';
    if (fs.existsSync(modelsPath)) {
      fs.copyFileSync(modelsPath, backupPath);
      console.log('✅ Backup creado:', backupPath);
    }
    
    // Escribir el nuevo contenido
    fs.writeFileSync(modelsPath, updatedModelsContent);
    console.log('✅ Archivo models.js actualizado exitosamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar models.js:', error.message);
    return false;
  }
}

// Ejecutar la actualización
if (require.main === module) {
  console.log('🚀 Actualizando modelos de Sequelize...');
  const success = updateModelsFile();
  
  if (success) {
    console.log('✅ Actualización completada exitosamente');
    console.log('📝 Próximos pasos:');
    console.log('   1. Ejecutar: npm run migrate:regenerate');
    console.log('   2. Ejecutar: npm run migrate');
    console.log('   3. Reiniciar el servidor');
  } else {
    console.log('❌ Error en la actualización');
    process.exit(1);
  }
}

module.exports = { updateModelsFile };
