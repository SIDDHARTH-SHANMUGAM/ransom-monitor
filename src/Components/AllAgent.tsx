import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown,
    ChevronRight,
    Trash2,
    Activity,
} from 'lucide-react';
import DeleteAgentModal from './DeleteAgentModal';
import Notification from './Notification';

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
}

interface ApiResponse {
    data: Agent[];
    total: number;
    page: number;
    limit: number;
}

interface Message {
    text: string;
    type: 'success' | 'info' | 'warning' | 'error';
}

function AllAgent() {
    const navigate = useNavigate();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;
    const [message, setMessage] = useState<Message | null>(null);

    useEffect(() => {
        fetchAgents(currentPage);
    }, [currentPage]);

    const fetchAgents = async (page: number) => {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.get<ApiResponse>(
                `http://localhost:3000/server/ransommonitor/getAllAgents?page=${page}&limit=${itemsPerPage}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Agents Data:', response.data);
            setAgents(response.data.data);
            setTotalPages(Math.ceil(response.data.total / itemsPerPage));
        } catch (err: any) {
            console.error('Error fetching Agents:', err.message);
            if (err.response && err.response.status === 401) {
                setMessage({ text: 'You are not authorized to view this page. Please log in again.', type: 'error' });
                setTimeout(() => {
                    navigate('/app');
                }, 1500);
            } else {
                setMessage({ text: 'Failed to fetch Agents.', type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    const cancelDelete = () => {
        setAgentToDelete(null);
    };

    const executeDeleteAgent = async () => {
        if (!agentToDelete) return;
        const token = sessionStorage.getItem('token');
        try {
            setLoading(true);
            const response = await axios.post(
                'http://localhost:3000/server/ransommonitor/deleteAgent',
                {
                    data: agentToDelete,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status >= 200 && response.status < 300) {
                setMessage({ text: response.data?.message || 'Agent deleted successfully.', type: 'success' });
                fetchAgents(currentPage);
                setAgentToDelete(null);
            } else {
                setMessage({ text: response.data?.message || 'Failed to delete Agent.', type: 'error' });
                setAgentToDelete(null);
            }
        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                setMessage({ text: 'You are not authorized to perform this action. Please log in again.', type: 'error' });
                setTimeout(() => {
                    navigate('/app');
                }, 1500);
            } else {
                setMessage({ text: err.response?.data?.error || 'Failed to delete Agent.', type: 'error' });
                setAgentToDelete(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAgent = (agentId: string) => {
        setAgentToDelete(agentId);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const navigateToViewAgent = (agentId: string) => {
        navigate(`/app/view-agent/${agentId}`);
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

    const handleCloseMessage = () => {
        setMessage(null);
    };

    return (
        <div className="container mx-auto p-6 max-w-full relative">
            <DeleteAgentModal
                agentToDelete={agentToDelete}
                onCancel={cancelDelete}
                onConfirm={executeDeleteAgent}
                loading={loading}
            />

            <Notification message={message} onClose={handleCloseMessage} />

            <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">Agent Status</h1>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200 mar-2">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fingerprint
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tor Connection
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Scrape At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Ping At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Scrape Frequency
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ping Frequency
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {agents.map(agent => (
                            <tr
                                key={agent.rowId}
                                className="hover:bg-gray-100 cursor-pointer"
                                onClick={() => navigateToViewAgent(agent.rowId)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {agent.fingerPrint}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {agent.torConnection ? 'Yes' : 'No'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {agent.lastScrapeAt}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {agent.lastPingAt}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {agent.scrapeFrequency}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {agent.pingFrequency}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent row click when delete is clicked
                                            handleDeleteAgent(agent.rowId);
                                        }}
                                        className="btn btn-red btn-sm"
                                        disabled={loading}
                                        title="Delete Agent"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && renderPagination()}
            {loading && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-lg p-6">
                    <Activity className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-2" />
                    <p className="text-center text-gray-700">Loading Agents...</p>
                </div>
            )}
        </div>
    );
}

export default AllAgent;