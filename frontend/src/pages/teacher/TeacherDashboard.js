"use client"

import { useState, useEffect } from "react"
import { teacherService } from "../../services/teacherService"
import { useAuth } from "../../context/AuthContext"
import Card from "../../components/common/Card"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import "../../styles/Dashboard.css"

const TeacherDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentSubmissions, setRecentSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [statsData, submissionsData] = await Promise.all([
        teacherService.getTeacherStats(),
        teacherService.getSubmissions(),
      ])
      setStats(statsData)
      setRecentSubmissions(submissionsData.slice(0, 5))
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>¡Bienvenido, {user?.name}! 🎓</h1>
        <p>Panel de control para gestionar tu clase y estudiantes</p>
      </div>

      <div className="dashboard-stats">
        <Card className="stat-card level-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats?.totalStudents}</h3>
            <p>Estudiantes Totales</p>
          </div>
        </Card>

        <Card className="stat-card points-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats?.activeStudents}</h3>
            <p>Estudiantes Activos</p>
          </div>
        </Card>

        <Card className="stat-card streak-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats?.totalAssignments}</h3>
            <p>Tareas Creadas</p>
          </div>
        </Card>

        <Card className="stat-card missions-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats?.pendingSubmissions}</h3>
            <p>Por Calificar</p>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card title="📊 Entregas Recientes" className="daily-missions">
          {recentSubmissions.length > 0 ? (
            <div className="missions-list">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="mission-item">
                  <div className="mission-info">
                    <h4>{submission.studentName}</h4>
                    <p>Entregó una tarea</p>
                    <div className="mission-meta">
                      <span className={`difficulty ${submission.status === "pending" ? "medium" : "easy"}`}>
                        {submission.status === "pending" ? "🟡 Pendiente" : "🟢 Calificada"}
                      </span>
                      {submission.grade && <span className="points">Nota: {submission.grade}/100</span>}
                    </div>
                  </div>
                  <div className="mission-deadline">
                    <span>📅 {new Date(submission.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-missions">
              <p>📝 No hay entregas recientes</p>
            </div>
          )}
        </Card>

        <Card title="📈 Estadísticas de Clase" className="weekly-progress">
          <div className="progress-chart">
            <div className="chart-placeholder">
              <div className="chart-bars">
                {[85, 92, 78, 95, 88, 90, 87].map((height, index) => (
                  <div key={index} className="chart-bar">
                    <div className="bar-fill" style={{ height: `${height}%` }}></div>
                    <span className="bar-label">{["L", "M", "X", "J", "V", "S", "D"][index]}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="chart-description">Actividad de estudiantes en los últimos 7 días</p>
          </div>
        </Card>
      </div>

      <div className="dashboard-achievements">
        <Card title="🎯 Resumen de Rendimiento" className="recent-achievements">
          <div className="achievements-list">
            <div className="achievement-item">
              <span className="achievement-icon">📊</span>
              <div className="achievement-info">
                <h4>Promedio de Clase</h4>
                <p>{stats?.averageGrade?.toFixed(1)}/100 - Excelente rendimiento</p>
              </div>
              <span className="achievement-time">Actualizado</span>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">🏆</span>
              <div className="achievement-info">
                <h4>Mejor Estudiante</h4>
                <p>Ana Rodríguez - Nivel 18</p>
              </div>
              <span className="achievement-time">Esta semana</span>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">📈</span>
              <div className="achievement-info">
                <h4>Participación</h4>
                <p>87% de estudiantes activos</p>
              </div>
              <span className="achievement-time">Hoy</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TeacherDashboard
