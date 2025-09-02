-- Creamos la base de datos si no existe
CREATE DATABASE IF NOT EXISTS studybooster_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studybooster_db;

-- TABLAS PRINCIPALES --

-- Tabla de Usuarios (Unificada para Estudiantes y Profesores)
-- Almacena la información central de cada usuario. Se elimina la tabla `Profesores` para simplificar.
CREATE TABLE Usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nickname para duelos y tablas de clasificación',
  nombre_completo VARCHAR(255) NOT NULL,
  email_institucional VARCHAR(255) NOT NULL UNIQUE,
  rol ENUM('estudiante','profesor') NOT NULL DEFAULT 'estudiante',
  contrasena_hash VARCHAR(255) NOT NULL,
  puntos_actuales INT DEFAULT 0 COMMENT 'Puntos disponibles para canjear o apostar',
  experiencia_total BIGINT DEFAULT 0 COMMENT 'Experiencia acumulada para subir de nivel',
  nivel INT DEFAULT 1 COMMENT 'Nivel del usuario basado en la experiencia',
  racha_dias_consecutivos INT DEFAULT 0 COMMENT 'Contador de días seguidos completando misiones diarias',
  fecha_ultima_actividad DATE COMMENT 'Usada para calcular y reiniciar la racha diaria',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de Materias
-- Las materias son el eje para la clasificación y las misiones específicas.
CREATE TABLE Materias (
  id_materia INT AUTO_INCREMENT PRIMARY KEY,
  nombre_materia VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- NUEVA TABLA: Vincula Profesores y Materias (Muchos a Muchos)
-- Permite que una materia tenga varios profesores y viceversa.
CREATE TABLE Profesor_Materias (
    id_profesor_materia INT AUTO_INCREMENT PRIMARY KEY,
    id_profesor INT,
    id_materia INT,
    FOREIGN KEY (id_profesor) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_materia) REFERENCES Materias(id_materia),
    UNIQUE(id_profesor, id_materia)
) ENGINE=InnoDB;


-- Tabla de Inscripciones
-- Vincula a los estudiantes con las materias que están cursando en un período académico.
CREATE TABLE Inscripciones (
  id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  id_materia INT,
  periodo_academico VARCHAR(20),
  calificacion_final DECIMAL(5,2) NULL COMMENT 'NUEVO: Nota final ponderada del estudiante en la materia.',
  UNIQUE(id_usuario, id_materia, periodo_academico),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_materia) REFERENCES Materias(id_materia)
) ENGINE=InnoDB;


-- TABLAS DEL SISTEMA DE MISIONES --

-- Tabla de Misiones
-- Contiene todas las misiones, tanto las diarias como las TAREAS creadas por profesores.
CREATE TABLE Misiones (
  id_mision INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_mision ENUM('DIARIA', 'TAREA') NOT NULL,
  dificultad ENUM('BASICA', 'AVANZADA', 'EPICA'),
  id_materia_asociada INT NULL COMMENT 'Vincula la misión/tarea a una materia específica',
  id_profesor_creador INT NULL COMMENT 'Profesor que asigna la tarea',
  -- Recompensas de Gamificación
  puntos_recompensa INT DEFAULT 0,
  experiencia_recompensa INT DEFAULT 0,
  -- Recompensas Académicas
  peso_en_calificacion DECIMAL(5,2) DEFAULT 0.00 COMMENT 'NUEVO: Peso de la tarea en la calificación final (ej. 20.00 para 20%)',
  bono_nota DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Bonificación extra sobre la nota final (ej. 0.5)',
  -- Requisitos para misiones épicas
  req_nivel_minimo INT DEFAULT 1,
  req_racha_minima INT DEFAULT 0,
  req_puntos_minimos INT DEFAULT 0,
  FOREIGN KEY (id_materia_asociada) REFERENCES Materias(id_materia),
  FOREIGN KEY (id_profesor_creador) REFERENCES Usuarios(id_usuario) -- MODIFICADO: Ahora referencia a Usuarios
) ENGINE=InnoDB;

-- Tabla de Progreso de Misiones por Usuario
-- Registra el estado de las misiones para cada usuario.
CREATE TABLE Usuario_Misiones (
  id_usuario_mision INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  id_mision INT,
  fecha_completada TIMESTAMP NULL,
  estado ENUM('ASIGNADA', 'EN_PROGRESO', 'COMPLETADA', 'VENCIDA') DEFAULT 'ASIGNADA',
  calificacion_obtenida DECIMAL(5,2) NULL COMMENT 'NUEVO: Nota que el profesor asigna a esta tarea completada.',
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_mision) REFERENCES Misiones(id_mision)
) ENGINE=InnoDB;


-- TABLAS DEL SISTEMA DE DUELOS (sin cambios relevantes) --

