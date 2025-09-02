-- Usar la base de datos recién creada
USE studybooster_db;

-- Deshabilitar temporalmente la verificación de claves foráneas para evitar errores de orden
SET FOREIGN_KEY_CHECKS=0;

-- Limpiar tablas existentes antes de insertar nuevos datos (opcional, pero recomendado para ejecuciones limpias)
TRUNCATE TABLE Tareas_Personales;
TRUNCATE TABLE Usuario_Escaneos_QR;
TRUNCATE TABLE Codigos_QR;
TRUNCATE TABLE Usuario_Canjes;
TRUNCATE TABLE Recompensas_Canjeables;
TRUNCATE TABLE Usuario_Insignias;
TRUNCATE TABLE Insignias;
TRUNCATE TABLE Respuestas_Duelo;
TRUNCATE TABLE Preguntas_Duelo;
TRUNCATE TABLE Duelo_Participantes;
TRUNCATE TABLE Duelos;
TRUNCATE TABLE Usuario_Misiones;
TRUNCATE TABLE Misiones;
TRUNCATE TABLE Inscripciones;
TRUNCATE TABLE Materias;
TRUNCATE TABLE Profesores;
TRUNCATE TABLE Usuarios;

-- Habilitar nuevamente la verificación de claves foráneas
SET FOREIGN_KEY_CHECKS=1;

-- INICIO DE LA INSERCIÓN DE DATOS --

-- 1. Tabla de Profesores
-- Creamos primero a los profesores que coordinarán las materias.
INSERT INTO `Profesores` (`id_profesor`, `nombre_completo`, `email_institucional`) VALUES
(1, 'Dr. Ricardo Paredes', 'ricardo.paredes@universidad.edu'),
(2, 'Dra. Elena Villa', 'elena.villa@universidad.edu'),
(3, 'Ing. Carlos Mendez', 'carlos.mendez@universidad.edu'),
(4, 'Lic. Sofia Castillo', 'sofia.castillo@universidad.edu'),
(5, 'Dr. Alberto Rios', 'alberto.rios@universidad.edu');

-- 2. Tabla de Usuarios (Estudiantes y el rol de profesor)
-- La contraseña para todos es '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC'
INSERT INTO `Usuarios` (`id_usuario`, `nombre_usuario`, `nombre_completo`, `email_institucional`, `rol`, `contrasena_hash`, `puntos_actuales`, `experiencia_total`, `nivel`, `racha_dias_consecutivos`, `fecha_ultima_actividad`, `fecha_creacion`) VALUES
-- Profesores (con rol)
(1, 'profe_paredes', 'Dr. Ricardo Paredes', 'ricardo.paredes@universidad.edu', 'profesor', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 100, 1000, 10, 5, '2025-08-28', '2024-01-10 08:00:00'),
(2, 'profe_villa', 'Dra. Elena Villa', 'elena.villa@universidad.edu', 'profesor', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 100, 1000, 10, 3, '2025-08-27', '2024-01-10 08:05:00'),
(3, 'profe_mendez', 'Ing. Carlos Mendez', 'carlos.mendez@universidad.edu', 'profesor', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 100, 1000, 10, 10, '2025-08-29', '2024-01-10 08:10:00'),
-- Estudiantes
(4, 'ana_dev', 'Ana Martínez', 'ana.martinez@email.edu', 'estudiante', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 1520, 12500, 12, 15, '2025-08-29', '2024-02-01 10:20:00'),
(5, 'luis_gamer', 'Luis González', 'luis.gonzalez@email.edu', 'estudiante', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 850, 7800, 8, 3, '2025-08-28', '2024-02-01 11:00:00'),
(6, 'lau_estudia', 'Laura Rodríguez', 'laura.rodriguez@email.edu', 'estudiante', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 2300, 18900, 15, 32, '2025-08-29', '2024-02-02 09:00:00'),
(7, 'pedro_sql', 'Pedro Sánchez', 'pedro.sanchez@email.edu', 'estudiante', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 450, 3200, 4, 0, '2025-08-20', '2024-02-03 14:00:00'),
(8, 'sofia_red', 'Sofía Pérez', 'sofia.perez@email.edu', 'estudiante', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 1100, 9500, 9, 8, '2025-08-29', '2024-02-05 16:30:00'),
(9, 'david_pro', 'David Gómez', 'david.gomez@email.edu', 'estudiante', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 300, 2500, 3, 2, '2025-08-27', '2024-02-06 18:00:00'),
(10, 'maria_ux', 'María Díaz', 'maria.diaz@email.edu', 'estudiante', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 1800, 15000, 13, 20, '2025-08-29', '2024-02-10 12:00:00'),
(11, 'carlos_byte', 'Carlos Ruiz', 'carlos.ruiz@email.edu', 'estudiante', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 75, 500, 1, 0, '2025-08-15', '2024-03-01 09:45:00'),
(12, 'elena_code', 'Elena Fernández', 'elena.fernandez@email.edu', 'estudiante', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 920, 8100, 8, 5, '2025-08-29', '2024-03-02 11:15:00'),
(13, 'javier_net', 'Javier Moreno', 'javier.moreno@email.edu', 'estudiante', '$2a$10$Q5J5U59axMrmWnDTfcy5G..z9Dof3sJHOOGzb6i5LDOs3GwSN5.mC', 640, 5500, 6, 1, '2025-08-28', '2024-03-05 17:00:00');

