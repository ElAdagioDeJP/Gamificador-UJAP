"use client"

import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Card from "../components/common/Card"
import NotificationModal from "../components/common/NotificationModal"
import { professorRequestService } from "../services/professorRequestService"
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
    rol: "estudiante", // Nuevo campo para el rol
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [carnetFile, setCarnetFile] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationData, setNotificationData] = useState({})

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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError('Solo se permiten archivos JPEG, JPG, PNG o PDF')
        return
      }
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5MB')
        return
      }
      setCarnetFile(file)
      setError('')
    }
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

    // Validar que si es profesor, debe subir carnet
    if (formData.rol === 'profesor' && !carnetFile) {
      setError("Debe subir una imagen de su carnet institucional para registrarse como profesor")
      setLoading(false)
      return
    }

    try {
      if (formData.rol === 'profesor') {
        // Crear solicitud de profesor
        const formDataToSend = new FormData()
        formDataToSend.append('nombre_usuario', formData.email.split('@')[0])
        formDataToSend.append('nombre_completo', formData.name)
        formDataToSend.append('email_institucional', formData.email)
        formDataToSend.append('sexo', formData.sexo)
        formDataToSend.append('contrasena', formData.password)
        formDataToSend.append('carnetInstitucional', carnetFile)

        const result = await professorRequestService.createProfessorRequest(formDataToSend)
        
        setNotificationData({
          type: 'success',
          title: '¡Solicitud Enviada!',
          message: 'Su solicitud de profesor ha sido enviada correctamente. Recibirá una notificación por email cuando sea aprobada. Mientras tanto, puede explorar la plataforma como visitante.',
          confirmText: 'Continuar'
        })
        setShowNotification(true)
      } else {
        // Registro normal de estudiante
        const { confirmPassword, rol, ...registerData } = formData
        const result = await register(registerData)
        if (!result.success) {
          setError(result.error)
          setLoading(false)
          return
        }
        setRedirectToLogin(true)
      }
    } catch (error) {
      setError(error.message || 'Error al procesar la solicitud')
    }
    
    setLoading(false)
  }

  const handleNotificationClose = () => {
    setShowNotification(false)
    // Redirigir a la página principal en lugar del login
    window.location.href = '/'
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
              <legend className="form-label">Tipo de Usuario</legend>
              <div className="form-row">
                <label className="radio-inline" htmlFor="rolEstudiante">
                  <input 
                    id="rolEstudiante" 
                    type="radio" 
                    name="rol" 
                    value="estudiante" 
                    checked={formData.rol === 'estudiante'} 
                    onChange={handleChange} 
                  /> Estudiante
                </label>
                <label className="radio-inline" htmlFor="rolProfesor" style={{ marginLeft: '1rem' }}>
                  <input 
                    id="rolProfesor" 
                    type="radio" 
                    name="rol" 
                    value="profesor" 
                    checked={formData.rol === 'profesor'} 
                    onChange={handleChange} 
                  /> Profesor
                </label>
              </div>
            </fieldset>

            {formData.rol === 'profesor' && (
              <div className="form-group">
                <label htmlFor="carnetInstitucional" className="form-label">
                  Carnet Institucional *
                </label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="carnetInstitucional"
                    name="carnetInstitucional"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="file-input"
                    required
                  />
                  <label htmlFor="carnetInstitucional" className="file-upload-label">
                    <div className="file-upload-content">
                      <svg className="file-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="file-upload-text">
                        {carnetFile ? carnetFile.name : 'Subir imagen del carnet institucional'}
                      </span>
                      <span className="file-upload-hint">JPEG, PNG o PDF (máx. 5MB)</span>
                    </div>
                  </label>
                </div>
                {carnetFile && (
                  <div className="file-preview">
                    <span className="file-preview-name">✓ {carnetFile.name}</span>
                    <span className="file-preview-size">({(carnetFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
            )}

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

      {/* Modal de notificación */}
      <NotificationModal
        isOpen={showNotification}
        onClose={handleNotificationClose}
        onConfirm={handleNotificationClose}
        {...notificationData}
      />
    </div>
  )
}

export default Register
