const { sequelize } = require('../../models');

exports.getLeaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const [rows] = await sequelize.query(
      `SELECT id_usuario, nombre_completo, puntos_actuales, nivel, avatar_url
         FROM Usuarios
        WHERE rol = 'estudiante' OR rol = 'user' OR rol IS NULL
        ORDER BY puntos_actuales DESC, nivel DESC
        LIMIT :limit`,
      { replacements: { limit } }
    );

    const data = rows.map((r) => ({
      id: r.id_usuario,
      name: r.nombre_completo,
      points: Number(r.puntos_actuales) || 0,
      level: Number(r.nivel) || 1,
  avatar: r.avatar_url || '/placeholder.svg?height=50&width=50',
    }));

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};
