const { sequelize } = require('../../models');

// Helpers
function mapDifficultyClientToDB(diff = 'medium') {
  const map = { easy: 'BASICA', medium: 'AVANZADA', hard: 'EPICA' };
  return map[diff] || 'AVANZADA';
}

// Create a mission (NORMAL or DIARIA). Daily missions must include 4-5 questions with single correct option each.
exports.createMission = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { title, description, type = 'NORMAL', points = 0, difficulty = 'medium', subjectId = null, questions = [] } = req.body;

    if (!title) return res.status(400).json({ success: false, message: 'Título requerido' });
    if (type === 'DIARIA') {
      if (!Array.isArray(questions) || questions.length < 4 || questions.length > 5) {
        return res.status(400).json({ success: false, message: 'La misión diaria requiere entre 4 y 5 preguntas' });
      }
      // Defensive iteration: ensure we only iterate when questions is an array
      for (const q of Array.isArray(questions) ? questions : []) {
        if (!q || !q.text || !Array.isArray(q.options) || q.options.length < 2) {
          return res.status(400).json({ success: false, message: 'Cada pregunta necesita texto y al menos 2 opciones' });
        }
        const correctCount = (Array.isArray(q.options) ? q.options : []).filter(o => o && o.correct).length;
        if (correctCount !== 1) {
          return res.status(400).json({ success: false, message: 'Cada pregunta debe tener exactamente una respuesta correcta' });
        }
      }
    }

    // Insert mission. Use RETURNING only for Postgres; MySQL/SQLite require INSERT + LAST_INSERT_ID()
    let mission;
    const replacements = { titulo: title, descripcion: description || '', tipo: type === 'DIARIA' ? 'DIARIA' : 'TAREA', puntos: points, dificultad: mapDifficultyClientToDB(difficulty), prof: teacherId, materia: subjectId };
    const dialect = sequelize.getDialect();
    if (/postgres|pg/i.test(dialect)) {
      const [[m]] = await sequelize.query(
        `INSERT INTO Misiones (titulo, descripcion, tipo_mision, puntos_recompensa, dificultad, id_profesor_creador, id_materia_asociada)
         VALUES (:titulo, :descripcion, :tipo, :puntos, :dificultad, :prof, :materia)
         RETURNING id_mision, titulo`,
        { replacements }
      );
      mission = m;
    } else {
      // MySQL/SQLite path: simple insert then read last insert id
      await sequelize.query(
        `INSERT INTO Misiones (titulo, descripcion, tipo_mision, puntos_recompensa, dificultad, id_profesor_creador, id_materia_asociada)
         VALUES (:titulo, :descripcion, :tipo, :puntos, :dificultad, :prof, :materia)`,
        { replacements }
      );
      const [[row]] = await sequelize.query('SELECT LAST_INSERT_ID() AS id_mision');
      mission = { id_mision: row.id_mision, titulo: title };
    }

    if (type === 'DIARIA') {
      // Persist questions & options in custom tables (create if not exist)
      await ensureQuestionTables();
      // Defensive iteration: only insert when questions is an array
      for (const q of Array.isArray(questions) ? questions : []) {
        const [[qRow]] = await sequelize.query(
          `INSERT INTO Misiones_Preguntas (id_mision, texto)
           VALUES (:missionId, :texto)`, { replacements: { missionId: mission.id_mision, texto: q && q.text ? q.text : '' } }
        );
        // MySQL returns no row; fetch id
        let questionId = qRow?.id_pregunta;
        if (!questionId) {
          const [[last]] = await sequelize.query('SELECT id_pregunta FROM Misiones_Preguntas WHERE id_mision = :m ORDER BY id_pregunta DESC LIMIT 1', { replacements: { m: mission.id_mision } });
          questionId = last.id_pregunta;
        }
        // Defensive: only iterate options when it's an array
        for (const opt of Array.isArray(q && q.options) ? q.options : []) {
          await sequelize.query(
            `INSERT INTO Misiones_Preguntas_Opciones (id_pregunta, texto_opcion, es_correcta)
             VALUES (:pid, :texto, :correcta)`,
            { replacements: { pid: questionId, texto: opt && opt.text ? opt.text : '', correcta: opt && opt.correct ? 1 : 0 } }
          );
        }
      }
    }

    // If the mission is a normal task (TAREA) and associated to a subject, auto-assign to all active enrollments
    const assigned = Array.isArray(req.body.assignedStudentIds) ? req.body.assignedStudentIds.map(Number).filter(Boolean) : [];
    if (type !== 'DIARIA') {
      await sequelize.transaction(async (t) => {
        if (subjectId) {
          // Ensure teacher coordinates this subject
          const [[coord]] = await sequelize.query(
            `SELECT id_materia FROM Profesor_Materias WHERE id_materia = :s AND id_profesor = :p`,
            { replacements: { s: subjectId, p: teacherId }, transaction: t }
          );
          if (!coord) {
            // Do not auto-assign if teacher doesn't coordinate subject; respond with created but note no assignments
            return;
          }
          // Select all active enrollments for the subject
          const [students] = await sequelize.query(
            `SELECT id_usuario FROM Inscripciones WHERE id_materia = :s AND estado = 'ACTIVA'`,
            { replacements: { s: subjectId }, transaction: t }
          );
          if (students && students.length) {
            const values = students.map(r => `(${Number(r.id_usuario)}, ${mission.id_mision}, 'ASIGNADA')`).join(',');
            await sequelize.query(
              `INSERT INTO Usuario_Misiones (id_usuario, id_mision, estado)
               VALUES ${values}
               ON DUPLICATE KEY UPDATE estado = 'ASIGNADA'`,
              { transaction: t }
            );
          }
        } else if (assigned.length) {
          // Fallback: teacher explicitly provided student ids (for non-subject tasks)
          const values = assigned.map(id => `(${id}, ${mission.id_mision}, 'ASIGNADA')`).join(',');
          await sequelize.query(
            `INSERT INTO Usuario_Misiones (id_usuario, id_mision, estado)
             VALUES ${values}
             ON DUPLICATE KEY UPDATE estado = 'ASIGNADA'`,
            { transaction: t }
          );
        }
      });
    }

    res.status(201).json({ success: true, data: { id: mission.id_mision, title } });
  } catch (e) { next(e); }
};

