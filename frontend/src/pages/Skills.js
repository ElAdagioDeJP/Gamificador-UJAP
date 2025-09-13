import { useGame } from "../context/GameContext"
import Card from "../components/common/Card"
import Button from "../components/common/Button"
import LoadingSpinner from "../components/common/LoadingSpinner"
import "../styles/Skills.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Skills = () => {
  const { gameData, loading, redeemPartial } = useGame()
  const navigate = useNavigate()
  const [redeeming, setRedeeming] = useState(false)
  const [message, setMessage] = useState("")

  if (loading) {
    return <LoadingSpinner />
  }

  const { skills, level, points } = gameData

  const canUnlock = level >= 2
  const canAfford = points >= 1000

  const handleRedeem = async () => {
    setMessage("")
    setRedeeming(true)
    try {
      const res = await redeemPartial()
      setMessage(res?.message || "Canje realizado con éxito.")
    } catch (err) {
      setMessage(err?.message || "No se pudo realizar el canje.")
    } finally {
      setRedeeming(false)
    }
  }

  const getSkillColor = (level) => {
    if (level >= 10) return "#10b981" // Verde
    if (level >= 5) return "#f59e0b" // Amarillo
    return "#6b7280" // Gris
  }

  const getSkillRank = (level) => {
    if (level >= 15) return "Experto"
    if (level >= 10) return "Avanzado"
    if (level >= 5) return "Intermedio"
    return "Principiante"
  }

  const skillCategories = [
    {
      name: "Ciencias Exactas",
      skills: skills.filter((skill) => ["Matemáticas", "Física", "Química"].includes(skill.name)),
    },
    {
      name: "Tecnología",
      skills: skills.filter((skill) => ["Programación"].includes(skill.name)),
    },
  ]

  return (
    <div className="skills">
      <div className="skills-header">
        <h1>🧠 Mis Habilidades</h1>
        <p>Desarrolla y mejora tus competencias académicas</p>
      </div>

      <div className="skills-overview">
        <Card className="skills-summary">
          <h3>📈 Resumen de Progreso</h3>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="stat-icon">🎯</span>
              <div className="stat-info">
                <h4>{skills.length}</h4>
                <p>Habilidades Activas</p>
              </div>
            </div>
            <div className="summary-stat">
              <span className="stat-icon">⭐</span>
              <div className="stat-info">
                <h4>{skills.length > 0 ? Math.round(skills.reduce((acc, skill) => acc + skill.level, 0) / skills.length) : 0}</h4>
                <p>Nivel Promedio</p>
              </div>
            </div>
            <div className="summary-stat">
              <span className="stat-icon">🚀</span>
              <div className="stat-info">
                <h4>{skills.filter((skill) => skill.level >= 10).length}</h4>
                <p>Habilidades Avanzadas</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="skills-content">
        {/* Canje de Parcial - Habilidad especial */}
        <div className="skills-category">
          <h2>Habilidades Especiales</h2>
          <div className="skills-grid">
            <Card className="skill-card">
              <div className="skill-header">
                <h3>Canje de Parcial</h3>
                <span className="skill-rank" style={{ backgroundColor: canUnlock ? "#10b981" : "#6b7280" }}>
                  {canUnlock ? "Disponible" : "Bloqueado"}
                </span>
              </div>

              <div className="skill-level">
                <div className="level-info">
                  <span className="level-text">Costo: 1000 puntos</span>
                  <span className="progress-text">Tu saldo: {points}</span>
                </div>
                <div className="skill-progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, Math.round((points / 1000) * 100))}%`,
                      backgroundColor: canAfford ? "#10b981" : "#6b7280",
                    }}
                  ></div>
                </div>
              </div>

              <div className="skill-actions">
                <Button
                  variant={canUnlock && canAfford ? "primary" : "secondary"}
                  size="small"
                  disabled={!canUnlock || !canAfford || redeeming}
                  onClick={handleRedeem}
                >
                  {redeeming ? "Canjeando..." : canUnlock ? (canAfford ? "Canjear 1000 pts" : "Saldo insuficiente") : "Desbloquea al nivel 2"}
                </Button>
              </div>

              {message && (
                <p style={{ marginTop: 8, fontSize: 12, color: message.includes("éxito") ? "#10b981" : "#ef4444" }}>{message}</p>
              )}
            </Card>
          </div>
        </div>

        {skillCategories.map((category) => (
          <div key={category.name} className="skills-category">
            <h2>{category.name}</h2>
            <div className="skills-grid">
              {category.skills.map((skill) => (
                <Card key={skill.id} className="skill-card">
                  <div className="skill-header">
                    <h3>{skill.name}</h3>
                    <span className="skill-rank" style={{ backgroundColor: getSkillColor(skill.level) }}>
                      {getSkillRank(skill.level)}
                    </span>
                  </div>

                  <div className="skill-level">
                    <div className="level-info">
                      <span className="level-text">Nivel {skill.level}</span>
                      <span className="progress-text">{skill.progress}%</span>
                    </div>
                    <div className="skill-progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${skill.progress}%`,
                          backgroundColor: getSkillColor(skill.level),
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="skill-actions">
                    <Button variant="primary" size="small">
                      Practicar
                    </Button>
                    <Button variant="secondary" size="small">
                      Ver Detalles
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="skills-recommendations">
        <Card title="💡 Recomendaciones" className="recommendations-card">
          <div className="recommendations-list">
            <div className="recommendation-item">
              <span className="recommendation-icon">📚</span>
              <div className="recommendation-content">
                <h4>Mejora en Química</h4>
                <p>
                  Tu habilidad en Química está en nivel básico. Completa más misiones relacionadas para subir de nivel.
                </p>
              </div>
              <Button variant="primary" size="small" onClick={() => navigate('/missions')}>
                Ver Misiones
              </Button>
            </div>
            <div className="recommendation-item">
              <span className="recommendation-icon">🎯</span>
              <div className="recommendation-content">
                <h4>Mantén tu racha en Programación</h4>
                <p>¡Excelente progreso! Estás cerca de alcanzar el nivel experto en Programación.</p>
              </div>
              <Button variant="secondary" size="small">
                Continuar
              </Button>
            </div>
            <div className="recommendation-item">
              <span className="recommendation-icon">⚔️</span>
              <div className="recommendation-content">
                <h4>Desafía a otros en Matemáticas</h4>
                <p>Tu nivel en Matemáticas es alto. ¡Participa en duelos para ganar más experiencia!</p>
              </div>
              <Button variant="primary" size="small" onClick={() => navigate('/duels')}>
                Buscar Duelo
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Skills
