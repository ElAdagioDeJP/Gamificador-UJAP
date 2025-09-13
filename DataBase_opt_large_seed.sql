-- =================================================================
-- MASSIVE SEED SCRIPT for studybooster_db (based on DataBase_OPTIMIZED.SQL)
-- Generated: 2025-09-12
-- Purpose: Populate most tables with realistic sample data for development/testing
-- Note: Uses same password hash as DataForDB.SQL for all seeded users
-- =================================================================

USE studybooster_db;

-- 1) Disable foreign keys and truncate child->parent order
SET FOREIGN_KEY_CHECKS=0;

TRUNCATE TABLE usuario_escaneos_qr;
TRUNCATE TABLE usuario_canjes;
TRUNCATE TABLE usuario_insignias;
TRUNCATE TABLE usuario_misiones;
TRUNCATE TABLE respuestas_usuario;
TRUNCATE TABLE opciones_respuesta;
TRUNCATE TABLE preguntas;
TRUNCATE TABLE misiones;
TRUNCATE TABLE recompensas_canjeables;
TRUNCATE TABLE insignias;
TRUNCATE TABLE duelo_participantes;
TRUNCATE TABLE duelos;
TRUNCATE TABLE solicitudes_profesores;
TRUNCATE TABLE tareas_personales;
TRUNCATE TABLE profesor_materias;
TRUNCATE TABLE inscripciones;
TRUNCATE TABLE materias;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE configuracion_sistema;
TRUNCATE TABLE codigos_qr;
TRUNCATE TABLE logs_actividad;

SET FOREIGN_KEY_CHECKS=1;

-- 2) System configuration
INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion) VALUES
('sistema_activo', 'true', 'BOOLEAN', 'Indica si el sistema está activo'),
('puntos_por_nivel', '1000', 'NUMBER', 'Puntos necesarios para subir de nivel'),
('racha_maxima', '30', 'NUMBER', 'Racha máxima de días consecutivos'),
('duelo_puntos_minimo', '10', 'NUMBER', 'Puntos mínimos para participar en duelos'),
('mision_diaria_puntos', '50', 'NUMBER', 'Puntos por completar misión diaria'),
('version_sistema', '2.0', 'STRING', 'Versión actual del sistema');

