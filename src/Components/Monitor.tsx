import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AttackerRow from './AttackerRow';
import DeleteUrlModal from './DeleteUrlModel';
import DeleteAttackerModal from './DeleteAttackerModal';
import MonitoringChangeModal from './MonitoringChangeModal';

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
  const [urlToDelete, setUrlToDelete] = useState<{attackerId: number, urlId: number} | null>(null);
  const [attackerToDelete, setAttackerToDelete] = useState<number | null>(null);
  const [monitoringChange, setMonitoringChange] = useState<{
    attackerId: number;
    urlId?: number;
    newStatus: boolean;
  } | null>(null);

  useEffect(() => {
    fetchAttackers();
  }, []);

  const fetchAttackers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get<Attacker[]>('http://localhost:3000/server/ransommonitor/getAllAttackers');
      setAttackers(response.data);
      console.log(response.data);
    } catch (err) {
      setError('Failed to fetch attackers');
      console.error('Error fetching attackers:', err);
    } finally {
      setLoading(false);
    }
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
    return <div className="container mx-auto p-4">Loading attackers...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-full">
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attacker Monitor</h1>

        <div className="flex gap-2">
          <button 
            className="btn btn-blue margin-4 pad-4 item-center" 
            onClick={handleDoScrap} 
            disabled={scraploading || loading}
          >
            {scraploading ? 'Scraping...' : 'Scrap Now'}
          </button>
          <button 
            className="btn btn-blue margin-4 pad-4 item-center" 
            onClick={handleSyncStatus} 
            disabled={syncloading || loading}
          >
            {syncloading ? 'Syncing...' : 'Sync Status'}
          </button>
        </div>
      </div>

      <div className="table-container overflow-x-auto">
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
              <AttackerRow
                key={attacker.attackerId}
                attacker={attacker}
                onViewAttacks={() => navigate('/attacks', { state: { attackerName: attacker.attackerName } })}
                onDeleteAttacker={() => setAttackerToDelete(attacker.attackerId)}
                onMonitoringChange={(urlId) => setMonitoringChange({
                  attackerId: attacker.attackerId,
                  urlId,
                  newStatus: urlId 
                    ? !attacker.urls.find(u => u.urlId === urlId)?.monitorStatus
                    : !attacker.monitorStatus
                })}
                onDeleteUrl={(urlId) => setUrlToDelete({ attackerId: attacker.attackerId, urlId })}
                loading={loading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Monitor;