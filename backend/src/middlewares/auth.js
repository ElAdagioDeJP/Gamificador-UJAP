const jwt = require('jsonwebtoken');

function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.substring(7) : null;

    if (!token) {
      if (!required) return next();
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  // Support both 'role' and 'rol' in payload
  req.user = { id: payload.id, role: payload.role || payload.rol };
      next();
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
  };
}

module.exports = { auth, requireRole };
