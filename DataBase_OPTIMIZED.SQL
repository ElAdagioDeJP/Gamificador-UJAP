-- =====================================================
-- SISTEMA GAMIFICADO DE APRENDIZAJE - BASE DE DATOS OPTIMIZADA
-- =====================================================
-- Versión: 2.0
-- Fecha: 2024-12-01
-- Descripción: Esquema optimizado basado en análisis completo del sistema
-- =====================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS studybooster_db 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE studybooster_db;

-- =====================================================
-- TABLA PRINCIPAL: USUARIOS (UNIFICADA)
-- =====================================================
-- Almacena estudiantes, profesores y administradores
CREATE TABLE usuarios (
  id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nickname único para duelos',
  nombre_completo VARCHAR(255) NOT NULL,
  email_institucional VARCHAR(255) NOT NULL UNIQUE,
  sexo ENUM('M', 'F') NULL,
  avatar_url VARCHAR(500) NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol ENUM('estudiante', 'profesor', 'admin') NOT NULL DEFAULT 'estudiante',
  estado_verificacion ENUM('PENDIENTE', 'VERIFICADO', 'RECHAZADO') DEFAULT 'VERIFICADO',
  
  -- Información académica
  universidad VARCHAR(255) NULL,
  carrera VARCHAR(255) NULL,
  semestre INT NULL,
  
  -- Sistema de gamificación
  puntos_actuales INT NOT NULL DEFAULT 0,
  experiencia_total BIGINT UNSIGNED NOT NULL DEFAULT 0,
  nivel INT NOT NULL DEFAULT 1,
  racha_dias_consecutivos INT NOT NULL DEFAULT 0,
  fecha_ultima_actividad DATE NULL,
  
  -- Auditoría
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Índices
  INDEX idx_rol (rol),
  INDEX idx_estado_verificacion (estado_verificacion),
  INDEX idx_nivel (nivel),
  INDEX idx_puntos (puntos_actuales),
  INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: MATERIAS
-- =====================================================
CREATE TABLE materias (
  id_materia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo_materia VARCHAR(20) NOT NULL UNIQUE,
  nombre_materia VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  creditos INT NOT NULL DEFAULT 3,
  semestre_recomendado INT NULL,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_codigo (codigo_materia),
  INDEX idx_activa (activa)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: INSCRIPCIONES
-- =====================================================
CREATE TABLE inscripciones (
  id_inscripcion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  id_materia INT UNSIGNED NOT NULL,
  periodo_academico VARCHAR(20) NOT NULL,
  calificacion_final DECIMAL(5,2) NULL,
  estado ENUM('ACTIVA', 'FINALIZADA', 'CANCELADA') DEFAULT 'ACTIVA',
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_finalizacion TIMESTAMP NULL,
  
  UNIQUE KEY uk_usuario_materia_periodo (id_usuario, id_materia, periodo_academico),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE,
  
  INDEX idx_periodo (periodo_academico),
  INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: PROFESOR_MATERIAS (RELACIÓN MUCHOS A MUCHOS)
-- =====================================================
CREATE TABLE profesor_materias (
  id_profesor_materia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_profesor INT UNSIGNED NOT NULL,
  id_materia INT UNSIGNED NOT NULL,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  
  UNIQUE KEY uk_profesor_materia (id_profesor, id_materia),
  FOREIGN KEY (id_profesor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE,
  
  INDEX idx_profesor (id_profesor),
  INDEX idx_materia (id_materia),
  INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: MISIONES (UNIFICADA)
-- =====================================================
CREATE TABLE misiones (
  id_mision INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  tipo_mision ENUM('DIARIA', 'TAREA', 'EVENTO') NOT NULL,
  dificultad ENUM('BASICA', 'AVANZADA', 'EPICA') DEFAULT 'BASICA',
  
  -- Relaciones
  id_materia_asociada INT UNSIGNED NULL,
  id_profesor_creador INT UNSIGNED NULL,
  
  -- Recompensas de gamificación
  puntos_recompensa INT NOT NULL DEFAULT 0,
  experiencia_recompensa INT NOT NULL DEFAULT 0,
  
  -- Recompensas académicas
  peso_en_calificacion DECIMAL(5,2) DEFAULT 0.00,
  bono_nota DECIMAL(3,2) DEFAULT 0.00,
  
  -- Requisitos para misiones épicas
  req_nivel_minimo INT DEFAULT 1,
  req_racha_minima INT DEFAULT 0,
  req_puntos_minimos INT DEFAULT 0,
  
  -- Fechas
  fecha_inicio DATETIME NULL,
  fecha_vencimiento DATETIME NULL,
  
  -- Estado
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_materia_asociada) REFERENCES materias(id_materia) ON DELETE SET NULL,
  FOREIGN KEY (id_profesor_creador) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  
  INDEX idx_tipo (tipo_mision),
  INDEX idx_dificultad (dificultad),
  INDEX idx_materia (id_materia_asociada),
  INDEX idx_profesor (id_profesor_creador),
  INDEX idx_activa (activa),
  INDEX idx_fecha_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: USUARIO_MISIONES (PROGRESO)
-- =====================================================
CREATE TABLE usuario_misiones (
  id_usuario_mision INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  id_mision INT UNSIGNED NOT NULL,
  estado ENUM('ASIGNADA', 'EN_PROGRESO', 'COMPLETADA', 'VENCIDA', 'RECHAZADA') DEFAULT 'ASIGNADA',
  fecha_completada TIMESTAMP NULL,
  calificacion_obtenida DECIMAL(5,2) NULL,
  comentarios TEXT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_usuario_mision (id_usuario, id_mision),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_mision) REFERENCES misiones(id_mision) ON DELETE CASCADE,
  
  INDEX idx_estado (estado),
  INDEX idx_fecha_completada (fecha_completada)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: PREGUNTAS (SISTEMA UNIFICADO)
-- =====================================================
CREATE TABLE preguntas (
  id_pregunta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_materia INT UNSIGNED NULL,
  id_mision INT UNSIGNED NULL,
  enunciado TEXT NOT NULL,
  tipo_pregunta ENUM('OPCION_MULTIPLE', 'VERDADERO_FALSO', 'RESPUESTA_CORTA') DEFAULT 'OPCION_MULTIPLE',
  dificultad ENUM('FACIL', 'NORMAL', 'DIFICIL') NOT NULL,
  puntos INT NOT NULL DEFAULT 10,
  tiempo_limite INT NULL COMMENT 'Tiempo en segundos',
  explicacion TEXT NULL,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE SET NULL,
  FOREIGN KEY (id_mision) REFERENCES misiones(id_mision) ON DELETE SET NULL,
  
  INDEX idx_materia (id_materia),
  INDEX idx_mision (id_mision),
  INDEX idx_dificultad (dificultad),
  INDEX idx_activa (activa)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: OPCIONES_RESPUESTA
-- =====================================================
CREATE TABLE opciones_respuesta (
  id_opcion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pregunta INT UNSIGNED NOT NULL,
  texto_opcion VARCHAR(500) NOT NULL,
  es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
  orden INT NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_pregunta) REFERENCES preguntas(id_pregunta) ON DELETE CASCADE,
  
  INDEX idx_pregunta (id_pregunta),
  INDEX idx_correcta (es_correcta)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: RESPUESTAS_USUARIO
-- =====================================================
CREATE TABLE respuestas_usuario (
  id_respuesta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  id_pregunta INT UNSIGNED NOT NULL,
  id_opcion_elegida INT UNSIGNED NULL,
  respuesta_texto TEXT NULL,
  es_correcta BOOLEAN NOT NULL,
  puntos_obtenidos INT NOT NULL DEFAULT 0,
  tiempo_respuesta INT NULL COMMENT 'Tiempo en segundos',
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_pregunta) REFERENCES preguntas(id_pregunta) ON DELETE CASCADE,
  FOREIGN KEY (id_opcion_elegida) REFERENCES opciones_respuesta(id_opcion) ON DELETE SET NULL,
  
  INDEX idx_usuario (id_usuario),
  INDEX idx_pregunta (id_pregunta),
  INDEX idx_fecha (fecha_respuesta)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: DUELOS
-- =====================================================
CREATE TABLE duelos (
  id_duelo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo_duelo ENUM('CLASICO', 'COOPERATIVO', 'TORNEO') NOT NULL,
  id_materia INT UNSIGNED NULL,
  estado ENUM('PENDIENTE', 'EN_JUEGO', 'FINALIZADO', 'CANCELADO') NOT NULL,
  puntos_apostados INT NOT NULL DEFAULT 0,
  id_ganador INT UNSIGNED NULL,
  duracion_minutos INT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_inicio TIMESTAMP NULL,
  fecha_fin TIMESTAMP NULL,
  
  FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE SET NULL,
  FOREIGN KEY (id_ganador) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  
  INDEX idx_tipo (tipo_duelo),
  INDEX idx_estado (estado),
  INDEX idx_materia (id_materia),
  INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: DUELO_PARTICIPANTES
-- =====================================================
CREATE TABLE duelo_participantes (
  id_participante INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_duelo INT UNSIGNED NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  equipo VARCHAR(50) NULL,
  puntuacion_final INT NOT NULL DEFAULT 0,
  posicion INT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_duelo_usuario (id_duelo, id_usuario),
  FOREIGN KEY (id_duelo) REFERENCES duelos(id_duelo) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  
  INDEX idx_duelo (id_duelo),
  INDEX idx_usuario (id_usuario),
  INDEX idx_puntuacion (puntuacion_final)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: INSIGNIAS (LOGROS)
-- =====================================================
CREATE TABLE insignias (
  id_insignia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NULL,
  icono_url VARCHAR(500) NULL,
  tipo_insignia ENUM('NIVEL', 'RACHA', 'MISION', 'DUELO', 'ESPECIAL') NOT NULL,
  requisito_valor INT NULL,
  id_mision_desbloqueo INT UNSIGNED NULL,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_mision_desbloqueo) REFERENCES misiones(id_mision) ON DELETE SET NULL,
  
  INDEX idx_tipo (tipo_insignia),
  INDEX idx_activa (activa)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: USUARIO_INSIGNIAS
-- =====================================================
CREATE TABLE usuario_insignias (
  id_usuario_insignia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  id_insignia INT UNSIGNED NOT NULL,
  fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_usuario_insignia (id_usuario, id_insignia),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_insignia) REFERENCES insignias(id_insignia) ON DELETE CASCADE,
  
  INDEX idx_usuario (id_usuario),
  INDEX idx_fecha (fecha_obtencion)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: RECOMPENSAS_CANJEABLES
-- =====================================================
CREATE TABLE recompensas_canjeables (
  id_recompensa INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  tipo_recompensa ENUM('FISICA', 'ACADEMICA', 'DIGITAL') NOT NULL,
  costo_en_puntos INT NOT NULL,
  stock INT NULL,
  stock_ilimitado BOOLEAN NOT NULL DEFAULT FALSE,
  requiere_aprobacion_docente BOOLEAN NOT NULL DEFAULT FALSE,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_tipo (tipo_recompensa),
  INDEX idx_activa (activa),
  INDEX idx_costo (costo_en_puntos)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: USUARIO_CANJES
-- =====================================================
CREATE TABLE usuario_canjes (
  id_canje INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  id_recompensa INT UNSIGNED NOT NULL,
  puntos_gastados INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  estado_aprobacion ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'ENTREGADO') DEFAULT 'APROBADO',
  fecha_canje TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_aprobacion TIMESTAMP NULL,
  id_admin_aprobador INT UNSIGNED NULL,
  comentarios TEXT NULL,
  
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_recompensa) REFERENCES recompensas_canjeables(id_recompensa) ON DELETE CASCADE,
  FOREIGN KEY (id_admin_aprobador) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  
  INDEX idx_usuario (id_usuario),
  INDEX idx_estado (estado_aprobacion),
  INDEX idx_fecha (fecha_canje)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: CODIGOS_QR
-- =====================================================
CREATE TABLE codigos_qr (
  id_qr INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo_hash VARCHAR(255) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NULL,
  tipo_qr ENUM('EVENTO', 'UBICACION', 'MISION', 'BONUS') NOT NULL,
  puntos_recompensa INT NOT NULL DEFAULT 0,
  experiencia_recompensa INT NOT NULL DEFAULT 0,
  fecha_expiracion DATETIME NULL,
  usos_maximos INT NULL,
  usos_actuales INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_codigo (codigo_hash),
  INDEX idx_tipo (tipo_qr),
  INDEX idx_activo (activo),
  INDEX idx_expiracion (fecha_expiracion)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: USUARIO_ESCANEOS_QR
-- =====================================================
CREATE TABLE usuario_escaneos_qr (
  id_escaneo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  id_qr INT UNSIGNED NOT NULL,
  fecha_escaneo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  puntos_obtenidos INT NOT NULL DEFAULT 0,
  experiencia_obtenida INT NOT NULL DEFAULT 0,
  
  UNIQUE KEY uk_usuario_qr (id_usuario, id_qr),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_qr) REFERENCES codigos_qr(id_qr) ON DELETE CASCADE,
  
  INDEX idx_usuario (id_usuario),
  INDEX idx_fecha (fecha_escaneo)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: TAREAS_PERSONALES
-- =====================================================
CREATE TABLE tareas_personales (
  id_tarea INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  fecha_vencimiento DATETIME NULL,
  estado ENUM('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA') DEFAULT 'PENDIENTE',
  prioridad ENUM('BAJA', 'MEDIA', 'ALTA') DEFAULT 'MEDIA',
  google_calendar_event_id VARCHAR(255) NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  
  INDEX idx_usuario (id_usuario),
  INDEX idx_estado (estado),
  INDEX idx_prioridad (prioridad),
  INDEX idx_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: SOLICITUDES_PROFESORES
-- =====================================================
CREATE TABLE solicitudes_profesores (
  id_solicitud INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL,
  carnet_institucional_url VARCHAR(500) NOT NULL,
  estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA') DEFAULT 'PENDIENTE',
  motivo_rechazo TEXT NULL,
  fecha_revision TIMESTAMP NULL,
  id_admin_revisor INT UNSIGNED NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_admin_revisor) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  
  INDEX idx_estado (estado),
  INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: CONFIGURACION_SISTEMA
-- =====================================================
CREATE TABLE configuracion_sistema (
  id_config INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT NULL,
  tipo ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
  descripcion TEXT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_clave (clave)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: LOGS_ACTIVIDAD
-- =====================================================
CREATE TABLE logs_actividad (
  id_log INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NULL,
  accion VARCHAR(100) NOT NULL,
  tabla_afectada VARCHAR(50) NULL,
  id_registro_afectado INT UNSIGNED NULL,
  datos_anteriores JSON NULL,
  datos_nuevos JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  
  INDEX idx_usuario (id_usuario),
  INDEX idx_accion (accion),
  INDEX idx_fecha (fecha_creacion)
) ENGINE=InnoDB;

-- =====================================================
-- INSERCIÓN DE DATOS INICIALES
-- =====================================================

-- Configuraciones del sistema
INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion) VALUES
('sistema_activo', 'true', 'BOOLEAN', 'Indica si el sistema está activo'),
('puntos_por_nivel', '1000', 'NUMBER', 'Puntos necesarios para subir de nivel'),
('racha_maxima', '30', 'NUMBER', 'Racha máxima de días consecutivos'),
('duelo_puntos_minimo', '10', 'NUMBER', 'Puntos mínimos para participar en duelos'),
('mision_diaria_puntos', '50', 'NUMBER', 'Puntos por completar misión diaria'),
('version_sistema', '2.0', 'STRING', 'Versión actual del sistema');

-- Insignias básicas
INSERT INTO insignias (nombre, descripcion, tipo_insignia, requisito_valor) VALUES
('Primer Paso', 'Completa tu primera misión', 'MISION', 1),
('Estudiante Dedicado', 'Completa 10 misiones', 'MISION', 10),
('Maestro de las Misiones', 'Completa 50 misiones', 'MISION', 50),
('Racha de Fuego', 'Mantén una racha de 7 días', 'RACHA', 7),
('Racha Épica', 'Mantén una racha de 30 días', 'RACHA', 30),
('Nivel 10', 'Alcanza el nivel 10', 'NIVEL', 10),
('Nivel 25', 'Alcanza el nivel 25', 'NIVEL', 25),
('Duelista', 'Participa en tu primer duelo', 'DUELO', 1),
('Campeón', 'Gana 10 duelos', 'DUELO', 10);

-- Recompensas canjeables básicas
INSERT INTO recompensas_canjeables (nombre, descripcion, tipo_recompensa, costo_en_puntos, stock_ilimitado) VALUES
('Bono de Nota +0.5', 'Bonificación de 0.5 puntos en una calificación', 'ACADEMICA', 100, TRUE),
('Bono de Nota +1.0', 'Bonificación de 1.0 punto en una calificación', 'ACADEMICA', 200, TRUE),
('Exención de Tarea', 'Exención de una tarea menor', 'ACADEMICA', 150, TRUE),
('Merchandise UJAP', 'Producto promocional de la universidad', 'FISICA', 500, FALSE),
('Certificado Digital', 'Certificado de logro personalizado', 'DIGITAL', 300, TRUE);

-- Materias de ejemplo
INSERT INTO materias (codigo_materia, nombre_materia, descripcion, creditos) VALUES
('MAT101', 'Matemáticas I', 'Álgebra y trigonometría básica', 4),
('FIS101', 'Física I', 'Mecánica clásica', 4),
('QUI101', 'Química General', 'Fundamentos de química', 3),
('PRO101', 'Programación I', 'Introducción a la programación', 4),
('ING101', 'Inglés I', 'Inglés básico', 2);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Ranking de usuarios por puntos
CREATE VIEW vista_ranking_usuarios AS
SELECT 
  u.id_usuario,
  u.nombre_usuario,
  u.nombre_completo,
  u.nivel,
  u.puntos_actuales,
  u.experiencia_total,
  u.racha_dias_consecutivos,
  ROW_NUMBER() OVER (ORDER BY u.puntos_actuales DESC, u.experiencia_total DESC) as posicion
FROM usuarios u
WHERE u.activo = TRUE AND u.rol = 'estudiante'
ORDER BY u.puntos_actuales DESC, u.experiencia_total DESC;

-- Vista: Estadísticas de misiones por usuario
CREATE VIEW vista_estadisticas_misiones AS
SELECT 
  u.id_usuario,
  u.nombre_usuario,
  COUNT(um.id_usuario_mision) as total_misiones,
  SUM(CASE WHEN um.estado = 'COMPLETADA' THEN 1 ELSE 0 END) as misiones_completadas,
  SUM(CASE WHEN um.estado = 'COMPLETADA' THEN m.puntos_recompensa ELSE 0 END) as puntos_ganados,
  AVG(CASE WHEN um.estado = 'COMPLETADA' THEN um.calificacion_obtenida END) as promedio_calificaciones
FROM usuarios u
LEFT JOIN usuario_misiones um ON u.id_usuario = um.id_usuario
LEFT JOIN misiones m ON um.id_mision = m.id_mision
WHERE u.activo = TRUE
GROUP BY u.id_usuario, u.nombre_usuario;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

DELIMITER //

-- Procedimiento: Actualizar nivel de usuario
CREATE PROCEDURE sp_actualizar_nivel_usuario(IN p_id_usuario INT UNSIGNED)
BEGIN
  DECLARE v_experiencia BIGINT;
  DECLARE v_nivel_actual INT;
  DECLARE v_puntos_por_nivel INT DEFAULT 1000;
  
  SELECT experiencia_total, nivel INTO v_experiencia, v_nivel_actual
  FROM usuarios WHERE id_usuario = p_id_usuario;
  
  -- Calcular nuevo nivel basado en experiencia
  SET @nuevo_nivel = FLOOR(v_experiencia / v_puntos_por_nivel) + 1;
  
  -- Actualizar nivel si ha cambiado
  IF @nuevo_nivel > v_nivel_actual THEN
    UPDATE usuarios 
    SET nivel = @nuevo_nivel 
    WHERE id_usuario = p_id_usuario;
  END IF;
END //

-- Procedimiento: Completar misión
CREATE PROCEDURE sp_completar_mision(
  IN p_id_usuario INT UNSIGNED,
  IN p_id_mision INT UNSIGNED,
  IN p_calificacion DECIMAL(5,2)
)
BEGIN
  DECLARE v_puntos INT;
  DECLARE v_experiencia INT;
  DECLARE v_tipo_mision VARCHAR(20);
  
  -- Obtener datos de la misión
  SELECT puntos_recompensa, experiencia_recompensa, tipo_mision
  INTO v_puntos, v_experiencia, v_tipo_mision
  FROM misiones WHERE id_mision = p_id_mision;
  
  -- Marcar misión como completada
  INSERT INTO usuario_misiones (id_usuario, id_mision, estado, fecha_completada, calificacion_obtenida)
  VALUES (p_id_usuario, p_id_mision, 'COMPLETADA', NOW(), p_calificacion)
  ON DUPLICATE KEY UPDATE 
    estado = 'COMPLETADA',
    fecha_completada = NOW(),
    calificacion_obtenida = p_calificacion;
  
  -- Actualizar puntos y experiencia del usuario
  UPDATE usuarios 
  SET puntos_actuales = puntos_actuales + v_puntos,
      experiencia_total = experiencia_total + v_experiencia,
      fecha_ultima_actividad = CURDATE()
  WHERE id_usuario = p_id_usuario;
  
  -- Actualizar nivel si es necesario
  CALL sp_actualizar_nivel_usuario(p_id_usuario);
  
  -- Actualizar racha si es misión diaria
  IF v_tipo_mision = 'DIARIA' THEN
    UPDATE usuarios 
    SET racha_dias_consecutivos = racha_dias_consecutivos + 1
    WHERE id_usuario = p_id_usuario;
  END IF;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Actualizar nivel automáticamente
DELIMITER //
CREATE TRIGGER tr_actualizar_nivel_usuario
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
  IF NEW.experiencia_total != OLD.experiencia_total THEN
    CALL sp_actualizar_nivel_usuario(NEW.id_usuario);
  END IF;
END //
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_usuario_estado_mision ON usuario_misiones(id_usuario, estado);
CREATE INDEX idx_mision_estado ON usuario_misiones(id_mision, estado);
CREATE INDEX idx_duelo_estado_fecha ON duelos(estado, fecha_creacion);
CREATE INDEX idx_respuesta_usuario_fecha ON respuestas_usuario(id_usuario, fecha_respuesta);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

/*
OPTIMIZACIONES IMPLEMENTADAS:

1. ✅ Unificación de sistema de preguntas (eliminada duplicación)
2. ✅ Campos faltantes agregados (universidad, carrera, codigo_materia)
3. ✅ Índices optimizados para consultas frecuentes
4. ✅ Sistema de auditoría completo
5. ✅ Relaciones optimizadas con CASCADE apropiado
6. ✅ Vistas para consultas complejas frecuentes
7. ✅ Procedimientos almacenados para operaciones comunes
8. ✅ Triggers para automatización
9. ✅ Sistema de configuración flexible
10. ✅ Logs de actividad para auditoría

CARACTERÍSTICAS PRINCIPALES:

- Sistema de gamificación completo
- Gestión de misiones y tareas
- Sistema de duelos competitivos
- Recompensas canjeables
- Códigos QR para eventos
- Tareas personales
- Sistema de insignias/logros
- Auditoría completa
- Configuración flexible
- Optimización de rendimiento

PRÓXIMOS PASOS RECOMENDADOS:

1. Ejecutar este script en la base de datos
2. Migrar datos existentes si los hay
3. Actualizar el código de la aplicación
4. Probar todas las funcionalidades
5. Configurar respaldos automáticos
*/