-- 3. Tabla de Materias
-- Asignamos las materias a los profesores coordinadores.
INSERT INTO `Materias` (`id_materia`, `nombre_materia`, `id_profesor_coordinador`) VALUES
(1, 'Bases de Datos Avanzadas', 1),
(2, 'Inteligencia Artificial', 2),
(3, 'Desarrollo de Software Seguro', 3),
(4, 'Interacción Humano-Computador', 4),
(5, 'Redes Neuronales y Deep Learning', 2),
(6, 'Cálculo Multivariable', 5),
(7, 'Estructuras de Datos', 3),
(8, 'Física de Ondas', 1);

-- 4. Tabla de Inscripciones
-- Inscribimos a los estudiantes en varias materias para el período actual.
INSERT INTO `Inscripciones` (`id_usuario`, `id_materia`, `periodo_academico`) VALUES
(4, 1, '2025-02'), (4, 3, '2025-02'), (4, 7, '2025-02'),
(5, 2, '2025-02'), (5, 5, '2025-02'), (5, 4, '2025-02'),
(6, 1, '2025-02'), (6, 2, '2025-02'), (6, 3, '2025-02'), (6, 5, '2025-02'),
(7, 1, '2025-02'), (7, 6, '2025-02'), (7, 8, '2025-02'),
(8, 3, '2025-02'), (8, 4, '2025-02'), (8, 7, '2025-02'),
(9, 6, '2025-02'), (9, 8, '2025-02'),
(10, 4, '2025-02'), (10, 1, '2025-02'), (10, 2, '2025-02'),
(11, 7, '2025-02'), (11, 6, '2025-02'),
(12, 3, '2025-02'), (12, 5, '2025-02'), (12, 7, '2025-02'),
(13, 1, '2025-02'), (13, 8, '2025-02');

-- 5. Tabla de Misiones (Diarias y Tareas de Profesores)
INSERT INTO `Misiones` (`id_mision`, `titulo`, `descripcion`, `tipo_mision`, `dificultad`, `id_materia_asociada`, `id_profesor_creador`, `puntos_recompensa`, `experiencia_recompensa`, `bono_nota`, `req_nivel_minimo`, `req_racha_minima`) VALUES
-- Misiones Diarias
(1, 'Inicio de Sesión Diario', 'Ingresa a la plataforma para reclamar tu recompensa diaria.', 'DIARIA', NULL, NULL, NULL, 20, 50, 0.00, 1, 0),
(2, 'Completa tu primera tarea del día', 'Finaliza cualquier tarea o misión para ganar un bono.', 'DIARIA', NULL, NULL, NULL, 30, 100, 0.00, 1, 0),
(3, 'Duelo Amistoso', 'Reta a un compañero a un duelo de conocimiento.', 'DIARIA', NULL, NULL, NULL, 50, 150, 0.00, 2, 0),
-- Tareas de Bases de Datos Avanzadas
(4, 'Diseño de Modelo ER', 'Diseñar el Modelo Entidad-Relación para un sistema de biblioteca.', 'TAREA', 'BASICA', 1, 1, 100, 250, 0.00, 3, 0),
(5, 'Optimización de Consultas SQL', 'Analizar y optimizar 3 consultas SQL lentas proporcionadas en el material.', 'TAREA', 'AVANZADA', 1, 1, 250, 600, 0.50, 8, 5),
(6, 'Proyecto Final: Sharding', 'Implementar una estrategia de sharding en una base de datos de prueba con más de 1 millón de registros.', 'TAREA', 'EPICA', 1, 1, 800, 2000, 1.00, 12, 10),
-- Tareas de IA
(7, 'Implementar A*', 'Desarrollar un algoritmo A* para resolver un laberinto.', 'TAREA', 'BASICA', 2, 2, 120, 300, 0.00, 4, 0),
(8, 'Clasificador de Sentimientos', 'Crear un clasificador de sentimientos usando una red neuronal recurrente (RNN).', 'TAREA', 'AVANZADA', 5, 2, 300, 750, 0.50, 9, 0),
-- Tareas de Desarrollo Seguro
(9, 'Análisis de Vulnerabilidades XSS', 'Identificar y corregir 3 vulnerabilidades de Cross-Site Scripting (XSS) en una aplicación web de prueba.', 'TAREA', 'AVANZADA', 3, 3, 280, 700, 0.00, 7, 3),
-- Tareas de Cálculo
(10, 'Integrales Dobles', 'Resolver la lista de 10 problemas de integrales dobles sobre regiones generales.', 'TAREA', 'BASICA', 6, 5, 150, 400, 0.00, 2, 0);

