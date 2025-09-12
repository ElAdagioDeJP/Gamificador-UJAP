# 🐍 Sistema de Modelos Estilo Django

Este proyecto ahora usa un sistema de modelos centralizado similar a Django, donde **todos los modelos están en un solo archivo** y las migraciones se generan automáticamente.

## 📁 **Estructura del Sistema**

```
backend/
├── models.js              # 🎯 ARCHIVO PRINCIPAL - Todos los modelos aquí
├── models/
│   ├── index.js           # Carga el archivo centralizado
│   ├── Usuario.js         # ❌ DEPRECADO - Usar models.js
│   ├── PreguntaDuelo.js   # ❌ DEPRECADO - Usar models.js
│   └── RespuestaDuelo.js  # ❌ DEPRECADO - Usar models.js
└── scripts/
    └── regenerate-migrations.js  # Genera migraciones desde models.js
```

## 🚀 **Comandos Principales**

### **Desarrollo Normal**
```bash
# Iniciar servidor
npm run dev

# Verificar base de datos
npm run db:check
```

### **Gestión de Modelos (Estilo Django)**
```bash
# Regenerar migraciones desde models.js
npm run migrate:regenerate

# Aplicar migraciones
npm run migrate

# Resetear y aplicar todo de una vez
npm run migrate:full
```

### **Configuración Inicial**
```bash
# Configuración completa
npm run db:setup

# Solo sincronizar IPs
npm run sync:ip
```

## 🎯 **Cómo Trabajar con Modelos**

### **1. Modificar Modelos**
Edita el archivo `backend/models.js`:

```javascript
// Ejemplo: Agregar campo a Usuario
models.Usuario = sequelize.define('Usuario', {
  // ... campos existentes ...
  
  // NUEVO CAMPO
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  
  // ... resto de campos ...
}, {
  tableName: 'usuarios',
  // ... resto de configuración ...
});
```

### **2. Regenerar Migraciones**
```bash
npm run migrate:regenerate
```

### **3. Aplicar Cambios**
```bash
npm run migrate:full
```

## 📊 **Modelos Disponibles**

### **Modelos Principales**
- `Usuario` - Usuarios del sistema
- `Materia` - Materias académicas
- `Inscripcion` - Inscripciones de estudiantes
- `Mision` - Misiones y tareas
- `UsuarioMision` - Progreso de misiones

### **Modelos de Duelos**
- `Duelo` - Duelos entre usuarios
- `DueloParticipante` - Participantes en duelos
- `PreguntaDuelo` - Preguntas del sistema antiguo
- `RespuestaDuelo` - Respuestas del sistema antiguo
- `PreguntaDueloNuevo` - Preguntas del nuevo sistema
- `RespuestaDueloNuevo` - Respuestas del nuevo sistema

### **Modelos de Gamificación**
- `Insignia` - Insignias/Logros
- `UsuarioInsignia` - Insignias obtenidas
- `RecompensaCanjeable` - Recompensas disponibles
- `UsuarioCanje` - Historial de canjes

### **Modelos de Utilidades**
- `CodigoQR` - Códigos QR
- `UsuarioEscaneoQR` - Escaneos de QR
- `TareaPersonal` - Tareas personales
- `ProfesorMateria` - Relación profesores-materias

## 🔗 **Relaciones Automáticas**

El sistema define automáticamente todas las relaciones:

```javascript
// Ejemplo de relaciones definidas
models.Usuario.hasMany(models.Inscripcion, { foreignKey: 'id_usuario' });
models.Materia.hasMany(models.Inscripcion, { foreignKey: 'id_materia' });
models.Usuario.hasMany(models.Mision, { foreignKey: 'id_profesor_creador' });
// ... y muchas más
```

## ⚠️ **Importante**

### **Archivos Deprecados**
Los archivos individuales en `models/` están **deprecados**:
- `Usuario.js` ❌
- `PreguntaDuelo.js` ❌  
- `RespuestaDuelo.js` ❌

**Usa siempre `models.js`** para hacer cambios.

### **Flujo de Trabajo**
1. **Modifica** `models.js`
2. **Regenera** con `npm run migrate:regenerate`
3. **Aplica** con `npm run migrate:full`

## 🎉 **Ventajas del Sistema**

✅ **Un solo archivo** para todos los modelos  
✅ **Relaciones automáticas** definidas  
✅ **Migraciones automáticas** desde modelos  
✅ **Sistema tipo Django** familiar  
✅ **Fácil mantenimiento** y cambios  
✅ **Consistencia** garantizada  

## 🚨 **Solución de Problemas**

### **Error: "Model not found"**
```bash
# Regenerar migraciones
npm run migrate:regenerate
npm run migrate:full
```

### **Error: "Table doesn't exist"**
```bash
# Resetear completamente
npm run migrate:reset
npm run migrate
```

### **Error: "Column doesn't exist"**
```bash
# Regenerar y aplicar
npm run migrate:full
```

---

**¡Disfruta del desarrollo estilo Django! 🐍✨**
