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
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    points: "",
    difficulty: "medium",
  })

  useEffect(() => {
    loadAssignments()
  }, [])

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

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      await teacherService.createAssignment({
        ...newAssignment,
        points: Number.parseInt(newAssignment.points),
      })
      setNewAssignment({
        title: "",
        description: "",
        dueDate: "",
        points: "",
        difficulty: "medium",
      })
      setShowCreateModal(false)
      loadAssignments()
      alert("Tarea creada exitosamente")
    } catch (error) {
      alert("Error al crear tarea")
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
        <Button onClick={() => setShowCreateModal(true)} className="btn-primary">
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
            <h3>{assignments.reduce((acc, a) => acc + a.submissions, 0)}</h3>
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
                <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="assignment-progress">
              <div className="progress-info">
                <span>
                  Entregas: {assignment.submissions}/{assignment.totalStudents}
                </span>
                <span>{Math.round((assignment.submissions / assignment.totalStudents) * 100)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="assignment-actions">
              <Button variant="primary" size="small">
                Ver Entregas
              </Button>
              <Button variant="secondary" size="small">
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal para crear tarea */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📝 Nueva Tarea</h3>
              <button onClick={() => setShowCreateModal(false)} className="modal-close">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="modal-form">
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
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha límite</label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
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
              <div className="modal-actions">
                <Button type="submit" variant="primary">
                  Crear Tarea
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Assignments
