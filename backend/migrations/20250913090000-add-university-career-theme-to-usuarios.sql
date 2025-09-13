-- Migration: Add universidad, carrera, and tema to usuarios
-- Idempotent migration for MySQL
USE studybooster_db;

-- Add columns if they do not exist
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS universidad VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS carrera VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS tema VARCHAR(100) NULL;

-- Optional: populate some example values for existing seeded users
UPDATE usuarios SET universidad = 'UJAP', carrera = 'Ingeniería de Computación', tema = 'claro'
WHERE email_institucional IN ('ricardo.paredes@universidad.edu','carlos.mendez@universidad.edu') AND universidad IS NULL;

UPDATE usuarios SET universidad = 'UJAP', carrera = 'Ingeniería en Telecomunicaciones', tema = 'oscuro'
WHERE email_institucional IN ('ana.martinez@email.edu','luis.gonzalez@email.edu') AND universidad IS NULL;

-- For admin and other users set default tema
UPDATE usuarios SET tema = 'claro' WHERE tema IS NULL;

SELECT 'MIGRATION_ADD_UNIVERSITY_CAREER_THEME_DONE' AS result;
