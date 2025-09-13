import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const ICON_MAP = {
  success: { icon: CheckCircleIcon, color: '#1f9d55' },
  error: { icon: XCircleIcon, color: '#dc2626' },
  warning: { icon: ExclamationTriangleIcon, color: '#d97706' },
  info: { icon: InformationCircleIcon, color: '#2563eb' }
};

const defaultTitles = {
  success: '¡Solicitud enviada! 🎉',
  error: 'Error',
  warning: 'Atención',
  info: 'Información'
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.45)',
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px'
};

const panelStyle = {
  width: '100%',
  maxWidth: 560,
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  overflow: 'hidden'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '20px 20px',
  borderBottom: '1px solid #f1f1f1'
};

const bodyStyle = {
  padding: '18px 20px',
  color: '#333',
  fontSize: 15,
  lineHeight: 1.45
};

const footerStyle = {
  padding: '14px 20px',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  borderTop: '1px solid #f6f6f6',
  background: '#fafafa'
};

const closeBtnStyle = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 18,
  color: '#666'
};

const primaryBtnStyle = (type) => ({
  background: ICON_MAP[type]?.color || ICON_MAP.info.color,
  color: '#fff',
  border: 'none',
  padding: '10px 14px',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600
});

const NotificationModal = ({
  isOpen,
  onClose,
  type = 'info',
  title,
  message,
  confirmText = 'Entendido',
  onConfirm
}) => {
  if (!isOpen) return null;

  const Icon = ICON_MAP[type]?.icon || ICON_MAP.info.icon;
  const iconColor = ICON_MAP[type]?.color || ICON_MAP.info.color;
  const resolvedTitle = title || defaultTitles[type] || defaultTitles.info;

  const handleConfirm = () => {
    if (onConfirm) return onConfirm();
    if (onClose) return onClose();
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: 44, height: 44, color: iconColor }} aria-hidden />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{resolvedTitle}</div>
            {message && <div style={{ marginTop: 6, color: '#555', fontSize: 14 }}>{message}</div>}
          </div>
          <div>
            <button aria-label="Cerrar" onClick={onClose} style={closeBtnStyle}>✕</button>
          </div>
        </div>

        <div style={bodyStyle}>
          {/* Extra space for longer explanations or actions */}
        </div>

        <div style={footerStyle}>
          <button onClick={handleConfirm} style={primaryBtnStyle(type)}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
