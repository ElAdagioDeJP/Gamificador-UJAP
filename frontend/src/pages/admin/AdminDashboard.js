import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationModal from '../../components/common/NotificationModal';
import { adminService } from '../../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [statistics, setStatistics] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfessors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllProfessors(filters);
      setProfessors(response.data.professors);
      setPagination(response.data.pagination);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching professors:', error);
      setError('Error al cargar los profesores');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProfessors();
  }, [fetchProfessors]);


  const handleStatusChange = async (professorId, newStatus) => {
    try {
      setActionLoading(true);
      let motivo_rechazo = '';
      
      if (newStatus === 'RECHAZADO') {
        motivo_rechazo = prompt('Ingrese el motivo del rechazo:');
        if (!motivo_rechazo) return;
      }

      await adminService.updateProfessorStatus(professorId, newStatus, motivo_rechazo);
      
      setModalData({
        type: 'success',
        title: 'Estado Actualizado',
        message: `El profesor ha sido ${newStatus === 'VERIFICADO' ? 'aprobado' : 'rechazado'} correctamente.`,
        confirmText: 'Entendido'
      });
      setShowModal(true);
      
      // Recargar la lista
      fetchProfessors();
    } catch (error) {
      console.error('Error updating status:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar el estado del profesor.',
        confirmText: 'Entendido'
      });
      setShowModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDIENTE': { class: 'status-pending', text: 'Pendiente' },
      'VERIFICADO': { class: 'status-approved', text: 'Aprobado' },
      'RECHAZADO': { class: 'status-rejected', text: 'Rechazado' }
    };
    
    const config = statusConfig[status] || { class: 'status-unknown', text: 'Desconocido' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when changing filters
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <p>Gestiona las solicitudes y estados de los profesores</p>
      </div>

      {/* Estadísticas */}
      <div className="admin-stats">
        <Card className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Profesores</h3>
            <p className="stat-number">{statistics.total || 0}</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pendientes</h3>
            <p className="stat-number pending">{statistics.pendientes || 0}</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Aprobados</h3>
            <p className="stat-number approved">{statistics.verificados || 0}</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Rechazados</h3>
            <p className="stat-number rejected">{statistics.rechazados || 0}</p>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="filters-card">
        <div className="filters">
          <div className="filter-group">
            <label>Estado:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="VERIFICADO">Aprobados</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Por página:</label>
            <select 
              value={filters.limit} 
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabla de profesores */}
      <Card className="professors-table-card">
        <div className="table-header">
          <h2>Lista de Profesores</h2>
          <button 
            className="refresh-btn"
            onClick={fetchProfessors}
            disabled={loading}
          >
            🔄 Actualizar
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="table-container">
          <table className="professors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {professors.map((professor) => (
                <tr key={professor.id_usuario}>
                  <td>{professor.id_usuario}</td>
                  <td>{professor.nombre_completo}</td>
                  <td>{professor.email_institucional}</td>
                  <td>{getStatusBadge(professor.estado_verificacion)}</td>
                  <td>{new Date(professor.fecha_creacion).toLocaleDateString()}</td>
                  <td className="actions">
                    {professor.estado_verificacion === 'PENDIENTE' && (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleStatusChange(professor.id_usuario, 'VERIFICADO')}
                          disabled={actionLoading}
                        >
                          ✅ Aprobar
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleStatusChange(professor.id_usuario, 'RECHAZADO')}
                          disabled={actionLoading}
                        >
                          ❌ Rechazar
                        </button>
                      </>
                    )}
                    {professor.estado_verificacion === 'VERIFICADO' && (
                      <button
                        className="btn-reject"
                        onClick={() => handleStatusChange(professor.id_usuario, 'RECHAZADO')}
                        disabled={actionLoading}
                      >
                        ❌ Rechazar
                      </button>
                    )}
                    {professor.estado_verificacion === 'RECHAZADO' && (
                      <button
                        className="btn-approve"
                        onClick={() => handleStatusChange(professor.id_usuario, 'VERIFICADO')}
                        disabled={actionLoading}
                      >
                        ✅ Aprobar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              ← Anterior
            </button>
            <span>
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Siguiente →
            </button>
          </div>
        )}
      </Card>

      {/* Modal de notificación */}
      <NotificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        {...modalData}
      />
    </div>
  );
};

export default AdminDashboard;
