import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationModal from '../../components/common/NotificationModal';
import { adminService } from '../../services/adminService';
import { subjectService } from '../../services/subjectService';
import './AdminProfessors.css';

const AdminProfessors = () => {
  const [professors, setProfessors] = useState([]);
  const [subjects, setSubjects] = useState([]);
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
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

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

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await subjectService.getAllSubjects();
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, []);

  useEffect(() => {
    fetchProfessors();
    fetchSubjects();
  }, [fetchProfessors, fetchSubjects]);

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

  const handleAssignSubjects = (professor) => {
    setSelectedProfessor(professor);
    setSelectedSubjects(professor.materias_asignadas || []);
    setShowSubjectModal(true);
  };

  const handleViewDetails = (professor) => {
    setSelectedProfessor(professor);
    setShowDetailsModal(true);
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleSaveSubjects = async () => {
    try {
      setActionLoading(true);
      await adminService.assignSubjectsToProfessor(selectedProfessor.id_usuario, selectedSubjects);
      
      setModalData({
        type: 'success',
        title: 'Materias Asignadas',
        message: 'Las materias han sido asignadas correctamente al profesor.',
        confirmText: 'Entendido'
      });
      setShowModal(true);
      
      setShowSubjectModal(false);
      fetchProfessors();
    } catch (error) {
      console.error('Error assigning subjects:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Error al asignar las materias al profesor.',
        confirmText: 'Entendido'
      });
      setShowModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDIENTE': { class: 'status-pending', text: 'Pendiente', icon: '⏳' },
      'VERIFICADO': { class: 'status-approved', text: 'Aprobado', icon: '✅' },
      'RECHAZADO': { class: 'status-rejected', text: 'Rechazado', icon: '❌' }
    };
    
    const config = statusConfig[status] || { class: 'status-unknown', text: 'Desconocido', icon: '❓' };
    return (
      <span className={`status-badge ${config.class}`}>
        <span className="status-icon">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  if (loading) {
    return (
      <div className="admin-professors-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="admin-professors">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Gestión de Profesores</h1>
          <p>Administra el estado de los profesores y asigna materias</p>
        </div>
        <button 
          className="refresh-btn"
          onClick={fetchProfessors}
          disabled={loading}
        >
          <span className="btn-icon">🔄</span>
          Actualizar
        </button>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
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
      <Card className="table-card">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
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
                <th>Materias</th>
                <th>Fecha Registro</th>
                <th>Detalles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {professors.map((professor) => (
                <tr key={professor.id_usuario}>
                  <td className="professor-id">#{professor.id_usuario}</td>
                  <td className="professor-name">
                    <div className="name-info">
                      <span className="name">{professor.nombre_completo}</span>
                    </div>
                  </td>
                  <td className="professor-email">{professor.email_institucional}</td>
                  <td className="professor-status">{getStatusBadge(professor.estado_verificacion)}</td>
                  <td className="professor-subjects">
                    <span className="subjects-count">
                      {professor.materias_asignadas?.length || 0} materias
                    </span>
                  </td>
                  <td className="professor-date">
                    {new Date(professor.fecha_creacion).toLocaleDateString()}
                  </td>
                  <td className="professor-details">
                    <button
                      className="btn-details"
                      onClick={() => handleViewDetails(professor)}
                    >
                      <span className="btn-icon">👁️</span>
                      Ver
                    </button>
                  </td>
                  <td className="professor-actions">
                    {professor.estado_verificacion === 'PENDIENTE' && (
                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => handleStatusChange(professor.id_usuario, 'VERIFICADO')}
                          disabled={actionLoading}
                        >
                          <span className="btn-icon">✅</span>
                          Aprobar
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleStatusChange(professor.id_usuario, 'RECHAZADO')}
                          disabled={actionLoading}
                        >
                          <span className="btn-icon">❌</span>
                          Rechazar
                        </button>
                      </div>
                    )}
                    {professor.estado_verificacion === 'VERIFICADO' && (
                      <div className="action-buttons">
                        <button
                          className="btn-assign"
                          onClick={() => handleAssignSubjects(professor)}
                          disabled={actionLoading}
                        >
                          <span className="btn-icon">📚</span>
                          Asignar
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleStatusChange(professor.id_usuario, 'RECHAZADO')}
                          disabled={actionLoading}
                        >
                          <span className="btn-icon">❌</span>
                          Rechazar
                        </button>
                      </div>
                    )}
                    {professor.estado_verificacion === 'RECHAZADO' && (
                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => handleStatusChange(professor.id_usuario, 'VERIFICADO')}
                          disabled={actionLoading}
                        >
                          <span className="btn-icon">✅</span>
                          Aprobar
                        </button>
                      </div>
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
              className="pagination-btn"
            >
              ← Anterior
            </button>
            <div className="pagination-info">
              Página {pagination.currentPage} de {pagination.totalPages}
            </div>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="pagination-btn"
            >
              Siguiente →
            </button>
          </div>
        )}
      </Card>

      {/* Modal de detalles del profesor */}
      {showDetailsModal && selectedProfessor && (
        <div className="modal-overlay">
          <div className="modal-content details-modal">
            <div className="modal-header">
              <h3>Detalles del Profesor</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="professor-details-grid">
                <div className="detail-item">
                  <label>ID:</label>
                  <span>#{selectedProfessor.id_usuario}</span>
                </div>
                <div className="detail-item">
                  <label>Nombre Completo:</label>
                  <span>{selectedProfessor.nombre_completo}</span>
                </div>
                <div className="detail-item">
                  <label>Email Institucional:</label>
                  <span>{selectedProfessor.email_institucional}</span>
                </div>
                <div className="detail-item">
                  <label>Estado:</label>
                  <span>{getStatusBadge(selectedProfessor.estado_verificacion)}</span>
                </div>
                <div className="detail-item">
                  <label>Fecha de Registro:</label>
                  <span>{new Date(selectedProfessor.fecha_creacion).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Materias Asignadas:</label>
                  <span>{selectedProfessor.materias_asignadas?.length || 0} materias</span>
                </div>
                {selectedProfessor.SolicitudProfesor?.motivo_rechazo && (
                  <div className="detail-item full-width">
                    <label>Motivo de Rechazo:</label>
                    <span className="rejection-reason">{selectedProfessor.SolicitudProfesor.motivo_rechazo}</span>
                  </div>
                )}
                {/* Carnet del profesor */}
                <div className="detail-item full-width">
                  <div className="carnet-container">
                    <div className="carnet-title">Carnet Institucional</div>
                    {selectedProfessor.SolicitudProfesor?.carnet_institucional_url ? (
                      <img 
                        src={selectedProfessor.SolicitudProfesor.carnet_institucional_url} 
                        alt="Carnet del profesor" 
                        className="carnet-image"
                        onClick={() => window.open(selectedProfessor.SolicitudProfesor.carnet_institucional_url, '_blank')}
                      />
                    ) : (
                      <div className="carnet-placeholder">
                        <div className="carnet-placeholder-icon">📄</div>
                        <div>No se ha subido carnet</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-close"
                onClick={() => setShowDetailsModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de asignación de materias */}
      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Asignar Materias a {selectedProfessor?.nombre_completo}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowSubjectModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="subjects-list">
                {subjects.map((subject) => (
                  <label key={subject.id_materia} className="subject-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id_materia)}
                      onChange={() => handleSubjectToggle(subject.id_materia)}
                    />
                    <span className="subject-name">{subject.nombre_materia}</span>
                    <span className="subject-code">({subject.codigo_materia})</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowSubjectModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-save"
                onClick={handleSaveSubjects}
                disabled={actionLoading}
              >
                {actionLoading ? 'Guardando...' : 'Guardar Materias'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notificación */}
      <NotificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        {...modalData}
      />
    </div>
  );
};

export default AdminProfessors;