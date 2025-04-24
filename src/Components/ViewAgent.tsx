import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, Edit, Settings, Plus, Trash2 } from 'lucide-react';
import Notification from './Notification';
import EditFrequencyModal from './EditFrequencyModal';
import MapAttackerModal from './MapAttackerModal';
import ConfirmationModal from './ConfirmationModal';

interface Agent {
    rowId: string;
    fingerPrint: string;
    torConnection: boolean;
    lastScrapeAt: string;
    lastPingAt: string;
    scrapeFrequency: string;
    pingFrequency: string;
    cmd: string;
    systemProperties: string;
    createdAt: string;
    modifiedAt: string;
    serverIp: string;
    activeTorPort: number;
}

interface Attacker {
    attackerId: string;
    attackerName: string;
    email: string;
    toxId: string;
    sessionId: string;
    description: string;
    isRaas: boolean;
    monitorStatus: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Message {
    text: string;
    type: 'success' | 'info' | 'warning' | 'error';
}

interface ApiResponse {
    agent: Agent | null;
    attackers: Attacker[];
}

interface EditFrequency {
    agentId: string;
    type: 'scrape' | 'ping';
    currentFrequency: string;
}

function ViewAgent() {
    const { agentId } = useParams<{ agentId: string }>();
    const navigate = useNavigate();
    const [agent, setAgent] = useState<Agent | null>(null);
    const [attackers, setAttackers] = useState<Attacker[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<Message | null>(null);
    const [parsedCmd, setParsedCmd] = useState<Record<string, any> | null>(null);
    const [parsedSystemProperties, setParsedSystemProperties] = useState<Record<string, string> | null>(null);
    const [editFrequencyModalOpen, setEditFrequencyModalOpen] = useState<EditFrequency | null>(null);
    const [mapAttackerModalOpen, setMapAttackerModalOpen] = useState(false); // State for the new modal
    const [confirmUnmapModalOpen, setConfirmUnmapModalOpen] = useState(false);
    const [attackerToUnmap, setAttackerToUnmap] = useState<string | null>(null);

    useEffect(() => {
        if (agentId) {
            fetchAgentDetailsWithAttackers(agentId);
        }
    }, [agentId]);

    useEffect(() => {
        if (agent?.cmd) {
            try {
                setParsedCmd(JSON.parse(agent.cmd));
            } catch (error) {
                console.error('Error parsing CMD JSON:', error);
                setParsedCmd(null);
            }
        } else {
            setParsedCmd(null);
        }
    }, [agent?.cmd]);

    useEffect(() => {
        if (agent?.systemProperties) {
            try {
                const parsed = JSON.parse(agent.systemProperties) as Record<string, any>;
                const stringifiedProperties: Record<string, string> = {};
                for (const key in parsed) {
                    if (Object.prototype.hasOwnProperty.call(parsed, key)) {
                        stringifiedProperties[key] = String(parsed[key]);
                    }
                }
                setParsedSystemProperties(stringifiedProperties);
            } catch (error) {
                console.error('Error parsing System Properties JSON:', error);
                setParsedSystemProperties(null);
            }
        } else {
            setParsedSystemProperties(null);
        }
    }, [agent?.systemProperties]);

    const fetchAgentDetailsWithAttackers = async (id: string) => {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.post<ApiResponse>(
                `http://localhost:3000/server/ransommonitor/getAgentById`,
                { agentId: id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setAgent(response.data.agent);
            setAttackers(response.data.attackers);
        } catch (error: any) {
            console.error('Error fetching agent details with attackers:', error.message);
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response) {
                    if (axiosError.response.status === 401) {
                        setMessage({ text: 'You are not authorized to view this page. Please log in again.', type: 'error' });
                        setTimeout(() => {
                            navigate('/app');
                        }, 1500);
                    } else if (axiosError.response.status === 404) {
                        setMessage({ text: 'Agent not found.', type: 'error' });
                    } else {
                        let errorMessage = 'Unknown error';
                        if (
                            axiosError.response.data &&
                            typeof axiosError.response.data === 'object' &&
                            'message' in axiosError.response.data &&
                            typeof axiosError.response.data.message === 'string'
                        ) {
                            errorMessage = axiosError.response.data.message;
                        }
                        setMessage({ text: `Failed to fetch agent details: ${errorMessage}`, type: 'error' });
                    }
                } else if (axiosError.request) {
                    setMessage({ text: 'Network error. Please check your connection.', type: 'error' });
                } else {
                    setMessage({ text: 'An unexpected error occurred.', type: 'error' });
                }
            } else {
                setMessage({ text: 'Failed to fetch agent details.', type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    const confirmUnmap = (attackerId: string) => {
        setAttackerToUnmap(attackerId);
        setConfirmUnmapModalOpen(true);
    };

    const handleUnmapConfirmation = async (confirmed: boolean) => {
        setConfirmUnmapModalOpen(false);
        if (confirmed && attackerToUnmap && agentId) {
            const token = sessionStorage.getItem('token');
            try {
                await axios.post(
                    `http://localhost:3000/server/ransommonitor/unmapAttacker`,
                    { agentId, attackerId: attackerToUnmap },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setMessage({ text: 'Attacker unmapped successfully.', type: 'success' });
                fetchAgentDetailsWithAttackers(agentId);
            } catch (error) {
                console.error('Error unmapping attacker:', error);
                setMessage({ text: 'Failed to unmap attacker.', type: 'error' });
            } finally {
                setAttackerToUnmap(null);
            }
        } else {
            setAttackerToUnmap(null);
        }
    };

    const handleCloseMessage = () => {
        setMessage(null);
    };

    const displayNAIfEmpty = (value: string | boolean | number | undefined | null) => {
        if (value === undefined || value === null || value === '') {
            return 'N/A';
        }
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    };

    const navigateToAttacker = (attackerId: string) => {
        navigate(`/app/view-Attacker`, { state: { attackerId: attackerId } });
    };

    const openEditFrequencyModal = (type: 'scrape' | 'ping', currentFrequency: string) => {
        if (agentId) {
            setEditFrequencyModalOpen({ agentId, type, currentFrequency });
        }
    };

    const closeEditFrequencyModal = () => {
        setEditFrequencyModalOpen(null);
        if (agentId) {
            fetchAgentDetailsWithAttackers(agentId);
        }
    };

    const handleFrequencyUpdateSuccess = (message: string) => {
        setMessage({ text: message, type: 'success' });
        closeEditFrequencyModal();
        if (agentId) {
            fetchAgentDetailsWithAttackers(agentId);
        }
    };

    const handleFrequencyUpdateError = (message: string) => {
        setMessage({ text: message, type: 'error' });
    };

    const renderSystemProperties = () => {
        if (parsedSystemProperties) {
            return (
                <div className="overflow-y-auto max-h-96 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(parsedSystemProperties).map(([key, value]) => (
                        <div key={key} className="bg-gray-100 rounded-md p-3 border border-gray-200 shadow-sm">
                            <p className="text-sm font-medium text-gray-700">{key}:</p>
                            <p className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
            );
        } else {
            return <p className="text-gray-700">{displayNAIfEmpty(agent?.systemProperties)}</p>;
        }
    };

    const openMapAttackerModal = () => {
        setMapAttackerModalOpen(true);
    };

    const closeMapAttackerModal = () => {
        setMapAttackerModalOpen(false);
        if (agentId) {
            fetchAgentDetailsWithAttackers(agentId); // Refresh the list of mapped attackers
        }
    };

    const handleAttackerMappedSuccess = (message: string) => {
        setMessage({ text: message, type: 'success' });
        closeMapAttackerModal();
        if (agentId) {
            fetchAgentDetailsWithAttackers(agentId);
        }
    };

    const handleAttackerMappedError = (message: string) => {
        setMessage({ text: message, type: 'error' });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Activity className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-2" />
                <p className="text-center text-gray-700">Loading Agent Details...</p>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="container mx-auto p-6">
                <Notification message={message} onClose={handleCloseMessage} />
                <h1 className="text-xl font-semibold text-gray-900 mb-4">View Agent</h1>
                <p className="text-gray-600">Agent not found.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <Notification message={message} onClose={handleCloseMessage} />
            <h1 className="text-xl font-semibold text-gray-900 mb-4">Agent Details</h1>

            {editFrequencyModalOpen && (
                <EditFrequencyModal
                    isOpen={!!editFrequencyModalOpen}
                    onClose={closeEditFrequencyModal}
                    agentId={editFrequencyModalOpen.agentId}
                    type={editFrequencyModalOpen.type}
                    currentFrequency={editFrequencyModalOpen.currentFrequency}
                    onSuccess={handleFrequencyUpdateSuccess}
                    onError={handleFrequencyUpdateError}
                    loading={loading}
                />
            )}

            {mapAttackerModalOpen && (
                <MapAttackerModal
                    isOpen={mapAttackerModalOpen}
                    onClose={() => setMapAttackerModalOpen(false)}
                    agentId={agentId}
                    onSuccess={(msg) => {
                        setMessage({ text: msg, type: 'success' });
                        if (agentId) fetchAgentDetailsWithAttackers(agentId); // only if defined
                    }}
                    onError={(msg) => setMessage({ text: msg, type: 'error' })}
                />
            )}

            {confirmUnmapModalOpen && (
                <ConfirmationModal
                    isOpen={confirmUnmapModalOpen}
                    onClose={() => handleUnmapConfirmation(false)}
                    onConfirm={() => handleUnmapConfirmation(true)}
                    message="Are you sure you want to unmap this attacker from the agent?"
                />
            )}

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Agent Information</h2>
                <p className="text-gray-700 mb-1"><span className="font-medium">Fingerprint:</span> {displayNAIfEmpty(agent.fingerPrint)}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Tor Connection:</span> {displayNAIfEmpty(agent.torConnection)}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Last Scrape At:</span> {displayNAIfEmpty(agent.lastScrapeAt)}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Last Ping At:</span> {displayNAIfEmpty(agent.lastPingAt)}</p>
                <p className="text-gray-700 mb-1">
                    <span className="font-medium">Scrape Frequency:</span> {displayNAIfEmpty(agent.scrapeFrequency)}{' '}
                    <button
                        onClick={() => openEditFrequencyModal('scrape', agent.scrapeFrequency)}
                        className="text-blue-500 hover:text-blue-700 focus:outline-none ml-2"
                        disabled={loading}
                        title="Edit Scrape Frequency"
                    >
                        <Edit className="h-4 w-4 inline-block" />
                    </button>
                </p>
                <p className="text-gray-700 mb-1">
                    <span className="font-medium">Ping Frequency:</span> {displayNAIfEmpty(agent.pingFrequency)}{' '}
                    <button
                        onClick={() => openEditFrequencyModal('ping', agent.pingFrequency)}
                        className="text-blue-500 hover:text-blue-700 focus:outline-none ml-2"
                        disabled={loading}
                        title="Edit Ping Frequency"
                    >
                        <Edit className="h-4 w-4 inline-block" />
                    </button>
                </p>
                <div className="mb-2">
                    <span className="font-medium block text-gray-700 mb-1">POLICY:</span>
                    {parsedCmd ? (
                        <pre className="bg-gray-100 rounded-md p-3 text-sm overflow-auto">
                            {JSON.stringify(parsedCmd, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-gray-700">{displayNAIfEmpty(agent.cmd)}</p>
                    )}
                </div>
                <div className="mb-2 p-4 rounded-md border border-gray-200 bg-white shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-yellow-600" /> System Properties
                    </h2>
                    {renderSystemProperties()}
                </div>
                <p className="text-gray-700 mb-1"><span className="font-medium">Created At:</span> {displayNAIfEmpty(agent.createdAt)}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Modified At:</span> {displayNAIfEmpty(agent.modifiedAt)}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Server IP:</span> {displayNAIfEmpty(agent.serverIp)}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Active Tor Port:</span> {displayNAIfEmpty(agent.activeTorPort)}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">Mapped Attackers</h2>
                    <button
                        onClick={openMapAttackerModal}
                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md"
                    >
                        <Plus className="w-4 h-4" /> Map New
                    </button>
                </div>
                {attackers.length > 0 ? (
                    <ul className="space-y-2">
                        {attackers.map(attacker => (
                            <li key={attacker.attackerId} className="flex justify-between items-center bg-gray-50 border p-3 rounded-md">
                                <div onClick={() => navigateToAttacker(attacker.attackerId)} className="cursor-pointer">
                                    <p className="text-sm font-medium text-gray-800">{attacker.attackerName}</p>
                                    <p className="text-xs text-gray-500">{attacker.email}</p>
                                </div>
                                <button
                                    onClick={() => confirmUnmap(attacker.attackerId)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                    title="Unmap Attacker"
                                >
                                    <Trash2 className="h-4 w-4 inline-block mr-1" /> Unmap
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-600">No attackers mapped to this agent.</p>
                )}
            </div>

        </div>
    );
}

export default ViewAgent;