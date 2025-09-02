"use client"

import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { subjectService } from "../../services/subjectService";
import "../../styles/Subjects.css";

const TeacherSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setSubjects(await subjectService.getTeacherSubjects()); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
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
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TeacherSubjects;
