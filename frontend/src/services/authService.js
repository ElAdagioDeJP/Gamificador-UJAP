// Servicio real de autenticación contra el backend
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.message || data?.error || 'Error de servidor'
    throw new Error(msg)
  }
  return data
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const mockUsers = [
  {
    id: 1,
    email: "student@university.edu",
    password: "password123",
    name: "Juan Pérez",
    avatar: "/placeholder.svg?height=100&width=100",
    university: "Universidad Nacional",
    career: "Ingeniería de Sistemas",
    role: "student",
  },
  {
    id: 2,
    email: "profesor@university.edu",
    password: "profesor123",
    name: "Venecia Miranda",
    avatar: "/placeholder.svg?height=100&width=100",
    university: "Universidad Nacional",
    department: "Facultad de Ingeniería",
    subject: "Programación Avanzada",
    role: "teacher",
  },
]

export const authService = {
  async login(email, password) {
    const { data } = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    // Mapear a shape del frontend
      const user = {
        id: data.user.id_usuario,
        email: data.user.email_institucional,
        name: data.user.nombre_completo,
        avatar: "/placeholder.svg?height=100&width=100",
        university: data.user.university || "",
        career: data.user.career || "",
        rol: (data.user.rol === 'user' ? 'estudiante' : data.user.rol) || 'estudiante',
      }
    return { user, token: data.token }
  },

  async register(userData) {
    // El backend espera: username, email, password, name
    const payload = {
      username: userData.email.split('@')[0],
      email: userData.email,
      password: userData.password,
      name: userData.name,
      university: userData.university,
      career: userData.career,
    }
    const { data } = await request('/auth/register', {
      method: 'POST',
      body: payload,
    })
    const user = {
      id: data.user.id_usuario,
      email: data.user.email_institucional,
      name: data.user.nombre_completo,
      avatar: "/placeholder.svg?height=100&width=100",
      university: payload.university,
      career: payload.career,
    rol: (data.user.rol === 'user' ? 'estudiante' : data.user.rol) || userData.rol || 'estudiante',
    }
    return { user, token: data.token }
  },

  async getCurrentUser() {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')
    const { data } = await request('/auth/me', { token })
    return {
      id: data.user.id_usuario,
      email: data.user.email_institucional,
      name: data.user.nombre_completo,
      avatar: "/placeholder.svg?height=100&width=100",
      university: data.user.university || "",
      career: data.user.career || "",
    rol: (data.user.rol === 'user' ? 'estudiante' : data.user.rol) || 'estudiante',
    }
  },
}