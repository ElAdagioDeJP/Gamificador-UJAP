# 📋 Modal de Términos y Condiciones

## Descripción

El componente `TermsModal` es un modal completo y profesional que muestra los términos y condiciones de StudyBooster. Está diseñado para cumplir con estándares legales y de privacidad.

## Características

### ✅ **Cobertura Legal Completa**
- **16 secciones** que cubren todos los aspectos legales
- **Datos personales** recopilados y su uso
- **Sistema de gamificación** y sus implicaciones
- **Duelos y competencias** académicas
- **Integración con Google Calendar**
- **Códigos QR** y eventos
- **Conducta del usuario** y prohibiciones
- **Suspensión y terminación** de cuentas
- **Propiedad intelectual**
- **Limitación de responsabilidad**

### 🎨 **Diseño Profesional**
- **Modal responsivo** que se adapta a todos los dispositivos
- **Gradientes y colores** que mantienen la identidad visual
- **Animaciones suaves** y transiciones
- **Scroll personalizado** para contenido largo
- **Botones de acción** claros y accesibles

### 📱 **Responsive Design**
- **Desktop**: Modal completo con scroll
- **Tablet**: Ajustes de padding y tamaños
- **Mobile**: Modal de pantalla completa optimizado

## Uso

### Importación
```javascript
import TermsModal from '../components/common/TermsModal';
```

### Implementación Básica
```javascript
const [showTerms, setShowTerms] = useState(false);

return (
  <>
    <button onClick={() => setShowTerms(true)}>
      Ver Términos y Condiciones
    </button>
    
    <TermsModal 
      isOpen={showTerms} 
      onClose={() => setShowTerms(false)} 
    />
  </>
);
```

### En Página de Login
```javascript
// En el footer del login
<p className="terms-link-container">
  Al usar StudyBooster, aceptas nuestros{" "}
  <button 
    type="button" 
    className="terms-link" 
    onClick={() => setShowTerms(true)}
  >
    Términos y Condiciones
  </button>
</p>
```

## Estructura del Modal

### Header
- **Título**: "📋 Términos y Condiciones"
- **Botón de cierre**: X rojo con hover effects

### Body (16 Secciones)
1. **Aceptación de los Términos**
2. **Descripción del Servicio**
3. **Registro y Cuentas de Usuario**
4. **Datos Personales y Privacidad** ⭐
5. **Sistema de Gamificación** ⭐
6. **Duelos y Competencias**
7. **Misiones y Tareas Académicas**
8. **Códigos QR y Eventos**
9. **Integración con Google Calendar**
10. **Conducta del Usuario**
11. **Suspensión y Terminación**
12. **Propiedad Intelectual**
13. **Limitación de Responsabilidad**
14. **Modificaciones**
15. **Ley Aplicable**
16. **Contacto**

### Footer
- **Información de versión** y última actualización
- **Botones de acción**: "Cerrar" y "Entendido"

## Datos Cubiertos

### 🔐 **Datos Personales**
- Nombre completo, email institucional, nombre de usuario
- Datos académicos (materias, calificaciones, progreso)
- Datos de gamificación (puntos, nivel, experiencia, rachas)
- Datos de actividad (fechas, historial)
- Datos opcionales (sexo, avatar, universidad, carrera)
- Datos de integración (Google Calendar IDs)

### 🎮 **Funcionalidades Cubiertas**
- Sistema de puntos y experiencia
- Duelos individuales y por equipos
- Misiones diarias y tareas académicas
- Recompensas canjeables (físicas y académicas)
- Códigos QR para eventos
- Integración con Google Calendar
- Tablas de clasificación y logros
- Sistema de insignias y logros

## Estilos CSS

### Clases Principales
- `.terms-modal-overlay` - Overlay del modal
- `.terms-modal-content` - Contenedor principal
- `.terms-modal-header` - Header con título y botón cerrar
- `.terms-modal-body` - Cuerpo con scroll
- `.terms-section` - Secciones individuales
- `.terms-modal-footer` - Footer con botones

### Clases Especiales
- `.terms-link` - Enlace de términos en login
- `.terms-link-container` - Contenedor del enlace

## Personalización

### Colores
Los colores se basan en las variables CSS del tema:
- `--pixel-blue` - Color principal
- `--pixel-blue-dark` - Color hover
- `--pixel-text-light` - Texto secundario

### Responsive Breakpoints
- **Desktop**: > 768px
- **Tablet**: 768px - 480px
- **Mobile**: < 480px

## Cumplimiento Legal

### ✅ **Estándares Cubiertos**
- **GDPR** (General Data Protection Regulation)
- **LOPD** (Ley Orgánica de Protección de Datos)
- **Términos de servicio** estándar
- **Política de privacidad** completa
- **Consentimiento informado** para datos

### 📋 **Elementos Legales**
- Información de contacto completa
- Fecha de última actualización
- Versión del documento
- Ley aplicable (Venezuela)
- Proceso de modificación de términos

## Mantenimiento

### Actualizaciones
1. Modificar el contenido en `TermsModal.js`
2. Actualizar la fecha en la sección footer
3. Incrementar la versión si es necesario
4. Notificar a los usuarios sobre cambios

### Testing
- Verificar en diferentes dispositivos
- Probar el scroll en contenido largo
- Validar la accesibilidad
- Comprobar la impresión (media queries)

---

**¡El modal está listo para uso en producción! 🚀**