-- 6. Progreso de Misiones por Usuario
INSERT INTO `Usuario_Misiones` (`id_usuario`, `id_mision`, `fecha_completada`, `estado`) VALUES
-- Ana (ID 4)
(4, 1, '2025-08-29 08:10:00', 'COMPLETADA'),
(4, 4, '2025-08-27 15:30:00', 'COMPLETADA'),
(4, 5, '2025-08-29 11:00:00', 'COMPLETADA'),
(4, 9, '2025-08-28 18:00:00', 'COMPLETADA'),
(4, 6, NOW(), 'EN_PROGRESO'),
-- Luis (ID 5)
(5, 1, '2025-08-28 09:00:00', 'COMPLETADA'),
(5, 7, '2025-08-26 12:00:00', 'COMPLETADA'),
(5, 8, NOW(), 'ASIGNADA'),
(5, 3, '2025-08-28 14:00:00', 'COMPLETADA'),
-- Laura (ID 6)
(6, 1, '2025-08-29 07:30:00', 'COMPLETADA'),
(6, 2, '2025-08-29 10:00:00', 'COMPLETADA'),
(6, 4, '2025-08-25 19:00:00', 'COMPLETADA'),
(6, 5, '2025-08-29 09:55:00', 'COMPLETADA'),
(6, 7, '2025-08-24 20:00:00', 'COMPLETADA'),
(6, 8, '2025-08-28 21:00:00', 'COMPLETADA'),
(6, 9, NOW(), 'EN_PROGRESO'),
-- Pedro (ID 7)
(7, 10, '2025-08-20 16:00:00', 'COMPLETADA');

-- 7. Banco de Preguntas para Duelos
INSERT INTO `Preguntas_Duelo` (`id_pregunta`, `id_materia`, `enunciado`, `dificultad`) VALUES
-- Bases de Datos (Materia 1)
(1, 1, '¿Qué forma normal garantiza que no haya dependencias transitivas?', 'NORMAL'),
(2, 1, '¿Cuál de las siguientes no es una propiedad ACID?', 'FACIL'),
(3, 1, 'En SQL, ¿qué cláusula se utiliza para filtrar los resultados de una función de agregación?', 'NORMAL'),
(4, 1, 'El proceso de dividir una base de datos grande en partes más pequeñas y manejables se llama...', 'DIFICIL'),
-- IA (Materia 2)
(5, 2, '¿Cuál de estos algoritmos es un ejemplo de aprendizaje no supervisado?', 'NORMAL'),
(6, 2, 'El "Test de Turing" se utiliza para medir...', 'FACIL'),
(7, 2, 'En un árbol de decisión, ¿qué métrica se usa comúnmente para medir la "pureza" de un nodo?', 'DIFICIL'),
-- Desarrollo Seguro (Materia 3)
(8, 3, '¿Qué tipo de ataque implica insertar scripts maliciosos en sitios web confiables?', 'FACIL'),
(9, 3, 'El principio de "menor privilegio" en seguridad significa...', 'NORMAL');

