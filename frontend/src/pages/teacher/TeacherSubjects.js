"use client"

import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { subjectService } from "../../services/subjectService";
import { teacherService } from "../../services/teacherService";
import "../../styles/Subjects.css";

const TeacherSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollIdBySubject, setEnrollIdBySubject] = useState({});
  const [students, setStudents] = useState([]);
  const [studentQuery, setStudentQuery] = useState('');

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  useEffect(() => {
    (async () => {
      try { setSubjects(await subjectService.getTeacherSubjects()); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
    // load teacher's students for enroll selector
    (async () => {
      try {
        setStudents(await teacherService.getStudents());
      } catch (e) { console.error('No se pudieron cargar estudiantes', e); }
    })();
  }, []);

  if (loading) return <LoadingSpinner/>;

  return (
    <div className="subjects">
      <div className="subjects-header">
        <h1>📚 Mis Materias</h1>
        <p>Materias que impartes y tareas con su peso</p>
      </div>
      <div className="subjects-grid">
        {subjects.map((s) => (
          <Card key={s.id} className="subject-card">
            <div className="subject-header">
              <h3>{s.name}</h3>
            </div>
            <div className="assignments">
              {s.assignments.length ? s.assignments.map((a) => (
                <div key={a.id} className="assignment-row">
                  <div>
                    <div className="assignment-title">{a.title}</div>
                    <div className="assignment-meta">Dificultad: {a.difficulty} • Pts: {a.points} • XP: {a.exp}</div>
                  </div>
                  <div className="assignment-weight">{a.weight.toFixed(2)}%</div>
                </div>
              )) : <div className="no-assignments">No hay tareas asignadas aún.</div>}
            </div>
            <div className="enrolled-students">
              <h4>Estudiantes inscritos</h4>
              {s.enrolledStudents && s.enrolledStudents.length ? (
                <ul className="enrolled-list">
                  {s.enrolledStudents.map(st => (
                    <li key={st.id} className="enrolled-item">
                      <div className="student-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 20, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#222' }}>
                          {getInitials(st.name)}
                        </div>
                        <div>
                          <div className="student-name">{st.name}</div>
                          <div className="student-email">{st.email}</div>
                        </div>
                      </div>
                      <button className="btn-small btn-danger" onClick={async () => {
                        if (!window.confirm(`Desinscribir a ${st.name} de ${s.name}?`)) return;
                        try {
                          await teacherService.unenrollStudentFromSubject(s.id, st.id);
                          alert('Estudiante desinscrito');
                          // refresh subjects to update list
                          const refreshed = await subjectService.getTeacherSubjects();
                          setSubjects(refreshed);
                        } catch (e) { console.error(e); alert('Error al desinscribir'); }
                      }}>Desinscribir</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-enrolled">No hay estudiantes inscritos</div>
              )}
            </div>
            <div className="subject-enroll">
              <label>Inscribir estudiante</label>
              <div className="enroll-row">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input placeholder="Buscar estudiante por nombre o email" value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} className="form-input" />
                  <select value={enrollIdBySubject[s.id] || ''} onChange={(e) => setEnrollIdBySubject({ ...enrollIdBySubject, [s.id]: e.target.value })}>
                    <option value="">-- Selecciona un estudiante --</option>
                    {students.filter(st => (
                      !studentQuery || `${st.name} ${st.email}`.toLowerCase().includes(studentQuery.toLowerCase())
                    )).map((st) => (
                      <option key={st.id} value={st.id}>{st.name} ({st.email})</option>
                    ))}
                  </select>
                </div>
                <button onClick={async () => {
                  const sid = enrollIdBySubject[s.id];
                  if (!sid) return alert('Selecciona un estudiante');
                  try {
                    await teacherService.enrollStudentToSubject(s.id, Number(sid));
                    alert('Estudiante inscrito exitosamente');
                  } catch (e) { console.error(e); alert('Error al inscribir estudiante') }
                }}>Inscribir</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TeacherSubjects;
