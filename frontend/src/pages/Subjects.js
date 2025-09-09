"use client"

import { useEffect, useState, useMemo } from "react";
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

  const totalSubjects = subjects.length;
  const totalAssignments = useMemo(() => subjects.reduce((acc,s)=>acc + s.assignments.length,0), [subjects]);
  const totalWeightAvg = useMemo(() => {
    const weights = subjects.map(s => s.assignments.reduce((a,b)=>a + b.weight,0));
    if(!weights.length) return 0;
    return weights.reduce((a,b)=>a+b,0) / weights.length;
  }, [subjects]);

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
        <>
          <div className="subjects-stats">
            <div className="stat-box">
              <span className="stat-label">Materias</span>
              <span className="stat-value">{totalSubjects}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Tareas</span>
              <span className="stat-value">{totalAssignments}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Peso Prom.</span>
              <span className="stat-value">{totalWeightAvg.toFixed(1)}%</span>
            </div>
          </div>
          <div className="subjects-grid">
            {subjects.map((s) => {
              const totalWeight = s.assignments.reduce((a,b)=>a+b.weight,0);
              return (
              <Card key={s.id} className={`subject-card ${totalWeight>100? 'subject-overweight':''}`}>
                <div className="subject-header">
                  <div className="subject-title-block">
                    <h3>{s.name}</h3>
                    <div className="subject-subinfo">
                      <span className="subject-weight-total">Peso total: {totalWeight.toFixed(2)}%</span>
                      {!s.enrolled && <span className="badge badge-muted">No inscrito</span>}
                    </div>
                  </div>
                  <div className="professors">
                    {s.professors.map(p => {
                      const initials = p.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
                      return (
                        <div key={p.id} className="professor-initial-chip" title={p.name}>
                          <span className="prof-initials">{initials}</span>
                        </div>
                      );
                    })}
                    {s.professors.length === 0 && <span className="no-prof">Sin profesores</span>}
                  </div>
                </div>
                <div className="assignments">
                  {s.assignments.length ? s.assignments.map((a) => {
                    const diffClass = `diff-${a.difficulty?.toLowerCase()}`;
                    return (
                      <div key={a.id} className="assignment-row">
                        <div className="assignment-main">
                          <div className="assignment-title-line">
                            <span className="assignment-title">{a.title}</span>
                            <span className={`difficulty-badge ${diffClass}`}>{a.difficulty}</span>
                          </div>
                          <div className="assignment-meta">Pts: {a.points} • XP: {a.exp}</div>
                          <div className="weight-bar-wrap">
                            <div className="weight-bar-bg">
                              <div className="weight-bar-fill" style={{width: `${a.weight}%`}} />
                            </div>
                          </div>
                        </div>
                        <div className="assignment-weight">{a.weight.toFixed(2)}%</div>
                      </div>
                    );
                  }) : <div className="no-assignments">No hay tareas asignadas aún.</div>}
                </div>
              </Card>
            )})}
          </div>
        </>
      )}
    </div>
  );
}

export default Subjects;
