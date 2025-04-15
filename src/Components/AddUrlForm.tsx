import React, { useState } from 'react';
import axios from 'axios';

interface AddUrlFormProps {
  attackerId: number;
  onCancel: () => void;
  onSuccess?: () => void; // Add this line
  loading: boolean;
}

const AddUrlForm: React.FC<AddUrlFormProps> = ({ 
  attackerId, 
  onCancel, 
  onSuccess,
  loading 
}) => {
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    try {
      await axios.post('http://localhost:3000/server/ransommonitor/addUrl', {
        attackerId,
        url: newUrl 
      });
      onCancel();
      if (onSuccess) onSuccess(); // Call onSuccess if provided
    } catch (err) {
      setError('Failed to add URL');
      console.error('Error adding URL:', err);
    }
  };

  return (
    <tr>
      <td colSpan={6} className="bg-gray-100">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Enter new URL"
            className="form-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </td>
    </tr>
  );
};

export default AddUrlForm;