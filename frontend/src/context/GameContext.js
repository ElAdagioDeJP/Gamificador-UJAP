"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { gameService } from "../services/gameService"
import { useAuth } from "./AuthContext"

const GameContext = createContext()

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

export const GameProvider = ({ children }) => {
  const { user } = useAuth()
  const [gameData, setGameData] = useState({
    level: 1,
    points: 0,
    xp: 0,
    streak: 0,
    missions: [],
    skills: [],
    duels: [],
    activityLast31: [],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadGameData()
    }
  }, [user])

  const loadGameData = async () => {
    setLoading(true)
    try {
      const data = await gameService.getGameData()
      setGameData(data)
    } catch (error) {
      console.error("Error loading game data:", error)
    } finally {
      setLoading(false)
    }
  }

  const completeMission = async (missionId) => {
    try {
      const result = await gameService.completeMission(missionId)
      setGameData((prev) => ({
        ...prev,
        points: prev.points + result.pointsEarned,
        missions: prev.missions.map((mission) =>
          mission.id === missionId ? { ...mission, completed: true } : mission,
        ),
      }))
      return result
    } catch (error) {
      console.error("Error completing mission:", error)
      throw error
    }
  }

  const redeemPartial = async () => {
    try {
      const result = await gameService.redeemPartial()
      // Refrescamos completamente para asegurar consistencia (puntos, logs, etc.)
      await loadGameData()
      return result
    } catch (error) {
      console.error("Error redeeming partial:", error)
      throw error
    }
  }

  const value = {
    gameData,
    loading,
    completeMission,
    loadGameData,
    redeemPartial,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
