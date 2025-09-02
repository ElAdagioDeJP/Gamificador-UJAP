"use client"

import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Card from "../components/common/Card"
import "../styles/Auth.css"

const Login = () => {
  const { user, login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (user) {
    // Redirigir según el rol del usuario
    return <Navigate to={user.role === "teacher" ? "/teacher" : "/"} replace />
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

    const result = await login(formData.email, formData.password)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
  }

  const fillStudentCredentials = () => {
    setFormData({
      email: "ana.martinez@email.edu",
      password: "marco1234",
    })
  }

  const fillTeacherCredentials = () => {
    setFormData({
      email: "carlos.mendez@universidad.edu",
      password: "marco1234",
    })
  }

  return (
    <div className="auth-container">
      <div className="auth-content">
        <Card className="auth-card">
          <div className="auth-header">
            {/* <div className="auth-logo">🎮</div> */}
            <h1 className="auth-title">StudyBooster</h1>
            <h2 className="auth-subtitle">¡Bienvenido de vuelta!</h2>
            <p className="auth-description">Continúa tu aventura académica y alcanza nuevos logros</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

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

            <button type="submit" disabled={loading} className="demo-btn">
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner"></span>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="auth-link">
                Regístrate aquí
              </Link>
            </p>
          </div>

          <div className="auth-demo">
            <p className="demo-text">Cuentas de prueba</p>
            <div className="demo-accounts">
              <div className="demo-account">
                <div className="demo-account-header">
                  <span className="demo-role student">👨‍🎓 Estudiante</span>
                  <button onClick={fillStudentCredentials} className="demo-btn" type="button">
                    Usar
                  </button>
                </div>
                <div className="demo-credentials">
                  <strong>Email:</strong> student@university.edu
                  <br />
                  <strong>Contraseña:</strong> password123
                </div>
              </div>

              <div className="demo-account">
                <div className="demo-account-header">
                  <span className="demo-role teacher">👩‍🏫 Profesor</span>
                  <button onClick={fillTeacherCredentials} className="demo-btn" type="button">
                    Usar
                  </button>
                </div>
                <div className="demo-credentials">
                  <strong>Email:</strong> profesor@university.edu
                  <br />
                  <strong>Contraseña:</strong> profesor123
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login