exports.listMissions = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { type } = req.query; // DIARIA or NORMAL
    const tipo = type === 'DIARIA' ? 'DIARIA' : 'TAREA';
    const [rows] = await sequelize.query(
      `SELECT id_mision, titulo, descripcion, tipo_mision, puntos_recompensa, dificultad, fecha_creacion
         FROM Misiones
        WHERE id_profesor_creador = :prof AND tipo_mision = :tipo
        ORDER BY id_mision DESC`, { replacements: { prof: teacherId, tipo } });
    res.json({ success: true, data: rows.map(r => ({ id: r.id_mision, title: r.titulo, description: r.descripcion, type: r.tipo_mision, points: r.puntos_recompensa || 0, difficulty: r.dificultad, createdAt: r.fecha_creacion })) });
  } catch (e) { next(e); }
};

// Update a mission (teacher only)
exports.updateMission = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const missionId = Number(req.params.missionId);
    const { title, description, points, difficulty, subjectId } = req.body;

    // Validate mission belongs to teacher
    const [[existing]] = await sequelize.query(`SELECT id_mision FROM Misiones WHERE id_mision = :m AND id_profesor_creador = :t`, { replacements: { m: missionId, t: teacherId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Misión no encontrada o sin permiso' });

    const updates = [];
    const replacements = { m: missionId };
    if (title !== undefined) { updates.push(`titulo = :titulo`); replacements.titulo = title; }
    if (description !== undefined) { updates.push(`descripcion = :descripcion`); replacements.descripcion = description; }
    if (points !== undefined) { updates.push(`puntos_recompensa = :puntos`); replacements.puntos = points; }
    if (difficulty !== undefined) { updates.push(`dificultad = :dificultad`); replacements.dificultad = difficulty; }
    if (subjectId !== undefined) { updates.push(`id_materia_asociada = :materia`); replacements.materia = subjectId; }

    if (!updates.length) return res.status(400).json({ success: false, message: 'Nada para actualizar' });

    await sequelize.query(`UPDATE Misiones SET ${updates.join(', ')} WHERE id_mision = :m`, { replacements });
    res.json({ success: true, data: { id: missionId } });
  } catch (e) { next(e); }
};

// Delete a mission (teacher only)
exports.deleteMission = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const missionId = Number(req.params.missionId);
    const [[existing]] = await sequelize.query(`SELECT id_mision FROM Misiones WHERE id_mision = :m AND id_profesor_creador = :t`, { replacements: { m: missionId, t: teacherId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Misión no encontrada o sin permiso' });
    await sequelize.query(`DELETE FROM Misiones WHERE id_mision = :m`, { replacements: { m: missionId } });
    res.json({ success: true, data: { id: missionId, deleted: true } });
  } catch (e) { next(e); }
};

// Student submits completion of NORMAL mission (needs approval)
exports.submitMission = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const missionId = Number(req.params.id);
    const [[mission]] = await sequelize.query(`SELECT tipo_mision FROM Misiones WHERE id_mision = :id`, { replacements: { id: missionId } });
    if (!mission) return res.status(404).json({ success: false, message: 'Misión no encontrada' });
    if (mission.tipo_mision !== 'TAREA') return res.status(400).json({ success: false, message: 'Solo misiones normales requieren envío manual' });
    await sequelize.query(
      `INSERT INTO Usuario_Misiones (id_usuario, id_mision, estado)
       VALUES (:u, :m, 'PENDIENTE')
       ON DUPLICATE KEY UPDATE estado = 'PENDIENTE', fecha_completada = NULL`, { replacements: { u: userId, m: missionId } }
    );
    res.json({ success: true, data: { missionId, status: 'pending' } });
  } catch (e) { next(e); }
};

