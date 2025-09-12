# Sistema de Registro de Profesores con Verificación

## Descripción

Se ha implementado un sistema completo de registro de profesores que incluye:

1. **Registro diferenciado**: Los usuarios pueden elegir entre "Estudiante" o "Profesor" al registrarse
2. **Verificación de carnet**: Los profesores deben subir una imagen de su carnet institucional
3. **Sistema de aprobación**: Los administradores pueden aprobar o rechazar solicitudes de profesores
4. **Notificaciones elegantes**: Sistema de notificaciones moderno para informar el estado de las solicitudes

## Características Implementadas

### Backend
- ✅ Modelo `SolicitudProfesor` para manejar las solicitudes
- ✅ Campo `estado_verificacion` en el modelo `Usuario`
- ✅ Controlador para manejar solicitudes de profesores
- ✅ Rutas para registro, aprobación y rechazo de solicitudes
- ✅ Middleware de administrador
- ✅ Subida de archivos con validación
- ✅ Migración de base de datos

### Frontend
- ✅ Componente de registro actualizado con selección de rol
- ✅ Campo de subida de carnet institucional
- ✅ Componente de notificación elegante
- ✅ Panel de administración para aprobar profesores
- ✅ Manejo de estados de verificación en el login
- ✅ Servicio para comunicación con la API

## Instalación

### Backend

1. Instalar dependencias:
```bash
cd backend
npm install multer
```

2. Ejecutar migración:
```bash
npm run migrate
```

3. Reiniciar el servidor:
```bash
npm run dev
```

### Frontend

1. Instalar dependencias (si no están instaladas):
```bash
cd frontend
npm install
```

2. Iniciar el servidor:
```bash
npm start
```

## Uso

### Para Estudiantes
1. Ir a la página de registro
2. Seleccionar "Estudiante" como tipo de usuario
3. Completar el formulario normalmente
4. La cuenta se crea inmediatamente

### Para Profesores
1. Ir a la página de registro
2. Seleccionar "Profesor" como tipo de usuario
3. Subir una imagen del carnet institucional (JPEG, PNG o PDF, máx. 5MB)
4. Completar el formulario
5. Recibir notificación de que la solicitud fue enviada
6. Esperar aprobación del administrador

### Para Administradores
1. Iniciar sesión con una cuenta de administrador
2. Ir a `/admin/professor-requests`
3. Revisar las solicitudes pendientes
4. Ver el carnet institucional subido
5. Aprobar o rechazar la solicitud

## Estructura de Archivos

### Backend
```
backend/
├── models/
│   └── models.js (actualizado con nuevos modelos)
├── src/
│   ├── controllers/
│   │   └── professorRequestController.js (nuevo)
│   ├── middlewares/
│   │   └── adminMiddleware.js (nuevo)
│   ├── routes/
│   │   ├── professorRequestRoutes.js (nuevo)
│   │   └── index.js (actualizado)
│   └── controllers/
│       └── authController.js (actualizado)
├── migrations/
│   └── 20241201000000-add-professor-requests.js (nuevo)
└── public/
    └── uploads/
        └── carnets/ (directorio para archivos subidos)
```

### Frontend
```
frontend/src/
├── components/
│   └── common/
│       └── NotificationModal.js (nuevo)
├── pages/
│   ├── Register.js (actualizado)
│   ├── Login.js (actualizado)
│   └── admin/
│       └── ProfessorRequests.js (nuevo)
├── services/
│   └── professorRequestService.js (nuevo)
├── context/
│   └── AuthContext.js (actualizado)
└── styles/
    └── Auth.css (actualizado con estilos de subida de archivos)
```

## API Endpoints

### Registro de Profesores
- `POST /api/professor-requests/register` - Crear solicitud de profesor

### Administración
- `GET /api/professor-requests/pending` - Obtener solicitudes pendientes
- `PUT /api/professor-requests/:id/approve` - Aprobar solicitud
- `PUT /api/professor-requests/:id/reject` - Rechazar solicitud

### Usuario
- `GET /api/professor-requests/status` - Obtener estado de solicitud del usuario actual

## Estados de Verificación

- **VERIFICADO**: Usuario aprobado (estudiantes por defecto, profesores aprobados)
- **PENDIENTE**: Profesor esperando aprobación
- **RECHAZADO**: Profesor rechazado por administrador

## Notas Importantes

1. Los archivos de carnet se almacenan en `backend/public/uploads/carnets/`
2. Solo los administradores pueden aprobar/rechazar solicitudes
3. Los profesores no pueden iniciar sesión hasta ser aprobados
4. El sistema valida tipos de archivo (JPEG, PNG, PDF) y tamaño (máx. 5MB)
5. Las notificaciones son elegantes y no usan `alert()` nativo

## Próximos Pasos

- [ ] Agregar notificaciones por email cuando se apruebe/rechace una solicitud
- [ ] Implementar sistema de roles más granular
- [ ] Agregar historial de solicitudes
- [ ] Implementar notificaciones push
- [ ] Agregar validación de carnet institucional con OCR
