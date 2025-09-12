import api from './api';

export const adminService = {
  // Obtener todos los profesores con filtros y paginación
  getAllProfessors: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.page) {
      params.append('page', filters.page);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const response = await api.get(`/admin/professors?${params.toString()}`);
    return response.data;
  },

  // Obtener detalles de un profesor específico
  getProfessorDetails: async (professorId) => {
    const response = await api.get(`/admin/professors/${professorId}`);
    return response.data;
  },

  // Cambiar estado de verificación de un profesor
  updateProfessorStatus: async (professorId, status, motivo_rechazo = '') => {
    const data = { status };
    if (motivo_rechazo) {
      data.motivo_rechazo = motivo_rechazo;
    }

    const response = await api.put(`/admin/professors/${professorId}/status`, data);
    return response.data;
  },

  // Asignar materias a un profesor
  assignSubjectsToProfessor: async (professorId, subjectIds) => {
    const response = await api.post(`/admin/professors/${professorId}/subjects`, {
      subject_ids: subjectIds
    });
    return response.data;
  },

  // Asignar profesores a una materia
  assignProfessorsToSubject: async (subjectId, professorIds) => {
    const response = await api.post(`/admin/subjects/${subjectId}/professors`, {
      professor_ids: professorIds
    });
    return response.data;
  }
};