// Teacher lists pending submissions for missions they created
exports.listPendingSubmissions = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const missionId = req.query.missionId ? Number(req.query.missionId) : null;
    const [rows] = await sequelize.query(
      `SELECT um.id_usuario, u.nombre_completo, um.id_mision, um.estado, um.fecha_completada, m.titulo
         FROM Usuario_Misiones um
         JOIN Misiones m ON m.id_mision = um.id_mision
         JOIN Usuarios u ON u.id_usuario = um.id_usuario
        WHERE m.id_profesor_creador = :prof AND um.estado = 'PENDIENTE'
          ${missionId ? 'AND um.id_mision = :missionId' : ''}
        ORDER BY um.id_mision`, { replacements: { prof: teacherId, missionId } });
    res.json({ success: true, data: rows.map(r => ({ missionId: r.id_mision, missionTitle: r.titulo, studentId: r.id_usuario, studentName: r.nombre_completo, status: r.estado })) });
  } catch (e) { next(e); }
};

exports.approveSubmission = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { missionId, studentId } = req.params;
    // Validate mission belongs to teacher
    const [[mission]] = await sequelize.query(`SELECT puntos_recompensa FROM Misiones WHERE id_mision = :m AND id_profesor_creador = :t`, { replacements: { m: missionId, t: teacherId } });
    if (!mission) return res.status(404).json({ success: false, message: 'Misión no encontrada o sin permiso' });
    await sequelize.transaction(async (t) => {
      await sequelize.query(
        `UPDATE Usuario_Misiones SET estado = 'COMPLETADA', fecha_completada = NOW() WHERE id_mision = :m AND id_usuario = :u`, { replacements: { m: missionId, u: studentId }, transaction: t }
      );
      await sequelize.query(
        `UPDATE Usuarios SET puntos_actuales = puntos_actuales + :p WHERE id_usuario = :u`, { replacements: { p: mission.puntos_recompensa || 0, u: studentId }, transaction: t }
      );
    });
    res.json({ success: true, data: { missionId: Number(missionId), studentId: Number(studentId), status: 'approved' } });
  } catch (e) { next(e); }
};

exports.rejectSubmission = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { missionId, studentId } = req.params;
    const [[mission]] = await sequelize.query(`SELECT id_mision FROM Misiones WHERE id_mision = :m AND id_profesor_creador = :t`, { replacements: { m: missionId, t: teacherId } });
    if (!mission) return res.status(404).json({ success: false, message: 'Misión no encontrada o sin permiso' });
    await sequelize.query(`UPDATE Usuario_Misiones SET estado = 'RECHAZADA' WHERE id_mision = :m AND id_usuario = :u`, { replacements: { m: missionId, u: studentId } });
    res.json({ success: true, data: { missionId: Number(missionId), studentId: Number(studentId), status: 'rejected' } });
  } catch (e) { next(e); }
};

// Daily mission: get questions for today (latest DIARIA created today)
exports.getTodayDailyMission = async (req, res, next) => {
  try {
    await ensureQuestionTables();
    const [[mission]] = await sequelize.query(
      `SELECT id_mision, titulo, descripcion, puntos_recompensa
         FROM Misiones
        WHERE tipo_mision = 'DIARIA' AND DATE(fecha_creacion) = CURDATE()
        ORDER BY id_mision DESC LIMIT 1`
    );
    if (!mission) return res.json({ success: true, data: null });
    const [questions] = await sequelize.query(
      `SELECT q.id_pregunta, q.texto
         FROM Misiones_Preguntas q
        WHERE q.id_mision = :m ORDER BY q.id_pregunta`, { replacements: { m: mission.id_mision } });
    const [options] = await sequelize.query(
      `SELECT o.id_opcion, o.id_pregunta, o.texto_opcion
         FROM Misiones_Preguntas_Opciones o
        WHERE o.id_pregunta IN (:ids)`, { replacements: { ids: questions.map(q => q.id_pregunta) } });
    const optsByQ = options.reduce((acc, o) => { acc[o.id_pregunta] = acc[o.id_pregunta] || []; acc[o.id_pregunta].push({ id: o.id_opcion, text: o.texto_opcion }); return acc; }, {});
    const payload = {
      id: mission.id_mision,
      title: mission.titulo,
      description: mission.descripcion,
      points: mission.puntos_recompensa || 0,
      questions: questions.map(q => ({ id: q.id_pregunta, text: q.texto, options: optsByQ[q.id_pregunta] || [] }))
    };
    res.json({ success: true, data: payload });
  } catch (e) { next(e); }
};

exports.submitDailyMissionAnswers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const missionId = Number(req.params.missionId);
    const { answers } = req.body; // [{questionId, optionId}]
    if (!Array.isArray(answers) || !answers.length) return res.status(400).json({ success: false, message: 'Respuestas requeridas' });
    await ensureQuestionTables();
    const [questions] = await sequelize.query(`SELECT id_pregunta FROM Misiones_Preguntas WHERE id_mision = :m`, { replacements: { m: missionId } });
    if (!questions.length) return res.status(404).json({ success: false, message: 'Misión diaria no encontrada' });
    if (answers.length !== questions.length) return res.status(400).json({ success: false, message: 'Debes responder todas las preguntas' });
    const [correctRows] = await sequelize.query(
      `SELECT o.id_opcion, o.id_pregunta FROM Misiones_Preguntas_Opciones o JOIN Misiones_Preguntas q ON q.id_pregunta = o.id_pregunta WHERE q.id_mision = :m AND o.es_correcta = 1`, { replacements: { m: missionId } });
    const correctByQ = Object.fromEntries(correctRows.map(r => [r.id_pregunta, r.id_opcion]));
    let correctCount = 0;
    for (const a of answers) {
      if (correctByQ[a.questionId] === a.optionId) correctCount++;
    }
    const allCorrect = correctCount === questions.length; // require all correct to activate streak
    if (!allCorrect) return res.status(400).json({ success: false, message: 'Debes acertar todas las preguntas para activar la racha', data: { correct: correctCount } });
    // Mark mission completed & increment streak and points
    const [[mission]] = await sequelize.query(`SELECT puntos_recompensa FROM Misiones WHERE id_mision = :m AND tipo_mision = 'DIARIA'`, { replacements: { m: missionId } });
    if (!mission) return res.status(404).json({ success: false, message: 'Misión no encontrada' });
    await sequelize.transaction(async (t) => {
      await sequelize.query(
        `INSERT INTO Usuario_Misiones (id_usuario, id_mision, fecha_completada, estado)
         VALUES (:u, :m, NOW(), 'COMPLETADA')
         ON DUPLICATE KEY UPDATE estado='COMPLETADA', fecha_completada = NOW()`, { replacements: { u: userId, m: missionId }, transaction: t }
      );
      await sequelize.query(
        `UPDATE Usuarios
            SET puntos_actuales = puntos_actuales + :p,
                racha_dias_consecutivos = racha_dias_consecutivos + 1,
                fecha_ultima_actividad = CURDATE()
          WHERE id_usuario = :u`, { replacements: { p: mission.puntos_recompensa || 0, u: userId }, transaction: t }
      );
    });
    res.json({ success: true, data: { missionId, correct: correctCount, streakActivated: true } });
  } catch (e) { next(e); }
};

// Ensure auxiliary tables exist (simple approach using CREATE TABLE IF NOT EXISTS)
async function ensureQuestionTables() {
  // MySQL flavor
  await sequelize.query(`CREATE TABLE IF NOT EXISTS Misiones_Preguntas (
    id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
    id_mision INT NOT NULL,
    texto VARCHAR(500) NOT NULL,
    FOREIGN KEY (id_mision) REFERENCES Misiones(id_mision) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await sequelize.query(`CREATE TABLE IF NOT EXISTS Misiones_Preguntas_Opciones (
    id_opcion INT AUTO_INCREMENT PRIMARY KEY,
    id_pregunta INT NOT NULL,
    texto_opcion VARCHAR(300) NOT NULL,
    es_correcta TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (id_pregunta) REFERENCES Misiones_Preguntas(id_pregunta) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
}