-- 3) Users
-- Password hash used in DataForDB.SQL
-- $2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC
INSERT INTO usuarios (id_usuario, nombre_usuario, nombre_completo, email_institucional, sexo, contrasena_hash, rol, puntos_actuales, experiencia_total, nivel, racha_dias_consecutivos, fecha_ultima_actividad, estado_verificacion, fecha_creacion, activo, avatar_url) VALUES
(1, 'profe_paredes', 'Dr. Ricardo Paredes', 'ricardo.paredes@universidad.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'profesor', 100, 1000, 10, 5, '2025-09-01', 'VERIFICADO', '2024-01-10 08:00:00', TRUE, NULL),
(2, 'profe_villa', 'Dra. Elena Villa', 'elena.villa@universidad.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'profesor', 100, 1000, 10, 3, '2025-08-30', 'VERIFICADO', '2024-01-10 08:05:00', TRUE, NULL),
(3, 'profe_mendez', 'Ing. Carlos Mendez', 'carlos.mendez@universidad.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'profesor', 100, 1000, 10, 10, '2025-09-02', 'VERIFICADO', '2024-01-10 08:10:00', TRUE, NULL),
(4, 'ana_dev', 'Ana Martínez', 'ana.martinez@email.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 1520, 12500, 12, 15, '2025-09-02', 'VERIFICADO', '2024-02-01 10:20:00', TRUE, NULL),
(5, 'luis_gamer', 'Luis González', 'luis.gonzalez@email.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 850, 7800, 8, 3, '2025-09-01', 'VERIFICADO', '2024-02-01 11:00:00', TRUE, NULL),
(6, 'lau_estudia', 'Laura Rodríguez', 'laura.rodriguez@email.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 2300, 18900, 15, 32, '2025-09-02', 'VERIFICADO', '2024-02-02 09:00:00', TRUE, NULL),
(7, 'carlos92', 'Carlos Pérez', 'carlos.perez@email.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 300, 2200, 5, 2, '2025-08-30', 'VERIFICADO', '2024-03-10 08:00:00', TRUE, NULL),
(8, 'maria_ux', 'María Torres', 'maria.torres@email.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 420, 3100, 6, 7, '2025-09-02', 'VERIFICADO', '2024-03-12 09:00:00', TRUE, NULL),
(9, 'sandra_a', 'Sandra Alvarez', 'sandra.alvarez@email.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 110, 900, 3, 0, '2025-08-01', 'VERIFICADO', '2024-04-01 12:00:00', TRUE, NULL),
(10, 'pablo_dev', 'Pablo Ruiz', 'pablo.ruiz@email.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 980, 8900, 9, 4, '2025-09-01', 'VERIFICADO', '2024-05-02 13:30:00', TRUE, NULL),
(11, 'sofia_castillo', 'Sofía Castillo', 'sofia.castillo@universidad.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'profesor', 100, 1000, 10, 8, '2025-09-02', 'VERIFICADO', '2024-01-10 08:15:00', TRUE, NULL),
(12, 'alberto_rios', 'Dr. Alberto Rios', 'alberto.rios@universidad.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'profesor', 100, 1000, 10, 12, '2025-09-01', 'VERIFICADO', '2024-01-10 08:20:00', TRUE, NULL),
(13, 'admin_user', 'Admin del Sistema', 'admin@universidad.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'admin', 9999, 99999, 99, 100, '2025-09-02', 'VERIFICADO', '2024-01-01 00:00:00', TRUE, NULL),
(14, 'juan_candidato', 'Juan Candidato', 'juan.candidato@email.edu', 'M', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 0, 0, 1, 0, '2025-09-01', 'PENDIENTE', '2025-09-01 10:00:00', TRUE, NULL),
(15, 'maria_postulante', 'Maria Postulante', 'maria.postulante@email.edu', 'F', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 'estudiante', 0, 0, 1, 0, '2025-09-01', 'RECHAZADO', '2025-09-01 11:00:00', TRUE, NULL);

-- 4) Materias
INSERT INTO materias (id_materia, codigo_materia, nombre_materia, descripcion, creditos, semestre_recomendado, activa, fecha_creacion) VALUES
(1, 'BDAV01', 'Bases de Datos Avanzadas', 'Modelado, optimización y escalabilidad', 4, 6, TRUE, NOW()),
(2, 'IA101', 'Inteligencia Artificial', 'Fundamentos de IA y aprendizaje automático', 4, 5, TRUE, NOW()),
(3, 'SWSEC', 'Desarrollo de Software Seguro', 'Prácticas y principios de seguridad', 3, 5, TRUE, NOW()),
(4, 'HCI01', 'Interacción Humano-Computador', 'Diseño de interfaces y usabilidad', 3, 4, TRUE, NOW()),
(5, 'DL201', 'Redes Neuronales y Deep Learning', 'Arquitecturas profundas y entrenamiento', 4, 7, TRUE, NOW()),
(6, 'CALC2', 'Cálculo Multivariable', 'Integrales múltiples y campos vectoriales', 4, 2, TRUE, NOW()),
(7, 'EDATA', 'Estructuras de Datos', 'Algoritmos y estructuras fundamentales', 4, 3, TRUE, NOW()),
(8, 'FISWAV', 'Física de Ondas', 'Fenómenos ondulatorios y aplicaciones', 3, 2, TRUE, NOW());

-- 5) Profesor-Materias
INSERT INTO profesor_materias (id_profesor, id_materia, fecha_asignacion, activo) VALUES
(1, 1, '2024-01-10 08:00:00', TRUE),
(1, 7, '2024-01-10 08:00:00', TRUE),
(2, 2, '2024-01-10 08:05:00', TRUE),
(2, 5, '2024-01-10 08:05:00', TRUE),
(3, 3, '2024-01-10 08:10:00', TRUE),
(11, 4, '2024-01-10 08:15:00', TRUE),
(12, 6, '2024-01-10 08:20:00', TRUE);

-- 6) Inscripciones
INSERT INTO inscripciones (id_usuario, id_materia, periodo_academico, calificacion_final, estado, fecha_inscripcion) VALUES
(4,1,'2025-02',NULL,'ACTIVA','2025-02-01'),
(4,3,'2025-02',17.50,'FINALIZADA','2025-02-01'),
(5,2,'2025-02',NULL,'ACTIVA','2025-02-01'),
(6,1,'2025-02',19.80,'FINALIZADA','2025-02-01'),
(6,2,'2025-02',18.00,'FINALIZADA','2025-02-01');

-- 7) Misiones
INSERT INTO misiones (id_mision, titulo, descripcion, tipo_mision, dificultad, id_materia_asociada, id_profesor_creador, puntos_recompensa, experiencia_recompensa, peso_en_calificacion, bono_nota, fecha_inicio, fecha_vencimiento, activa) VALUES
(1, 'Inicio de Sesión Diario', 'Ingresa para reclamar tu recompensa diaria.', 'DIARIA', 'BASICA', NULL, NULL, 20, 50, 0.00, 0.00, NOW()-INTERVAL 30 DAY, NOW()+INTERVAL 365 DAY, TRUE),
(2, 'Completa tu primera tarea del día', 'Finaliza cualquier tarea para ganar un bono.', 'DIARIA', 'BASICA', NULL, NULL, 30, 100, 0.00, 0.00, NOW()-INTERVAL 20 DAY, NOW()+INTERVAL 365 DAY, TRUE),
(3, 'Duelo Amistoso', 'Reta a un compañero a un duelo.', 'DIARIA', 'BASICA', NULL, NULL, 50, 150, 0.00, 0.00, NOW()-INTERVAL 10 DAY, NOW()+INTERVAL 365 DAY, TRUE),
(4, 'Diseño de Modelo ER', 'Diseñar el Modelo E-R para un sistema de biblioteca.', 'TAREA', 'BASICA', 1, 1, 100, 250, 20.00, 0.00, NOW()-INTERVAL 60 DAY, NOW()+INTERVAL 180 DAY, TRUE),
(5, 'Optimización de Consultas SQL', 'Analizar y optimizar 3 consultas SQL lentas.', 'TAREA', 'AVANZADA', 1, 1, 250, 600, 30.00, 0.50, NOW()-INTERVAL 45 DAY, NOW()+INTERVAL 120 DAY, TRUE),
(6, 'Proyecto Final: Sharding', 'Implementar sharding en una BD de prueba.', 'TAREA', 'EPICA', 1, 1, 800, 2000, 50.00, 1.00, NOW()-INTERVAL 10 DAY, NOW()+INTERVAL 300 DAY, TRUE),
(7, 'Implementar A*', 'Desarrollar un algoritmo A* para resolver un laberinto.', 'TAREA', 'BASICA', 2, 2, 120, 300, 25.00, 0.00, NOW()-INTERVAL 40 DAY, NOW()+INTERVAL 90 DAY, TRUE),
(8, 'Clasificador de Sentimientos', 'Crear un clasificador de sentimientos usando RNN.', 'TAREA', 'AVANZADA', 5, 2, 300, 750, 40.00, 0.50, NOW()-INTERVAL 30 DAY, NOW()+INTERVAL 120 DAY, TRUE);

-- 8) Usuario_Misiones
INSERT INTO usuario_misiones (id_usuario, id_mision, estado, fecha_completada, calificacion_obtenida) VALUES
(4,1,'COMPLETADA','2025-09-02 08:10:00',NULL),
(4,4,'COMPLETADA','2025-08-27 15:30:00',18.00),
(4,5,'COMPLETADA','2025-08-29 11:00:00',19.50),
(5,1,'COMPLETADA','2025-09-01 09:00:00',NULL),
(6,1,'COMPLETADA','2025-09-02 07:30:00',NULL);

-- 9) Preguntas y opciones (sistema unificado)
INSERT INTO preguntas (id_pregunta, id_materia, id_mision, enunciado, tipo_pregunta, dificultad, puntos, tiempo_limite, explicacion, activa, fecha_creacion) VALUES
(1,1,NULL,'En SQL, ¿qué cláusula se utiliza para filtrar los resultados de una función de agregación como COUNT() o SUM()?','OPCION_MULTIPLE','NORMAL',15,60,'La cláusula WHERE filtra filas antes de la agregación, mientras que HAVING filtra grupos después de la agregación.',TRUE,NOW()),
(2,2,NULL,'¿Cuál de estos algoritmos es un ejemplo clásico de aprendizaje no supervisado?','OPCION_MULTIPLE','FACIL',10,45,'K-Means agrupa los datos en clústeres sin tener etiquetas previas.',TRUE,NOW()),
(3,3,NULL,'El principio de "menor privilegio" en ciberseguridad se refiere a:','OPCION_MULTIPLE','NORMAL',15,45,'Otorgar solo los permisos mínimos necesarios para una tarea.',TRUE,NOW());

INSERT INTO opciones_respuesta (id_opcion, id_pregunta, texto_opcion, es_correcta, orden, fecha_creacion) VALUES
(1,1,'WHERE',FALSE,1,NOW()),
(2,1,'HAVING',TRUE,2,NOW()),
(3,1,'FILTER',FALSE,3,NOW()),
(4,1,'GROUP BY',FALSE,4,NOW()),
(5,2,'Regresión Lineal',FALSE,1,NOW()),
(6,2,'K-Means Clustering',TRUE,2,NOW()),
(7,2,'Support Vector Machine (SVM)',FALSE,3,NOW()),
(8,2,'Red Neuronal Convolucional (CNN)',FALSE,4,NOW()),
(9,3,'Ocultar el código fuente',FALSE,1,NOW()),
(10,3,'Usar siempre HTTPS',FALSE,2,NOW()),
(11,3,'Otorgar solo los permisos mínimos necesarios para una tarea',TRUE,3,NOW()),
(12,3,'Dar a todos acceso de administrador',FALSE,4,NOW());

-- 10) Respuestas de usuarios
INSERT INTO respuestas_usuario (id_respuesta, id_usuario, id_pregunta, id_opcion_elegida, respuesta_texto, es_correcta, puntos_obtenidos, tiempo_respuesta, fecha_respuesta) VALUES
(1,4,1,2,NULL,TRUE,15,5,NOW()),
(2,5,2,7,NULL,FALSE,0,8,NOW()),
(3,6,1,2,NULL,TRUE,15,3,NOW());

-- 11) Duelos y participantes
INSERT INTO duelos (id_duelo, tipo_duelo, id_materia, estado, puntos_apostados, id_ganador, duracion_minutos, fecha_creacion, fecha_inicio, fecha_fin) VALUES
(1,'CLASICO',1,'FINALIZADO',50,4,15,NOW()-INTERVAL 10 DAY,NOW()-INTERVAL 10 DAY,NOW()-INTERVAL 10 DAY),
(2,'CLASICO',2,'EN_JUEGO',20,NULL,10,NOW()-INTERVAL 1 DAY,NOW(),NULL);

INSERT INTO duelo_participantes (id_participante, id_duelo, id_usuario, equipo, puntuacion_final, posicion, fecha_inscripcion) VALUES
(1,1,4,'A',80,1,NOW()-INTERVAL 10 DAY),
(2,1,5,'B',60,2,NOW()-INTERVAL 10 DAY),
(3,2,6,'A',0,NULL,NOW()-INTERVAL 1 DAY);

-- 12) Insignias
INSERT INTO insignias (id_insignia, nombre, descripcion, icono_url, tipo_insignia, requisito_valor, id_mision_desbloqueo, activa, fecha_creacion) VALUES
(1,'Primer Paso','Completa tu primera misión',NULL,'MISION',1,NULL,TRUE,NOW()),
(2,'Estudiante Dedicado','Completa 10 misiones',NULL,'MISION',10,NULL,TRUE,NOW()),
(3,'Racha de Fuego','Mantén una racha de 7 días',NULL,'RACHA',7,NULL,TRUE,NOW());

INSERT INTO usuario_insignias (id_usuario_insignia, id_usuario, id_insignia, fecha_obtencion) VALUES
(1,4,1,'2025-08-27 15:35:00'),
(2,6,3,'2025-09-02 07:35:00');

-- 13) Recompensas canjeables y canjes
INSERT INTO recompensas_canjeables (id_recompensa, nombre, descripcion, tipo_recompensa, costo_en_puntos, stock, stock_ilimitado, requiere_aprobacion_docente, activa, fecha_creacion) VALUES
(1,'Bono de Nota +0.5','Bonificación de 0.5 puntos en una calificación','ACADEMICA',100,NULL,TRUE,FALSE,TRUE,NOW()),
(2,'Merchandise UJAP','Producto promocional de la universidad','FISICA',500,20,FALSE,TRUE,TRUE,NOW());

INSERT INTO usuario_canjes (id_canje, id_usuario, id_recompensa, puntos_gastados, cantidad, estado_aprobacion, fecha_canje, id_admin_aprobador) VALUES
(1,4,1,100,1,'APROBADO','2025-08-28 12:00:00',NULL),
(2,6,2,500,1,'APROBADO','2025-09-02 10:00:00',13);

-- 14) Codigos QR y escaneos
INSERT INTO codigos_qr (id_qr, codigo_hash, descripcion, tipo_qr, puntos_recompensa, experiencia_recompensa, fecha_expiracion, usos_maximos, usos_actuales, activo, fecha_creacion) VALUES
(1,'QR-EVENT-2025-001','Evento de bienvenida','EVENTO',100,200,'2026-01-01',100,3,TRUE,NOW()),
(2,'QR-BONUS-DAILY','Bonus diario','BONUS',10,25,NULL,1000,50,TRUE,NOW());

INSERT INTO usuario_escaneos_qr (id_escaneo, id_usuario, id_qr, fecha_escaneo, puntos_obtenidos, experiencia_obtenida) VALUES
(1,4,1,'2025-09-02 09:00:00',100,200),
(2,5,2,'2025-09-01 09:05:00',10,25);

-- 15) Tareas personales
INSERT INTO tareas_personales (id_tarea, id_usuario, titulo, descripcion, fecha_vencimiento, estado, prioridad, google_calendar_event_id, fecha_creacion) VALUES
(1,4,'Estudiar para BD','Repasar índices y normalización','2025-09-15 23:59:00','PENDIENTE','ALTA',NULL,'2025-08-20 10:00:00'),
(2,5,'Proyecto IA','Preparar dataset y pipeline','2025-10-01 23:59:00','EN_PROGRESO','MEDIA',NULL,'2025-08-24 12:00:00');

-- 16) Solicitudes de profesores
INSERT INTO solicitudes_profesores (id_solicitud, id_usuario, carnet_institucional_url, estado, motivo_rechazo, fecha_revision, id_admin_revisor, fecha_creacion, fecha_actualizacion) VALUES
(1,14,'https://cdn.example.com/carnets/juan_candidato.jpg','PENDIENTE',NULL,NULL,NULL,'2025-09-02 11:00:00','2025-09-02 11:00:00'),
(2,12,'https://cdn.example.com/carnets/alberto_rios.jpg','APROBADA',NULL,'2025-09-01 15:00:00',13,'2025-08-30 09:00:00','2025-09-01 15:00:00');

-- 17) Logs de actividad (ejemplos)
INSERT INTO logs_actividad (id_log, id_usuario, accion, tabla_afectada, id_registro_afectado, datos_anteriores, datos_nuevos, ip_address, user_agent, fecha_creacion) VALUES
(1,4,'LOGIN','usuarios',4,NULL,'{"login":"success"}','192.0.2.1','Mozilla/5.0','2025-09-02 08:10:00'),
(2,5,'COMPLETAR_MISION','usuario_misiones',3,NULL,'{"estado":"COMPLETADA"}','192.0.2.2','Mozilla/5.0','2025-08-28 14:00:00');

-- 18) Final message
SELECT 'SEED_COMPLETED' AS result;

-- End of seed script
