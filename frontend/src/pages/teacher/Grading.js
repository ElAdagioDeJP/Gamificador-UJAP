"use client"

import { useState, useEffect } from "react"
import { teacherService } from "../../services/teacherService"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import "../../styles/Grading.css"

const Grading = () => {
  const [submissions, setSubmissions] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [gradeForm, setGradeForm] = useState({
    grade: "",
    feedback: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [submissionsData, assignmentsData] = await Promise.all([
        teacherService.getSubmissions(),
        teacherService.getAssignments(),
      ])
      setSubmissions(submissionsData)
      setAssignments(assignmentsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmission = async (e) => {
    e.preventDefault()
    try {
      await teacherService.gradeSubmission(selectedSubmission.id, Number.parseInt(gradeForm.grade), gradeForm.feedback)
      setSelectedSubmission(null)
      setGradeForm({ grade: "", feedback: "" })
      loadData()
      alert("Calificación guardada exitosamente")
    } catch (error) {
      alert("Error al guardar calificación")
    }
  }

  const openGradingModal = (submission) => {
    setSelectedSubmission(submission)
    setGradeForm({
      grade: submission.grade || "",
      feedback: submission.feedback || "",
    })
  }

  const getAssignmentTitle = (assignmentId) => {
    const assignment = assignments.find((a) => a.id === assignmentId)
    return assignment ? assignment.title : "Tarea desconocida"
  }

  const pendingSubmissions = submissions.filter((s) => s.status === "pending")
  const gradedSubmissions = submissions.filter((s) => s.status === "graded")

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="grading">
      <div className="grading-header">
        <h1>📊 Centro de Calificaciones</h1>
        <p>Revisa y califica las entregas de tus estudiantes</p>
      </div>

      <div className="grading-stats">
        <Card className="grading-stat-card">
          <div className="stat-content">
            <h3>{pendingSubmissions.length}</h3>
            <p>Por Calificar</p>
          </div>
        </Card>
        <Card className="grading-stat-card">
          <div className="stat-content">
            <h3>{gradedSubmissions.length}</h3>
            <p>Calificadas</p>
          </div>
        </Card>
        <Card className="grading-stat-card">
          <div className="stat-content">
            <h3>
              {gradedSubmissions.length > 0
                ? Math.round(gradedSubmissions.reduce((acc, s) => acc + s.grade, 0) / gradedSubmissions.length)
                : 0}
            </h3>
            <p>Promedio</p>
          </div>
        </Card>
      </div>

      <div className="grading-content">
        {pendingSubmissions.length > 0 && (
          <div className="grading-section">
            <h2>⏳ Entregas Pendientes</h2>
            <div className="submissions-grid">
              {pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="submission-card pending">
                  <div className="submission-header">
                    <h3>{submission.studentName}</h3>
                    <span className="submission-status pending">⏳ Pendiente</span>
                  </div>
                  <p className="submission-assignment">{getAssignmentTitle(submission.assignmentId)}</p>
                  <div className="submission-date">
                    📅 Entregado: {new Date(submission.submittedAt).toLocaleDateString()}
                  </div>
                  <div className="submission-actions">
                    <Button onClick={() => openGradingModal(submission)} variant="primary" size="small">
                      Calificar
                    </Button>
                    <Button variant="secondary" size="small">
                      Ver Archivo
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grading-section">
          <h2>✅ Entregas Calificadas</h2>
          <div className="submissions-grid">
            {gradedSubmissions.map((submission) => (
              <Card key={submission.id} className="submission-card graded">
                <div className="submission-header">
                  <h3>{submission.studentName}</h3>
                  <span className="submission-grade">{submission.grade}/100</span>
                </div>
                <p className="submission-assignment">{getAssignmentTitle(submission.assignmentId)}</p>
                <div className="submission-date">
                  📅 Entregado: {new Date(submission.submittedAt).toLocaleDateString()}
                </div>
                {submission.feedback && (
                  <div className="submission-feedback">
                    <strong>Comentarios:</strong> {submission.feedback}
                  </div>
                )}
                <div className="submission-actions">
                  <Button onClick={() => openGradingModal(submission)} variant="secondary" size="small">
                    Editar Nota
                  </Button>
                  <Button variant="secondary" size="small">
                    Ver Archivo
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de calificación */}
      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📊 Calificar Entrega</h3>
              <button onClick={() => setSelectedSubmission(null)} className="modal-close">
                ✕
              </button>
            </div>
            <div className="grading-info">
              <div className="student-info">
                <h4>{selectedSubmission.studentName}</h4>
                <p>{getAssignmentTitle(selectedSubmission.assignmentId)}</p>
                <p>Entregado: {new Date(selectedSubmission.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <form onSubmit={handleGradeSubmission} className="modal-form">
              <div className="form-group">
                <label>Calificación (0-100)</label>
                <input
                  type="number"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                  required
                  className="form-input"
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>Comentarios</label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  className="form-textarea"
                  rows="4"
                  placeholder="Escribe tus comentarios sobre la entrega..."
                />
              </div>
              <div className="modal-actions">
                <Button type="submit" variant="primary">
                  Guardar Calificación
                </Button>
                <Button type="button" variant="secondary" onClick={() => setSelectedSubmission(null)}>
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

export default Grading
