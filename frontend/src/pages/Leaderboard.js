"use client"

import { useState, useEffect } from "react"
import { gameService } from "../services/gameService"
import { useAuth } from "../context/AuthContext"
import Card from "../components/common/Card"
import LoadingSpinner from "../components/common/LoadingSpinner"
import "../styles/Leaderboard.css"

const Leaderboard = () => {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("all")

  useEffect(() => {
    loadLeaderboard()
  }, [timeFilter])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await gameService.getLeaderboard()
      // Filtrar solo estudiantes (en caso de que el backend no lo haga)
      const studentsOnly = data.filter(player => 
        !player.role || 
        player.role === 'estudiante' || 
        player.role === 'user' || 
        player.role === 'student'
      )
      setLeaderboard(studentsOnly)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return `#${position}`
    }
  }

  const getRankClass = (position) => {
    switch (position) {
      case 1:
        return "rank-gold"
      case 2:
        return "rank-silver"
      case 3:
        return "rank-bronze"
      default:
        return "rank-default"
    }
  }

  // Solo mostrar la posición del usuario si es estudiante
  const isStudent = user?.rol === 'estudiante' || user?.rol === 'user' || user?.rol === 'student' || !user?.rol
  const currentUserRank = isStudent ? leaderboard.findIndex((player) => player.name === user?.name) + 1 : 0

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h1>🏆 Clasificación Global</h1>
        <p>Compite con estudiantes de todo el mundo</p>
        {!isStudent && (
          <div className="admin-notice">
            <p>ℹ️ Esta clasificación es solo para estudiantes. Los profesores y administradores no participan en el ranking.</p>
          </div>
        )}
      </div>

      <div className="leaderboard-filters">
        <div className="filter-buttons">
          <button className={`filter-btn ${timeFilter === "all" ? "active" : ""}`} onClick={() => setTimeFilter("all")}>
            Todo el tiempo
          </button>
          <button
            className={`filter-btn ${timeFilter === "month" ? "active" : ""}`}
            onClick={() => setTimeFilter("month")}
          >
            Este mes
          </button>
          <button
            className={`filter-btn ${timeFilter === "week" ? "active" : ""}`}
            onClick={() => setTimeFilter("week")}
          >
            Esta semana
          </button>
        </div>
      </div>

      <div className="leaderboard-content">
        <Card className="leaderboard-card">
          <div className="leaderboard-list">
            {leaderboard.map((player, index) => {
              const position = index + 1
              const isCurrentUser = isStudent && player.name === user?.name

              return (
                <div
                  key={player.id}
                  className={`leaderboard-item ${getRankClass(position)} ${isCurrentUser ? "current-user" : ""}`}
                >
                  <div className="rank-position">
                    <span className="rank-icon">{getRankIcon(position)}</span>
                  </div>

                  <div className="player-info">
                    <div className="player-avatar avatar-initials" title={player.name}>
                      {player.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                    </div>
                    <div className="player-details">
                      <h3 className="player-name">
                        {player.name}
                        {isCurrentUser && <span className="you-badge">Tú</span>}
                      </h3>
                      <p className="player-level">Nivel {player.level}</p>
                    </div>
                  </div>

                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-value">{player.points.toLocaleString()}</span>
                      <span className="stat-label">Puntos</span>
                    </div>
                  </div>

                  {position <= 3 && (
                    <div className="rank-badge">
                      <span className="badge-text">Top {position}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {isStudent && currentUserRank > 5 && (
          <Card className="current-user-rank">
            <div className="current-rank-header">
              <h3>Tu Posición Actual</h3>
            </div>
            <div className={`leaderboard-item ${getRankClass(currentUserRank)} current-user`}>
              <div className="rank-position">
                <span className="rank-icon">{getRankIcon(currentUserRank)}</span>
              </div>

              <div className="player-info">
                <div className="player-avatar avatar-initials" title={user?.name}>
                  {user?.name?.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                </div>
                <div className="player-details">
                  <h3 className="player-name">
                    {user?.name}
                    <span className="you-badge">Tú</span>
                  </h3>
                  <p className="player-level">Nivel {leaderboard.find((p) => p.name === user?.name)?.level}</p>
                </div>
              </div>

              <div className="player-stats">
                <div className="stat-item">
                  <span className="stat-value">
                    {leaderboard.find((p) => p.name === user?.name)?.points.toLocaleString()}
                  </span>
                  <span className="stat-label">Puntos</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="leaderboard-stats">
        <Card className="stats-summary">
          <h3>📊 Estadísticas Globales</h3>
          <div className="global-stats">
            <div className="global-stat">
              <span className="stat-icon">👥</span>
              <div className="stat-info">
                <h4>1,247</h4>
                <p>Estudiantes Activos</p>
              </div>
            </div>
            <div className="global-stat">
              <span className="stat-icon">🎯</span>
              <div className="stat-info">
                <h4>15,892</h4>
                <p>Misiones Completadas</p>
              </div>
            </div>
            <div className="global-stat">
              <span className="stat-icon">⚔️</span>
              <div className="stat-info">
                <h4>3,456</h4>
                <p>Duelos Realizados</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Leaderboard
