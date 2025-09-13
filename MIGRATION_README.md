# 🚀 Migración a Base de Datos Optimizada

Este documento explica cómo migrar tu sistema actual a la nueva estructura de base de datos optimizada.

## 📋 Resumen de Cambios

### ✅ **Mejoras Implementadas:**

1. **Sistema de preguntas unificado** - Eliminada la duplicación entre sistemas antiguo y nuevo
2. **Campos faltantes agregados** - `universidad`, `carrera`, `codigo_materia`, etc.
3. **Índices optimizados** - Para consultas más rápidas
4. **Sistema de auditoría completo** - Logs de actividad y configuración
5. **Relaciones optimizadas** - Con CASCADE apropiado
6. **Vistas y procedimientos** - Para consultas complejas frecuentes
7. **Triggers automáticos** - Para actualización de niveles
8. **Configuración flexible** - Sistema de configuración dinámico

### 🗂️ **Archivos Creados:**

- `DataBase_OPTIMIZED.SQL` - Esquema completo optimizado
- `migration_to_optimized_db.sql` - Script de migración simple
- `update_sequelize_models.js` - Actualización de modelos Sequelize
- `install_optimized_db.js` - Instalador automático

## 🚀 Instalación Automática (Recomendada)

### Opción 1: Instalador Automático

```bash
# Desde el directorio raíz del proyecto
node install_optimized_db.js
```

El instalador automático:
- ✅ Verifica dependencias
- ✅ Crea backup de la base de datos
- ✅ Aplica la migración SQL
- ✅ Actualiza modelos de Sequelize
- ✅ Regenera migraciones
- ✅ Verifica la instalación

### Opción 2: Instalación Manual

#### Paso 1: Backup de la Base de Datos

```bash
# Crear backup
mysqldump -u root -p studybooster_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Paso 2: Aplicar Migración SQL

```bash
# Aplicar migración
mysql -u root -p studybooster_db < migration_to_optimized_db.sql
```

#### Paso 3: Actualizar Modelos de Sequelize

```bash
# Actualizar modelos
node update_sequelize_models.js
```

#### Paso 4: Regenerar Migraciones

```bash
cd backend
npm run migrate:regenerate
npm run migrate
```

#### Paso 5: Reiniciar Servidor

```bash
npm run dev
```

## 🔧 Configuración Post-Migración

### 1. **Credenciales del Administrador**

```
Email: admin@ujap.edu.ve
Contraseña: password
```

**⚠️ IMPORTANTE:** Cambia la contraseña inmediatamente después del primer login.

### 2. **Configuración del Sistema**

Accede al panel de administración y configura:

- **Materias:** Agrega las materias de tu universidad
- **Profesores:** Asigna profesores a materias
- **Configuraciones:** Ajusta parámetros del sistema
- **Recompensas:** Configura el catálogo de recompensas

### 3. **Variables de Entorno**

Verifica que tu archivo `.env` tenga:

```env
# Base de datos
DATABASE_URL=mysql://root:@127.0.0.1:3306/studybooster_db
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=studybooster_db

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# Servidor
NODE_ENV=development
PORT=5000
```

## 📊 Nuevas Funcionalidades

### 1. **Sistema de Preguntas Unificado**

```javascript
// Crear pregunta con opciones
const pregunta = await Pregunta.create({
  enunciado: "¿Cuál es la capital de Venezuela?",
  tipo_pregunta: "OPCION_MULTIPLE",
  dificultad: "FACIL",
  puntos: 10,
  id_materia: 1
});

// Agregar opciones
await OpcionRespuesta.bulkCreate([
  { id_pregunta: pregunta.id, texto_opcion: "Caracas", es_correcta: true, orden: 1 },
  { id_pregunta: pregunta.id, texto_opcion: "Valencia", es_correcta: false, orden: 2 },
  { id_pregunta: pregunta.id, texto_opcion: "Maracaibo", es_correcta: false, orden: 3 },
  { id_pregunta: pregunta.id, texto_opcion: "Barquisimeto", es_correcta: false, orden: 4 }
]);
```

### 2. **Sistema de Configuración Dinámico**

```javascript
// Obtener configuración
const config = await ConfiguracionSistema.findOne({
  where: { clave: 'puntos_por_nivel' }
});

