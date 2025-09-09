"use client"

import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Card from "../components/common/Card"
import "../styles/Auth.css"

const Register = () => {
  // Carreras por universidad
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
  const { user, register } = useAuth()
  const [redirectToLogin, setRedirectToLogin] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    career: "",
  sexo: "M",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (user) {
    return <Navigate to="/" replace />
  }
  if (redirectToLogin) {
    return <Navigate to="/login" replace />
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

  const { confirmPassword, ...registerData } = formData
    const result = await register(registerData)
    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }
    setLoading(false)
    setRedirectToLogin(true)
  }

  return (
    <div className="auth-container">
      <div className="auth-content">
        <Card className="auth-card register-form">
          <div className="auth-header">
            {/* <div className="auth-logo">🎮</div> */}
            <h1 className="auth-title">StudyBooster</h1>
            <h2 className="auth-subtitle">¡Únete a la aventura!</h2>
            <p className="auth-description">Crea tu cuenta y comienza tu viaje académico gamificado</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nombre Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Juan Pérez García"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Universitario
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="tu.email@universidad.edu"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="university" className="form-label">
                Universidad
              </label>
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
                  <label htmlFor="career" className="form-label">
                    Carrera
                  </label>
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

            <fieldset className="form-group">
              <legend className="form-label">Sexo</legend>
              <div className="form-row">
                <label className="radio-inline" htmlFor="sexoM">
                  <input id="sexoM" type="radio" name="sexo" value="M" checked={formData.sexo === 'M'} onChange={handleChange} /> Hombre
                </label>
                <label className="radio-inline" htmlFor="sexoF" style={{ marginLeft: '1rem' }}>
                  <input id="sexoF" type="radio" name="sexo" value="F" checked={formData.sexo === 'F'} onChange={handleChange} /> Mujer
                </label>
              </div>
            </fieldset>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="demo-btn">
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner"></span>
                  Creando cuenta...
                </span>
              ) : (
                "Crear Cuenta"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="auth-link">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Register
