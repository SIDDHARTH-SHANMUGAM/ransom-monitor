import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';

interface URL {
  url: string;
}

interface AttackerInfo {
  attackerName: string;
  email: string;
  toxId: string;
  sessionId: string;
  description: string;
  isRaas: boolean;
  monitorStatus: boolean;
}

interface AttackerForm {
  attacker: AttackerInfo;
  urls: URL[];
}

interface Message {
  text: string;
  type: 'success' | 'error';
}

interface MessageProps {
  message: Message;
  onClose: () => void;
}

const MessageComponent: React.FC<MessageProps> = ({ message, onClose }) => (
  <div
    className={`mb-4 p-3 rounded-md flex items-center justify-between ${
      message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}
    role="alert"
  >
    <span>{message.text}</span>
    {message.type === 'error' && (
      <button onClick={onClose} className="ml-4 focus:outline-none">
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

interface AddAttackerResponse {
  message?: string;
  error?: string;
  // Add other expected properties from your API response
}

function AddAttacker() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AttackerForm>({
    attacker: {
      attackerName: '',
      email: '',
      toxId: '',
      sessionId: '',
      description: '',
      isRaas: false,
      monitorStatus: true,
    },
    urls: [{ url: '' }],
  });
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  const addUrlField = () => {
    setFormData((prev) => ({
      ...prev,
      urls: [...prev.urls, { url: '' }],
    }));
  };

  const removeUrlField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index),
    }));
  };

  const handleUrlChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      urls: prev.urls.map((url, i) => (i === index ? { url: value } : url)),
    }));
  };

  const handleAttackerInfoChange = (field: keyof AttackerInfo, value: any) => {
    setFormData((prev) => ({
      ...prev,
      attacker: {
        ...prev.attacker,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const requestBody = {
      attacker: formData.attacker,
      urls: formData.urls.map((urlObj) => urlObj.url),
    };

    try {
      const token = sessionStorage.getItem('token');
      const response: AxiosResponse<AddAttackerResponse> = await axios.post(
        'http://localhost:3000/server/ransommonitor/addAttacker',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Include the token here
          },
        }
      );
      console.log(response);
      if (response.status === 200) {
        setMessage({ text: response.data.message || 'Attacker added successfully!', type: 'success' });
        setTimeout(() => navigate('/app/monitor'), 1000);
      } else if (response.status === 206) {
        setMessage({ text: response.data.message || 'Attacker Already Exist.', type: 'error' });
      } else {
        setMessage({ text: response.data.message || 'Failed to add attacker.', type: 'error' });
      }
    } catch (error: any) {
      console.error('Error adding attacker:', error);
      if (error.response && error.response.status === 401) {
        setMessage({ text: 'You are not authorized to perform this action. Please log in again.', type: 'error' });
        // sessionStorage.removeItem('token');
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        setMessage({ text: error.response?.data?.error || 'Failed to add attacker due to a server error.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMessage = () => {
    setMessage(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-8 pb-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-8"> {/* Changed max-w to 3xl */}
        <button
          onClick={() => navigate('/app/monitor')}
          className="flex items-center text-gray-700 hover:text-blue-500 transition duration-150 ease-in-out mb-4 focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Monitor
        </button>

        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Add New Attacker</h1>

        {message && <MessageComponent message={message} onClose={handleCloseMessage} />}

        <form onSubmit={handleSubmit} className="flex gap-6"> {/* Use flex to arrange columns */}
          <div className="flex-1 space-y-4"> {/* Left side: Attacker Info */}
            <div>
              <label htmlFor="attackerName" className="block text-sm font-medium text-gray-700">
                Attacker Name
              </label>
              <input
                type="text"
                id="attackerName"
                value={formData.attacker.attackerName}
                onChange={(e) => handleAttackerInfoChange('attackerName', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.attacker.email}
                onChange={(e) => handleAttackerInfoChange('email', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="toxId" className="block text-sm font-medium text-gray-700">
                Tox ID
              </label>
              <input
                type="text"
                id="toxId"
                value={formData.attacker.toxId}
                onChange={(e) => handleAttackerInfoChange('toxId', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700">
                Session ID
              </label>
              <input
                type="text"
                id="sessionId"
                value={formData.attacker.sessionId}
                onChange={(e) => handleAttackerInfoChange('sessionId', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.attacker.description}
                onChange={(e) => handleAttackerInfoChange('description', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRaas"
                checked={formData.attacker.isRaas}
                onChange={(e) => handleAttackerInfoChange('isRaas', e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="isRaas" className="ml-2 block text-sm font-medium text-gray-700">
                isRaas
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="monitorStatus"
                checked={formData.attacker.monitorStatus}
                onChange={(e) => handleAttackerInfoChange('monitorStatus', e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="monitorStatus" className="ml-2 block text-sm font-medium text-gray-700">
                Monitor Status
              </label>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">URLs</label>
                <button
                  type="button"
                  onClick={addUrlField}
                  className="inline-flex items-center text-blue-500 hover:text-blue-700 font-semibold transition duration-150 ease-in-out focus:outline-none"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add URL
                </button>
              </div>

              {formData.urls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={url.url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline sm:text-sm"
                    placeholder="Enter URL"
                    required
                    disabled={loading}
                  />
                  {formData.urls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUrlField(index)}
                      className="text-red-600 hover:text-red-700 focus:outline-none"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Attacker'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAttacker;