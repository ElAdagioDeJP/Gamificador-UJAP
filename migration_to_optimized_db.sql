-- =====================================================
-- MIGRACIÓN SIMPLE A BASE DE DATOS OPTIMIZADA
-- =====================================================
-- Este script actualiza la base de datos existente sin perder datos
-- Solo incluye la lógica esencial para la migración
-- =====================================================

USE studybooster_db;

-- =====================================================
-- 1. AGREGAR CAMPOS FALTANTES A TABLAS EXISTENTES
-- =====================================================

-- Agregar campos faltantes a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS universidad VARCHAR(255) NULL AFTER sexo,
ADD COLUMN IF NOT EXISTS carrera VARCHAR(255) NULL AFTER universidad,
ADD COLUMN IF NOT EXISTS semestre INT NULL AFTER carrera,
ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE AFTER fecha_ultima_actividad,
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER fecha_creacion;

-- Agregar campos faltantes a la tabla materias
ALTER TABLE materias 
ADD COLUMN IF NOT EXISTS codigo_materia VARCHAR(20) NULL UNIQUE AFTER id_materia,
ADD COLUMN IF NOT EXISTS descripcion TEXT NULL AFTER nombre_materia,
ADD COLUMN IF NOT EXISTS creditos INT NOT NULL DEFAULT 3 AFTER descripcion,
ADD COLUMN IF NOT EXISTS semestre_recomendado INT NULL AFTER creditos,
ADD COLUMN IF NOT EXISTS activa BOOLEAN NOT NULL DEFAULT TRUE AFTER semestre_recomendado,
ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER activa,
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER fecha_creacion;

-- =====================================================
-- 2. CREAR TABLAS NUEVAS QUE NO EXISTEN
-- =====================================================

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS configuracion_sistema (
  id_config INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT NULL,
  tipo ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
  descripcion TEXT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_clave (clave)
) ENGINE=InnoDB;

