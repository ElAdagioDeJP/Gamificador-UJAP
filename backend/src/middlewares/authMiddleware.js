const jwt = require('jsonwebtoken');
const { Usuario } = require('../../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro_aqui');
    const user = await Usuario.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }

    req.user = {
      id: user.id_usuario,
      rol: user.rol,
      email: user.email_institucional
    };
    
    next();
  } catch (error) {
    console.error('Error en auth middleware:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

// Middleware opcional (no requiere autenticación)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro_aqui');
      const user = await Usuario.findByPk(decoded.id);
      
      if (user) {
        req.user = {
          id: user.id_usuario,
          rol: user.rol,
          email: user.email_institucional
        };
      }
    }
    
    next();
  } catch (error) {
    // Si hay error, continuar sin usuario autenticado
    next();
  }
};

module.exports = { auth, optionalAuth };