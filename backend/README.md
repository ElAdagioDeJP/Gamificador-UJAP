# StudyBooster - Backend

API RESTful con Express y Sequelize (MySQL).

## Requisitos

- Node.js 18+
- MySQL en ejecución

## Configuración

1. Copia `.env.example` a `.env` y ajusta valores.
2. Instala dependencias.

## Scripts

- `npm run dev` inicia el servidor con nodemon.
- `npm start` inicia en modo producción.
- `npm run seed:admin` crea/actualiza un usuario admin por consola.

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`

## Notas

- Las contraseñas se hashean con bcrypt.
- JWT en header `Authorization: Bearer <token>`.
