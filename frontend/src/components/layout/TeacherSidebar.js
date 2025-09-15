import { NavLink } from "react-router-dom"
import "../../styles/Sidebar.css"

const TeacherSidebar = () => {
  const menuItems = [
    { path: "/teacher", label: "Dashboard", icon: "🏠" },
  { path: "/teacher/subjects", label: "Materias", icon: "📚" },
    { path: "/teacher/students", label: "Estudiantes", icon: "👥" },
  { path: "/teacher/assignments", label: "Tareas", icon: "📝" },
  { path: "/teacher/missions", label: "Misiones", icon: "🎯" },
    { path: "/teacher/grading", label: "Calificaciones", icon: "📊" },
    { path: "/teacher/profile", label: "Perfil", icon: "👤" },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">🎓 StudyBooster</h2>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar-menu-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                end={item.path === "/teacher"}
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

export default TeacherSidebar
