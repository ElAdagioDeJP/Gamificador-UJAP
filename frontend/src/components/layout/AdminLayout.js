import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div className="admin-logo">
              <span className="admin-logo-icon">🎮</span>
              <span className="admin-logo-text">StudyBooster Admin</span>
            </div>
          </div>
          
          <div className="admin-user-info">
            <div className="admin-user-details">
              <span className="admin-user-name">{user?.name || 'Administrador'}</span>
              <span className="admin-user-role">Administrador del Sistema</span>
            </div>
            <div className="admin-user-avatar">
              <img 
                src={user?.avatar || "/static/avatars/male.svg"} 
                alt="Admin Avatar" 
                className="admin-avatar-img"
              />
            </div>
            <button 
              className="admin-logout-btn"
              onClick={handleLogout}
            >
              <span className="logout-icon">🚪</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="admin-body">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="admin-nav">
            <ul className="admin-nav-list">
              <li className="admin-nav-item">
                <Link 
                  to="/admin" 
                  className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="admin-nav-icon">🏠</span>
                  <span className="admin-nav-text">Dashboard</span>
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link 
                  to="/admin/professors" 
                  className={`admin-nav-link ${isActive('/admin/professors') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="admin-nav-icon">👥</span>
                  <span className="admin-nav-text">Profesores</span>
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link 
                  to="/admin/subjects" 
                  className={`admin-nav-link ${isActive('/admin/subjects') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="admin-nav-icon">📚</span>
                  <span className="admin-nav-text">Materias</span>
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link 
                  to="/admin/students" 
                  className={`admin-nav-link ${isActive('/admin/students') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="admin-nav-icon">👨‍🎓</span>
                  <span className="admin-nav-text">Estudiantes</span>
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link 
                  to="/admin/requests" 
                  className={`admin-nav-link ${isActive('/admin/requests') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="admin-nav-icon">📋</span>
                  <span className="admin-nav-text">Solicitudes</span>
                </Link>
              </li>
              <li className="admin-nav-item">
                <Link 
                  to="/admin/settings" 
                  className={`admin-nav-link ${isActive('/admin/settings') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="admin-nav-icon">⚙️</span>
                  <span className="admin-nav-text">Configuración</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main className="admin-main">
          <div className="admin-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;