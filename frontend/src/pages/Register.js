"use client"

import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Card from "../components/common/Card"
import "../styles/Auth.css"

const Register = () => {
  const { user, register } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    career: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (user) {
    return <Navigate to="/" replace />
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
    }

    setLoading(false)
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
              <input
                type="text"
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="form-input"
                placeholder="Universidad Nacional"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="career" className="form-label">
                Carrera
              </label>
              <input
                type="text"
                id="career"
                name="career"
                value={formData.career}
                onChange={handleChange}
                className="form-input"
                placeholder="Ingeniería de Sistemas"
                required
              />
            </div>

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
