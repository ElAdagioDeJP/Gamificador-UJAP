const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Usuario } = require('../../models');

function signToken(user) {
  return jwt.sign({ id: user.id_usuario, rol: user.rol || 'estudiante' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Validation error');
      err.status = 400;
      err.errors = errors.array();
      throw err;
    }

  const { username, email, password, name, rol, sexo } = req.body;

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
      const err = new Error('User already exists with same email or username');
      err.status = 409;
      throw err;
    }

    const user = await Usuario.create({
      nombre_usuario,
      nombre_completo,
      email_institucional,
      contrasena_hash: password,
      rol: rol || 'estudiante',
      sexo: (sexo === 'M' || sexo === 'F') ? sexo : null,
    });
    const token = signToken(user);

    res.status(201).json({ success: true, data: { user: user.toSafeJSON(), token } });
  } catch (e) {
    next(e);
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

    const user = await Usuario.findOne({ where: { email_institucional: email } });
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

    const token = signToken(user);
    res.json({ success: true, data: { user: user.toSafeJSON(), token } });
  } catch (e) {
    next(e);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await Usuario.findByPk(req.user.id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    res.json({ success: true, data: { user: user.toSafeJSON() } });
  } catch (e) {
    next(e);
  }
};