-- 8. Respuestas a las Preguntas
INSERT INTO `Respuestas_Duelo` (`id_pregunta`, `texto_respuesta`, `es_correcta`) VALUES
-- Pregunta 1
(1, 'Primera Forma Normal (1FN)', 0), (1, 'Segunda Forma Normal (2FN)', 0), (1, 'Tercera Forma Normal (3FN)', 1), (1, 'Forma Normal de Boyce-Codd (FNBC)', 0),
-- Pregunta 2
(2, 'Atomicidad', 0), (2, 'Consistencia', 0), (2, 'Aislamiento', 0), (2, 'Disponibilidad', 1),
-- Pregunta 3
(3, 'WHERE', 0), (3, 'HAVING', 1), (3, 'FILTER', 0), (3, 'GROUP BY', 0),
-- Pregunta 4
(4, 'Replicación', 0), (4, 'Indexación', 0), (4, 'Normalización', 0), (4, 'Sharding (Fragmentación)', 1),
-- Pregunta 5
(5, 'Regresión Lineal', 0), (5, 'K-Means', 1), (5, 'Máquinas de Vectores de Soporte (SVM)', 0), (5, 'Red Neuronal Convolucional (CNN)', 0),
-- Pregunta 6
(6, 'La velocidad de un procesador', 0), (6, 'La inteligencia de una máquina', 1), (6, 'La seguridad de un sistema', 0), (6, 'La eficiencia de un algoritmo', 0),
-- Pregunta 7
(7, 'Precisión (Accuracy)', 0), (7, 'Raíz del error cuadrático medio (RMSE)', 0), (7, 'Ganancia de Información (Information Gain)', 1), (7, 'Puntuación F1 (F1-Score)', 0),
-- Pregunta 8
(8, 'Inyección SQL', 0), (8, 'Cross-Site Scripting (XSS)', 1), (8, 'Denegación de Servicio (DoS)', 0), (8, 'Man-in-the-Middle (MITM)', 0),
-- Pregunta 9
(9, 'Dar a todos los usuarios acceso de administrador', 0), (9, 'Ocultar el código fuente del programa', 0), (9, 'Otorgar solo los permisos necesarios para realizar una tarea', 1), (9, 'Usar siempre el protocolo HTTPS', 0);

-- 9. Duelos
INSERT INTO `Duelos` (`id_duelo`, `tipo_duelo`, `id_materia`, `estado`, `id_ganador`, `puntos_apostados`) VALUES
(1, 'CLASICO', 1, 'FINALIZADO', 4, 100),
(2, 'CLASICO', 2, 'FINALIZADO', 6, 50),
(3, 'COOPERATIVO', 3, 'FINALIZADO', NULL, 75), -- En cooperativo, el ganador podría manejarse a nivel de equipo
(4, 'CLASICO', 1, 'EN_JUEGO', NULL, 200),
(5, 'CLASICO', 5, 'PENDIENTE', NULL, 150);

-- 10. Participantes en Duelos
INSERT INTO `Duelo_Participantes` (`id_duelo`, `id_usuario`, `equipo`, `puntuacion_final`) VALUES
-- Duelo 1 (Ana vs Pedro)
(1, 4, NULL, 500), -- Ana, ganadora
(1, 7, NULL, 300), -- Pedro
-- Duelo 2 (Laura vs Luis)
(2, 6, NULL, 450), -- Laura, ganadora
(2, 5, NULL, 400),
-- Duelo 3 (Cooperativo: Ana y Sofía vs Laura y María)
(3, 4, 'Equipo Alfa', 800), -- Equipo ganador
(3, 8, 'Equipo Alfa', 800), -- Equipo ganador
(3, 6, 'Equipo Beta', 750),
(3, 10, 'Equipo Beta', 750),
-- Duelo 4 (En juego: Elena vs Javier)
(4, 12, NULL, 0),
(4, 13, NULL, 0),
-- Duelo 5 (Pendiente: Luis vs David)
(5, 5, NULL, 0),
(5, 9, NULL, 0);

-- 11. Insignias (Logros)
INSERT INTO `Insignias` (`id_insignia`, `nombre`, `descripcion`, `icono_url`, `id_mision_desbloqueo`) VALUES
(1, 'Maestro de SQL', 'Otorgada por completar la misión épica de Sharding.', 'https/cdn.example.com/icons/sql_master.png', 6),
(2, 'Arquitecto de IA', 'Otorgada por crear un clasificador de sentimientos avanzado.', 'https/cdn.example.com/icons/ai_architect.png', 8),
(3, 'Guardián Digital', 'Otorgada por resolver la misión de vulnerabilidades XSS.', 'https/cdn.example.com/icons/guardian.png', 9),
(4, 'Racha Imparable', 'Mantén una racha de 30 días consecutivos.', 'https/cdn.example.com/icons/streak_30.png', NULL),
(5, 'Duelista Legendario', 'Gana 20 duelos Clásicos.', 'https/cdn.example.com/icons/duelist.png', NULL);

