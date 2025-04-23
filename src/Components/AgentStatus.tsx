// AgentStatusPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, Server, Settings, AlertTriangle } from 'lucide-react';
import Notification from './Notification';

interface SystemProperties {
  [key: string]: string;
}

interface TorConnection {
  activePort: string;
  isConnected: boolean;
  socksIp: string;
}

interface AgentStatusResponse {
  systemProperties: SystemProperties;
  torConnection: TorConnection;
  serverIp: string;
}

interface Message {
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

function AgentStatus() {
  const navigate = useNavigate();
  const [agentStatus, setAgentStatus] = useState<AgentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchAgentStatus();
  }, []);

  const fetchAgentStatus = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get<AgentStatusResponse>(
        'http://localhost:3000/server/ransommonitor/getAgentStatus',
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      setAgentStatus(response.data);
    } catch (error: any) {
      console.error('Error fetching agent status:', error);
      if (error.response && error.response.status === 401) {
        setMessage({ text: 'Agent service is currently unavailable.', type: 'warning' });
      } else {
        setMessage({ text: 'Failed to fetch agent status.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/app/monitor'); // Assuming '/app/monitor' is your Monitor page route
  };

  const handleCloseMessage = () => {
    setMessage(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Notification message={message} onClose={handleCloseMessage} />
      <button onClick={handleGoBack} className="btn btn-ghost mb-4">
        &larr; Back to Monitor
      </button>

      <div className="bg-gradient-to-br from-gray-100 to-blue-50 rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
          <Server className="h-6 w-6 mr-2 text-blue-600" /> Agent Status
        </h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto"></div>
            <p className="mt-2 text-gray-600">Fetching Agent Status...</p>
          </div>
        ) : agentStatus ? (
          <>
            <div className="mb-6 p-4 rounded-md border border-gray-200 bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <Wifi className="h-5 w-5 mr-2 text-green-500" /> Network Information
              </h2>
              <p className="text-gray-700">
                <span className="font-semibold">Server IP:</span> {agentStatus.serverIp}
              </p>
              <div className="mt-2">
                <span className="font-semibold flex items-center">
                  Tor Connection:{' '}
                  {agentStatus.torConnection.isConnected ? (
                    <Wifi className="h-4 w-4 ml-1 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 ml-1 text-red-500" />
                  )}
                </span>
                <ul className="list-disc pl-5 text-gray-600">
                  <li>
                    <span className="font-semibold">Status:</span>{' '}
                    {agentStatus.torConnection.isConnected ? 'Connected' : 'Not Connected'}
                  </li>
                  <li>
                    <span className="font-semibold">SOCKS IP:</span> {agentStatus.torConnection.socksIp}
                  </li>
                  <li>
                    <span className="font-semibold">Active Port:</span> {agentStatus.torConnection.activePort}
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-md border border-gray-200 bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-yellow-600" /> System Properties
              </h2>
              <div className="overflow-y-auto max-h-96">
                <ul className="divide-y divide-gray-200">
                  {Object.entries(agentStatus.systemProperties).map(([key, value]) => (
                    <li key={key} className="py-2">
                      <span className="font-semibold text-gray-700">{key}:</span>{' '}
                      <span className="text-gray-600">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-700">Could not retrieve agent status.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentStatus;