// Simulación de API para datos del profesor
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const mockStudents = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@university.edu",
    avatar: "/placeholder.svg?height=50&width=50",
    university: "Universidad Nacional",
    career: "Ingeniería de Sistemas",
    level: 15,
    points: 2450,
    streak: 7,
    status: "active",
    lastActivity: "2024-01-10",
  },
  {
    id: 2,
    name: "Ana Rodríguez",
    email: "ana.rodriguez@university.edu",
    avatar: "/placeholder.svg?height=50&width=50",
    university: "Universidad Nacional",
    career: "Ingeniería de Sistemas",
    level: 18,
    points: 3200,
    streak: 12,
    status: "active",
    lastActivity: "2024-01-10",
  },
  {
    id: 3,
    name: "Carlos López",
    email: "carlos.lopez@university.edu",
    avatar: "/placeholder.svg?height=50&width=50",
    university: "Universidad Nacional",
    career: "Ingeniería de Sistemas",
    level: 13,
    points: 1950,
    streak: 3,
    status: "inactive",
    lastActivity: "2024-01-08",
  },
  {
    id: 4,
    name: "Laura Martín",
    email: "laura.martin@university.edu",
    avatar: "/placeholder.svg?height=50&width=50",
    university: "Universidad Nacional",
    career: "Ingeniería de Sistemas",
    level: 12,
    points: 1800,
    streak: 5,
    status: "active",
    lastActivity: "2024-01-10",
  },
]

const mockAssignments = [
  {
    id: 1,
    title: "Proyecto Final - Sistema Web",
    description: "Desarrollar una aplicación web completa usando React y Node.js",
    dueDate: "2024-01-25",
    points: 300,
    difficulty: "hard",
    submissions: 12,
    totalStudents: 15,
    status: "active",
    createdAt: "2024-01-05",
  },
  {
    id: 2,
    title: "Ejercicios de Algoritmos",
    description: "Resolver 10 problemas de algoritmos y estructuras de datos",
    dueDate: "2024-01-15",
    points: 150,
    difficulty: "medium",
    submissions: 14,
    totalStudents: 15,
    status: "active",
    createdAt: "2024-01-03",
  },
  {
    id: 3,
    title: "Ensayo sobre IA",
    description: "Escribir un ensayo de 2000 palabras sobre el impacto de la IA",
    dueDate: "2024-01-12",
    points: 100,
    difficulty: "easy",
    submissions: 15,
    totalStudents: 15,
    status: "completed",
    createdAt: "2024-01-01",
  },
]

const mockSubmissions = [
  {
    id: 1,
    assignmentId: 1,
    studentId: 1,
    studentName: "Juan Pérez",
    submittedAt: "2024-01-10",
    status: "pending",
    grade: null,
    feedback: "",
    fileUrl: "/placeholder-document.pdf",
  },
  {
    id: 2,
    assignmentId: 1,
    studentId: 2,
    studentName: "Ana Rodríguez",
    submittedAt: "2024-01-09",
    status: "graded",
    grade: 95,
    feedback: "Excelente trabajo, muy completo y bien estructurado.",
    fileUrl: "/placeholder-document.pdf",
  },
  {
    id: 3,
    assignmentId: 2,
    studentId: 1,
    studentName: "Juan Pérez",
    submittedAt: "2024-01-08",
    status: "graded",
    grade: 88,
    feedback: "Buen trabajo, pero puede mejorar la eficiencia de algunos algoritmos.",
    fileUrl: "/placeholder-document.pdf",
  },
]

export const teacherService = {
  async getStudents() {
    await delay(800)
    return mockStudents
  },

  async createStudent(studentData) {
    await delay(1000)

    const newStudent = {
      id: mockStudents.length + 1,
      ...studentData,
      avatar: "/placeholder.svg?height=50&width=50",
      level: 1,
      points: 0,
      streak: 0,
      status: "active",
      lastActivity: new Date().toISOString().split("T")[0],
    }

    mockStudents.push(newStudent)
    return newStudent
  },

  async deleteStudent(studentId) {
    await delay(500)
    const index = mockStudents.findIndex((s) => s.id === studentId)
    if (index > -1) {
      mockStudents.splice(index, 1)
      return { success: true }
    }
    throw new Error("Estudiante no encontrado")
  },

  async getStudent(studentId) {
    await delay(500)
    const student = mockStudents.find((s) => s.id === studentId)
    if (!student) {
      throw new Error("Estudiante no encontrado")
    }
    return student
  },

  async getAssignments() {
    await delay(600)
    return mockAssignments
  },

  async createAssignment(assignmentData) {
    await delay(1000)

    const newAssignment = {
      id: mockAssignments.length + 1,
      ...assignmentData,
      submissions: 0,
      totalStudents: mockStudents.length,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    }

    mockAssignments.push(newAssignment)
    return newAssignment
  },

  async getSubmissions(assignmentId = null) {
    await delay(700)
    if (assignmentId) {
      return mockSubmissions.filter((s) => s.assignmentId === assignmentId)
    }
    return mockSubmissions
  },

  async gradeSubmission(submissionId, grade, feedback) {
    await delay(800)

    const submission = mockSubmissions.find((s) => s.id === submissionId)
    if (!submission) {
      throw new Error("Entrega no encontrada")
    }

    submission.grade = grade
    submission.feedback = feedback
    submission.status = "graded"

    return submission
  },

  async getTeacherStats() {
    await delay(500)

    return {
      totalStudents: mockStudents.length,
      activeStudents: mockStudents.filter((s) => s.status === "active").length,
      totalAssignments: mockAssignments.length,
      pendingSubmissions: mockSubmissions.filter((s) => s.status === "pending").length,
      averageGrade:
        mockSubmissions.filter((s) => s.grade !== null).reduce((acc, s) => acc + s.grade, 0) /
          mockSubmissions.filter((s) => s.grade !== null).length || 0,
    }
  },
}
