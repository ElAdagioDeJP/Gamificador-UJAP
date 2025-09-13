import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationModal from '../../components/common/NotificationModal';
import { adminService } from '../../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState({
    totalProfessors: 0,
    pendingProfessors: 0,
    approvedProfessors: 0,
    rejectedProfessors: 0,
    totalSubjects: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllProfessors({ status: 'all', limit: 1 });
      const stats = response.data.statistics;
      // Basic professor statistics
      const baseStats = {
        totalProfessors: stats.total || 0,
        pendingProfessors: stats.pendientes || 0,
        approvedProfessors: stats.verificados || 0,
        rejectedProfessors: stats.rechazados || 0,
        totalSubjects: 0,
        totalStudents: 0
      };

      // Fetch system-wide totals (subjects, students, professors)
      try {
        const sys = await adminService.getSystemStatistics();
        const sysData = sys.data || {};
        baseStats.totalSubjects = sysData.totalSubjects || 0;
        baseStats.totalStudents = sysData.totalStudents || 0;
        // totalProfessors already present from professors endpoint; prefer system count if available
        baseStats.totalProfessors = sysData.totalProfessors || baseStats.totalProfessors;
      } catch (err) {
        console.warn('Could not fetch system statistics:', err);
      }

      setStatistics(baseStats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Panel de Administración</h1>
          <p>Bienvenido al centro de control del sistema StudyBooster</p>
        </div>
        <button 
          className="refresh-btn"
          onClick={fetchStatistics}
          disabled={loading}
        >
          <span className="btn-icon">🔄</span>
          Actualizar
        </button>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Profesores</h3>
            <p className="stat-number">{statistics.totalProfessors}</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pendientes</h3>
            <p className="stat-number pending">{statistics.pendingProfessors}</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Aprobados</h3>
            <p className="stat-number approved">{statistics.approvedProfessors}</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Rechazados</h3>
            <p className="stat-number rejected">{statistics.rejectedProfessors}</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Materias</h3>
            <p className="stat-number">{statistics.totalSubjects}</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>Estudiantes</h3>
            <p className="stat-number">{statistics.totalStudents}</p>
          </div>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/admin/professors" className="action-card">
            <div className="action-icon">👥</div>
            <div className="action-content">
              <h3>Gestionar Profesores</h3>
              <p>Administra el estado de los profesores y asigna materias</p>
              <span className="action-arrow">→</span>
            </div>
          </Link>

          <Link to="/admin/subjects" className="action-card">
            <div className="action-icon">📚</div>
            <div className="action-content">
              <h3>Gestionar Materias</h3>
              <p>Administra las materias y asigna profesores</p>
              <span className="action-arrow">→</span>
            </div>
          </Link>

          <Link to="/admin/requests" className="action-card">
            <div className="action-icon">📋</div>
            <div className="action-content">
              <h3>Solicitudes</h3>
              <p>Revisa las solicitudes de registro de profesores</p>
              <span className="action-arrow">→</span>
            </div>
          </Link>

          <div className="action-card disabled">
            <div className="action-icon">👨‍🎓</div>
            <div className="action-content">
              <h3>Gestionar Estudiantes</h3>
              <p>Administra los estudiantes del sistema</p>
              <span className="action-arrow">🚧</span>
            </div>
          </div>

          <div className="action-card disabled">
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h3>Reportes</h3>
              <p>Genera reportes y estadísticas del sistema</p>
              <span className="action-arrow">🚧</span>
            </div>
          </div>

          <div className="action-card disabled">
            <div className="action-icon">⚙️</div>
            <div className="action-content">
              <h3>Configuración</h3>
              <p>Configura parámetros del sistema</p>
              <span className="action-arrow">🚧</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="recent-activity">
        <h2>Actividad Reciente</h2>
        <Card className="activity-card">
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">👥</div>
              <div className="activity-content">
                <p><strong>Nuevo profesor registrado</strong></p>
                <span className="activity-time">Hace 2 horas</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <p><strong>Profesor aprobado</strong></p>
                <span className="activity-time">Hace 4 horas</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📚</div>
              <div className="activity-content">
                <p><strong>Nueva materia creada</strong></p>
                <span className="activity-time">Hace 6 horas</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🔗</div>
              <div className="activity-content">
                <p><strong>Profesor asignado a materia</strong></p>
                <span className="activity-time">Hace 8 horas</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;