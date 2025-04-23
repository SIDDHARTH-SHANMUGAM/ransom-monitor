import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Save, XCircle } from 'lucide-react';
import axios, { AxiosResponse } from 'axios';
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
  attackerId?: number;
  attackerName: string;
  email: string;
  toxId: string;
  sessionId: string;
  description: string;
  isRaas: boolean;
  monitorStatus: boolean;
  urls?: URL[];
}

interface Message {
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface GetAttackerResponse extends Attacker {
  message?: string;
  error?: string;
}

interface UpdateAttackerResponse {
  message?: string;
  error?: string;
}

function ViewAttacker() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedAttackerId = location.state?.attackerId as number | undefined;
  const [attackerInfo, setAttackerInfo] = useState<Attacker | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAttackerName, setEditedAttackerName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedToxId, setEditedToxId] = useState('');
  const [editedSessionId, setEditedSessionId] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedIsRaas, setEditedIsRaas] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false); // For the save button
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const fetchAttackerDetails = useCallback(async (id: number) => {
    setLoading(true);
    setMessage(null);
    try {
      const token = sessionStorage.getItem('token');
      const response: AxiosResponse<GetAttackerResponse> = await axios.post(
        `http://localhost:3000/server/ransommonitor/getAttacker`,
        { attackerId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200 && response.data) {
        setAttackerInfo(response.data);
        setEditedAttackerName(response.data.attackerName);
        setEditedEmail(response.data.email);
        setEditedToxId(response.data.toxId);
        setEditedSessionId(response.data.sessionId);
        setEditedDescription(response.data.description);
        setEditedIsRaas(response.data.isRaas);
        console.log(response.data.isRaas);
      } else {
        setMessage({ text: response.data?.error || 'Failed to load Ransom Group details.', type: 'error' });
        setAttackerInfo(null);
      }
    } catch (error: any) {
      console.error('Error fetching attacker details:', error);
      if (error.response && error.response.status === 401) {
        setMessage({ text: 'You are not authorized to view this content. Please log in again.', type: 'error' });
        // sessionStorage.removeItem('token');
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        setMessage({ text: error?.response?.data?.message || 'Failed to load Ransom Group details.', type: 'error' });
        setAttackerInfo(null);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (passedAttackerId) {
      fetchAttackerDetails(passedAttackerId);
    } else {
      setMessage({ text: 'No Ransom Group ID provided.', type: 'warning' });
    }
  }, [passedAttackerId, fetchAttackerDetails]);

  useEffect(() => {
    if (shouldRefetch && attackerInfo?.attackerId) {
      fetchAttackerDetails(attackerInfo.attackerId);
      setShouldRefetch(false);
    }
  }, [shouldRefetch, attackerInfo?.attackerId, fetchAttackerDetails]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (attackerInfo) {
      setEditedAttackerName(attackerInfo.attackerName);
      setEditedEmail(attackerInfo.email);
      setEditedToxId(attackerInfo.toxId);
      setEditedSessionId(attackerInfo.sessionId);
      setEditedDescription(attackerInfo.description);
      setEditedIsRaas(attackerInfo.isRaas);
    }
  };

  const handleSaveClick = async () => {
    if (!attackerInfo?.attackerId) {
      console.error('Attacker ID is missing, cannot update.');
      setMessage({ text: 'Error: Could not determine Ransom Group ID for update.', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const token = sessionStorage.getItem('token');
      const response: AxiosResponse<UpdateAttackerResponse> = await axios.post(
        `http://localhost:3000/server/ransommonitor/updateAttacker`,
        {
          attackerId: attackerInfo.attackerId,
          attackerName: editedAttackerName,
          email: editedEmail,
          toxId: editedToxId,
          sessionId: editedSessionId,
          description: editedDescription,
          isRaas: editedIsRaas,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage({ text: response.data?.message || 'Ransom Group updated successfully.', type: 'success' });
        setTimeout(() => {
          setIsEditing(false);
          setShouldRefetch(true);
        }, 1000);
      } else {
        setMessage({ text: response.data?.error || 'Failed to update Ransom Group.', type: 'error' });
      }
    } catch (error: any) {
      console.error('Error updating attacker:', error);
      if (error.response && error.response.status === 401) {
        setMessage({ text: 'You are not authorized to perform this action. Please log in again.', type: 'error' });
        // sessionStorage.removeItem('token');
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        setMessage({ text: error?.response?.data?.message || 'Failed to update Ransom Group.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    switch (id) {
      case 'attackerName':
        setEditedAttackerName(value);
        break;
      case 'email':
        setEditedEmail(value);
        break;
      case 'toxId':
        setEditedToxId(value);
        break;
      case 'sessionId':
        setEditedSessionId(value);
        break;
      case 'description':
        setEditedDescription(value);
        break;
      case 'isRaas':
        if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
          setEditedIsRaas(e.target.checked);
        } else {
          setEditedIsRaas(Boolean(value)); // Fallback
        }
        break;
      default:
        break;
    }
  };

  const handleCloseMessage = () => {
    setMessage(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-xl">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back
        </button>
      </div>

      <Notification message={message} onClose={handleCloseMessage} />

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">
          {isEditing ? 'Edit Ransom Group' : 'Ransom Group Details'}
        </h1>

        <div className="mb-4">
          <label htmlFor="attackerName" className="block text-gray-700 text-sm font-bold mb-2">
            Ransom Group Name:
          </label>
          {isEditing ? (
            <input
              type="text"
              id="attackerName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={editedAttackerName}
              onChange={handleInputChange}
            />
          ) : (
            <p className="text-gray-800">{attackerInfo?.attackerName}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          {isEditing ? (
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={editedEmail}
              onChange={handleInputChange}
            />
          ) : (
            <p className="text-gray-800">{attackerInfo?.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="toxId" className="block text-gray-700 text-sm font-bold mb-2">
            Tox ID:
          </label>
          {isEditing ? (
            <input
              type="text"
              id="toxId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={editedToxId}
              onChange={handleInputChange}
            />
          ) : (
            <p className="text-gray-800">{attackerInfo?.toxId}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="sessionId" className="block text-gray-700 text-sm font-bold mb-2">
            Session ID:
          </label>
          {isEditing ? (
            <input
              type="text"
              id="sessionId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={editedSessionId}
              onChange={handleInputChange}
            />
          ) : (
            <p className="text-gray-800">{attackerInfo?.sessionId}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description:
          </label>
          {isEditing ? (
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={editedDescription}
              onChange={handleInputChange}
              rows={3}
            />
          ) : (
            <p className="text-gray-800">{attackerInfo?.description}</p>
          )}
        </div>

        <div className="mb-4 flex items-center">
          <label htmlFor="isRaas" className="block text-gray-700 text-sm font-bold mr-2">
            Is Raas:
          </label>
          {isEditing ? (
            <input
              type="checkbox"
              id="isRaas"
              className="form-checkbox h-5 w-5 text-green-500 focus:ring-indigo-500 transition duration-150 ease-in-out"
              checked={editedIsRaas}
              onChange={handleInputChange}
            />
          ) : (
            <p className="text-gray-800">{attackerInfo?.isRaas ? 'Yes' : 'No'}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Monitoring Status:
          </label>
          <p className="text-gray-800">{attackerInfo?.monitorStatus ? 'Enabled' : 'Disabled'}</p>
          {!isEditing && (
            <p className="text-sm text-gray-500 mt-1">
              Monitoring status can be changed from the main Ransom Groups page.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveClick}
                className="btn btn-primary btn-sm mr-2"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" /> Save
              </button>
              <button onClick={handleCancelEdit} className="btn btn-secondary btn-sm">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={handleEditClick} className="btn btn-blue btn-sm">
              <Edit className="h-4 w-4 mr-2" /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewAttacker;