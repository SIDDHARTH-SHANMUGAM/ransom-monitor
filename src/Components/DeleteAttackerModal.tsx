import React from 'react';

interface DeleteAttackerModalProps {
  attackerToDelete: number | null;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteAttackerModal: React.FC<DeleteAttackerModalProps> = ({ 
  attackerToDelete, 
  onCancel, 
  onConfirm,
  loading
}) => {
  if (!attackerToDelete) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">Confirm Attacker Deletion</h3>
        <p className="modal-message">This will delete the attacker and all associated URLs. Are you sure?</p>
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
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAttackerModal;