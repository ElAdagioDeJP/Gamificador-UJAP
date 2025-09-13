const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { Usuario, sequelize } = require('../../models');

function signToken(user) {
  return jwt.sign({ id: user.id_usuario, rol: user.rol || 'estudiante' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de registro inválidos',
        errors: errors.array()
      });
    }

  const { username, email, password, name, rol, sexo, university, career, tema } = req.body;

    // Validaciones adicionales
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Map frontend fields to DB columns
    const nombre_usuario = username || email.split('@')[0];
    const nombre_completo = name || username || '';
    const email_institucional = email;

    // Check duplicates
    const exists = await Usuario.findOne({
      where: {
        [Op.or]: [
          { email_institucional },
          { nombre_usuario },
        ],
      },
    });
    
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con este email o nombre de usuario'
      });
    }

    const user = await Usuario.create({
      nombre_usuario,
      nombre_completo,
      email_institucional,
      contrasena_hash: password,
      rol: rol || 'estudiante',
      sexo: (sexo === 'M' || sexo === 'F') ? sexo : null,
      estado_verificacion: rol === 'profesor' ? 'PENDIENTE' : 'VERIFICADO',
      universidad: university || null,
      carrera: career || null,
      tema: tema || 'claro'
    });
    
    const token = signToken(user);

    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente',
      data: { 
        user: user.toSafeJSON(), 
        token 
      } 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Validation error');
      err.status = 400;
      err.errors = errors.array();
      throw err;
    }

    const { email, password } = req.body;

    let user;
    try {
      user = await Usuario.findOne({ where: { email_institucional: email } });
    } catch (err) {
      // Fallback when DB schema is not yet updated (missing columna tema)
      if (err && err.name === 'SequelizeDatabaseError' && err.parent && err.parent.code === 'ER_BAD_FIELD_ERROR') {
        // Select safe columns (exclude tema) and validate password manually
        const q = `SELECT id_usuario, nombre_usuario, nombre_completo, email_institucional, sexo, avatar_url, contrasena_hash, rol, puntos_actuales, experiencia_total, nivel, racha_dias_consecutivos, fecha_ultima_actividad, estado_verificacion, universidad, carrera, fecha_creacion FROM usuarios WHERE email_institucional = ? LIMIT 1`;
        const rows = await sequelize.query(q, { replacements: [email], type: sequelize.QueryTypes.SELECT });
        if (!rows || rows.length === 0) {
          const e = new Error('Invalid credentials');
          e.status = 401;
          throw e;
        }
        const row = rows[0];
        const ok = await bcrypt.compare(password, row.contrasena_hash);
        if (!ok) {
          const e = new Error('Invalid credentials');
          e.status = 401;
          throw e;
        }
        // Build response similar to previous flow
        const token = signToken({ id_usuario: row.id_usuario, rol: row.rol });
        // Remove sensitive fields
        delete row.contrasena_hash;
        return res.json({ success: true, data: { user: row, token } });
      }
      throw err;
    }

    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    // Verificar estado de verificación para profesores
    if (user.rol === 'profesor' && user.estado_verificacion === 'PENDIENTE') {
      return res.status(403).json({
        success: false,
        message: 'Su solicitud de profesor está pendiente de aprobación. Por favor, espere la confirmación de un administrador.',
        data: { 
          user: user.toSafeJSON(),
          verificationStatus: 'PENDING'
        }
      });
    }

    if (user.rol === 'profesor' && user.estado_verificacion === 'RECHAZADO') {
      return res.status(403).json({
        success: false,
        message: 'Su solicitud de profesor ha sido rechazada. Contacte al administrador para más información.',
        data: { 
          user: user.toSafeJSON(),
          verificationStatus: 'REJECTED'
        }
      });
    }

    const token = signToken(user);
    res.json({ success: true, data: { user: user.toSafeJSON(), token } });
  } catch (e) {
    next(e);
  }
};

exports.me = async (req, res, next) => {
  try {
    try {
      const user = await Usuario.findByPk(req.user.id);
      if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
      }
      return res.json({ success: true, data: { user: user.toSafeJSON() } });
    } catch (err) {
      if (err && err.name === 'SequelizeDatabaseError' && err.parent && err.parent.code === 'ER_BAD_FIELD_ERROR') {
        // Fallback raw select excluding tema
        const q = `SELECT id_usuario, nombre_usuario, nombre_completo, email_institucional, sexo, avatar_url, rol, puntos_actuales, experiencia_total, nivel, racha_dias_consecutivos, fecha_ultima_actividad, estado_verificacion, universidad, carrera, fecha_creacion FROM usuarios WHERE id_usuario = ? LIMIT 1`;
        const rows = await sequelize.query(q, { replacements: [req.user.id], type: sequelize.QueryTypes.SELECT });
        if (!rows || rows.length === 0) {
          const e = new Error('User not found');
          e.status = 404;
          throw e;
        }
        return res.json({ success: true, data: { user: rows[0] } });
      }
      throw err;
    }
  } catch (e) {
    next(e);
  }
};
