const jwt = require('jsonwebtoken');

function auth(required = true) {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.substring(7) : null;

      if (!token) {
        if (!required) return next();
        return res.status(401).json({ 
          success: false, 
          message: 'Token de acceso requerido' 
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET no está configurado');
        return res.status(500).json({ 
          success: false, 
          message: 'Error de configuración del servidor' 
        });
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      
      // Validar que el payload tenga la estructura esperada
      if (!payload.id) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token inválido: ID de usuario no encontrado' 
        });
      }

      // Support both 'role' and 'rol' in payload
      req.user = { 
        id: payload.id, 
        rol: payload.rol || payload.role || 'estudiante' 
      };
      
      next();
    } catch (error) {
      console.error('Error en autenticación:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expirado. Por favor, inicie sesión nuevamente' 
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token inválido' 
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Error de autenticación' 
      });
    }
  };
}

function requireRole(role) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'No autorizado: usuario no autenticado' 
        });
      }
      
      if (req.user.rol !== role) {
        return res.status(403).json({ 
          success: false, 
          message: `Acceso denegado. Se requiere rol: ${role}` 
        });
      }
      
      next();
    } catch (error) {
      console.error('Error en verificación de rol:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  };
}

module.exports = { auth, requireRole };
