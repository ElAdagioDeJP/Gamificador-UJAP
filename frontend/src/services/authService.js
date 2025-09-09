// Servicio real de autenticación contra el backend
// Determina dinámicamente la URL de la API para evitar hardcodear IPs internas que causan timeouts en otras redes.
let API_BASE_URL = process.env.REACT_APP_API_URL;
if (!API_BASE_URL) {
  const { protocol, hostname } = window.location;
  // Si el frontend corre en localhost:3000 usamos mismo host con puerto 5000
  if (hostname === 'localhost' || hostname === '172.16.0.32') {
    API_BASE_URL = `${protocol}//${hostname}:5000/api`;
  } else {
    // fallback razonable (puede ajustarse vía REACT_APP_API_URL)
    API_BASE_URL = `${protocol}//${hostname}/api`;
  }
}

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
// (mockUsers y delay removidos - ya no se usan)

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
        avatar: data.user.avatar_url || "/placeholder.svg?height=100&width=100",
        university: data.user.universidad || "",
        career: data.user.carrera || "",
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
  sexo: userData.sexo,
    }
    const { data } = await request('/auth/register', {
      method: 'POST',
      body: payload,
    })
  const user = {
      id: data.user.id_usuario,
      email: data.user.email_institucional,
      name: data.user.nombre_completo,
      avatar: data.user.avatar_url || "/placeholder.svg?height=100&width=100",
      university: data.user.universidad || payload.university,
      career: data.user.carrera || payload.carrera,
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
      avatar: data.user.avatar_url || "/placeholder.svg?height=100&width=100",
      university: data.user.universidad || "",
      career: data.user.carrera || "",
      rol: (data.user.rol === 'user' ? 'estudiante' : data.user.rol) || 'estudiante',
    }
  },
}