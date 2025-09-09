"use client"

import { useState, useEffect } from "react"
import { teacherService } from "../../services/teacherService"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import "../../styles/Students.css"

const Students = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    university: "",
    career: "",
  })

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const data = await teacherService.getStudents()
      setStudents(data)
    } catch (error) {
      console.error("Error loading students:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStudent = async (e) => {
    e.preventDefault()
    try {
      await teacherService.createStudent(newStudent)
      setNewStudent({ name: "", email: "", university: "", career: "" })
      setShowCreateModal(false)
      loadStudents()
      alert("Estudiante creado exitosamente")
    } catch (error) {
      alert("Error al crear estudiante")
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este estudiante?")) {
      try {
        await teacherService.deleteStudent(studentId)
        loadStudents()
        alert("Estudiante eliminado exitosamente")
      } catch (error) {
        alert("Error al eliminar estudiante")
      }
    }
  }

  const handleViewStudent = async (studentId) => {
    try {
      const student = await teacherService.getStudent(studentId)
      setSelectedStudent(student)
    } catch (error) {
      alert("Error al cargar datos del estudiante")
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="students">
      <div className="students-header">
        <h1>👥 Gestión de Estudiantes</h1>
        <p>Administra y supervisa a todos los estudiantes de tu clase</p>
      </div>

      <div className="students-actions">
        <Button onClick={() => setShowCreateModal(true)} className="btn-primary">
          ➕ Crear Nuevo Estudiante
        </Button>
      </div>

      <div className="students-stats">
        <Card className="students-stat-card">
          <div className="stat-content">
            <h3>{students.length}</h3>
            <p>Total Estudiantes</p>
          </div>
        </Card>
        <Card className="students-stat-card">
          <div className="stat-content">
            <h3>{students.filter((s) => s.status === "active").length}</h3>
            <p>Activos</p>
          </div>
        </Card>
        <Card className="students-stat-card">
          <div className="stat-content">
            <h3>{Math.round(students.reduce((acc, s) => acc + s.level, 0) / students.length) || 0}</h3>
            <p>Nivel Promedio</p>
          </div>
        </Card>
      </div>

      <Card className="students-table-card">
        <div className="students-table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Email</th>
                {/* <th>Carrera</th> */}
                <th>Nivel</th>
                <th>Puntos</th>
                <th>Racha</th>
                <th>Estado</th>
                <th>Última Actividad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className={`student-row ${student.status}`}>
                  <td className="student-info">
                    <div className="student-avatar avatar-initials" title={student.name}>
                      {student.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                    </div>
                    <span className="student-name">{student.name}</span>
                  </td>
                  <td className="student-email">{student.email}</td>
                  {/* <td className="student-career">{student.career}</td> */}
                  <td className="student-level">
                    <span className="level-badge">Nivel {student.level}</span>
                  </td>
                  <td className="student-points">{student.points.toLocaleString()}</td>
                  <td className="student-streak">
                    <span className="streak-badge">{student.streak} días</span>
                  </td>
                  <td className="student-status">
                    <span className={`status-badge ${student.status}`}>
                      {student.status === "active" ? "🟢 Activo" : "🔴 Inactivo"}
                    </span>
                  </td>
                  <td className="student-activity">{new Date(student.lastActivity).toLocaleDateString()}</td>
                  <td className="student-actions">
                    <button
                      onClick={() => handleViewStudent(student.id)}
                      className="action-btn view-btn"
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="action-btn delete-btn"
                      title="Eliminar estudiante"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal para crear estudiante */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>➕ Crear Nuevo Estudiante</h3>
              <button onClick={() => setShowCreateModal(false)} className="modal-close">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="modal-form">
              <div className="form-group">
                <label htmlFor="student-name">Nombre Completo</label>
                <input
                  id="student-name"
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="student-email">Email</label>
                <input
                  id="student-email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="student-university">Universidad</label>
                <input
                  id="student-university"
                  type="text"
                  value={newStudent.university}
                  onChange={(e) => setNewStudent({ ...newStudent, university: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="student-career">Carrera</label>
                <input
                  id="student-career"
                  type="text"
                  value={newStudent.career}
                  onChange={(e) => setNewStudent({ ...newStudent, career: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="modal-actions">
                <Button type="submit" variant="primary">
                  Crear Estudiante
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver estudiante */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>👤 Detalles del Estudiante</h3>
              <button onClick={() => setSelectedStudent(null)} className="modal-close">
                ✕
              </button>
            </div>
            <div className="student-details">
              <div className="student-detail-header">
                <div className="student-detail-avatar avatar-initials-lg" title={selectedStudent.name}>
                  {selectedStudent.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                </div>
                <div className="student-detail-info">
                  <h4>{selectedStudent.name}</h4>
                  <p>{selectedStudent.email}</p>
                  <p>{selectedStudent.career}</p>
                </div>
              </div>
              <div className="student-detail-stats">
                <div className="detail-stat">
                  <span className="stat-label">Nivel</span>
                  <span className="stat-value">{selectedStudent.level}</span>
                </div>
                <div className="detail-stat">
                  <span className="stat-label">Puntos</span>
                  <span className="stat-value">{selectedStudent.points.toLocaleString()}</span>
                </div>
                <div className="detail-stat">
                  <span className="stat-label">Racha</span>
                  <span className="stat-value">{selectedStudent.streak} días</span>
                </div>
                <div className="detail-stat">
                  <span className="stat-label">Estado</span>
                  <span className={`stat-value ${selectedStudent.status}`}>
                    {selectedStudent.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <Button onClick={() => setSelectedStudent(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students