-- 12. Insignias Obtenidas por Usuario
INSERT INTO `Usuario_Insignias` (`id_usuario`, `id_insignia`, `fecha_obtencion`) VALUES
(6, 2, '2025-08-28 21:05:00'), -- Laura obtuvo la insignia de IA
(4, 3, '2025-08-28 18:10:00'), -- Ana obtuvo la insignia de Guardián Digital
(6, 4, '2025-08-27 08:00:00'); -- Laura tiene una racha de más de 30 días

-- 13. Catálogo de Recompensas Canjeables
INSERT INTO `Recompensas_Canjeables` (`id_recompensa`, `nombre`, `descripcion`, `tipo_recompensa`, `costo_en_puntos`, `stock`, `requiere_aprobacion_docente`) VALUES
(1, 'Taza Oficial de StudyBooster', 'Una taza de cerámica con el logo de la aplicación.', 'FISICA', 1500, 50, 0),
(2, 'Punto extra en parcial', 'Canjea 1 punto completo para sumarlo a la nota de tu próximo examen parcial.', 'ACADEMICA', 2500, NULL, 1),
(3, 'Consulta de 30 min con Profesor', 'Reserva una sesión de tutoría individual con uno de tus profesores.', 'ACADEMICA', 1800, 20, 1),
(4, 'Extensión de entrega (24h)', 'Obtén 24 horas adicionales para entregar una tarea.', 'ACADEMICA', 1000, NULL, 1),
(5, 'Sudadera de la Universidad', 'Sudadera con el logo de la facultad de ingeniería.', 'FISICA', 4000, 25, 0);

-- 14. Historial de Canjes de Recompensas
INSERT INTO `Usuario_Canjes` (`id_usuario`, `id_recompensa`, `puntos_gastados`, `fecha_canje`, `estado_aprobacion`) VALUES
(6, 1, 1500, '2025-08-20 10:00:00', 'APROBADO'), -- Laura canjeó una taza
(10, 4, 1000, '2025-08-26 14:00:00', 'PENDIENTE'), -- María pidió una extensión
(4, 3, 1800, '2025-08-28 11:30:00', 'APROBADO'); -- Ana tuvo una tutoría

-- 15. Códigos QR
INSERT INTO `Codigos_QR` (`codigo_hash`, `descripcion`, `puntos_recompensa`, `experiencia_recompensa`, `fecha_expiracion`, `usos_maximos`) VALUES
('hash_qr_biblioteca_semana5', 'QR Biblioteca Semana 5 - Zona de Estudio', 50, 100, '2025-09-30 23:59:59', 100),
('hash_qr_evento_ia_2025', 'QR Charla "El Futuro de la IA" - Agosto 2025', 150, 400, '2025-08-30 23:59:59', 200),
('hash_qr_cafeteria_descuento', 'QR Cafetería - Bono de Lealtad', 25, 50, '2025-10-15 23:59:59', 500);

-- 16. Registro de escaneos de QR por usuario
INSERT INTO `Usuario_Escaneos_QR` (`id_usuario`, `id_qr`) VALUES
(4, 1), (6, 1), (10, 1), -- Varios escanearon el QR de la biblioteca
(5, 2), (6, 2), -- Luis y Laura fueron al evento de IA
(8, 3); -- Sofía escaneó el de la cafetería

-- 17. Tareas personales
INSERT INTO `Tareas_Personales` (`id_usuario`, `titulo`, `descripcion`, `fecha_vencimiento`, `estado`, `google_calendar_event_id`) VALUES
(4, 'Estudiar para el parcial de BD', 'Repasar los temas de normalización y transacciones. Capítulos 3 y 4 del libro.', '2025-09-10 18:00:00', 'PENDIENTE', 'evt_google_ana_1'),
(4, 'Terminar laboratorio de Redes', 'Completar la configuración del switch y documentar los resultados.', '2025-09-05 23:59:00', 'PENDIENTE', NULL),
(6, 'Preparar presentación de IA', 'Crear las diapositivas para el proyecto de clasificación de imágenes.', '2025-09-12 12:00:00', 'PENDIENTE', 'evt_google_laura_1'),
(10, 'Leer paper de UX', 'Leer el paper "10 Heurísticas de Usabilidad de Nielsen" para la clase de IHC.', '2025-09-02 20:00:00', 'COMPLETADA', NULL);

-- FIN DE LA INSERCIÓN --