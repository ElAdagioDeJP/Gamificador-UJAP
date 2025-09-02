// Simulación de API para datos del juego
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const mockGameData = {
  level: 15,
  points: 2450,
  streak: 7,
  missions: [
    {
      id: 1,
      title: "Completar Tarea de Matemáticas",
      description: "Resolver 10 ejercicios de cálculo integral",
      points: 100,
      deadline: "2024-01-15",
      completed: false,
      difficulty: "medium",
    },
    {
      id: 2,
      title: "Participar en Foro",
      description: "Hacer 3 comentarios constructivos en el foro de física",
      points: 50,
      deadline: "2024-01-12",
      completed: true,
      difficulty: "easy",
    },
    {
      id: 3,
      title: "Proyecto Final",
      description: "Entregar el proyecto final de programación",
      points: 300,
      deadline: "2024-01-20",
      completed: false,
      difficulty: "hard",
    },
  ],
  skills: [
    { id: 1, name: "Matemáticas", level: 8, progress: 75 },
    { id: 2, name: "Programación", level: 12, progress: 40 },
    { id: 3, name: "Física", level: 6, progress: 90 },
    { id: 4, name: "Química", level: 4, progress: 25 },
  ],
  duels: [
    {
      id: 1,
      opponent: "María García",
      subject: "Matemáticas",
      status: "active",
      myScore: 85,
      opponentScore: 78,
      deadline: "2024-01-14",
    },
    {
      id: 2,
      opponent: "Carlos López",
      subject: "Programación",
      status: "completed",
      myScore: 92,
      opponentScore: 88,
      result: "won",
    },
  ],
}

const mockLeaderboard = [
  { id: 1, name: "Ana Rodríguez", points: 3200, level: 18, avatar: "/placeholder.svg?height=50&width=50" },
  { id: 2, name: "Juan Pérez", points: 2450, level: 15, avatar: "/placeholder.svg?height=50&width=50" },
  { id: 3, name: "María García", points: 2100, level: 14, avatar: "/placeholder.svg?height=50&width=50" },
  { id: 4, name: "Carlos López", points: 1950, level: 13, avatar: "/placeholder.svg?height=50&width=50" },
  { id: 5, name: "Laura Martín", points: 1800, level: 12, avatar: "/placeholder.svg?height=50&width=50" },
]

export const gameService = {
  async getGameData() {
    await delay(800)
    return mockGameData
  },

  async completeMission(missionId) {
    await delay(500)

    const mission = mockGameData.missions.find((m) => m.id === missionId)
    if (!mission) {
      throw new Error("Mission not found")
    }

    if (mission.completed) {
      throw new Error("Mission already completed")
    }

    mission.completed = true
    mockGameData.points += mission.points
    mockGameData.streak += 1

    return {
      pointsEarned: mission.points,
      newTotal: mockGameData.points,
      streakBonus: mockGameData.streak > 5 ? 50 : 0,
    }
  },

  async getLeaderboard() {
    await delay(600)
    return mockLeaderboard
  },

  async updateProfile(profileData) {
    await delay(700)
    return { success: true, message: "Perfil actualizado correctamente" }
  },
}
