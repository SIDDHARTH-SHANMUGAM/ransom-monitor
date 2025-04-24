import axios from 'axios';
import React, { useState } from 'react';

interface EditFrequencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentId: string;
    type: 'scrape' | 'ping';
    currentFrequency: string;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    loading: boolean; // You might want to pass this down if the update API call happens here
}

const EditFrequencyModal: React.FC<EditFrequencyModalProps> = ({
    isOpen,
    onClose,
    agentId,
    type,
    currentFrequency,
    onSuccess,
    onError,
    loading,
}) => {
    const [newFrequency, setNewFrequency] = useState(currentFrequency);

    const handleSave = async () => {
        // Make your API call here to update the frequency
        // Example using axios (you'll need to import it):
        try {
            // setLoading(true); // If you manage loading here
            const token = sessionStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3000/server/ransommonitor/editFrequency',
                {
                    agentId: agentId,
                    frequencyType: type, // 'scrape' or 'ping'
                    newFrequency: newFrequency,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status >= 200 && response.status < 300) {
                onSuccess(response.data?.message || `Agent ${type} frequency updated successfully.`);
            } else {
                onError(response.data?.message || `Failed to update agent ${type} frequency.`);
            }
        } catch (error: any) {
            onError(error.response?.data?.error || `Failed to update agent ${type} frequency.`);
        } finally {
            // setLoading(false); // If you manage loading here
            onClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h3 className="modal-title">Edit {type === 'scrape' ? 'Scrape' : 'Ping'} Frequency</h3>
                <p className="modal-message">Current frequency: {currentFrequency}</p>
                <div className="mb-4">
                    <label htmlFor="newFrequency" className="block text-gray-700 text-sm font-bold mb-2">
                        New Frequency:
                    </label>
                    <input
                        type="text" // Or number, depending on your frequency format
                        id="newFrequency"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={newFrequency}
                        onChange={(e) => setNewFrequency(e.target.value)}
                    />
                </div>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditFrequencyModal;