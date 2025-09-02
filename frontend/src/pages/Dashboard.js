"use client"
import { useGame } from "../context/GameContext"
import { useAuth } from "../context/AuthContext"
import Card from "../components/common/Card"
import LoadingSpinner from "../components/common/LoadingSpinner"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const { gameData, loading } = useGame()
  const { user } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  const { level, points, streak, missions } = gameData
  const dailyMissions = missions.filter((mission) => !mission.completed).slice(0, 3)
  const completedToday = missions.filter((mission) => mission.completed).length

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>¡Bienvenido de vuelta, {user?.name}! 🎉</h1>
        <p>Continúa tu aventura académica y alcanza nuevos logros</p>
      </div>

      <div className="dashboard-stats">
        <Card className="stat-card level-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Nivel {level}</h3>
            <p>Académico Avanzado</p>
            <div className="level-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(points % 200) / 2}%` }}></div>
              </div>
              <span>{points % 200}/200 XP</span>
            </div>
          </div>
        </Card>

        <Card className="stat-card points-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{points.toLocaleString()}</h3>
            <p>Puntos Totales</p>
          </div>
        </Card>

        <Card className="stat-card streak-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{streak} días</h3>
            <p>Racha Actual</p>
          </div>
        </Card>

        <Card className="stat-card missions-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{completedToday}</h3>
            <p>Misiones Completadas</p>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card title="🎯 Misiones Diarias" className="daily-missions">
          {dailyMissions.length > 0 ? (
            <div className="missions-list">
              {dailyMissions.map((mission) => (
                <div key={mission.id} className="mission-item">
                  <div className="mission-info">
                    <h4>{mission.title}</h4>
                    <p>{mission.description}</p>
                    <div className="mission-meta">
                      <span className={`difficulty ${mission.difficulty}`}>
                        {mission.difficulty === "easy"
                          ? "🟢 Fácil"
                          : mission.difficulty === "medium"
                            ? "🟡 Medio"
                            : "🔴 Difícil"}
                      </span>
                      <span className="points">+{mission.points} pts</span>
                    </div>
                  </div>
                  <div className="mission-deadline">
                    <span>📅 {new Date(mission.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-missions">
              <p>🎉 ¡Todas las misiones diarias completadas!</p>
            </div>
          )}
        </Card>

        <Card title="📊 Progreso Semanal" className="weekly-progress">
          <div className="progress-chart">
            <div className="chart-placeholder">
              <div className="chart-bars">
                {[65, 80, 45, 90, 75, 60, 85].map((height, index) => (
                  <div key={index} className="chart-bar">
                    <div className="bar-fill" style={{ height: `${height}%` }}></div>
                    <span className="bar-label">{["L", "M", "X", "J", "V", "S", "D"][index]}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="chart-description">Actividad académica de los últimos 7 días</p>
          </div>
        </Card>
      </div>

      <div className="dashboard-achievements">
        <Card title="🏅 Logros Recientes" className="recent-achievements">
          <div className="achievements-list">
            <div className="achievement-item">
              <span className="achievement-icon">🎯</span>
              <div className="achievement-info">
                <h4>Misión Completada</h4>
                <p>Participar en Foro - +50 pts</p>
              </div>
              <span className="achievement-time">Hace 2 horas</span>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">🔥</span>
              <div className="achievement-info">
                <h4>Racha de 7 días</h4>
                <p>¡Mantén el ritmo!</p>
              </div>
              <span className="achievement-time">Hoy</span>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">⬆️</span>
              <div className="achievement-info">
                <h4>Subiste de nivel</h4>
                <p>Ahora eres nivel 15</p>
              </div>
              <span className="achievement-time">Ayer</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
