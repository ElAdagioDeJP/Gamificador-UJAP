import { NavLink } from "react-router-dom"
import "../../styles/Sidebar.css"

const Sidebar = () => {
  const menuItems = [
    { path: "/", label: "Dashboard", icon: "🏠" },
    { path: "/missions", label: "Misiones", icon: "🎯" },
    { path: "/duels", label: "Duelos", icon: "⚔️" },
    { path: "/skills", label: "Habilidades", icon: "🧠" },
    { path: "/leaderboard", label: "Clasificación", icon: "🏆" },
    { path: "/profile", label: "Perfil", icon: "👤" },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">StudyBooster</h2>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar-menu-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                end={item.path === "/"}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
