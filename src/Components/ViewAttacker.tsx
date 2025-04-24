import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ExternalLink,
  Trash2,
  Search,
  X,
  Eye,
  Activity,
  ChevronLeft,
} from 'lucide-react';
import DeleteUrlModal from './DeleteUrlModal';
import MonitoringChangeModal from './MonitoringChangeModal';
import AddUrlForm from './AddUrlForm';
import Notification from './Notification';

interface URL {
  urlId: number;
  URL: string;
  status: boolean;
  monitorStatus: boolean;
  lastScrap: string;
  isScraped: boolean;
}

interface Attacker {
  attackerId: number;
  attackerName: string;
  email: string;
  toxId: string;
  sessionId: string;
  description: string;
  isRAAS: boolean;
  monitorStatus: boolean;
  urls: URL[];
}

interface Message {
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

function ViewAttacker() {
  const navigate = useNavigate();
  const location = useLocation();
  const [attacker, setAttacker] = useState<Attacker | null>(null);
  const [loading, setLoading] = useState(true);
  const [urlToDelete, setUrlToDelete] = useState<{ attackerId: number; urlId: number } | null>(null);
  const [monitoringChange, setMonitoringChange] = useState<{
    attackerId: number;
    urlId?: number;
    newStatus: boolean;
  } | null>(null);
  const [showAddUrlForm, setShowAddUrlForm] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const attackerId = location.state?.attackerId;

  useEffect(() => {
    if (attackerId) {
      fetchAttacker();
    } else {
      navigate('/app/monitor');
    }
  }, [attackerId]);

  const fetchAttacker = async () => {
    setLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const response = await axios.post(
        'http://localhost:3000/server/ransommonitor/getAttacker',
        {
          attackerId: attackerId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAttacker(response.data.data);
    } catch (err: any) {
      console.error('Error fetching attacker:', err.message);
      if (err.response && err.response.status === 401) {
        setMessage({ text: 'You are not authorized to view this page. Please log in again.', type: 'error' });
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        setMessage({ text: 'Failed to fetch attacker details.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setUrlToDelete(null);
  };

  const executeDeleteUrl = async () => {
    if (!urlToDelete) return;
    const { urlId } = urlToDelete;
    const token = sessionStorage.getItem('token');
    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:3000/server/ransommonitor/deleteUrl',
        {
          data: urlId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status >= 200 && response.status < 300) {
        setMessage({ text: response.data?.message || 'URL deleted successfully.', type: 'success' });
        fetchAttacker();
        setUrlToDelete(null);
      } else {
        setMessage({ text: response.data?.message || 'Failed to delete URL.', type: 'error' });
        setUrlToDelete(null);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setMessage({ text: 'You are not authorized to view this page. Please log in again.', type: 'error' });
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        setMessage({ text: err.response?.data?.error || 'Failed to delete URL.', type: 'error' });
        setUrlToDelete(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmMonitoringChange = async () => {
    if (!monitoringChange || !attacker) return;

    const { urlId, newStatus, attackerId: currentAttackerId } = monitoringChange;
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const requestData = urlId ? { urlId, newStatus } : { attackerId: currentAttackerId, newStatus };

      const response = await axios.post(
        'http://localhost:3000/server/ransommonitor/urlMonitoring',
        requestData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (response.status >= 200 && response.status < 300) {
        setMessage({ text: response.data?.message || 'Monitoring status updated successfully.', type: 'success' });
        fetchAttacker();
        setMonitoringChange(null);
      } else {
        setMessage({ text: response.data?.message || 'Failed to update monitoring status.', type: 'error' });
        setMonitoringChange(null);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setMessage({ text: 'You are not authorized to view this page. Please log in again.', type: 'error' });
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        setMessage({ text: err.response?.data?.error || 'Failed to update monitoring status.', type: 'error' });
        setMonitoringChange(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMonitoringChange = (urlId?: number) => {
    if (!attacker) return;

    setMonitoringChange({
      attackerId: attacker.attackerId,
      urlId,
      newStatus: urlId ? !attacker.urls.find(u => u.urlId === urlId)?.monitorStatus : !attacker.monitorStatus,
    });
  };

  const handleViewAttacks = () => {
    if (attacker) {
      navigate(`/attacks/${attacker.attackerId}`);
    }
  };

  const handleDeleteUrl = (urlId: number) => {
    if (attacker) {
      setUrlToDelete({ attackerId: attacker.attackerId, urlId });
    }
  };

  const handleAddUrlSuccess = (message: string) => {
    setMessage({ text: message, type: 'success' });
    setShowAddUrlForm(false);
    fetchAttacker();
  };

  const handleAddUrlError = (message: string) => {
    setMessage({ text: message, type: 'error' });
  };

  const handleCloseMessage = () => {
    setMessage(null);
  };

  const navigateBack = () => {
    navigate('/app/monitor');
  };

  return (
    <div className="container mx-auto p-6 max-w-full relative">
      <DeleteUrlModal
        urlToDelete={urlToDelete}
        onCancel={cancelDelete}
        onConfirm={executeDeleteUrl}
        loading={loading}
      />

      <MonitoringChangeModal
        monitoringChange={monitoringChange}
        onCancel={() => setMonitoringChange(null)}
        onConfirm={confirmMonitoringChange}
        loading={loading}
      />

      <Notification message={message} onClose={handleCloseMessage} />

      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <button
            onClick={navigateBack}
            className="btn btn-sm mr-4"
            disabled={loading}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {attacker?.attackerName || 'Loading...'}
          </h1>
        </div>

        <div className="flex gap-2 btn">
          <button
            onClick={() => handleMonitoringChange()}
            className={`btn btn-sm ${!attacker?.monitorStatus ? 'btn-red' : 'btn-green'}`}
            disabled={loading}
          >
            {!attacker?.monitorStatus ? 'Enable Scrap' : 'Disable Scrap'}
          </button>
          <button
            onClick={handleViewAttacks}
            className="btn btn-blue btn-sm"
            disabled={loading || !attacker}
          >
            View Attacks
          </button>
        </div>
      </div>

      {attacker && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Attacker Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{attacker.attackerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{attacker.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tox ID</label>
                  <p className="mt-1 text-sm text-gray-900">{attacker.toxId || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Additional Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Session ID</label>
                  <p className="mt-1 text-sm text-gray-900">{attacker.sessionId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{attacker.description || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">RaaS</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {attacker.isRAAS ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">URLs</h2>
          <button
            onClick={() => setShowAddUrlForm(true)}
            className="btn btn-blue btn-sm"
            disabled={loading || !attacker}
          >
            + Add URL
          </button>
        </div>

        {showAddUrlForm && attacker && (
          <AddUrlForm
            attackerId={attacker.attackerId}
            onCancel={() => setShowAddUrlForm(false)}
            onSuccess={handleAddUrlSuccess}
            onError={handleAddUrlError}
            loading={loading}
          />
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scrape Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monitoring
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Scraped
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attacker?.urls.map(url => (
                <tr key={url.urlId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2 text-blue-500" />
                      <a
                        href={url.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {url.URL}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        url.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {url.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        url.isScraped ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {url.isScraped ? 'Scraped' : 'Unscraped'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-green-500 focus:ring-indigo-500 transition duration-150 ease-in-out"
                        checked={url.monitorStatus}
                        onChange={() => handleMonitoringChange(url.urlId)}
                        disabled={loading}
                      />
                      <span className="ml-2 text-gray-700">{url.monitorStatus ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{url.lastScrap}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteUrl(url.urlId)}
                      className="btn btn-red btn-sm"
                      title="Delete URL"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {attacker?.urls.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No URLs found for this attacker
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ViewAttacker;