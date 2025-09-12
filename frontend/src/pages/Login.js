"use client"

import { useState, useEffect } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Card from "../components/common/Card"
import TermsModal from "../components/common/TermsModal"
import NotificationModal from "../components/common/NotificationModal"
import { debugAuth, checkAuthState, forceLogout } from "../utils/debug"
import "../styles/Auth.css"

const Login = () => {
  const { user, login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showTerms, setShowTerms] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationData, setNotificationData] = useState({})

  useEffect(() => {
    // Debug del estado de autenticación
    console.log('=== LOGIN COMPONENT DEBUG ===');
    console.log('user from context:', user);
    console.log('checkAuthState:', checkAuthState());
    
    // Si hay un usuario pero no se está mostrando, forzar logout
    if (checkAuthState() && !user) {
      console.log('Hay token en localStorage pero no hay usuario en context, forzando logout');
      forceLogout();
    }
  }, [user]);

  if (user) {
    console.log('Usuario logueado, redirigiendo a:', user.role === "teacher" ? "/teacher" : "/");
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
      // Manejar estados de verificación especiales
      if (result.verificationStatus === 'PENDING') {
        setNotificationData({
          type: 'warning',
          title: 'Solicitud Pendiente',
          message: result.error,
          confirmText: 'Entendido'
        })
        setShowNotification(true)
      } else if (result.verificationStatus === 'REJECTED') {
        setNotificationData({
          type: 'error',
          title: 'Solicitud Rechazada',
          message: result.error,
          confirmText: 'Entendido'
        })
        setShowNotification(true)
      } else {
        setError(result.error)
      }
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
            <p className="terms-link-container">
              Al usar StudyBooster, aceptas nuestros{" "}
              <button 
                type="button" 
                className="terms-link" 
                onClick={() => setShowTerms(true)}
              >
                Términos y Condiciones
              </button>
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
                  <strong>Email:</strong> ana.martinez@email.edu
                  <br />
                  <strong>Contraseña:</strong> marco1234
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
                  <strong>Email:</strong> carlos.mendez@universidad.edu
                  <br />
                  <strong>Contraseña:</strong> marco1234
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Debug */}
          <div className="auth-debug" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#666' }}>🔧 Debug Tools</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                onClick={debugAuth}
                style={{ padding: '8px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                🧹 Limpiar localStorage
              </button>
              <button 
                type="button" 
                onClick={() => window.location.reload()}
                style={{ padding: '8px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                🔄 Recargar página
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setFormData({ email: 'admin@edu.com', password: 'admin123' });
                }}
                style={{ padding: '8px 12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                👤 Llenar Admin
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de Términos y Condiciones */}
      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
      />

      {/* Modal de notificación */}
      <NotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        onConfirm={() => setShowNotification(false)}
        {...notificationData}
      />
    </div>
  )
}

export default Login
