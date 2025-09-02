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

  // Helper para mostrar dificultad sin ternarios anidados
  const difficultyText = (d) => ({
    easy: "🟢 Fácil",
    medium: "🟡 Medio",
    hard: "🔴 Difícil",
  }[d] || "❓")

  // Datos del gráfico semanal (claves estables)
  const weekDays = ["L", "M", "X", "J", "V", "S", "D"]
  const weekHeights = [65, 80, 45, 90, 75, 60, 85]
  const weeklyChart = weekDays.map((day, i) => ({ day, height: weekHeights[i] }))

  // Flags para logros dinámicos
  const showCompletedToday = completedToday > 0
  const showStreak = streak > 0
  const leveledUp = level > 1

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
                      <span className={`difficulty ${mission.difficulty}`}>{difficultyText(mission.difficulty)}</span>
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
                {weeklyChart.map(({ day, height }) => (
                  <div key={day} className="chart-bar">
                    <div className="bar-fill" style={{ height: `${height}%` }}></div>
                    <span className="bar-label">{day}</span>
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
            {showCompletedToday && (
              <div className="achievement-item">
                <span className="achievement-icon">🎯</span>
                <div className="achievement-info">
                  <h4>
                    {completedToday} misión{completedToday > 1 ? "es" : ""} completada
                    {completedToday > 1 ? "s" : ""}
                  </h4>
                  <p>Buen trabajo</p>
                </div>
                <span className="achievement-time">Hoy</span>
              </div>
            )}
            {showStreak && (
              <div className="achievement-item">
                <span className="achievement-icon">🔥</span>
                <div className="achievement-info">
                  <h4>Racha de {streak} día{streak > 1 ? "s" : ""}</h4>
                  <p>¡Mantén el ritmo!</p>
                </div>
                <span className="achievement-time">Reciente</span>
              </div>
            )}
            {leveledUp ? (
              <div className="achievement-item">
                <span className="achievement-icon">⬆️</span>
                <div className="achievement-info">
                  <h4>Subiste de nivel</h4>
                  <p>Ahora eres nivel {level}</p>
                </div>
                <span className="achievement-time">Reciente</span>
              </div>
            ) : (
              <div className="achievement-item">
                <span className="achievement-icon">✨</span>
                <div className="achievement-info">
                  <h4>¡Primeros pasos!</h4>
                  <p>Has iniciado tu aventura</p>
                </div>
                <span className="achievement-time">Hoy</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