CREATE TABLE Duelos (
  id_duelo INT AUTO_INCREMENT PRIMARY KEY,
  tipo_duelo ENUM('CLASICO', 'COOPERATIVO') NOT NULL,
  id_materia INT,
  estado ENUM('PENDIENTE', 'EN_JUEGO', 'FINALIZADO', 'CANCELADO') NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_ganador INT NULL,
  puntos_apostados INT NOT NULL,
  FOREIGN KEY (id_materia) REFERENCES Materias(id_materia)
) ENGINE=InnoDB;

CREATE TABLE Duelo_Participantes (
  id_participante_duelo INT AUTO_INCREMENT PRIMARY KEY,
  id_duelo INT,
  id_usuario INT,
  equipo VARCHAR(50) NULL,
  puntuacion_final INT DEFAULT 0,
  FOREIGN KEY (id_duelo) REFERENCES Duelos(id_duelo),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
) ENGINE=InnoDB;
-- Banco de Preguntas para Duelos
CREATE TABLE Preguntas_Duelo (
  id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
  id_materia INT,
  enunciado TEXT NOT NULL,
  dificultad ENUM('FACIL', 'NORMAL', 'DIFICIL') NOT NULL COMMENT 'Para rondas de desempate [cite: 19]',
  FOREIGN KEY (id_materia) REFERENCES Materias(id_materia)
) ENGINE=InnoDB;

-- Respuestas a las Preguntas
CREATE TABLE Respuestas_Duelo (
  id_respuesta INT AUTO_INCREMENT PRIMARY KEY,
  id_pregunta INT,
  texto_respuesta VARCHAR(255) NOT NULL,
  es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (id_pregunta) REFERENCES Preguntas_Duelo(id_pregunta) ON DELETE CASCADE
) ENGINE=InnoDB;


-- TABLAS DE RECOMPENSAS Y CANJES --

-- Tabla de Insignias (Logros)
-- Recompensas no numéricas por logros especiales.
CREATE TABLE Insignias (
  id_insignia INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono_url VARCHAR(255) COMMENT 'URL a la imagen del logro',
  id_mision_desbloqueo INT NULL COMMENT 'Misión avanzada o épica que la otorga [cite: 12]',
  FOREIGN KEY (id_mision_desbloqueo) REFERENCES Misiones(id_mision)
) ENGINE=InnoDB;

-- Tabla de Insignias Obtenidas por Usuario
CREATE TABLE Usuario_Insignias (
  id_usuario_insignia INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  id_insignia INT,
  fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_insignia) REFERENCES Insignias(id_insignia)
) ENGINE=InnoDB;

-- Catálogo de Recompensas Canjeables
-- Items que los usuarios pueden "comprar" con sus puntos.
CREATE TABLE Recompensas_Canjeables (
  id_recompensa INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_recompensa ENUM('FISICA', 'ACADEMICA') NOT NULL COMMENT '[cite: 14, 15]',
  costo_en_puntos INT NOT NULL,
  stock INT NULL COMMENT 'Para recursos físicos limitados',
  requiere_aprobacion_docente BOOLEAN DEFAULT FALSE COMMENT 'Para bonos de nota [cite: 14]'
) ENGINE=InnoDB;

-- Historial de Canjes de Recompensas
CREATE TABLE Usuario_Canjes (
  id_canje INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  id_recompensa INT,
  puntos_gastados INT,
  fecha_canje TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado_aprobacion ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO') DEFAULT 'APROBADO',
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_recompensa) REFERENCES Recompensas_Canjeables(id_recompensa)
) ENGINE=InnoDB;


-- TABLAS DE INTEGRACIÓN Y UTILIDADES --

-- Códigos QR para eventos y lugares físicos
CREATE TABLE Codigos_QR (
  id_qr INT AUTO_INCREMENT PRIMARY KEY,
  codigo_hash VARCHAR(255) NOT NULL UNIQUE,
  descripcion VARCHAR(255) COMMENT 'Ej: "QR Biblioteca Semana 1", "QR Evento IA" [cite: 25]',
  puntos_recompensa INT NOT NULL,
  experiencia_recompensa INT NOT NULL,
  fecha_expiracion DATETIME,
  usos_maximos INT NULL,
  usos_actuales INT DEFAULT 0
) ENGINE=InnoDB;

-- Registro de escaneos de QR por usuario
CREATE TABLE Usuario_Escaneos_QR (
  id_escaneo INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  id_qr INT,
  fecha_escaneo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_usuario, id_qr) COMMENT 'Un usuario solo puede escanear cada QR una vez',
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
  FOREIGN KEY (id_qr) REFERENCES Codigos_QR(id_qr)
) ENGINE=InnoDB;

-- Tareas personales para planificación del estudiante
-- Soporte para la funcionalidad de autorregulación y agenda [cite: 27, 29]
CREATE TABLE Tareas_Personales (
  id_tarea INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_vencimiento DATETIME,
  estado ENUM('PENDIENTE', 'COMPLETADA') DEFAULT 'PENDIENTE',
  google_calendar_event_id VARCHAR(255) NULL COMMENT 'Para sincronización con Google Calendar API [cite: 27]',
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
) ENGINE=InnoDB;