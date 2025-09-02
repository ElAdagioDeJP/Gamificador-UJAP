const { sequelize } = require('../../models');

exports.getStudentSubjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [subjects] = await sequelize.query(
      `SELECT m.id_materia, m.nombre_materia
         FROM Inscripciones i
         JOIN Materias m ON m.id_materia = i.id_materia
        WHERE i.id_usuario = :userId
        ORDER BY m.nombre_materia`, { replacements: { userId } });

    const subjectIds = subjects.map(s => s.id_materia);
    let professorsBySubject = {};
    let assignmentsBySubject = {};

    if (subjectIds.length) {
      const [professors] = await sequelize.query(
        `SELECT pm.id_materia, u.id_usuario, u.nombre_completo, u.email_institucional, u.avatar_url
           FROM Profesor_Materias pm
           JOIN Usuarios u ON u.id_usuario = pm.id_profesor
          WHERE pm.id_materia IN (:ids)` , { replacements: { ids: subjectIds } });
      professorsBySubject = professors.reduce((acc, p) => {
        acc[p.id_materia] = acc[p.id_materia] || [];
        acc[p.id_materia].push({ id: p.id_usuario, name: p.nombre_completo, email: p.email_institucional, avatar: p.avatar_url || null });
        return acc;
      }, {});

      const [assignments] = await sequelize.query(
        `SELECT id_mision, titulo, descripcion, puntos_recompensa, experiencia_recompensa, peso_en_calificacion, dificultad, id_materia_asociada
           FROM Misiones
          WHERE tipo_mision = 'TAREA' AND id_materia_asociada IN (:ids)
          ORDER BY id_mision DESC` , { replacements: { ids: subjectIds } });
      assignmentsBySubject = assignments.reduce((acc, a) => {
        acc[a.id_materia_asociada] = acc[a.id_materia_asociada] || [];
        acc[a.id_materia_asociada].push({ id: a.id_mision, title: a.titulo, description: a.descripcion, points: a.puntos_recompensa || 0, exp: a.experiencia_recompensa || 0, weight: Number(a.peso_en_calificacion) || 0, difficulty: (a.dificultad || 'BASICA').toLowerCase() });
        return acc;
      }, {});
    }

    const data = subjects.map(s => ({
      id: s.id_materia,
      name: s.nombre_materia,
      professors: professorsBySubject[s.id_materia] || [],
      assignments: assignmentsBySubject[s.id_materia] || [],
    }));

    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.getTeacherSubjects = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const [subjects] = await sequelize.query(
      `SELECT m.id_materia, m.nombre_materia
         FROM Profesor_Materias pm
         JOIN Materias m ON m.id_materia = pm.id_materia
        WHERE pm.id_profesor = :teacherId
        ORDER BY m.nombre_materia` , { replacements: { teacherId } });

    const subjectIds = subjects.map(s => s.id_materia);
    let assignmentsBySubject = {};
    if (subjectIds.length) {
      const [assignments] = await sequelize.query(
        `SELECT id_mision, titulo, descripcion, puntos_recompensa, experiencia_recompensa, peso_en_calificacion, dificultad, id_materia_asociada
           FROM Misiones
          WHERE tipo_mision = 'TAREA' AND id_profesor_creador = :teacherId AND id_materia_asociada IN (:ids)
          ORDER BY id_mision DESC` , { replacements: { teacherId, ids: subjectIds } });
      assignmentsBySubject = assignments.reduce((acc, a) => {
        acc[a.id_materia_asociada] = acc[a.id_materia_asociada] || [];
        acc[a.id_materia_asociada].push({ id: a.id_mision, title: a.titulo, description: a.descripcion, points: a.puntos_recompensa || 0, exp: a.experiencia_recompensa || 0, weight: Number(a.peso_en_calificacion) || 0, difficulty: (a.dificultad || 'BASICA').toLowerCase() });
        return acc;
      }, {});
    }

    const data = subjects.map(s => ({
      id: s.id_materia,
      name: s.nombre_materia,
      assignments: assignmentsBySubject[s.id_materia] || [],
    }));

    res.json({ success: true, data });
  } catch (e) { next(e); }
};
