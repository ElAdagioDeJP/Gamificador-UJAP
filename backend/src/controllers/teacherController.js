const { sequelize } = require('../../models');

exports.listStudents = async (req, res, next) => {
  try {
    // Students enrolled in any subject coordinated by the teacher
    const teacherId = req.user.id;
    const [rows] = await sequelize.query(
      `SELECT DISTINCT u.id_usuario, u.nombre_completo, u.email_institucional, u.nivel, u.puntos_actuales,
              u.racha_dias_consecutivos, u.fecha_ultima_actividad
         FROM Usuarios u
         JOIN Inscripciones i ON i.id_usuario = u.id_usuario
         JOIN Materias m ON m.id_materia = i.id_materia
        WHERE m.id_profesor_coordinador = :teacherId
          AND u.rol = 'estudiante'`,
      { replacements: { teacherId } }
    );

    const data = rows.map((u) => ({
      id: u.id_usuario,
      name: u.nombre_completo,
      email: u.email_institucional,
      avatar: '/placeholder.svg?height=50&width=50',
      level: Number(u.nivel) || 1,
      points: Number(u.puntos_actuales) || 0,
      streak: Number(u.racha_dias_consecutivos) || 0,
      status: 'active',
      lastActivity: u.fecha_ultima_actividad || null,
    }));
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.listAssignments = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const [rows] = await sequelize.query(
      `SELECT m.id_mision, m.titulo, m.descripcion, m.puntos_recompensa, m.dificultad, m.id_materia_asociada,
              mat.nombre_materia, m.id_profesor_creador, m.tipo_mision
         FROM Misiones m
         JOIN Materias mat ON mat.id_materia = m.id_materia_asociada
        WHERE m.id_profesor_creador = :teacherId AND m.tipo_mision = 'TAREA'
        ORDER BY m.id_mision DESC`, { replacements: { teacherId } });

    const data = rows.map((r) => ({
      id: r.id_mision,
      title: r.titulo,
      description: r.descripcion,
      points: r.puntos_recompensa || 0,
      difficulty: (r.dificultad || 'BASICA').toLowerCase(),
      subject: r.nombre_materia,
      status: 'active',
      dueDate: null,
      createdAt: null,
      totalStudents: 0,
      submissions: 0,
    }));

    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.listSubmissions = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const missionId = req.query.assignmentId ? Number(req.query.assignmentId) : null;

    // Use Usuario_Misiones as "submissions" for now
    const [rows] = await sequelize.query(
      `SELECT um.id_mision, um.id_usuario, um.estado, um.fecha_completada, u.nombre_completo
         FROM Usuario_Misiones um
         JOIN Misiones m ON m.id_mision = um.id_mision
         JOIN Usuarios u ON u.id_usuario = um.id_usuario
        WHERE m.id_profesor_creador = :teacherId
          ${missionId ? 'AND um.id_mision = :missionId' : ''}
        ORDER BY um.fecha_completada DESC` , { replacements: { teacherId, missionId } });

    const data = rows.map((r, idx) => ({
      id: idx + 1,
      assignmentId: r.id_mision,
      studentId: r.id_usuario,
      studentName: r.nombre_completo,
      submittedAt: r.fecha_completada,
      status: r.estado === 'COMPLETADA' ? 'graded' : 'pending',
      grade: r.estado === 'COMPLETADA' ? 100 : null,
      feedback: r.estado === 'COMPLETADA' ? 'Entregado a tiempo.' : '',
      fileUrl: '#',
    }));

    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params; // synthetic id, not persisted yet
    const { grade, feedback } = req.body;
    // For now, acknowledge grading. In a full impl, persist to a Calificaciones table.
    res.json({ success: true, data: { id: Number(submissionId), grade, feedback, status: 'graded' } });
  } catch (e) { next(e); }
};

exports.getStats = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const [[counts]] = await sequelize.query(
      `SELECT 
        (SELECT COUNT(DISTINCT i.id_usuario)
           FROM Inscripciones i JOIN Materias m ON m.id_materia = i.id_materia
          WHERE m.id_profesor_coordinador = :teacherId) AS totalStudents,
        (SELECT COUNT(*) FROM Misiones WHERE id_profesor_creador = :teacherId AND tipo_mision = 'TAREA') AS totalAssignments,
        (SELECT COUNT(*) FROM Usuario_Misiones um JOIN Misiones mi ON mi.id_mision = um.id_mision WHERE mi.id_profesor_creador = :teacherId AND um.estado <> 'COMPLETADA') AS pendingSubmissions` , { replacements: { teacherId } });

    const averageGrade = 85; // placeholder metric
    res.json({ success: true, data: { totalStudents: Number(counts.totalStudents) || 0, activeStudents: Number(counts.totalStudents) || 0, totalAssignments: Number(counts.totalAssignments) || 0, pendingSubmissions: Number(counts.pendingSubmissions) || 0, averageGrade } });
  } catch (e) { next(e); }
};
