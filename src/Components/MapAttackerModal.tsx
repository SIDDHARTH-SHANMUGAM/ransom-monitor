import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    agentId: string | undefined;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const MapAttackerModal: React.FC<Props> = ({ isOpen, onClose, agentId, onSuccess, onError }) => {
    const [nonMappedAttackers, setNonMappedAttackers] = useState<Attacker[]>([]);
    const [selectedAttackers, setSelectedAttackers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        if (isOpen && agentId) {
            fetchNonMappedAttackers();
        } else {
            setNonMappedAttackers([]);
            setSelectedAttackers([]);
            setFetchError(null);
        }
    }, [isOpen, agentId]);

    const fetchNonMappedAttackers = async () => {
        setFetchLoading(true);
        setFetchError(null);
        try {
            const response = await axios.post<Attacker[]>(
                'http://localhost:3000/server/ransommonitor/getNonMapedAttacker',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setNonMappedAttackers(response.data);
        } catch (error: any) {
            setFetchError(error.response?.data?.message || error.message || 'Failed to fetch non-mapped attackers.');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleAttackerSelection = (attackerId: string) => {
        setSelectedAttackers((prevSelected) => {
            if (prevSelected.includes(attackerId)) {
                return prevSelected.filter((id) => id !== attackerId);
            } else {
                return [...prevSelected, attackerId];
            }
        });
    };

    const handleMapAttackers = async () => {
        if (!agentId) {
            onError('Agent ID is not available.');
            return;
        }

        if (selectedAttackers.length === 0) {
            onError('Please select at least one attacker to map.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:3000/server/ransommonitor/mapAttackerToAgent',
                {
                    agentId: agentId,
                    attackerIds: selectedAttackers,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            onSuccess(response.data.message || 'Attackers mapped successfully!');
            onClose();
        } catch (error: any) {
            onError(error.response?.data?.message || error.message || 'Failed to map attackers.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Map Attackers to Agent</h2>

                {fetchLoading ? (
                    <p className="text-gray-600">Loading non-mapped attackers...</p>
                ) : fetchError ? (
                    <p className="text-red-500">{fetchError}</p>
                ) : nonMappedAttackers.length > 0 ? (
                    <ul className="overflow-y-auto max-h-96 divide-y divide-gray-200 mb-4">
                        {nonMappedAttackers.map((attacker) => (
                            <li key={attacker.attackerId} className="py-2 flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2 form-checkbox h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                                    value={attacker.attackerId}
                                    checked={selectedAttackers.includes(attacker.attackerId)}
                                    onChange={() => handleAttackerSelection(attacker.attackerId)}
                                />
                                <label className="text-gray-700">{attacker.attackerName}</label>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">No non-mapped attackers available.</p>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleMapAttackers}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loading || selectedAttackers.length === 0}
                    >
                        {loading ? 'Mapping...' : 'Map Selected'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapAttackerModal;