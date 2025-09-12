-- =================================================================
-- SCRIPT DE INSERCIÓN DE DATOS (SEED) v2.0
-- Compatible con los modelos de Sequelize centralizados.
-- =================================================================

-- Usar la base de datos
USE studybooster_db;

-- 1. PREPARACIÓN: Deshabilitar claves foráneas y limpiar tablas
-- -----------------------------------------------------------------
SET FOREIGN_KEY_CHECKS=0;

-- Limpieza en orden inverso a la creación (de tablas hijas a padres)
TRUNCATE TABLE solicitudes_profesores;
TRUNCATE TABLE tareas_personales;
TRUNCATE TABLE usuario_escaneos_qr;
TRUNCATE TABLE codigos_qr;
TRUNCATE TABLE usuario_canjes;
TRUNCATE TABLE recompensas_canjeables;
TRUNCATE TABLE usuario_insignias;
TRUNCATE TABLE insignias;
TRUNCATE TABLE respuestaduelos;       -- NUEVO: Limpia sistema de respuestas
TRUNCATE TABLE preguntaduelos;        -- NUEVO: Limpia sistema de preguntas
TRUNCATE TABLE respuestas_duelo;      -- DEPRECADO: Limpieza por si acaso
TRUNCATE TABLE preguntas_duelo;       -- DEPRECADO: Limpieza por si acaso
TRUNCATE TABLE duelo_participantes;
TRUNCATE TABLE duelos;
TRUNCATE TABLE usuario_misiones;
TRUNCATE TABLE misiones;
TRUNCATE TABLE inscripciones;
TRUNCATE TABLE profesor_materias;
TRUNCATE TABLE materias;
TRUNCATE TABLE usuarios;

SET FOREIGN_KEY_CHECKS=1;

-- 2. INSERCIÓN DE DATOS
-- -----------------------------------------------------------------

-- Tabla: usuarios
-- Contraseña para todos: 'password123' -> $2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC
-- Se añade el rol 'admin', 'sexo' y se deja 'avatar_url' en NULL para que el hook de Sequelize lo gestione.
INSERT INTO `usuarios` (`id_usuario`, `nombre_usuario`, `nombre_completo`, `email_institucional`, `sexo`, `contrasena_hash`, `rol`, `puntos_actuales`, `experiencia_total`, `nivel`, `racha_dias_consecutivos`, `fecha_ultima_actividad`, `estado_verificacion`, `fecha_creacion`) VALUES
(1, 'profe_paredes', 'Dr. Ricardo Paredes', 'ricardo.paredes@universidad.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'profesor', 100, 1000, 10, 5, '2025-09-01', 'VERIFICADO', '2024-01-10 08:00:00'),
(2, 'profe_villa', 'Dra. Elena Villa', 'elena.villa@universidad.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'profesor', 100, 1000, 10, 3, '2025-08-30', 'VERIFICADO', '2024-01-10 08:05:00'),
(3, 'profe_mendez', 'Ing. Carlos Mendez', 'carlos.mendez@universidad.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'profesor', 100, 1000, 10, 10, '2025-09-02', 'VERIFICADO', '2024-01-10 08:10:00'),
(4, 'ana_dev', 'Ana Martínez', 'ana.martinez@email.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 1520, 12500, 12, 15, '2025-09-02', 'VERIFICADO', '2024-02-01 10:20:00'),
(5, 'luis_gamer', 'Luis González', 'luis.gonzalez@email.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 850, 7800, 8, 3, '2025-09-01', 'VERIFICADO', '2024-02-01 11:00:00'),
(6, 'lau_estudia', 'Laura Rodríguez', 'laura.rodriguez@email.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 2300, 18900, 15, 32, '2025-09-02', 'VERIFICADO', '2024-02-02 09:00:00'),
(14, 'profe_castillo', 'Lic. Sofia Castillo', 'sofia.castillo@universidad.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'profesor', 100, 1000, 10, 8, '2025-09-02', 'VERIFICADO', '2024-01-10 08:15:00'),
(15, 'profe_rios', 'Dr. Alberto Rios', 'alberto.rios@universidad.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'profesor', 100, 1000, 10, 12, '2025-09-01', 'VERIFICADO', '2024-01-10 08:20:00'),
(16, 'admin_user', 'Admin del Sistema', 'admin@universidad.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'admin', 9999, 99999, 99, 100, '2025-09-02', 'VERIFICADO', '2024-01-01 00:00:00'),
(17, 'candidato_profe', 'Juan Candidato', 'juan.candidato@email.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 0, 0, 1, 0, '2025-09-01', 'PENDIENTE', '2025-09-01 10:00:00'),
(18, 'candidato_rechazado', 'Maria Postulante', 'maria.postulante@email.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 0, 0, 1, 0, '2025-09-01', 'RECHAZADO', '2025-09-01 11:00:00');

-- Tabla: materias
INSERT INTO `materias` (`id_materia`, `nombre_materia`) VALUES
(1, 'Bases de Datos Avanzadas'),
(2, 'Inteligencia Artificial'),
(3, 'Desarrollo de Software Seguro'),
(4, 'Interacción Humano-Computador'),
(5, 'Redes Neuronales y Deep Learning'),
(6, 'Cálculo Multivariable'),
(7, 'Estructuras de Datos'),
(8, 'Física de Ondas');

-- Tabla: profesor_materias
INSERT INTO `profesor_materias` (`id_profesor`, `id_materia`) VALUES
(1, 1), (1, 8), (1, 7),
(2, 2), (2, 5),
(3, 3), (3, 7),
(14, 4),
(15, 6);

-- Tabla: inscripciones
INSERT INTO `inscripciones` (`id_usuario`, `id_materia`, `periodo_academico`, `calificacion_final`) VALUES
(4, 1, '2025-02', NULL), (4, 3, '2025-02', 17.50), (4, 7, '2025-02', NULL),
(5, 2, '2025-02', NULL), (5, 5, '2025-02', NULL), (5, 4, '2025-02', NULL),
(6, 1, '2025-02', 19.80), (6, 2, '2025-02', 18.00), (6, 3, '2025-02', NULL), (6, 5, '2025-02', NULL);

-- Tabla: misiones
INSERT INTO `misiones` (`id_mision`, `titulo`, `descripcion`, `tipo_mision`, `dificultad`, `id_materia_asociada`, `id_profesor_creador`, `puntos_recompensa`, `experiencia_recompensa`, `peso_en_calificacion`, `bono_nota`) VALUES
(1, 'Inicio de Sesión Diario', 'Ingresa para reclamar tu recompensa diaria.', 'DIARIA', NULL, NULL, NULL, 20, 50, 0.00, 0.00),
(2, 'Completa tu primera tarea del día', 'Finaliza cualquier tarea para ganar un bono.', 'DIARIA', NULL, NULL, NULL, 30, 100, 0.00, 0.00),
(3, 'Duelo Amistoso', 'Reta a un compañero a un duelo.', 'DIARIA', NULL, NULL, NULL, 50, 150, 0.00, 0.00),
(4, 'Diseño de Modelo ER', 'Diseñar el Modelo E-R para un sistema de biblioteca.', 'TAREA', 'BASICA', 1, 1, 100, 250, 20.00, 0.00),
(5, 'Optimización de Consultas SQL', 'Analizar y optimizar 3 consultas SQL lentas.', 'TAREA', 'AVANZADA', 1, 1, 250, 600, 30.00, 0.50),
(6, 'Proyecto Final: Sharding', 'Implementar sharding en una BD de prueba.', 'TAREA', 'EPICA', 1, 1, 800, 2000, 50.00, 1.00),
(7, 'Implementar A*', 'Desarrollar un algoritmo A* para resolver un laberinto.', 'TAREA', 'BASICA', 2, 2, 120, 300, 25.00, 0.00),
(8, 'Clasificador de Sentimientos', 'Crear un clasificador de sentimientos usando RNN.', 'TAREA', 'AVANZADA', 5, 2, 300, 750, 40.00, 0.50),
(9, 'Análisis de Vulnerabilidades XSS', 'Identificar y corregir 3 vulnerabilidades XSS.', 'TAREA', 'AVANZADA', 3, 3, 280, 700, 35.00, 0.00),
(10, 'Integrales Dobles', 'Resolver 10 problemas de integrales dobles.', 'TAREA', 'BASICA', 6, 15, 150, 400, 30.00, 0.00);

-- Tabla: usuario_misiones
INSERT INTO `usuario_misiones` (`id_usuario`, `id_mision`, `fecha_completada`, `estado`, `calificacion_obtenida`) VALUES
(4, 1, '2025-09-02 08:10:00', 'COMPLETADA', NULL), (4, 4, '2025-08-27 15:30:00', 'COMPLETADA', 18.00), (4, 5, '2025-08-29 11:00:00', 'COMPLETADA', 19.50), (4, 9, '2025-08-28 18:00:00', 'COMPLETADA', 16.00), (4, 6, NULL, 'EN_PROGRESO', NULL),
(5, 1, '2025-09-01 09:00:00', 'COMPLETADA', NULL), (5, 7, '2025-08-26 12:00:00', 'COMPLETADA', 15.50), (5, 8, NULL, 'ASIGNADA', NULL), (5, 3, '2025-08-28 14:00:00', 'COMPLETADA', NULL),
(6, 1, '2025-09-02 07:30:00', 'COMPLETADA', NULL), (6, 4, '2025-08-25 19:00:00', 'COMPLETADA', 20.00), (6, 5, '2025-08-29 09:55:00', 'COMPLETADA', 19.80), (6, 7, '2025-08-24 20:00:00', 'COMPLETADA', 18.00);

-- Tabla: preguntaduelos (NUEVO SISTEMA)
INSERT INTO `preguntaduelos` (`id`, `pregunta`, `opcion_a`, `opcion_b`, `opcion_c`, `opcion_d`, `respuesta_correcta`, `explicacion`, `materia`, `dificultad`, `puntos`, `activo`, `createdAt`, `updatedAt`) VALUES
(1, 'En SQL, ¿qué cláusula se utiliza para filtrar los resultados de una función de agregación como COUNT() o SUM()?', 'WHERE', 'HAVING', 'FILTER', 'GROUP BY', 'B', 'La cláusula WHERE filtra filas antes de la agregación, mientras que HAVING filtra grupos después de que la agregación ha ocurrido.', 'Bases de Datos Avanzadas', 'medio', 15, 1, NOW(), NOW()),
(2, '¿Cuál de estos algoritmos es un ejemplo clásico de aprendizaje no supervisado?', 'Regresión Lineal', 'K-Means Clustering', 'Support Vector Machine (SVM)', 'Red Neuronal Convolucional (CNN)', 'B', 'K-Means agrupa los datos en clústeres sin tener etiquetas previas, lo cual es la definición de aprendizaje no supervisado.', 'Inteligencia Artificial', 'facil', 10, 1, NOW(), NOW()),
(3, 'El principio de "menor privilegio" en ciberseguridad se refiere a:', 'Ocultar el código fuente', 'Usar siempre HTTPS', 'Otorgar solo los permisos mínimos necesarios para una tarea', 'Dar a todos acceso de administrador', 'C', 'Este principio fundamental minimiza el daño potencial de un ataque, ya que una cuenta comprometida tendrá capacidades muy limitadas.', 'Desarrollo de Software Seguro', 'medio', 15, 1, NOW(), NOW());

-- Tabla: respuestaduelos (NUEVO SISTEMA)
INSERT INTO `respuestaduelos` (`id`, `usuario_id`, `pregunta_id`, `respuesta_elegida`, `es_correcta`, `tiempo_respuesta`, `puntos_obtenidos`, `createdAt`, `updatedAt`) VALUES
(1, 4, 1, 'B', 1, 5, 15, NOW(), NOW()),  -- Ana responde correctamente
(2, 5, 2, 'C', 0, 8, 0, NOW(), NOW()),   -- Luis responde incorrectamente
(3, 6, 1, 'B', 1, 3, 15, NOW(), NOW());  -- Laura responde correctamente

-- Tabla: solicitudes_profesores (NUEVO)
INSERT INTO `solicitudes_profesores` (`id_solicitud`, `id_usuario`, `carnet_institucional_url`, `estado`, `motivo_rechazo`, `fecha_revision`, `id_admin_revisor`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 17, 'https://cdn.example.com/carnets/juan_candidato.jpg', 'PENDIENTE', NULL, NULL, NULL, '2025-09-02 11:00:00', '2025-09-02 11:00:00'),
(2, 15, 'https://cdn.example.com/carnets/alberto_rios.jpg', 'APROBADA', NULL, '2025-09-01 15:00:00', 16, '2025-08-30 09:00:00', '2025-09-01 15:00:00'),
(3, 18, 'https://cdn.example.com/carnets/maria_postulante.jpg', 'RECHAZADA', 'La imagen del carnet no es legible. Por favor, suba una foto más clara.', '2025-09-02 10:00:00', 16, '2025-09-01 12:00:00', '2025-09-02 10:00:00');


-- (Se omiten inserts de tablas no modificadas como Insignias, Recompensas, etc. por brevedad)
-- FIN DE LA INSERCIÓN --
