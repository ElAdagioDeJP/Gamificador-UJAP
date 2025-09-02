"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import "../../styles/TeacherProfile.css"

const TeacherProfile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    university: user?.university || "",
    department: user?.department || "",
    subject: user?.subject || "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsEditing(false)
    alert("Perfil actualizado correctamente")
  }

  const teachingStats = {
    totalStudents: 25,
    activeAssignments: 3,
    totalAssignments: 12,
    averageGrade: 87.5,
    completionRate: 92,
  }

  const recentActivity = [
    {
      id: 1,
      type: "grade",
      description: "Calificaste la tarea de Juan Pérez",
      time: "Hace 2 horas",
      icon: "📊",
    },
    {
      id: 2,
      type: "assignment",
      description: "Creaste una nueva tarea: Proyecto Final",
      time: "Hace 1 día",
      icon: "📝",
    },
    {
      id: 3,
      type: "student",
      description: "Ana Rodríguez alcanzó el nivel 18",
      time: "Hace 2 días",
      icon: "🏆",
    },
  ]

  return (
    <div className="teacher-profile">
      <div className="teacher-profile-header">
        <h1>👤 Mi Perfil de Profesor</h1>
        <p>Gestiona tu información personal y revisa tu actividad docente</p>
      </div>

      <div className="teacher-profile-content">
        <div className="profile-main">
          <Card className="profile-info-card">
            <div className="profile-avatar-section">
              <img
                src={user?.avatar || "/placeholder.svg?height=100&width=100&query=teacher+avatar"}
                alt="Avatar"
                className="profile-avatar"
              />
              <Button variant="secondary" size="small">
                Cambiar Foto
              </Button>
            </div>

            <div className="profile-details">
              {!isEditing ? (
                <div className="profile-view">
                  <div className="profile-field">
                    <label>Nombre Completo</label>
                    <p>{user?.name}</p>
                  </div>
                  <div className="profile-field">
                    <label>Email</label>
                    <p>{user?.email}</p>
                  </div>
                  <div className="profile-field">
                    <label>Universidad</label>
                    <p>{user?.university}</p>
                  </div>
                  <div className="profile-field">
                    <label>Departamento</label>
                    <p>{user?.department}</p>
                  </div>
                  <div className="profile-field">
                    <label>Materia</label>
                    <p>{user?.subject}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="profile-edit">
                  <div className="form-group">
                    <label htmlFor="name">Nombre Completo</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="university">Universidad</label>
                    <input
                      type="text"
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="department">Departamento</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Materia</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-actions">
                    <Button type="submit" variant="primary">
                      Guardar Cambios
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>

          <Card title="📊 Estadísticas de Enseñanza" className="teaching-stats-card">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-icon">👥</span>
                <div className="stat-info">
                  <h3>{teachingStats.totalStudents}</h3>
                  <p>Estudiantes</p>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📝</span>
                <div className="stat-info">
                  <h3>{teachingStats.activeAssignments}</h3>
                  <p>Tareas Activas</p>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📊</span>
                <div className="stat-info">
                  <h3>{teachingStats.averageGrade}</h3>
                  <p>Promedio Clase</p>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">✅</span>
                <div className="stat-info">
                  <h3>{teachingStats.completionRate}%</h3>
                  <p>Tasa Completitud</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="profile-sidebar">
          <Card title="🕒 Actividad Reciente" className="activity-card">
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <span className="activity-icon">{activity.icon}</span>
                  <div className="activity-info">
                    <p>{activity.description}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="🎯 Objetivos del Semestre" className="goals-card">
            <div className="goals-list">
              <div className="goal-item">
                <div className="goal-header">
                  <span>Participación Estudiantil</span>
                  <span>92%</span>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "92%" }}></div>
                  </div>
                </div>
              </div>
              <div className="goal-item">
                <div className="goal-header">
                  <span>Promedio de Clase</span>
                  <span>87.5/100</span>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "87.5%" }}></div>
                  </div>
                </div>
              </div>
              <div className="goal-item">
                <div className="goal-header">
                  <span>Tareas Completadas</span>
                  <span>95%</span>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "95%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TeacherProfile
