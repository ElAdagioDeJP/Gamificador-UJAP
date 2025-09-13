-- Seed: Populate universidad and carrera for existing users
USE studybooster_db;

-- Example mappings by email (idempotent)
UPDATE usuarios SET universidad = 'UJAP', carrera = 'Ingeniería de Computación' WHERE email_institucional = 'carlos.mendez@universidad.edu' AND (universidad IS NULL OR universidad = '');
UPDATE usuarios SET universidad = 'UJAP', carrera = 'Ingeniería Civil' WHERE email_institucional = 'ricardo.paredes@universidad.edu' AND (universidad IS NULL OR universidad = '');
UPDATE usuarios SET universidad = 'UJAP', carrera = 'Ingeniería en Telecomunicaciones' WHERE email_institucional = 'ana.martinez@email.edu' AND (universidad IS NULL OR universidad = '');
UPDATE usuarios SET universidad = 'UJAP', carrera = 'Ingeniería de Computación' WHERE email_institucional = 'luis.gonzalez@email.edu' AND (universidad IS NULL OR universidad = '');

-- Fallback: set a default university for any user lacking it
UPDATE usuarios SET universidad = 'UJAP' WHERE universidad IS NULL OR universidad = '';

SELECT 'SEED_UNIVERSITY_CAREER_DONE' AS result;
