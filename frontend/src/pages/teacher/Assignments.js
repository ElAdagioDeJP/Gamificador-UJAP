"use client"

import { useState, useEffect } from "react"
import { teacherService } from "../../services/teacherService"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import "../../styles/Assignments.css"

const Assignments = () => {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    points: "",
    difficulty: "medium",
    subjectId: null,
  })
  const [subjects, setSubjects] = useState([])
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
  const [currentAssignmentSubmissions, setCurrentAssignmentSubmissions] = useState([])
  const [currentAssignmentId, setCurrentAssignmentId] = useState(null)

  const loadAssignments = async () => {
    setLoading(true)
    try {
      const data = await teacherService.getAssignments()
      setAssignments(data)
    } catch (error) {
      console.error("Error loading assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function init() {
      await loadAssignments()
      try {
        const s = await teacherService.getSubjects()
        setSubjects(s)
      } catch (e) {
        console.error('Failed to load subjects', e)
      }
    }
    init()
  }, [])

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await teacherService.updateAssignment(editing.id, {
          title: newAssignment.title,
          description: newAssignment.description,
          points: Number.parseInt(newAssignment.points) || 0,
          difficulty: newAssignment.difficulty,
          subjectId: newAssignment.subjectId,
        })
      } else {
        await teacherService.createAssignment({
          ...newAssignment,
          points: Number.parseInt(newAssignment.points) || 0,
        })
      }
      setNewAssignment({
        title: "",
        description: "",
        dueDate: "",
        points: "",
        difficulty: "medium",
        subjectId: null,
      })
      setShowCreateModal(false)
      setEditing(null)
      loadAssignments()
      alert("Tarea creada exitosamente")
    } catch (error) {
      console.error(error)
      alert("Error al crear/actualizar tarea: " + (error.message || ''))
    }
  }

  const handleEdit = (assignment) => {
    setEditing(assignment)
    setNewAssignment({
      title: assignment.title || '',
      description: assignment.description || '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0,10) : '',
      points: assignment.points || '',
      difficulty: assignment.difficulty || 'medium',
      subjectId: assignment.subjectId || null,
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Eliminar tarea "${assignment.title}"? Esta acción no se puede deshacer.`)) return
    try {
      await teacherService.deleteAssignment(assignment.id)
      loadAssignments()
      alert('Tarea eliminada')
    } catch (e) {
      console.error(e)
      alert('Error al eliminar tarea')
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "#22c55e"
      case "medium":
        return "#f59e0b"
      case "hard":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "🟢 Fácil"
      case "medium":
        return "🟡 Medio"
      case "hard":
        return "🔴 Difícil"
      default:
        return "Normal"
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="assignments">
      <div className="assignments-header">
        <h1>📝 Gestión de Tareas</h1>
        <p>Crea y administra las tareas para tus estudiantes</p>
      </div>

      <div className="assignments-actions">
        <Button onClick={() => { setEditing(null); setNewAssignment({ title: '', description: '', dueDate: '', points: '', difficulty: 'medium', subjectId: null }); setShowCreateModal(true); }} className="btn-primary">
          ➕ Nueva Tarea
        </Button>
      </div>

      <div className="assignments-stats">
        <Card className="assignments-stat-card">
          <div className="stat-content">
            <h3>{assignments.length}</h3>
            <p>Total Tareas</p>
          </div>
        </Card>
        <Card className="assignments-stat-card">
          <div className="stat-content">
            <h3>{assignments.filter((a) => a.status === "active").length}</h3>
            <p>Activas</p>
          </div>
        </Card>
        <Card className="assignments-stat-card">
          <div className="stat-content">
            <h3>{assignments.reduce((acc, a) => acc + (Number(a.submissions) || 0), 0)}</h3>
            <p>Entregas Totales</p>
          </div>
        </Card>
      </div>

      <div className="assignments-grid">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className={`assignment-card ${assignment.status}`}>
            <div className="assignment-header">
              <h3>{assignment.title}</h3>
              <span
                className="assignment-difficulty"
                style={{ backgroundColor: getDifficultyColor(assignment.difficulty) }}
              >
                {getDifficultyLabel(assignment.difficulty)}
              </span>
            </div>

            <p className="assignment-description">{assignment.description}</p>

              <div className="assignment-meta">
              <div className="assignment-points">
                <span className="points-icon">⭐</span>
                <span>{assignment.points} puntos</span>
              </div>
              <div className="assignment-due">
                <span className="due-icon">📅</span>
                <span>{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '—'}</span>
              </div>
            </div>

            <div className="assignment-progress">
              <div className="progress-info">
                <span>
                  Entregas: {Number(assignment.submissions) || 0}/{Number(assignment.totalStudents) || 0}
                </span>
                <span>{assignment.totalStudents ? Math.round((Number(assignment.submissions) || 0) / Number(assignment.totalStudents) * 100) : 0}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${assignment.totalStudents ? ((Number(assignment.submissions) || 0) / Number(assignment.totalStudents) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="assignment-actions">
                <Button onClick={async () => {
                  try {
                    setCurrentAssignmentId(assignment.id)
                    const subs = await teacherService.getSubmissions(assignment.id)
                    setCurrentAssignmentSubmissions(subs)
                    setShowSubmissionsModal(true)
                  } catch (e) { console.error(e); alert('Error al cargar entregas') }
                }} variant="primary" size="small">
                  Ver Entregas
                </Button>
              <Button onClick={() => handleEdit(assignment)} variant="secondary" size="small">
                Editar
              </Button>
              <Button onClick={() => handleDelete(assignment)} variant="danger" size="small">
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal para crear/editar tarea: fixed overlay con mejor UX */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowCreateModal(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 8,
              width: '100%',
              maxWidth: 760,
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0 }}>{editing ? '✏️ Editar Tarea' : '📝 Nueva Tarea'}</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }} aria-label="Cerrar">✕</button>
            </div>
            <form onSubmit={handleCreateAssignment} className="modal-form" style={{ padding: 20 }}>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  required
                  className="form-textarea"
                  rows="3"
                />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Fecha límite</label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ width: 160 }}>
                  <label>Puntos</label>
                  <input
                    type="number"
                    value={newAssignment.points}
                    onChange={(e) => setNewAssignment({ ...newAssignment, points: e.target.value })}
                    required
                    className="form-input"
                    min="1"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Dificultad</label>
                <select
                  value={newAssignment.difficulty}
                  onChange={(e) => setNewAssignment({ ...newAssignment, difficulty: e.target.value })}
                  className="form-select"
                >
                  <option value="easy">🟢 Fácil</option>
                  <option value="medium">🟡 Medio</option>
                  <option value="hard">🔴 Difícil</option>
                </select>
              </div>
              <div className="form-group">
                <label>Materia</label>
                <select className="form-select" value={newAssignment.subjectId || ''} onChange={(e) => setNewAssignment({ ...newAssignment, subjectId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">-- Sin materia (opcional) --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <Button type="submit" variant="primary">
                  {editing ? 'Guardar Cambios' : 'Crear Tarea'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions modal */}
      {showSubmissionsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowSubmissionsModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'auto', borderRadius: 8, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Entregas - Tarea #{currentAssignmentId}</h3>
              <button onClick={() => setShowSubmissionsModal(false)} style={{ border: 'none', background: 'transparent', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ marginTop: 12 }}>
              {currentAssignmentSubmissions.length ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {currentAssignmentSubmissions.map(s => (
                    <li key={`${s.assignmentId}-${s.studentId}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #efefef' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.studentName}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>Estado: {s.status} • Enviado: {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '—'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button onClick={async () => {
                          try {
                            await teacherService.approveMissionSubmission(s.assignmentId, s.studentId)
                            alert('Entrega aprobada')
                            const refreshed = await teacherService.getSubmissions(currentAssignmentId)
                            setCurrentAssignmentSubmissions(refreshed)
                            loadAssignments()
                          } catch (e) { console.error(e); alert('Error al aprobar') }
                        }} variant="primary" size="small">Aprobar</Button>
                        <Button onClick={async () => {
                          try {
                            await teacherService.rejectMissionSubmission(s.assignmentId, s.studentId)
                            alert('Entrega rechazada')
                            const refreshed = await teacherService.getSubmissions(currentAssignmentId)
                            setCurrentAssignmentSubmissions(refreshed)
                            loadAssignments()
                          } catch (e) { console.error(e); alert('Error al rechazar') }
                        }} variant="danger" size="small">Rechazar</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>No hay entregas para esta tarea.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Assignments
