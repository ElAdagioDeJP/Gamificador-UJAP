import api from './api';

export const professorRequestService = {
  // Crear solicitud de profesor
  async createProfessorRequest(formData) {
    try {
      // Let axios/browser set the Content-Type (including boundary) for FormData
      const response = await api.post('/professor-requests/register', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear solicitud de profesor' };
    }
  },

  // Obtener estado de solicitud del usuario actual
  async getRequestStatus() {
    try {
      const response = await api.get('/professor-requests/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener estado de solicitud' };
    }
  },

  // Obtener solicitudes pendientes (admin)
  async getPendingRequests() {
    try {
      const response = await api.get('/professor-requests/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener solicitudes pendientes' };
    }
  },

  // Aprobar solicitud
  async approveRequest(solicitudId) {
    try {
      const response = await api.put(`/professor-requests/${solicitudId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al aprobar solicitud' };
    }
  },

  // Rechazar solicitud
  async rejectRequest(solicitudId, motivoRechazo) {
    try {
      const response = await api.put(`/professor-requests/${solicitudId}/reject`, {
        motivo_rechazo: motivoRechazo
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al rechazar solicitud' };
    }
  }
};
