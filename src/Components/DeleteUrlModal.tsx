import React from 'react';

interface DeleteUrlModalProps {
  urlToDelete: { attackerId: number, urlId: number } | null;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteUrlModal: React.FC<DeleteUrlModalProps> = ({ 
  urlToDelete, 
  onCancel, 
  onConfirm,
  loading
}) => {
  if (!urlToDelete) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">Confirm URL Deletion</h3>
        <p className="modal-message">Are you sure you want to delete this URL?</p>
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

export default DeleteUrlModal;