# 🚀 Sistema de Migraciones - StudyBooster

Este documento explica cómo usar el sistema de migraciones optimizado para el desarrollo rápido.

## 📋 Comandos Disponibles

### Configuración Inicial
```bash
# Configurar archivo .env con IP automática
npm run setup:env

# Configurar .env forzando sobrescritura
npm run setup:env:force

# Configuración completa (env + migración + admin)
npm run db:setup
```

### Migraciones
```bash
# Ejecutar migraciones
npm run migrate

# Ver estado de migraciones
npm run migrate:status

# Resetear base de datos completamente
npm run migrate:reset

# Crear nueva migración
npm run migrate:create -- nombre-de-la-migracion
```

### Desarrollo
```bash
# Iniciar servidor en modo desarrollo
npm run dev

# Crear usuario administrador
npm run seed:admin
```

## 🔧 Configuración del Archivo .env

El sistema automáticamente detecta tu IP local y configura las siguientes variables:

```env
# Configuración de Base de Datos
DATABASE_URL=mysql://root:@127.0.0.1:3306/studybooster_db
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=studybooster_db

# Configuración del Servidor
NODE_ENV=development
PORT=5000
SERVER_IP=192.168.1.100  # ← IP automática detectada

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# Socket.io
SOCKET_PORT=5001

# URLs de desarrollo
FRONTEND_URL=http://192.168.1.100:3000
BACKEND_URL=http://192.168.1.100:5000
```

## 🏗️ Estructura de Migraciones

```
backend/
├── migrations/           # Archivos de migración
├── seeders/            # Archivos de seeders
├── scripts/
│   ├── migrate.js      # Script principal de migración
│   └── setup-env.js    # Configuración automática de .env
└── .sequelizerc        # Configuración de Sequelize CLI
```

## 🚀 Flujo de Desarrollo Rápido

### 1. Configuración Inicial (Solo una vez)
```bash
cd backend
npm install
npm run db:setup
```

### 2. Desarrollo Diario
```bash
# Iniciar servidor
npm run dev

# Si necesitas resetear la DB
npm run migrate:reset
npm run migrate
```

### 3. Crear Nueva Migración
```bash
# Crear migración para nueva tabla
npm run migrate:create -- add-user-preferences

# Editar el archivo generado en migrations/
# Ejecutar migración
npm run migrate
```

## 📊 Tablas Creadas Automáticamente

### Usuarios
- `id`, `nombre`, `apellido`, `email`, `email_institucional`
- `password`, `sexo`, `avatar_url`, `rol`
- `puntos`, `nivel`, `experiencia`, `activo`
- `createdAt`, `updatedAt`

### PreguntaDuelos
- `id`, `pregunta`, `opcion_a`, `opcion_b`, `opcion_c`, `opcion_d`
- `respuesta_correcta`, `explicacion`, `materia`
- `dificultad`, `puntos`, `activo`
- `createdAt`, `updatedAt`

### RespuestaDuelos
- `id`, `usuario_id`, `pregunta_id`
- `respuesta_elegida`, `es_correcta`, `tiempo_respuesta`
- `puntos_obtenidos`, `createdAt`, `updatedAt`

## 🔍 Solución de Problemas

### Error de Conexión a Base de Datos
1. Verificar que MySQL esté ejecutándose
2. Verificar credenciales en `.env`
3. Verificar que la base de datos existe

### Error de Migración
```bash
# Ver estado actual
npm run migrate:status

# Resetear si es necesario
npm run migrate:reset
npm run migrate
```

### IP No Detectada Correctamente
```bash
# Forzar nueva configuración
npm run setup:env:force
```

## 💡 Consejos para Desarrollo

1. **Siempre usa migraciones** para cambios de esquema
2. **Nunca edites directamente** la base de datos en desarrollo
3. **Usa seeders** para datos de prueba
4. **Mantén las migraciones pequeñas** y específicas
5. **Prueba las migraciones** antes de hacer commit

## 🎯 Comandos de Producción

```bash
# Solo migraciones (sin seeders)
npm run migrate

# Verificar estado
npm run migrate:status
```

---

**¡Desarrollo rápido y eficiente! 🚀**
