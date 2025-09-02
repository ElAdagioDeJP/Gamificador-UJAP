"use client"

import { useEffect, useState } from "react";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { subjectService } from "../services/subjectService";
import "../styles/Subjects.css";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await subjectService.getMySubjects();
        setSubjects(data);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingSpinner/>;

  return (
    <div className="subjects">
      <div className="subjects-header">
        <h1>📚 Materias</h1>
        <p>Tus materias inscritas, profesores y tareas con su peso</p>
      </div>

      {!subjects.length ? (
        <Card className="subject-card">
          <div className="no-assignments">No tienes materias para mostrar aún.</div>
        </Card>
      ) : (
        <div className="subjects-grid">
        {subjects.map((s) => (
          <Card key={s.id} className="subject-card">
            <div className="subject-header">
              <h3>{s.name}</h3>
              {!s.enrolled && <span className="badge badge-muted">No inscrito</span>}
              <div className="professors">
                {s.professors.map((p) => (
                  <div key={p.id} className="professor-chip">
                    <img src={p.avatar || "/placeholder.svg?height=24&width=24"} alt={p.name} />
                    <span>{p.name}</span>
                  </div>
                ))}
                {s.professors.length === 0 && <span className="no-prof">Sin profesores asignados</span>}
              </div>
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
      )}
    </div>
  );
}

export default Subjects;
