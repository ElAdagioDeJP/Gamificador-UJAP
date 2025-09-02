"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import LoadingSpinner from "./LoadingSpinner"

const ProtectedRoute = ({ children, allowedRoles = ["estudiante", "profesor"] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Verificar si el usuario tiene el rol permitido
  if (!allowedRoles.includes(user.rol)) {
    // Redirigir al dashboard correspondiente según el rol
    const redirectPath = user.rol === "profesor" ? "/teacher" : "/"
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default ProtectedRoute
