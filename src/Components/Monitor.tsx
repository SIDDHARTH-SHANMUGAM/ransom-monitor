import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, ExternalLink, Trash2 } from 'lucide-react';
import DeleteUrlModal from './DeleteUrlModel';
import DeleteAttackerModal from './DeleteAttackerModal';
import MonitoringChangeModal from './MonitoringChangeModal';
import AddUrlForm from './AddUrlForm';

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
  monitorStatus: boolean;
  urls: URL[];
}

function Monitor() {
  const navigate = useNavigate();
  const [attackers, setAttackers] = useState<Attacker[]>([]);
  const [syncloading, setSyncLoading] = useState(false);
  const [scraploading, setScrapLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [urlToDelete, setUrlToDelete] = useState<{ attackerId: number, urlId: number } | null>(null);
  const [attackerToDelete, setAttackerToDelete] = useState<number | null>(null);
  const [monitoringChange, setMonitoringChange] = useState<{
    attackerId: number;
    urlId?: number;
    newStatus: boolean;
  } | null>(null);
  const [expandedAttackers, setExpandedAttackers] = useState<number[]>([]);
  const [showAddUrlForm, setShowAddUrlForm] = useState<number | null>(null);

  useEffect(() => {
    fetchAttackers();
  }, []);

  const fetchAttackers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get<Attacker[]>('http://localhost:3000/server/ransommonitor/getAllAttackers');
      setAttackers(response.data);
    } catch (err) {
      setError('Failed to fetch attackers');
      console.error('Error fetching attackers:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttackerExpansion = (attackerId: number) => {
    setExpandedAttackers(prev =>
      prev.includes(attackerId)
        ? prev.filter(id => id !== attackerId)
        : [...prev, attackerId]
    );
  };

  const cancelDelete = () => {
    setUrlToDelete(null);
    setAttackerToDelete(null);
  };

  const executeDeleteUrl = async () => {
    if (!urlToDelete) return;

    try {
      setLoading(true);
      await axios.post('http://localhost:3000/server/ransommonitor/deleteUrl', {
        data: urlToDelete.urlId
      });
      await fetchAttackers();
      setUrlToDelete(null);
    } catch (err) {
      setError('Failed to delete URL');
      console.error('Error deleting URL:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteAttacker = async () => {
    if (!attackerToDelete) return;

    try {
      setLoading(true);
      await axios.post('http://localhost:3000/server/ransommonitor/deleteAttacker', {
        data: attackerToDelete
      });
      await fetchAttackers();
      setAttackerToDelete(null);
    } catch (err) {
      setError('Failed to delete attacker');
      console.error('Error deleting attacker:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmMonitoringChange = async () => {
    if (!monitoringChange) return;

    const { attackerId, urlId, newStatus } = monitoringChange;
    try {
      setLoading(true);

      const requestData = urlId
        ? { urlId, newStatus }
        : { attackerId, newStatus };

      await axios.post(
        'http://localhost:3000/server/ransommonitor/urlMonitoring',
        requestData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      await fetchAttackers();
      setMonitoringChange(null);
    } catch (err) {
      setError('Failed to update monitoring status');
      console.error('Error updating monitoring status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonitoringChange = (attackerId: number, urlId?: number) => {
    const attacker = attackers.find(a => a.attackerId === attackerId);
    if (!attacker) return;

    setMonitoringChange({
      attackerId,
      urlId,
      newStatus: urlId
        ? !attacker.urls.find(u => u.urlId === urlId)?.monitorStatus
        : !attacker.monitorStatus
    });
  };

  const handleViewAttacks = (attackerId: number) => {
    console.log("Viewing attacks for Attacker ID:", attackerId);
    navigate(`/attacks/${attackerId}`);
  };

  const handleDeleteAttacker = (attackerId: number) => {
    setAttackerToDelete(attackerId);
  };

  const handleDeleteUrl = (attackerId: number, urlId: number) => {
    setUrlToDelete({ attackerId, urlId });
  };

  const handleSyncStatus = async () => {
    setSyncLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:3000/server/ransommonitor/syncStatus');
      await fetchAttackers();
    } catch (err) {
      setError('Failed to sync status');
      console.error('Error syncing status:', err);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleDoScrap = async () => {
    setScrapLoading(true);
    setError('');
    try {
      await axios.get('http://localhost:3000/server/ransommonitor/addAttack');
      await fetchAttackers();
    } catch (err) {
      setError('Failed to Scrape');
      console.error('Error during scraping:', err);
    } finally {
      setScrapLoading(false);
    }
  };

  if (loading && attackers.length === 0) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-full">
      <DeleteUrlModal
        urlToDelete={urlToDelete}
        onCancel={cancelDelete}
        onConfirm={executeDeleteUrl}
        loading={loading}
      />

      <DeleteAttackerModal
        attackerToDelete={attackerToDelete}
        onCancel={cancelDelete}
        onConfirm={executeDeleteAttacker}
        loading={loading}
      />

      <MonitoringChangeModal
        monitoringChange={monitoringChange}
        onCancel={() => setMonitoringChange(null)}
        onConfirm={confirmMonitoringChange}
        loading={loading}
      />

      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Attacker Monitor</h1>

        <div className="flex gap-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleDoScrap}
            disabled={scraploading || loading}
          >
            {scraploading ? 'Scraping...' : 'Scrap Now'}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleSyncStatus}
            disabled={syncloading || loading}
          >
            {syncloading ? 'Syncing...' : 'Sync Status'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attacker Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scrape Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monitoring</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Scraped</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attackers.map(attacker => (
              <React.Fragment key={attacker.attackerId}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleAttackerExpansion(attacker.attackerId)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-semibold text-blue-700">{attacker.attackerName}</span>
                      <span className="ml-2 text-gray-500">
                        {expandedAttackers.includes(attacker.attackerId) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" colSpan={6}>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMonitoringChange(attacker.attackerId);
                        }}
                        className={`btn btn-sm ${!attacker.monitorStatus ? 'btn-red' : 'btn-green'}`}
                        disabled={loading}
                      >
                        {attacker.monitorStatus ? 'Disable Scrap' : 'Enable Scrap'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAttacks(attacker.attackerId);
                        }}
                        className="btn btn-blue btn-sm"
                        disabled={loading}
                      >
                        View Attacks
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAttacker(attacker.attackerId);
                        }}
                        className="btn btn-red btn-sm"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedAttackers.includes(attacker.attackerId) && (
                  <>
                    {attacker.urls.map(url => (
                      <tr key={url.urlId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="ml-6 text-gray-700">└─</div>
                        </td>
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
                          <span className={`px-2 py-1 text-xs rounded-full ${url.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {url.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${url.isScraped ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {url.isScraped ? 'Scraped' : 'Unscraped'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 text-green-500 focus:ring-indigo-500 transition duration-150 ease-in-out"
                              checked={url.monitorStatus}
                              onChange={() => handleMonitoringChange(attacker.attackerId, url.urlId)}
                              disabled={loading}
                            />
                            <span className="ml-2 text-gray-700">{url.monitorStatus ? 'Enabled' : 'Disabled'}</span>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{url.lastScrap}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteUrl(attacker.attackerId, url.urlId)}
                            className="btn btn-red btn-sm"
                            title="Delete URL"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {showAddUrlForm === attacker.attackerId ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4">
                          <AddUrlForm
                            attackerId={attacker.attackerId}
                            onCancel={() => setShowAddUrlForm(null)}
                            onSuccess={() => {
                              setShowAddUrlForm(null);
                              fetchAttackers();
                            }}
                            loading={loading}
                          />
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-2">
                          <button
                            onClick={() => setShowAddUrlForm(attacker.attackerId)}
                            className="btn btn-blue btn-sm ml-6"
                            disabled={loading}
                          >
                            + Add URL
                          </button>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Monitor;