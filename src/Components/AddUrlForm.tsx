import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface AddUrlFormProps {
  attackerId: number;
  onCancel: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  loading: boolean;
}

interface AddUrlResponse {
  message?: string;
  error?: string;
  // Add other expected properties from your API response
}

const AddUrlForm: React.FC<AddUrlFormProps> = ({
  attackerId,
  onCancel,
  onSuccess,
  onError,
  loading
}) => {
  const [newUrl, setNewUrl] = useState('');
  const [formError, setFormError] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      setFormError('Please enter a URL.');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response: AxiosResponse<AddUrlResponse> = await axios.post(
        'http://localhost:3000/server/ransommonitor/addUrl',
        {
          attackerId,
          url: newUrl
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onCancel();
      if (response.status === 200) {
        onSuccess(response.data?.message || 'URL added successfully.');
      } else if (response.status === 206) {
        onError(response.data?.message || 'URL Already Exists.');
      } else {
        onError(response.data?.message || `Failed to add URL (Status: ${response.status})`);
      }
    } catch (err: any) {
      console.error('Error adding URL:', err);
      if (err.response && err.response.status === 401) {
        onError('You are not authorized to perform this action. Please log in again.');
        // sessionStorage.removeItem('token');
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        setFormError('Failed to add URL.');
        onError(err.response?.data?.error || `Failed to add URL (Error: ${err.message})`);
      }
    }
  };

  return (
    <tr>
      <td colSpan={7} className="bg-gray-100 w-700">
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
        {formError && <p className="text-red-500 text-sm mt-1">{formError}</p>}
      </td>
    </tr>
  );
};

export default AddUrlForm;