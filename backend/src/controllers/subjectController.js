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

    let data = subjects.map(s => ({
      id: s.id_materia,
      name: s.nombre_materia,
      professors: professorsBySubject[s.id_materia] || [],
      assignments: assignmentsBySubject[s.id_materia] || [],
      enrolled: true,
    }));

    // Fallback: si el estudiante no tiene inscripciones, devolver catálogo general
    if (!data.length) {
      const [allSubjects] = await sequelize.query(
        `SELECT m.id_materia, m.nombre_materia FROM Materias m ORDER BY m.nombre_materia`
      );
      const allIds = allSubjects.map(s => s.id_materia);

      let profs = [];
      let assigns = [];
      if (allIds.length) {
        [profs] = await sequelize.query(
          `SELECT pm.id_materia, u.id_usuario, u.nombre_completo, u.email_institucional, u.avatar_url
             FROM Profesor_Materias pm
             JOIN Usuarios u ON u.id_usuario = pm.id_profesor
            WHERE pm.id_materia IN (:ids)`, { replacements: { ids: allIds } }
        );
        [assigns] = await sequelize.query(
          `SELECT id_mision, titulo, descripcion, puntos_recompensa, experiencia_recompensa, peso_en_calificacion, dificultad, id_materia_asociada
             FROM Misiones
            WHERE tipo_mision = 'TAREA' AND id_materia_asociada IN (:ids)
            ORDER BY id_mision DESC`, { replacements: { ids: allIds } }
        );
      }

      const profBy = profs.reduce((acc, p) => {
        acc[p.id_materia] = acc[p.id_materia] || [];
        acc[p.id_materia].push({ id: p.id_usuario, name: p.nombre_completo, email: p.email_institucional, avatar: p.avatar_url || null });
        return acc;
      }, {});
      const assBy = assigns.reduce((acc, a) => {
        acc[a.id_materia_asociada] = acc[a.id_materia_asociada] || [];
        acc[a.id_materia_asociada].push({ id: a.id_mision, title: a.titulo, description: a.descripcion, points: a.puntos_recompensa || 0, exp: a.experiencia_recompensa || 0, weight: Number(a.peso_en_calificacion) || 0, difficulty: (a.dificultad || 'BASICA').toLowerCase() });
        return acc;
      }, {});

      data = allSubjects.map(s => ({
        id: s.id_materia,
        name: s.nombre_materia,
        professors: profBy[s.id_materia] || [],
        assignments: assBy[s.id_materia] || [],
        enrolled: false,
      }));
    }

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
    let studentsBySubject = {};
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

      // Load enrolled students per subject so teachers can see who's inscribed
      const [students] = await sequelize.query(
        `SELECT i.id_materia, u.id_usuario, u.nombre_completo, u.email_institucional, u.avatar_url
           FROM Inscripciones i
           JOIN Usuarios u ON u.id_usuario = i.id_usuario
          WHERE i.id_materia IN (:ids) AND u.rol = 'estudiante'
          ORDER BY u.nombre_completo`, { replacements: { ids: subjectIds } }
      );
      studentsBySubject = students.reduce((acc, s) => {
        acc[s.id_materia] = acc[s.id_materia] || [];
        acc[s.id_materia].push({ id: s.id_usuario, name: s.nombre_completo, email: s.email_institucional, avatar: s.avatar_url || null });
        return acc;
      }, {});
    }

    const data = subjects.map(s => ({
      id: s.id_materia,
      name: s.nombre_materia,
      assignments: assignmentsBySubject[s.id_materia] || [],
      enrolledStudents: studentsBySubject[s.id_materia] || [],
    }));

    res.json({ success: true, data });
  } catch (e) { next(e); }
};

// ---------------------- Admin: CRUD para materias y asignaciones ----------------------
exports.getAllSubjectsAdmin = async (req, res, next) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT m.id_materia, m.codigo_materia, m.nombre_materia, m.descripcion, m.creditos, m.semestre_recomendado, m.activa,
              GROUP_CONCAT(pm.id_profesor) AS profesores
         FROM Materias m
    LEFT JOIN Profesor_Materias pm ON pm.id_materia = m.id_materia AND pm.activo = 1
        GROUP BY m.id_materia
        ORDER BY m.nombre_materia`);

    // Normalize profesores as array of ints
    const subjects = rows.map(r => ({
      ...r,
      profesores_asignados: r.profesores ? r.profesores.split(',').map(v => parseInt(v, 10)) : []
    }));

    res.json({ success: true, data: subjects });
  } catch (e) { next(e); }
};

exports.getSubjectById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows] = await sequelize.query(
      `SELECT m.id_materia, m.codigo_materia, m.nombre_materia, m.descripcion, m.creditos, m.semestre_recomendado, m.activa,
              GROUP_CONCAT(pm.id_profesor) AS profesores
         FROM Materias m
    LEFT JOIN Profesor_Materias pm ON pm.id_materia = m.id_materia AND pm.activo = 1
        WHERE m.id_materia = :id
        GROUP BY m.id_materia`, { replacements: { id } });

  const subjectRow = rows?.[0] || null;
  if (!subjectRow) return res.status(404).json({ success: false, message: 'Materia no encontrada' });

  const profesores_asignados = (subjectRow.profesores ? subjectRow.profesores.split(',').map(v => parseInt(v, 10)) : []);
  const subject = { ...subjectRow, profesores_asignados };

    res.json({ success: true, data: subject });
  } catch (e) { next(e); }
};

exports.createSubject = async (req, res, next) => {
  const { codigo_materia, nombre_materia, descripcion, creditos = 3, semestre_recomendado = null, activa = true } = req.body;
  try {
    // Run the INSERT as a single statement. Some MySQL configs disallow multiple statements
    // in one query call, so we perform the INSERT first and then retrieve the last insert id
    // with a separate query.
    await sequelize.query(
      `INSERT INTO Materias (codigo_materia, nombre_materia, descripcion, creditos, semestre_recomendado, activa, fecha_creacion)
         VALUES (:codigo, :nombre, :desc, :creditos, :semestre, :activa, NOW())`,
      { replacements: { codigo: codigo_materia, nombre: nombre_materia, desc: descripcion, creditos, semestre: semestre_recomendado, activa } }
    );

    const [[last]] = await sequelize.query(`SELECT LAST_INSERT_ID() AS id`);
    const newId = last && last.id ? last.id : null;
    res.status(201).json({ success: true, id: newId });
  } catch (e) { next(e); }
};

exports.updateSubject = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { codigo_materia, nombre_materia, descripcion, creditos, semestre_recomendado, activa } = req.body;
  try {
    await sequelize.query(
      `UPDATE Materias SET codigo_materia = :codigo, nombre_materia = :nombre, descripcion = :desc, creditos = :creditos, semestre_recomendado = :semestre, activa = :activa, fecha_actualizacion = NOW()
         WHERE id_materia = :id`,
      { replacements: { codigo: codigo_materia, nombre: nombre_materia, desc: descripcion, creditos, semestre: semestre_recomendado, activa, id } }
    );
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.deleteSubject = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  try {
    await sequelize.query(`DELETE FROM Materias WHERE id_materia = :id`, { replacements: { id } });
    // Also remove any professor assignments
    await sequelize.query(`DELETE FROM Profesor_Materias WHERE id_materia = :id`, { replacements: { id } });
    res.json({ success: true });
  } catch (e) { next(e); }
};

// Asignar una lista de profesores a una materia (reemplaza las asignaciones actuales)
exports.assignProfessorsToSubject = async (req, res, next) => {
  const subjectId = parseInt(req.params.id, 10);
  const { professor_ids } = req.body;
  try {
    await sequelize.transaction(async (t) => {
      await sequelize.query(`DELETE FROM Profesor_Materias WHERE id_materia = :subjectId`, { replacements: { subjectId }, transaction: t });
      if (Array.isArray(professor_ids) && professor_ids.length) {
        const values = professor_ids.map(p => `(${p}, ${subjectId}, NOW(), 1)`).join(',');
        await sequelize.query(`INSERT INTO Profesor_Materias (id_profesor, id_materia, fecha_asignacion, activo) VALUES ${values}`, { transaction: t });
      }
    });
    res.json({ success: true });
  } catch (e) { next(e); }
};

// Asignar una lista de materias a un profesor (reemplaza las asignaciones actuales)
exports.assignSubjectsToProfessor = async (req, res, next) => {
  const professorId = parseInt(req.params.id, 10);
  const { subject_ids } = req.body;
  try {
    await sequelize.transaction(async (t) => {
      await sequelize.query(`DELETE FROM Profesor_Materias WHERE id_profesor = :professorId`, { replacements: { professorId }, transaction: t });
      if (Array.isArray(subject_ids) && subject_ids.length) {
        const values = subject_ids.map(s => `(${professorId}, ${s}, NOW(), 1)`).join(',');
        await sequelize.query(`INSERT INTO Profesor_Materias (id_profesor, id_materia, fecha_asignacion, activo) VALUES ${values}`, { transaction: t });
      }
    });
    res.json({ success: true });
  } catch (e) { next(e); }
};
