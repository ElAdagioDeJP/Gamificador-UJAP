"use client"
import { useGame } from "../context/GameContext"
import { useAuth } from "../context/AuthContext"
import Card from "../components/common/Card"
import LoadingSpinner from "../components/common/LoadingSpinner"
import StatusBanner from "../components/common/StatusBanner"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const { gameData, loading } = useGame()
  const { user } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  const { level, points, streak, missions, xp, activityLast31 = [] } = gameData
  const dailyMissions = missions.filter((mission) => !mission.completed).slice(0, 3)
  const completedToday = missions.filter((mission) => mission.completed).length

  // Helper para mostrar dificultad sin ternarios anidados
  const difficultyText = (d) => ({
    easy: "🟢 Fácil",
    medium: "🟡 Medio",
    hard: "🔴 Difícil",
  }[d] || "❓")

  // Datos del gráfico semanal basados en racha: marcamos los últimos `streak` días.
  // dayIndex: 0=L, 6=D. Tomamos hoy como referencia y retrocedemos.
  const weekDays = ["L", "M", "X", "J", "V", "S", "D"]
  const today = new Date()
  const todayIdx = (today.getDay() + 6) % 7 // getDay: 0=Dom..6=Sab -> convertimos a 0=L..6=D
  const activeSet = new Set()
  for (let i = 0; i < Math.min(7, Math.max(0, streak)); i++) {
    const idx = (todayIdx - i + 7) % 7
    activeSet.add(idx)
  }
  const weeklyChart = weekDays.map((day, i) => ({ day, active: activeSet.has(i) }))

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

      {/* Banner de estado para profesores */}
      <StatusBanner user={user} />

      <div className="dashboard-stats">
        <Card className="stat-card level-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Nivel {level}</h3>
            <p>Académico Avanzado</p>
            <div className="level-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${((xp ?? 0) % 200) / 2}%` }}></div>
              </div>
              <span>{(xp ?? 0) % 200}/200 XP</span>
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

        <Card title="📊 Progreso Mensual" className="weekly-progress">
          <div className="progress-chart">
            <div className="chart-placeholder">
              {/* Calendario de los últimos 31 días, en columnas por semana (L arriba -> D abajo) */}
              {(() => {
                const today = new Date();
                const earliest = new Date();
                earliest.setDate(today.getDate() - 30);
                // Construir set de fechas activas desde activityLast31
                const activeSet = new Set();
                for (let i = 0; i < (activityLast31?.length || 0); i++) {
                  if (activityLast31[i]) {
                    const d = new Date(earliest);
                    d.setDate(earliest.getDate() + i);
                    activeSet.add(d.toISOString().slice(0, 10));
                  }
                }
                // Ajustar inicio a Lunes
                const startWeekday = (earliest.getDay() + 6) % 7; // 0=L .. 6=D
                const gridStart = new Date(earliest);
                gridStart.setDate(earliest.getDate() - startWeekday);
                const totalDays = Math.floor((today - gridStart) / (24 * 3600 * 1000)) + 1;
                const weekCount = Math.ceil(totalDays / 7);
                // Construir columnas (semanas)
                const columns = [];
                const cur = new Date(gridStart);
                for (let w = 0; w < weekCount; w++) {
                  const col = [];
                  for (let r = 0; r < 7; r++) {
                    const iso = cur.toISOString().slice(0, 10);
                    const withinRange = cur >= earliest && cur <= today;
                    col.push({ iso, active: withinRange && activeSet.has(iso) });
                    cur.setDate(cur.getDate() + 1);
                  }
                  columns.push(col);
                }
                return (
                  <div className="heatmap" style={{ maxWidth: '100%' }}>
                    <div className="heatmap-labels">
                      {weekDays.map((d) => (
                        <span key={`lbl-${d}`} className="heatmap-day">{d}</span>
                      ))}
                    </div>
                    <div className="heatmap-weeks">
                      {columns.map((col, wIdx) => (
                        <div key={`w${wIdx}`} className="heatmap-week">
                          {col.map((cell, rIdx) => (
                            <div
                              key={`c${wIdx}-${rIdx}`}
                              className={`heatmap-cell ${cell.active ? 'active' : ''}`}
                              title={cell.iso}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            <p className="chart-description">Actividad académica de los últimos 31 días</p>
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
