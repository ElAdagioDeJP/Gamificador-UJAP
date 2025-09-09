"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import PropTypes from "prop-types"
import { authService } from "../services/authService"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      authService
        .getCurrentUser()
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          localStorage.removeItem("token")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
  const response = await authService.login(email, password)
  setUser(response.user)
  localStorage.setItem("token", response.token)
  localStorage.setItem("user", JSON.stringify(response.user))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const register = useCallback(async (userData) => {
    try {
      const response = await authService.register(userData)
      // No guardar usuario ni token, solo retornar éxito
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
  localStorage.removeItem("user")
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    setUser,
    login,
    register,
    logout,
    loading,
  }), [user, setUser, loading, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}
