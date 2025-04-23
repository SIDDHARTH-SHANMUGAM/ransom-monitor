// Monitor.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Trash2,
  Search,
  X,
  Eye,
  Activity,
} from 'lucide-react';
import DeleteUrlModal from './DeleteUrlModel';
import DeleteAttackerModal from './DeleteAttackerModal';
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

interface ApiResponse {
  data: Attacker[];
  total: number;
}

interface Message {
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

function Monitor() {
  const navigate = useNavigate();
  const [attackers, setAttackers] = useState<Attacker[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlToDelete, setUrlToDelete] = useState<{ attackerId: number; urlId: number } | null>(null);
  const [attackerToDelete, setAttackerToDelete] = useState<number | null>(null);
  const [monitoringChange, setMonitoringChange] = useState<{
    attackerId: number;
    urlId?: number;
    newStatus: boolean;
  } | null>(null);
  const [expandedAttackers, setExpandedAttackers] = useState<number[]>([]);
  const [showAddUrlForm, setShowAddUrlForm] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchAttackers(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchAttackers = async (page: number, search?: string) => {
    setLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const response = await axios.post<ApiResponse>(
        'http://localhost:3000/server/ransommonitor/getAllAttackers',
        {
          page: page,
          limit: itemsPerPage,
          search: search,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.data);
      setAttackers(response.data.data);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (err: any) {
      console.error('Error fetching Ransom Groups:', err.message);
      if (err.response && err.response.status === 401) {
        setMessage({ text: 'You are not authorized to view this page. Please log in again.', type: 'error' });
        // sessionStorage.removeItem('token');
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        setMessage({ text: 'Failed to fetch Ransom Groups.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAttackerExpansion = (attackerId: number) => {
    setExpandedAttackers(prev =>
      prev.includes(attackerId) ? prev.filter(id => id !== attackerId) : [...prev, attackerId]
    );
  };

  const cancelDelete = () => {
    setUrlToDelete(null);
    setAttackerToDelete(null);
  };

  const executeDeleteUrl = async () => {
    if (!urlToDelete) return;
    const token = sessionStorage.getItem('token');
    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:3000/server/ransommonitor/deleteUrl',
        {
          data: urlToDelete.urlId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status >= 200 && response.status < 300) {
        setMessage({ text: response.data?.message || 'URL deleted successfully.', type: 'success' });
        fetchAttackers(currentPage, searchTerm);
        setUrlToDelete(null);
      } else {
        setMessage({ text: response.data?.message || 'Failed to delete URL.', type: 'error' });
        setUrlToDelete(null);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setMessage({ text: 'You are not authorized to view this page. Please log in again.', type: 'error' });
        // sessionStorage.removeItem('token');
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

  const executeDeleteAttacker = async () => {
    if (!attackerToDelete) return;

    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/server/ransommonitor/deleteAttacker',
        {
          data: attackerToDelete,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status >= 200 && response.status < 300) {
        setMessage({ text: response.data?.message || 'Ransom Group deleted successfully.', type: 'success' });
        fetchAttackers(currentPage, searchTerm);
        setAttackerToDelete(null);
      } else {
        setMessage({ text: response.data?.message || 'Failed to delete Ransom Group.', type: 'error' });
        setAttackerToDelete(null);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setMessage({ text: 'You are not authorized to view this page. Please log in again.', type: 'error' });
        // sessionStorage.removeItem('token');
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        setMessage({ text: err.response?.data?.error || 'Failed to delete Ransom Group.', type: 'error' });
        setAttackerToDelete(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmMonitoringChange = async () => {
    if (!monitoringChange) return;

    const { attackerId, urlId, newStatus } = monitoringChange;
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const requestData = urlId ? { urlId, newStatus } : { attackerId, newStatus };

      const response = await axios.post(
        'http://localhost:3000/server/ransommonitor/urlMonitoring',
        requestData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (response.status >= 200 && response.status < 300) {
        setMessage({ text: response.data?.message || 'Monitoring status updated successfully.', type: 'success' });
        fetchAttackers(currentPage, searchTerm);
        setMonitoringChange(null);
      } else {
        setMessage({ text: response.data?.message || 'Failed to update monitoring status.', type: 'error' });
        setMonitoringChange(null);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setMessage({ text: 'You are not authorized to view this page. Please log in again.', type: 'error' });
        // sessionStorage.removeItem('token');
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

  const handleMonitoringChange = (attackerId: number, urlId?: number) => {
    const attacker = attackers.find(a => a.attackerId === attackerId);
    if (!attacker) return;

    setMonitoringChange({
      attackerId,
      urlId,
      newStatus: urlId ? !attacker.urls.find(u => u.urlId === urlId)?.monitorStatus : !attacker.monitorStatus,
    });
  };

  const handleViewAttacks = (attackerId: number) => {
    navigate(`/attacks/${attackerId}`);
  };

  const handleViewAttacker = (attackerInfo: Attacker) => {
    console.log('here ', attackerInfo);
    navigate(`/app/view-Attacker`, { state: { attackerId: attackerInfo.attackerId } });
  };

  const handleDeleteAttacker = (attackerId: number) => {
    setAttackerToDelete(attackerId);
  };

  const handleDeleteUrl = (attackerId: number, urlId: number) => {
    setUrlToDelete({ attackerId, urlId });
  };


  const handleAddUrlSuccess = (message: string) => {
    setMessage({ text: message, type: 'success' });
    setShowAddUrlForm(null);
    fetchAttackers(currentPage, searchTerm);
  };

  const handleAddUrlError = (message: string) => {
    setMessage({ text: message, type: 'error' });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 py-1 mx-1 rounded ${
            currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-300 hover:text-white'
          }`}
          disabled={loading}
        >
          {i}
        </button>
      );
    }
    return <div className="flex justify-center mt-4">{pages}</div>;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(event.target.value);
  };

  const handleSearchClick = () => {
    setSearchTerm(searchInputValue);
    setCurrentPage(1);
  };

  const handleCloseMessage = () => {
    setMessage(null);
  };

  const navigateToAgentStatus = () => {
    navigate('/app/agent-Status');
  };
  const navigateToOnlineAttackers = () => {
    navigate('/app/view-Online-Attacker');
  };

  return (
    <div className="container mx-auto p-6 max-w-full relative">
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

      <Notification message={message} onClose={handleCloseMessage} />

      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Ransom Groups</h1>

        <div className="flex gap-2 btn">
          <div className="relative flex items-center btn btn-sm">
            <Search className="absolute left-5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md pl-8 h-10 align-middle w-60 "
              value={searchInputValue}
              onChange={handleInputChange}
            />
            <button
              className="absolute right-4 text-gray-400 hover:gray-300 cursor-pointer btn btn-primary h-10"
              onClick={handleSearchClick}
              disabled={loading}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={navigateToAgentStatus}
            disabled={loading}
          >
            Agent Status
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={navigateToOnlineAttackers}
            disabled={loading}
          >
            Report
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200 mar-2">
        <table className="min-w-full divide-y divide-gray-200">
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
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" colSpan={6}>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMonitoringChange(attacker.attackerId);
                        }}
                        className={`btn btn-sm mar-2 ${!attacker.monitorStatus ? 'btn-red' : 'btn-green'}`}
                        disabled={loading}
                      >
                        {!attacker.monitorStatus ? 'Enable Scrap' : 'DisableScrap'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAttacks(attacker.attackerId);
                        }}
                        className="btn btn-blue btn-sm mar-2"
                        disabled={loading}
                      >
                        View Attacks
                      </button>
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAttacker(attacker);
                          }}
                          className="btn btn-blue btn-sm mar-2"
                          disabled={loading}
                        >
                          View Attacker
                        </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAttacker(attacker.attackerId);
                        }}
                        className="btn btn-sm mar-2"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedAttackers.includes(attacker.attackerId) && (
                  <>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attacker Name
                      </th>
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
                    {attacker.urls.map(url => (
                      <tr key={url.urlId} className="bg-gray-50">
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
                      <AddUrlForm
                        attackerId={attacker.attackerId}
                        onCancel={() => setShowAddUrlForm(null)}
                        onSuccess={handleAddUrlSuccess}
                        onError={handleAddUrlError}
                        loading={loading}
                      />
                    ) : (
                      <tr className="bg-gray-50">
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
      {totalPages > 1 && renderPagination()}
    </div>
  );
}

export default Monitor;