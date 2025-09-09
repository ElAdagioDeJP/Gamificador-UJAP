"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useGame } from "../context/GameContext"
import Card from "../components/common/Card"
import Button from "../components/common/Button"
import LoadingSpinner from "../components/common/LoadingSpinner"
import "../styles/Profile.css"

// Carreras por universidad (igual que en Register)
const careersByUniversity = {
  UJAP: [
    "Ingeniería Civil",
    "Ingeniería de Computación",
    "Ingeniería Electrónica",
    "Ingeniería Industrial",
    "Ingeniería Mecánica",
    "Ingeniería en Telecomunicaciones",
    "Arquitectura",
    "Administración de Empresas",
    "Contaduría Pública",
    "Mercadeo",
    "Relaciones Industriales",
    "Administración Pública",
    "Odontología",
    "Derecho",
    "Educación Inicial",
    "Educación Integral",
    "Educación Informática"
  ],
  UAM: [
    "Fisioterapia",
    "Histotecnología",
    "Citotecnología",
    "TSU Fisioterapia",
    "TSU Imagenología",
    "Psicología",
    "Comunicación Social",
    "Contaduría",
    "Administración Comercial",
    "Diseño Gráfico",
    "Idiomas Modernos",
    "Derecho",
    "Ingeniería Electrónica",
    "TSU Comunicaciones y Electrónica",
    "TSU Computación"
  ],
  UCAB: [
    "Ingeniería Industrial",
    "Ingeniería Informática",
    "Arquitectura",
    "Ingeniería Civil",
    "Ingeniería en Telecomunicaciones",
    "Ingeniería Mecatrónica",
    "TSU Diseño y Producción de Software",
    "Filosofía",
    "Psicología",
    "Letras",
    "Comunicación Social",
    "Educación",
    "Administración",
    "Contaduría",
    "Relaciones Industriales",
    "Sociología",
    "Economía",
    "TSU en Seguridad y Salud Laboral",
    "TSU en Seguros",
    "Derecho",
    "Teología"
  ],
  UBA: [
    "Administración de Empresas",
    "Contaduría Pública",
    "Comunicación Social",
    "Derecho",
    "Psicología",
    "Ingeniería en Sistemas",
    "Ingeniería Electrónica"
  ]
};

const Profile = () => {
  const { user, setUser } = useAuth()
  const { gameData, loading } = useGame()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    university: user?.university || "",
    career: user?.career || "",
  })

  if (loading) {
    return <LoadingSpinner />
  }

  const { level, points, streak, skills } = gameData

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Guardar cambios en el backend
    import("../services/gameService").then(({ gameService }) => {
      gameService.updateProfile(formData)
        .then((data) => {
          console.log('Respuesta updateProfile:', data);
          if (data && data.success !== false && data.user) {
            setUser((prev) => ({
              ...prev,
              name: data.user.nombre_completo,
              university: data.user.universidad,
              career: data.user.carrera,
            }))
            setIsEditing(false)
            alert("Perfil actualizado correctamente")
          } else {
            alert(data?.message || "Error inesperado: la respuesta no contiene datos de usuario")
          }
        })
        .catch((err) => {
          alert(err?.message || "Error al actualizar el perfil")
        })
    })
  }

  const achievements = [
    { id: 1, name: "Primer Paso", description: "Completaste tu primera misión", icon: "🎯", earned: true },
    { id: 2, name: "Racha de Fuego", description: "Mantuviste una racha de 7 días", icon: "🔥", earned: true },
    { id: 3, name: "Duelista", description: "Ganaste tu primer duelo", icon: "⚔️", earned: true },
    { id: 4, name: "Estudiante Dedicado", description: "Alcanzaste el nivel 10", icon: "📚", earned: true },
    { id: 5, name: "Maestro", description: "Alcanza el nivel 20", icon: "🎓", earned: false },
    { id: 6, name: "Leyenda", description: "Acumula 5000 puntos", icon: "👑", earned: false },
  ]

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>👤 Mi Perfil</h1>
        <p>Gestiona tu información personal y revisa tus logros</p>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          <Card className="profile-info-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar avatar-initials-lg" title={user?.name}>
                {user?.name?.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?'}
              </div>
            </div>

            <div className="profile-details">
              {!isEditing ? (
                <div className="profile-view">
                  <div className="profile-field">
                    <label>Nombre Completo</label>
                    <p>{user?.name}</p>
                  </div>
                  <div className="profile-field">
                    <label>Email</label>
                    <p>{user?.email}</p>
                  </div>
                  <div className="profile-field">
                    <label>Universidad</label>
                    <p>{user?.university}</p>
                  </div>
                  <div className="profile-field">
                    <label>Carrera</label>
                    <p>{user?.career}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="profile-edit">
                  <div className="form-group">
                    <label htmlFor="name">Nombre Completo</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="university">Universidad</label>
                    <select
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">Selecciona una universidad</option>
                      <option value="UJAP">UJAP</option>
                      <option value="UAM">UAM</option>
                      <option value="UCAB">UCAB</option>
                      <option value="UBA">UBA</option>
                    </select>
                  </div>
                  <div className="form-group">
                    {formData.university && (
                      <>
                        <label htmlFor="career">Carrera</label>
                        <select
                          id="career"
                          name="career"
                          value={formData.career}
                          onChange={handleChange}
                          className="form-input"
                          required
                        >
                          <option value="">Selecciona una carrera</option>
                          {careersByUniversity[formData.university]?.map((career) => (
                            <option key={career} value={career}>{career}</option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                  <div className="form-actions">
                    <Button type="submit" variant="primary">
                      Guardar Cambios
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>

          <Card title="📊 Estadísticas Generales" className="profile-stats-card">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-icon">🏆</span>
                <div className="stat-info">
                  <h3>Nivel {level}</h3>
                  <p>Académico Avanzado</p>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <div className="stat-info">
                  <h3>{points.toLocaleString()}</h3>
                  <p>Puntos Totales</p>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🔥</span>
                <div className="stat-info">
                  <h3>{streak} días</h3>
                  <p>Racha Actual</p>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🧠</span>
                <div className="stat-info">
                  <h3>{skills.length}</h3>
                  <p>Habilidades</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="profile-sidebar">
          <Card title="🏅 Logros" className="achievements-card">
            <div className="achievements-list">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`achievement-item ${achievement.earned ? "earned" : "locked"}`}>
                  <span className="achievement-icon">{achievement.icon}</span>
                  <div className="achievement-info">
                    <h4>{achievement.name}</h4>
                    <p>{achievement.description}</p>
                  </div>
                  {achievement.earned ? (
                    <span className="achievement-status earned">✅</span>
                  ) : (
                    <span className="achievement-status locked">🔒</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card title="📈 Progreso de Habilidades" className="skills-progress-card">
            <div className="skills-list">
              {skills.slice(0, 4).map((skill) => (
                <div key={skill.id} className="skill-item">
                  <div className="skill-header">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-level">Nivel {skill.level}</span>
                  </div>
                  <div className="skill-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${skill.progress}%` }}></div>
                    </div>
                    <span className="progress-text">{skill.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile
