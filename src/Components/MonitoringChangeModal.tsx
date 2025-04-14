import React from 'react';

interface MonitoringChangeModalProps {
  monitoringChange: {
    attackerId: number;
    urlId?: number;
    newStatus: boolean;
  } | null;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const MonitoringChangeModal: React.FC<MonitoringChangeModalProps> = ({ 
  monitoringChange, 
  onCancel, 
  onConfirm,
  loading
}) => {
  if (!monitoringChange) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">Confirm Monitoring Change</h3>
        <p className="modal-message">
          Are you sure you want to {monitoringChange.newStatus ? 'enable' : 'disable'} monitoring{
            monitoringChange.urlId ? ' for this URL' : ' for all URLs of this attacker'
          }?
        </p>
        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonitoringChangeModal;