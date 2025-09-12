import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { professorRequestService } from '../../services/professorRequestService';

const StatusBanner = ({ user }) => {
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.rol === 'profesor' && user.estado_verificacion === 'PENDIENTE') {
      checkRequestStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkRequestStatus = async () => {
    try {
      const response = await professorRequestService.getRequestStatus();
      setRequestStatus(response.data.solicitud);
    } catch (error) {
      console.error('Error checking request status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !requestStatus) return null;

  const getStatusInfo = () => {
    switch (requestStatus.estado) {
      case 'PENDIENTE':
        return {
          icon: <ClockIcon className="w-5 h-5" />,
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          title: 'Solicitud en Revisión',
          message: 'Su solicitud de profesor está siendo revisada por un administrador. Le notificaremos cuando sea aprobada.'
        };
      case 'APROBADA':
        return {
          icon: <CheckCircleIcon className="w-5 h-5" />,
          color: 'bg-green-50 border-green-200 text-green-800',
          title: '¡Solicitud Aprobada!',
          message: 'Su solicitud de profesor ha sido aprobada. Ya puede acceder a todas las funcionalidades de profesor.'
        };
      case 'RECHAZADA':
        return {
          icon: <XCircleIcon className="w-5 h-5" />,
          color: 'bg-red-50 border-red-200 text-red-800',
          title: 'Solicitud Rechazada',
          message: requestStatus.motivo_rechazo || 'Su solicitud de profesor ha sido rechazada. Contacte al administrador para más información.'
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <div className={`border-l-4 p-4 mb-6 ${statusInfo.color}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {statusInfo.icon}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">
            {statusInfo.title}
          </h3>
          <div className="mt-2 text-sm">
            <p>{statusInfo.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBanner;
