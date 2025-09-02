import { useGame } from "../context/GameContext"
import Card from "../components/common/Card"
import Button from "../components/common/Button"
import LoadingSpinner from "../components/common/LoadingSpinner"
import "../styles/Duels.css"

const Duels = () => {
  const { gameData, loading } = useGame()

  if (loading) {
    return <LoadingSpinner />
  }

  const { duels } = gameData
  const activeDuels = duels.filter((duel) => duel.status === "active")
  const completedDuels = duels.filter((duel) => duel.status === "completed")

  const getStatusColor = (status, result) => {
    if (status === "active") return "#3b82f6"
    if (result === "won") return "#10b981"
    if (result === "lost") return "#ef4444"
    return "#6b7280"
  }

  const getStatusLabel = (status, result) => {
    if (status === "active") return "🔄 En Progreso"
    if (result === "won") return "🏆 Ganado"
    if (result === "lost") return "❌ Perdido"
    return "⏸️ Finalizado"
  }

  return (
    <div className="duels">
      <div className="duels-header">
        <h1>⚔️ Duelos Académicos</h1>
        <p>Compite con otros estudiantes y demuestra tus conocimientos</p>
      </div>

      <div className="duels-stats">
        <Card className="duels-stat-card">
          <div className="stat-content">
            <h3>{activeDuels.length}</h3>
            <p>Duelos Activos</p>
          </div>
        </Card>
        <Card className="duels-stat-card">
          <div className="stat-content">
            <h3>{completedDuels.filter((d) => d.result === "won").length}</h3>
            <p>Victorias</p>
          </div>
        </Card>
        <Card className="duels-stat-card">
          <div className="stat-content">
            <h3>
              {completedDuels.length > 0
                ? Math.round((completedDuels.filter((d) => d.result === "won").length / completedDuels.length) * 100)
                : 0}
              %
            </h3>
            <p>Tasa de Victoria</p>
          </div>
        </Card>
      </div>

      <div className="duels-content">
        <div className="duels-section">
          <div className="section-header">
            <h2>🔄 Duelos Activos</h2>
            <Button variant="primary" size="small">
              Nuevo Duelo
            </Button>
          </div>

          {activeDuels.length > 0 ? (
            <div className="duels-grid">
              {activeDuels.map((duel) => (
                <Card key={duel.id} className="duel-card active">
                  <div className="duel-header">
                    <div className="duel-opponent">
                      <img
                        src={`/placeholder.svg?height=50&width=50&query=${duel.opponent.replace(" ", "+")}`}
                        alt={duel.opponent}
                        className="opponent-avatar"
                      />
                      <div className="opponent-info">
                        <h3>vs {duel.opponent}</h3>
                        <p>{duel.subject}</p>
                      </div>
                    </div>
                    <span className="duel-status" style={{ backgroundColor: getStatusColor(duel.status, duel.result) }}>
                      {getStatusLabel(duel.status, duel.result)}
                    </span>
                  </div>

                  <div className="duel-scores">
                    <div className="score-item my-score">
                      <span className="score-label">Tu puntuación</span>
                      <span className="score-value">{duel.myScore}</span>
                    </div>
                    <div className="score-vs">VS</div>
                    <div className="score-item opponent-score">
                      <span className="score-label">Oponente</span>
                      <span className="score-value">{duel.opponentScore}</span>
                    </div>
                  </div>

                  <div className="duel-deadline">
                    <span className="deadline-icon">⏰</span>
                    <span>Finaliza: {new Date(duel.deadline).toLocaleDateString()}</span>
                  </div>

                  <div className="duel-actions">
                    <Button variant="primary" size="small">
                      Continuar Duelo
                    </Button>
                    <Button variant="secondary" size="small">
                      Ver Detalles
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="no-duels">
              <div className="no-duels-content">
                <span className="no-duels-icon">⚔️</span>
                <h3>No tienes duelos activos</h3>
                <p>¡Desafía a otros estudiantes y demuestra tus conocimientos!</p>
                <Button variant="primary">Buscar Oponente</Button>
              </div>
            </Card>
          )}
        </div>

        {completedDuels.length > 0 && (
          <div className="duels-section">
            <h2>📊 Historial de Duelos</h2>
            <div className="duels-grid">
              {completedDuels.map((duel) => (
                <Card key={duel.id} className={`duel-card completed ${duel.result}`}>
                  <div className="duel-header">
                    <div className="duel-opponent">
                      <img
                        src={`/placeholder.svg?height=50&width=50&query=${duel.opponent.replace(" ", "+")}`}
                        alt={duel.opponent}
                        className="opponent-avatar"
                      />
                      <div className="opponent-info">
                        <h3>vs {duel.opponent}</h3>
                        <p>{duel.subject}</p>
                      </div>
                    </div>
                    <span className="duel-status" style={{ backgroundColor: getStatusColor(duel.status, duel.result) }}>
                      {getStatusLabel(duel.status, duel.result)}
                    </span>
                  </div>

                  <div className="duel-scores">
                    <div className="score-item my-score">
                      <span className="score-label">Tu puntuación</span>
                      <span className="score-value">{duel.myScore}</span>
                    </div>
                    <div className="score-vs">VS</div>
                    <div className="score-item opponent-score">
                      <span className="score-label">Oponente</span>
                      <span className="score-value">{duel.opponentScore}</span>
                    </div>
                  </div>

                  <div className="duel-result">
                    {duel.result === "won" ? (
                      <span className="result-text won">🎉 ¡Victoria! +150 puntos</span>
                    ) : (
                      <span className="result-text lost">😔 Derrota. +25 puntos de participación</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Duels
