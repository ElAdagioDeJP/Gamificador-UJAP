# Gamificador-UJAP

Plataforma de gamificación educativa para instituciones: misiones, duelos, calificaciones y gestión de usuarios con paneles para profesores y administradores. Frontend en React y backend en Node.js + Sequelize (MySQL).

Descripción breve
------------------
Gamificador-UJAP convierte actividades académicas en una experiencia gamificada: crea misiones, reta a estudiantes en duelos de preguntas, gestiona puntajes, insignias y reportes. Pensado para despliegues en universidades y colegios.

Características principales
-------------------------
- Misiones y preguntas por asignatura
- Duelos en tiempo real entre estudiantes
- Puntos, rankings y badges
- Panel de administración y panel docente
- Gestión de usuarios y perfiles (avatars, verificación, tema)
- API REST con autenticación JWT

Arquitectura
------------
- frontend/: React (SPA) con contexto de auth y servicios a la API
- backend/: Node.js + Express + Sequelize (MySQL)
- Base de datos: MySQL (esquema y migraciones incluidas en /backend)

Requisitos
---------
- Node.js 16+ (recomendado)
- MySQL 5.7+ o compatible
- npm o yarn

Instalación rápida (local)
-------------------------

Backend

1. Ir a la carpeta backend:

   cd backend

2. Instalar dependencias:

   npm install

3. Copiar variables de entorno y configurar `config/config.json` o `.env` según el entorno. Puedes partir de `.env.example`.

4. Crear la base de datos MySQL y ejecutar migraciones/seed (si aplica):

   # Asegúrate de haber configurado la conexión en backend/config/config.json
   node scripts/migrate.js
   node scripts/seedDB.js

5. Iniciar el servidor:

   npm start

Frontend

1. Ir a la carpeta frontend:

   cd frontend

2. Instalar dependencias:

   npm install

3. Configurar la URL de la API en `.env` (por ejemplo `REACT_APP_API_URL=http://localhost:5000/api`).

4. Iniciar la app de desarrollo:

   npm start

Variables de entorno importantes
-------------------------------
- BACKEND (ejemplos)
  - DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE
  - JWT_SECRET
  - PORT

- FRONTEND
  - REACT_APP_API_URL

Puntos operativos y scripts útiles (backend)
-------------------------------------------
- `node scripts/test-connection.js` — comprueba la conexión a la DB
- `node scripts/migrate.js` — aplica migraciones
- `node scripts/seedDB.js` — inserta datos de prueba
- `node scripts/create-admin.js` — crea un administrador
- `node scripts/system-check.js` — chequeos de sistema y schema

Notas sobre la base de datos
---------------------------
El backend incluye comprobaciones automáticas de esquema (ver `backend/src/config/db.js`) que intentan añadir columnas faltantes y alinear llaves foráneas para evitar errores de integridad en instalaciones existentes.

Contribuir
---------
1. Haz fork del repositorio
2. Crea una rama con un nombre claro (feature/bugfix)
3. Añade tests cuando correspondan
4. Envía un pull request describiendo los cambios

Licencia
--------
Este proyecto está bajo la licencia contenida en `LICENSE`.

Contacto
-------
Para dudas y despliegues empresariales, abre un issue o contacta al mantenedor del repositorio.

Gracias por probar Gamificador-UJAP — ¡haz el aprendizaje más divertido!

