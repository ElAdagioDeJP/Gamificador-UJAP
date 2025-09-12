import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationModal from '../../components/common/NotificationModal';
import { subjectService } from '../../services/subjectService';
import { adminService } from '../../services/adminService';
import './AdminSubjects.css';

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedProfessors, setSelectedProfessors] = useState([]);
  const [newSubject, setNewSubject] = useState({
    nombre_materia: '',
    codigo_materia: '',
    descripcion: '',
    creditos: 3
  });

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subjectService.getAllSubjects();
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Error al cargar las materias');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfessors = useCallback(async () => {
    try {
      const response = await adminService.getAllProfessors({ status: 'all', limit: 100 });
      // Filtrar solo profesores verificados
      const verifiedProfessors = response.data.professors.filter(
        prof => prof.estado_verificacion === 'VERIFICADO'
      );
      setProfessors(verifiedProfessors);
    } catch (error) {
      console.error('Error fetching professors:', error);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
    fetchProfessors();
  }, [fetchSubjects, fetchProfessors]);

  const handleCreateSubject = async () => {
    try {
      setActionLoading(true);
      await subjectService.createSubject(newSubject);
      
      setModalData({
        type: 'success',
        title: 'Materia Creada',
        message: 'La materia ha sido creada correctamente.',
        confirmText: 'Entendido'
      });
      setShowModal(true);
      
      setShowSubjectModal(false);
      setNewSubject({ nombre_materia: '', codigo_materia: '', descripcion: '', creditos: 3 });
      fetchSubjects();
    } catch (error) {
      console.error('Error creating subject:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Error al crear la materia.',
        confirmText: 'Entendido'
      });
      setShowModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignProfessors = (subject) => {
    setSelectedSubject(subject);
    setSelectedProfessors(subject.profesores_asignados || []);
    setShowAssignModal(true);
  };

  const handleProfessorToggle = (professorId) => {
    setSelectedProfessors(prev => {
      if (prev.includes(professorId)) {
        return prev.filter(id => id !== professorId);
      } else {
        return [...prev, professorId];
      }
    });
  };

  const handleSaveAssignments = async () => {
    try {
      setActionLoading(true);
      await adminService.assignProfessorsToSubject(selectedSubject.id_materia, selectedProfessors);
      
      setModalData({
        type: 'success',
        title: 'Profesores Asignados',
        message: 'Los profesores han sido asignados correctamente a la materia.',
        confirmText: 'Entendido'
      });
      setShowModal(true);
      
      setShowAssignModal(false);
      fetchSubjects();
    } catch (error) {
      console.error('Error assigning professors:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Error al asignar los profesores a la materia.',
        confirmText: 'Entendido'
      });
      setShowModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
      return;
    }

    try {
      setActionLoading(true);
      await subjectService.deleteSubject(subjectId);
      
      setModalData({
        type: 'success',
        title: 'Materia Eliminada',
        message: 'La materia ha sido eliminada correctamente.',
        confirmText: 'Entendido'
      });
      setShowModal(true);
      
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Error al eliminar la materia.',
        confirmText: 'Entendido'
      });
      setShowModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const getProfessorName = (professorId) => {
    const professor = professors.find(p => p.id_usuario === professorId);
    return professor ? professor.nombre_completo : 'Profesor no encontrado';
  };

  if (loading) {
    return (
      <div className="admin-subjects-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="admin-subjects">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Gestión de Materias</h1>
          <p>Administra las materias y asigna profesores</p>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={fetchSubjects}
            disabled={loading}
          >
            <span className="btn-icon">🔄</span>
            Actualizar
          </button>
          <button 
            className="create-btn"
            onClick={() => setShowSubjectModal(true)}
          >
            <span className="btn-icon">➕</span>
            Nueva Materia
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Total Materias</h3>
            <p className="stat-number">{subjects.length}</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Profesores Activos</h3>
            <p className="stat-number">{professors.length}</p>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon">🔗</div>
          <div className="stat-content">
            <h3>Asignaciones</h3>
            <p className="stat-number">
              {subjects.reduce((total, subject) => total + (subject.profesores_asignados?.length || 0), 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Lista de materias */}
      <div className="subjects-grid">
        {subjects.map((subject) => (
          <Card key={subject.id_materia} className="subject-card">
            <div className="subject-header">
              <div className="subject-info">
                <h3 className="subject-name">{subject.nombre_materia}</h3>
                <p className="subject-code">{subject.codigo_materia}</p>
                <p className="subject-credits">{subject.creditos} créditos</p>
              </div>
              <div className="subject-actions">
                <button
                  className="btn-assign"
                  onClick={() => handleAssignProfessors(subject)}
                  disabled={actionLoading}
                >
                  <span className="btn-icon">👥</span>
                  Asignar
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteSubject(subject.id_materia)}
                  disabled={actionLoading}
                >
                  <span className="btn-icon">🗑️</span>
                </button>
              </div>
            </div>
            
            {subject.descripcion && (
              <p className="subject-description">{subject.descripcion}</p>
            )}
            
            <div className="subject-professors">
              <h4>Profesores Asignados:</h4>
              {subject.profesores_asignados && subject.profesores_asignados.length > 0 ? (
                <div className="professors-list">
                  {subject.profesores_asignados.map((professorId) => (
                    <span key={professorId} className="professor-tag">
                      {getProfessorName(professorId)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="no-professors">No hay profesores asignados</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {subjects.length === 0 && (
        <Card className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No hay materias</h3>
          <p>Comienza creando tu primera materia</p>
          <button 
            className="create-btn"
            onClick={() => setShowSubjectModal(true)}
          >
            <span className="btn-icon">➕</span>
            Crear Primera Materia
          </button>
        </Card>
      )}

      {/* Modal para crear materia */}
      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nueva Materia</h3>
              <button 
                className="modal-close"
                onClick={() => setShowSubjectModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre de la Materia:</label>
                <input
                  type="text"
                  value={newSubject.nombre_materia}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, nombre_materia: e.target.value }))}
                  placeholder="Ej: Programación I"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Código de la Materia:</label>
                <input
                  type="text"
                  value={newSubject.codigo_materia}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, codigo_materia: e.target.value }))}
                  placeholder="Ej: PROG-101"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={newSubject.descripcion}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción de la materia..."
                  className="form-textarea"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Créditos:</label>
                <input
                  type="number"
                  value={newSubject.creditos}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, creditos: parseInt(e.target.value) || 3 }))}
                  min="1"
                  max="10"
                  className="form-input"
                />
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
                onClick={handleCreateSubject}
                disabled={actionLoading || !newSubject.nombre_materia || !newSubject.codigo_materia}
              >
                {actionLoading ? 'Creando...' : 'Crear Materia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para asignar profesores */}
      {showAssignModal && selectedSubject && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Asignar Profesores a {selectedSubject.nombre_materia}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAssignModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="professors-list">
                {professors.map((professor) => (
                  <label key={professor.id_usuario} className="professor-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedProfessors.includes(professor.id_usuario)}
                      onChange={() => handleProfessorToggle(professor.id_usuario)}
                    />
                    <div className="professor-info">
                      <span className="professor-name">{professor.nombre_completo}</span>
                      <span className="professor-email">{professor.email_institucional}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowAssignModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-save"
                onClick={handleSaveAssignments}
                disabled={actionLoading}
              >
                {actionLoading ? 'Guardando...' : 'Guardar Asignaciones'}
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

export default AdminSubjects;
