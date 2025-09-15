import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationModal from '../../components/common/NotificationModal';
import { adminService } from '../../services/adminService';
import api from '../../services/api';
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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingRejectProfessorId, setPendingRejectProfessorId] = useState(null);
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

  const handleStatusChange = async (professorId, newStatus, motivo_rechazo = '') => {
    try {
      setActionLoading(true);
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
      // reset any pending reject state
      setPendingRejectProfessorId(null);
      setRejectReason('');
      setShowRejectModal(false);
    }
  };

  const openRejectModal = (professorId) => {
    setPendingRejectProfessorId(professorId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason || rejectReason.trim().length < 3) {
      // simple validation: require at least 3 chars
      setModalData({
        type: 'error',
        title: 'Motivo inválido',
        message: 'Por favor ingrese un motivo de al menos 3 caracteres.',
        confirmText: 'Entendido'
      });
      setShowModal(true);
      return;
    }
    await handleStatusChange(pendingRejectProfessorId, 'RECHAZADO', rejectReason.trim());
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

  const getFullUrl = (maybePath) => {
    if (!maybePath) return null;
    try {
      // If it's already absolute (http/https), return as-is
      if (/^https?:\/\//i.test(maybePath)) return maybePath;
      // Otherwise build from api base (strip trailing /api if present)
      const base = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
      if (base) return `${base}${maybePath}`;
  // Derive backend host from api baseURL or env var; fall back to current origin if unavailable
  const baseFromApi = (api.defaults.baseURL || process.env.REACT_APP_API_URL || '').replace(/\/api\/?$/, '');
  const fallbackHost = baseFromApi || window.location.origin;
  return `${fallbackHost}${maybePath}`;
    } catch (err) {
      return maybePath;
    }
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
                          onClick={() => openRejectModal(professor.id_usuario)}
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
                      </div>
                    )}
                    {professor.estado_verificacion === 'RECHAZADO' && (
                      <div className="action-buttons">
                        <button className="btn-details" onClick={() => handleViewDetails(professor)}>
                          <span className="btn-icon">ℹ️</span>
                          Motivo
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
                      (() => {
                        const fullUrl = getFullUrl(selectedProfessor.SolicitudProfesor.carnet_institucional_url);
                        return (
                          <div className="carnet-image-wrapper">
                            <img
                              src={fullUrl}
                              alt="Carnet del profesor"
                              className="carnet-image"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const placeholder = e.currentTarget.nextElementSibling;
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                            />
                            <div className="carnet-placeholder" style={{ display: 'none' }}>
                              <div className="carnet-placeholder-icon">📄</div>
                              <div>No se pudo cargar la imagen</div>
                            </div>
                            <div className="carnet-actions" style={{ marginTop: 8 }}>
                              <button
                                className="btn-view"
                                onClick={() => window.open(fullUrl, '_blank')}
                              >
                                Ver en nueva pestaña
                              </button>
                              <a
                                className="btn-download"
                                href={fullUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ marginLeft: 8 }}
                              >
                                Descargar
                              </a>
                            </div>
                          </div>
                        );
                      })()
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
      {/* Modal de rechazo (replaces prompt) */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Rechazar Solicitud</h3>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 12 }}>Ingrese el motivo del rechazo para la solicitud del profesor {professors.find(p => p.id_usuario === pendingRejectProfessorId)?.nombre_completo || ''}:</p>
              <textarea
                className="reject-textarea"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Describa el motivo del rechazo..."
                rows={6}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => { setShowRejectModal(false); setRejectReason(''); setPendingRejectProfessorId(null); }}>Cancelar</button>
              <button className="btn-save" onClick={confirmReject} disabled={actionLoading}>{actionLoading ? 'Enviando...' : 'Confirmar Rechazo'}</button>
            </div>
          </div>
        </div>
      )}

      <NotificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        {...modalData}
      />
    </div>
  );
};

export default AdminProfessors;