-- Tabla de logs de actividad
CREATE TABLE IF NOT EXISTS logs_actividad (
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
-- 3. AGREGAR ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices en usuarios
ALTER TABLE usuarios 
ADD INDEX IF NOT EXISTS idx_rol (rol),
ADD INDEX IF NOT EXISTS idx_estado_verificacion (estado_verificacion),
ADD INDEX IF NOT EXISTS idx_nivel (nivel),
ADD INDEX IF NOT EXISTS idx_puntos (puntos_actuales),
ADD INDEX IF NOT EXISTS idx_activo (activo);

-- Índices en materias
ALTER TABLE materias 
ADD INDEX IF NOT EXISTS idx_codigo (codigo_materia),
ADD INDEX IF NOT EXISTS idx_activa (activa);

-- Índices en inscripciones
ALTER TABLE inscripciones 
ADD INDEX IF NOT EXISTS idx_periodo (periodo_academico),
ADD INDEX IF NOT EXISTS idx_estado (estado);

-- Índices en misiones
ALTER TABLE misiones 
ADD INDEX IF NOT EXISTS idx_tipo (tipo_mision),
ADD INDEX IF NOT EXISTS idx_dificultad (dificultad),
ADD INDEX IF NOT EXISTS idx_materia (id_materia_asociada),
ADD INDEX IF NOT EXISTS idx_profesor (id_profesor_creador),
ADD INDEX IF NOT EXISTS idx_activa (activa),
ADD INDEX IF NOT EXISTS idx_fecha_vencimiento (fecha_vencimiento);

-- Índices en usuario_misiones
ALTER TABLE usuario_misiones 
ADD INDEX IF NOT EXISTS idx_estado (estado),
ADD INDEX IF NOT EXISTS idx_fecha_completada (fecha_completada);

-- Índices en duelos
ALTER TABLE duelos 
ADD INDEX IF NOT EXISTS idx_tipo (tipo_duelo),
ADD INDEX IF NOT EXISTS idx_estado (estado),
ADD INDEX IF NOT EXISTS idx_materia (id_materia),
ADD INDEX IF NOT EXISTS idx_fecha_creacion (fecha_creacion);

-- =====================================================
-- 4. INSERTAR DATOS INICIALES
-- =====================================================

-- Configuraciones del sistema
INSERT IGNORE INTO configuracion_sistema (clave, valor, tipo, descripcion) VALUES
('sistema_activo', 'true', 'BOOLEAN', 'Indica si el sistema está activo'),
('puntos_por_nivel', '1000', 'NUMBER', 'Puntos necesarios para subir de nivel'),
('racha_maxima', '30', 'NUMBER', 'Racha máxima de días consecutivos'),
('duelo_puntos_minimo', '10', 'NUMBER', 'Puntos mínimos para participar en duelos'),
('mision_diaria_puntos', '50', 'NUMBER', 'Puntos por completar misión diaria'),
('version_sistema', '2.0', 'STRING', 'Versión actual del sistema');

-- Insignias básicas
INSERT IGNORE INTO insignias (nombre, descripcion, tipo_insignia, requisito_valor) VALUES
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
INSERT IGNORE INTO recompensas_canjeables (nombre, descripcion, tipo_recompensa, costo_en_puntos, stock_ilimitado) VALUES
('Bono de Nota +0.5', 'Bonificación de 0.5 puntos en una calificación', 'ACADEMICA', 100, TRUE),
('Bono de Nota +1.0', 'Bonificación de 1.0 punto en una calificación', 'ACADEMICA', 200, TRUE),
('Exención de Tarea', 'Exención de una tarea menor', 'ACADEMICA', 150, TRUE),
('Merchandise UJAP', 'Producto promocional de la universidad', 'FISICA', 500, FALSE),
('Certificado Digital', 'Certificado de logro personalizado', 'DIGITAL', 300, TRUE);

-- Materias de ejemplo (solo si no existen)
INSERT IGNORE INTO materias (codigo_materia, nombre_materia, descripcion, creditos) VALUES
('MAT101', 'Matemáticas I', 'Álgebra y trigonometría básica', 4),
('FIS101', 'Física I', 'Mecánica clásica', 4),
('QUI101', 'Química General', 'Fundamentos de química', 3),
('PRO101', 'Programación I', 'Introducción a la programación', 4),
('ING101', 'Inglés I', 'Inglés básico', 2);

-- =====================================================
-- 5. CREAR USUARIO ADMINISTRADOR
-- =====================================================

-- Crear usuario administrador si no existe
INSERT IGNORE INTO usuarios (
  nombre_usuario, 
  nombre_completo, 
  email_institucional, 
  contrasena_hash, 
  rol, 
  estado_verificacion,
  universidad,
  carrera
) VALUES (
  'admin', 
  'Administrador del Sistema', 
  'admin@ujap.edu.ve', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
  'admin', 
  'VERIFICADO',
  'Universidad José Antonio Páez',
  'Sistemas'
);

-- =====================================================
-- 6. CREAR VISTAS ÚTILES
-- =====================================================

-- Vista: Ranking de usuarios por puntos
CREATE OR REPLACE VIEW vista_ranking_usuarios AS
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
CREATE OR REPLACE VIEW vista_estadisticas_misiones AS
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
-- 7. PROCEDIMIENTOS ALMACENADOS BÁSICOS
-- =====================================================

DELIMITER //

-- Procedimiento: Actualizar nivel de usuario
CREATE PROCEDURE IF NOT EXISTS sp_actualizar_nivel_usuario(IN p_id_usuario INT UNSIGNED)
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
CREATE PROCEDURE IF NOT EXISTS sp_completar_mision(
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
-- 8. ACTUALIZAR DATOS EXISTENTES
-- =====================================================

-- Actualizar usuarios existentes para que tengan activo = TRUE
UPDATE usuarios SET activo = TRUE WHERE activo IS NULL;

-- Actualizar materias existentes para que tengan activa = TRUE
UPDATE materias SET activa = TRUE WHERE activa IS NULL;

-- Actualizar niveles de usuarios basado en su experiencia
UPDATE usuarios 
SET nivel = FLOOR(experiencia_total / 1000) + 1 
WHERE nivel = 1 AND experiencia_total > 0;

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

-- Mostrar resumen de la migración
SELECT 
  'MIGRACIÓN COMPLETADA' as estado,
  COUNT(*) as total_usuarios,
  (SELECT COUNT(*) FROM materias) as total_materias,
  (SELECT COUNT(*) FROM misiones) as total_misiones
FROM usuarios;

-- Mostrar información del administrador creado
SELECT 
  'ADMINISTRADOR CREADO' as estado,
  nombre_usuario,
  email_institucional,
  rol
FROM usuarios 
WHERE rol = 'admin' 
ORDER BY fecha_creacion DESC 
LIMIT 1;
