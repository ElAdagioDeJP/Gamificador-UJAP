"use client"

import { useState } from "react"
import { useGame } from "../context/GameContext"
import Card from "../components/common/Card"
import Button from "../components/common/Button"
import LoadingSpinner from "../components/common/LoadingSpinner"
import "../styles/Missions.css"

const Missions = () => {
  const { gameData, loading, completeMission } = useGame()
  const [completingMission, setCompletingMission] = useState(null)

  if (loading) {
    return <LoadingSpinner />
  }

  const { missions } = gameData
  const activeMissions = missions.filter((mission) => !mission.completed)
  const completedMissions = missions.filter((mission) => mission.completed)

  const handleCompleteMission = async (missionId) => {
    setCompletingMission(missionId)
    try {
      const result = await completeMission(missionId)
      alert(`¡Misión completada! +${result.pointsEarned} puntos`)
    } catch (error) {
      alert("Error al completar la misión")
    } finally {
      setCompletingMission(null)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "#4ade80"
      case "medium":
        return "#fbbf24"
      case "hard":
        return "#f87171"
      default:
        return "#6b7280"
    }
  }

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "🟢 Fácil"
      case "medium":
        return "🟡 Medio"
      case "hard":
        return "🔴 Difícil"
      default:
        return "Normal"
    }
  }

  return (
    <div className="missions">
      <div className="missions-header">
        <h1>🎯 Misiones Académicas</h1>
        <p>Completa tus tareas y gana puntos de experiencia</p>
      </div>

      <div className="missions-stats">
        <Card className="missions-stat-card">
          <div className="stat-content">
            <h3>{activeMissions.length}</h3>
            <p>Misiones Activas</p>
          </div>
        </Card>
        <Card className="missions-stat-card">
          <div className="stat-content">
            <h3>{completedMissions.length}</h3>
            <p>Completadas</p>
          </div>
        </Card>
        <Card className="missions-stat-card">
          <div className="stat-content">
            <h3>{missions.reduce((total, mission) => total + mission.points, 0)}</h3>
            <p>Puntos Totales</p>
          </div>
        </Card>
      </div>

      <div className="missions-content">
        <div className="missions-section">
          <h2>📋 Misiones Activas</h2>
          {activeMissions.length > 0 ? (
            <div className="missions-grid">
              {activeMissions.map((mission) => (
                <Card key={mission.id} className="mission-card active">
                  <div className="mission-header">
                    <h3>{mission.title}</h3>
                    <span
                      className="mission-difficulty"
                      style={{ backgroundColor: getDifficultyColor(mission.difficulty) }}
                    >
                      {getDifficultyLabel(mission.difficulty)}
                    </span>
                  </div>

                  <p className="mission-description">{mission.description}</p>

                  <div className="mission-meta">
                    <div className="mission-points">
                      <span className="points-icon">⭐</span>
                      <span>{mission.points} puntos</span>
                    </div>
                    <div className="mission-deadline">
                      <span className="deadline-icon">📅</span>
                      <span>{new Date(mission.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleCompleteMission(mission.id)}
                    loading={completingMission === mission.id}
                    className="mission-complete-btn"
                  >
                    Completar Misión
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="no-missions">
              <div className="no-missions-content">
                <span className="no-missions-icon">🎉</span>
                <h3>¡Todas las misiones completadas!</h3>
                <p>Excelente trabajo. Nuevas misiones estarán disponibles pronto.</p>
              </div>
            </Card>
          )}
        </div>

        {completedMissions.length > 0 && (
          <div className="missions-section">
            <h2>✅ Misiones Completadas</h2>
            <div className="missions-grid">
              {completedMissions.map((mission) => (
                <Card key={mission.id} className="mission-card completed">
                  <div className="mission-header">
                    <h3>{mission.title}</h3>
                    <span className="mission-completed-badge">✅ Completada</span>
                  </div>

                  <p className="mission-description">{mission.description}</p>

                  <div className="mission-meta">
                    <div className="mission-points earned">
                      <span className="points-icon">⭐</span>
                      <span>+{mission.points} puntos ganados</span>
                    </div>
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

export default Missions
