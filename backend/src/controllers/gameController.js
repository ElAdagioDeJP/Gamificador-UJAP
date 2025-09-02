const { sequelize, Usuario } = require('../../models');

function mapDifficulty(dbValue) {
  if (!dbValue) return 'medium';
  const m = { BASICA: 'easy', AVANZADA: 'medium', EPICA: 'hard' };
  return m[dbValue] || 'medium';
}

function defaultDeadline(tipo) {
  const d = new Date();
  if (tipo === 'DIARIA') return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString();
  d.setDate(d.getDate() + 7);
  return d.toISOString();
}

exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await Usuario.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    // Misiones del usuario con estado
    const [missions] = await sequelize.query(
      `SELECT m.id_mision, m.titulo, m.descripcion, m.tipo_mision, m.dificultad, m.puntos_recompensa,
              um.estado, um.fecha_completada
         FROM Misiones m
    LEFT JOIN Usuario_Misiones um ON um.id_mision = m.id_mision AND um.id_usuario = :userId`
      , { replacements: { userId } });

    const mappedMissions = missions.map(m => ({
      id: m.id_mision,
      title: m.titulo,
      description: m.descripcion,
      points: m.puntos_recompensa || 0,
      deadline: defaultDeadline(m.tipo_mision),
      completed: (m.estado === 'COMPLETADA'),
      difficulty: mapDifficulty(m.dificultad),
    }));

    // Skills: derivadas de materias inscritas y progreso (conteo de misiones completadas por materia)
    const [skillsRows] = await sequelize.query(
      `SELECT mat.nombre_materia,
              SUM(CASE WHEN um.estado = 'COMPLETADA' THEN 1 ELSE 0 END) AS completadas,
              COUNT(DISTINCT m.id_mision) AS total
         FROM Inscripciones i
         JOIN Materias mat ON mat.id_materia = i.id_materia
    LEFT JOIN Misiones m ON m.id_materia_asociada = mat.id_materia
    LEFT JOIN Usuario_Misiones um ON um.id_mision = m.id_mision AND um.id_usuario = :userId
        WHERE i.id_usuario = :userId
     GROUP BY mat.nombre_materia` , { replacements: { userId } });

    const skills = skillsRows.map((row, idx) => {
      const total = Number(row.total) || 0;
      const comp = Number(row.completadas) || 0;
      const progress = total ? Math.min(100, Math.round((comp / total) * 100)) : 0;
      const level = 1 + Math.floor(comp / 2);
      return { id: idx + 1, name: row.nombre_materia, level, progress };
    });

    // Duelos del usuario
    const [duels] = await sequelize.query(
      `SELECT d.id_duelo, d.tipo_duelo, d.id_materia, d.estado, d.id_ganador, dp.id_usuario, dp.puntuacion_final,
              mat.nombre_materia
         FROM Duelos d
         JOIN Duelo_Participantes dp ON dp.id_duelo = d.id_duelo
         JOIN Materias mat ON mat.id_materia = d.id_materia
        WHERE d.id_duelo IN (
                SELECT id_duelo FROM Duelo_Participantes WHERE id_usuario = :userId
              )
        ORDER BY d.id_duelo` , { replacements: { userId } });

    // Agrupar por duelo para obtener oponente y puntajes
    const duelsMap = new Map();
    for (const row of duels) {
      let entry = duelsMap.get(row.id_duelo);
      if (!entry) {
        entry = { id: row.id_duelo, subject: row.nombre_materia, status: row.estado, id_materia: row.id_materia, id_ganador: row.id_ganador, myScore: 0, opponentScore: 0, opponent: '' };
        duelsMap.set(row.id_duelo, entry);
      }
      if (row.id_usuario === userId) {
        entry.myScore = row.puntuacion_final || 0;
      } else {
        entry._opponentId = row.id_usuario;
        entry.opponentScore = row.puntuacion_final || 0;
      }
    }

    const opponentIds = [...duelsMap.values()].map(d => d._opponentId).filter(Boolean);
    let opponentsById = {};
    if (opponentIds.length) {
      const [opponents] = await sequelize.query(
        `SELECT id_usuario, nombre_completo FROM Usuarios WHERE id_usuario IN (:ids)` , { replacements: { ids: opponentIds } });
      opponentsById = Object.fromEntries(opponents.map(o => [o.id_usuario, o.nombre_completo]));
    }

    const mappedDuels = [...duelsMap.values()].map(d => {
      const status = d.status === 'FINALIZADO' ? 'completed' : 'active';
      let result;
      if (d.status === 'FINALIZADO') {
        result = (d.id_ganador === userId) ? 'won' : 'lost';
      }
      return { id: d.id, opponent: opponentsById[d._opponentId] || 'Desconocido', subject: d.subject, status, myScore: d.myScore, opponentScore: d.opponentScore, result };
    });

    const payload = {
      level: user.nivel || 1,
      points: user.puntos_actuales || 0,
      streak: user.racha_dias_consecutivos || 0,
      missions: mappedMissions,
      skills,
      duels: mappedDuels,
    };

    res.json({ success: true, data: payload });
  } catch (e) {
    next(e);
  }
};

exports.completeMission = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const missionId = Number(req.params.id);

    // Obtener recompensa
    const [[mission]] = await sequelize.query(`SELECT puntos_recompensa, experiencia_recompensa FROM Misiones WHERE id_mision = :missionId`, { replacements: { missionId } });
    if (!mission) return res.status(404).json({ success: false, message: 'Misión no encontrada' });

    await sequelize.transaction(async (t) => {
      // Upsert en Usuario_Misiones
      await sequelize.query(
        `INSERT INTO Usuario_Misiones (id_usuario, id_mision, fecha_completada, estado)
         VALUES (:userId, :missionId, NOW(), 'COMPLETADA')
         ON DUPLICATE KEY UPDATE estado = 'COMPLETADA', fecha_completada = NOW()`,
        { replacements: { userId, missionId }, transaction: t }
      );

      // Actualizar usuario: puntos, exp, racha
      await sequelize.query(
        `UPDATE Usuarios
            SET puntos_actuales = puntos_actuales + :puntos,
                experiencia_total = experiencia_total + :exp,
                racha_dias_consecutivos = racha_dias_consecutivos + 1,
                fecha_ultima_actividad = CURDATE()
          WHERE id_usuario = :userId`,
        { replacements: { userId, puntos: mission.puntos_recompensa || 0, exp: mission.experiencia_recompensa || 0 }, transaction: t }
      );
    });

    const [[u]] = await sequelize.query(`SELECT puntos_actuales FROM Usuarios WHERE id_usuario = :userId`, { replacements: { userId } });
    res.json({ success: true, data: { pointsEarned: mission.puntos_recompensa || 0, newTotal: u.puntos_actuales, streakBonus: 0 } });
  } catch (e) {
    next(e);
  }
};