// Actualizar configuración
await ConfiguracionSistema.update(
  { valor: '1500' },
  { where: { clave: 'puntos_por_nivel' } }
);
```

### 3. **Logs de Actividad**

```javascript
// Registrar actividad
await LogActividad.create({
  id_usuario: userId,
  accion: 'COMPLETAR_MISION',
  tabla_afectada: 'usuario_misiones',
  id_registro_afectado: misionId,
  ip_address: req.ip,
  user_agent: req.get('User-Agent')
});
```

### 4. **Vistas Optimizadas**

```sql
-- Ranking de usuarios
SELECT * FROM vista_ranking_usuarios LIMIT 10;

-- Estadísticas de misiones
SELECT * FROM vista_estadisticas_misiones WHERE id_usuario = 1;
```

## 🔍 Verificación de la Migración

### 1. **Verificar Tablas Creadas**

```sql
SHOW TABLES;
```

Deberías ver las nuevas tablas:
- `configuracion_sistema`
- `logs_actividad`
- `preguntas`
- `opciones_respuesta`
- `respuestas_usuario`

### 2. **Verificar Campos Agregados**

```sql
-- Verificar campos en usuarios
DESCRIBE usuarios;

-- Verificar campos en materias
DESCRIBE materias;
```

### 3. **Verificar Datos Iniciales**

```sql
-- Verificar administrador
SELECT * FROM usuarios WHERE rol = 'admin';

-- Verificar configuraciones
SELECT * FROM configuracion_sistema;

-- Verificar insignias
SELECT * FROM insignias;
```

## 🚨 Solución de Problemas

### Error: "Table doesn't exist"

```bash
# Verificar que la migración se aplicó correctamente
mysql -u root -p studybooster_db -e "SHOW TABLES;"
```

### Error: "Column doesn't exist"

```bash
# Verificar estructura de tabla
mysql -u root -p studybooster_db -e "DESCRIBE usuarios;"
```

### Error: "Model not found"

```bash
# Regenerar modelos
cd backend
npm run migrate:regenerate
npm run migrate
```

### Error de Conexión

```bash
# Verificar configuración
cd backend
npm run db:check
```

## 📈 Mejoras de Rendimiento

### 1. **Índices Optimizados**

La nueva estructura incluye índices optimizados para:
- Consultas por rol de usuario
- Búsquedas por estado de verificación
- Rankings por puntos
- Consultas por fechas

### 2. **Consultas Optimizadas**

```sql
-- Consulta optimizada para ranking
SELECT * FROM vista_ranking_usuarios 
WHERE posicion BETWEEN 1 AND 10;

-- Consulta optimizada para estadísticas
SELECT * FROM vista_estadisticas_misiones 
WHERE total_misiones > 5;
```

### 3. **Procedimientos Almacenados**

```sql
-- Completar misión automáticamente
CALL sp_completar_mision(1, 5, 8.5);

-- Actualizar nivel de usuario
CALL sp_actualizar_nivel_usuario(1);
```

## 🔄 Rollback (Si es Necesario)

### 1. **Restaurar Backup**

```bash
# Restaurar desde backup
mysql -u root -p studybooster_db < backup_YYYYMMDD_HHMMSS.sql
```

### 2. **Revertir Modelos**

```bash
# Restaurar backup de modelos
cd backend
cp models/models.js.backup models/models.js
```

## 📞 Soporte

Si encuentras problemas durante la migración:

1. **Revisa los logs** del servidor
2. **Verifica la conexión** a la base de datos
3. **Confirma que todos los archivos** estén en su lugar
4. **Ejecuta las verificaciones** mencionadas arriba

## 🎉 ¡Listo!

Una vez completada la migración, tendrás:

- ✅ Base de datos optimizada y escalable
- ✅ Sistema de preguntas unificado
- ✅ Mejor rendimiento en consultas
- ✅ Sistema de auditoría completo
- ✅ Configuración flexible
- ✅ Nuevas funcionalidades

**¡Disfruta de tu sistema gamificado optimizado! 🚀**
