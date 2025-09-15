import React, { useState, useEffect } from 'react';
import { professorRequestService } from '../../services/professorRequestService';
import api from '../../services/api';
import Card from '../../components/common/Card';
import NotificationModal from '../../components/common/NotificationModal';

const ProfessorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await professorRequestService.getPendingRequests();
      setRequests(response.data);
    } catch (error) {
      setError('Error al cargar las solicitudes');
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await professorRequestService.approveRequest(requestId);
      setNotificationData({
        type: 'success',
        title: 'Solicitud Aprobada',
        message: 'La solicitud de profesor ha sido aprobada correctamente.',
        confirmText: 'Entendido'
      });
      setShowNotification(true);
      loadRequests();
    } catch (error) {
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: error.message || 'Error al aprobar la solicitud',
        confirmText: 'Entendido'
      });
      setShowNotification(true);
    }
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setError('Debe proporcionar un motivo para el rechazo');
      return;
    }

    try {
      await professorRequestService.rejectRequest(selectedRequest.id_solicitud, rejectReason);
      setNotificationData({
        type: 'success',
        title: 'Solicitud Rechazada',
        message: 'La solicitud de profesor ha sido rechazada correctamente.',
        confirmText: 'Entendido'
      });
      setShowNotification(true);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequest(null);
      loadRequests();
    } catch (error) {
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: error.message || 'Error al rechazar la solicitud',
        confirmText: 'Entendido'
      });
      setShowNotification(true);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Profesores</h1>
        <button
          onClick={loadRequests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500 text-lg">
            No hay solicitudes pendientes de aprobación
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id_solicitud} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {request.Usuario.nombre_completo.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.Usuario.nombre_completo}
                      </h3>
                      <p className="text-gray-600">{request.Usuario.email_institucional}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Usuario:</span>
                      <p className="text-gray-900">{request.Usuario.nombre_usuario}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Sexo:</span>
                      <p className="text-gray-900">{request.Usuario.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Fecha de solicitud:</span>
                      <p className="text-gray-900">{formatDate(request.fecha_creacion)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Estado:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500">Carnet Institucional:</span>
                    <div className="mt-2">
                        {(() => {
                          const maybePath = request.carnet_institucional_url;
                          const baseFromApi = (api.defaults.baseURL || process.env.REACT_APP_API_URL || '').replace(/\/api\/?$/, '');
                          const base = baseFromApi || window.location.origin;
                          const fullUrl = /^https?:\/\//i.test(maybePath) ? maybePath : `${base}${maybePath}`;
                          return (
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver Carnet
                            </a>
                          );
                        })()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(request.id_solicitud)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 sm:mx-0 sm:h-16 sm:w-16">
                    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-red-800">
                      Rechazar Solicitud
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Está seguro de que desea rechazar la solicitud de {selectedRequest?.Usuario.nombre_completo}?
                      </p>
                      <div className="mt-4">
                        <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700">
                          Motivo del rechazo *
                        </label>
                        <textarea
                          id="rejectReason"
                          rows={3}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Explique el motivo del rechazo..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmReject}
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedRequest(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notificación */}
      <NotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        onConfirm={() => setShowNotification(false)}
        {...notificationData}
      />
    </div>
  );
};

export default ProfessorRequests;
