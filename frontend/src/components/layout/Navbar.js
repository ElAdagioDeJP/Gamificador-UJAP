"use client"
import { useAuth } from "../../context/AuthContext"
import Button from "../common/Button"
import "../../styles/Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="navbar-user">
          <div className="navbar-avatar avatar-initials" title={user?.name}>
            {user?.name?.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?'}
          </div>
          <div className="navbar-user-info">
            <span className="navbar-username">{user?.name}</span>
            <span className="navbar-separator">•</span>
            <span className="navbar-university">{user?.university}</span>
          </div>
        </div>

        <Button variant="secondary" size="small" className="navbar-logout" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </div>
    </header>
  )
}

export default Navbar
