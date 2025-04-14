import React, { useState } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
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

interface AttackerRowProps {
  attacker: Attacker;
  onViewAttacks: () => void;
  onDeleteAttacker: () => void;
  onMonitoringChange: (urlId?: number) => void;
  onDeleteUrl: (urlId: number) => void;
  loading: boolean;
}

const AttackerRow: React.FC<AttackerRowProps> = ({
  attacker,
  onViewAttacks,
  onDeleteAttacker,
  onMonitoringChange,
  onDeleteUrl,
  loading
}) => {
  const [showAddUrlForm, setShowAddUrlForm] = useState(false);

  return (
    <>
      <tr className="bg-gray-50">
        <td>
          <div className="flex items-center">
            <span className="font-bold">{attacker.attackerName}</span>
          </div>
        </td>
        <td>
          <div className="flex">
            <button
              onClick={() => onMonitoringChange()}
              className={`btn ${!attacker.monitorStatus ? 'btn-red' : 'btn-green'} m-6`}
              disabled={loading}
            >
              {attacker.monitorStatus ? 'Disable Scrap' : 'Enable Scrap'}
            </button>
            <button
              onClick={onViewAttacks}
              className="btn btn-blue m-6"
              disabled={loading}
            >
              View Attacks
            </button>
            <button
              onClick={onDeleteAttacker}
              className="btn btn-red m-6"
              disabled={loading}
            >
              <Trash2 className="icon-sm" />
            </button>
          </div>
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddUrlForm(!showAddUrlForm)}
              className="btn btn-blue"
              disabled={loading}
            >
              Add URL
            </button>
          </div>
        </td>
      </tr>

      {showAddUrlForm && (
        <AddUrlForm
          attackerId={attacker.attackerId}
          onCancel={() => setShowAddUrlForm(false)}
          loading={loading}
        />
      )}

      {attacker.urls.map(url => (
        <tr key={url.urlId}>
          <td>
            <div className="url-list">└─</div>
          </td>
          <td >
            <div className="flex items-center">
              <ExternalLink className="icon-sm mr-2" />
              <a
                href={url.URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 "
                
              >
                {url.URL}
              </a>
            </div>
          </td>
          <td>
            <span className={`badge ${url.status ? 'badge-success' : 'badge-danger'}`}>
              {url.status ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td>
            <span className={`badge ${url.isScraped ? 'badge-success' : 'badge-danger'}`}>
              {url.isScraped ? 'Scraped' : 'unScraped'}
            </span>
          </td>
          <td>
            <label className="switch">
              <input
                type="checkbox"
                checked={url.monitorStatus}
                onChange={() => onMonitoringChange(url.urlId)}
                disabled={loading}
              />
              <span className="slider"></span>
            </label>
          </td>
          <td className="text-sm text-gray-500">
            {url.lastScrap}
          </td>
          <td>
            <button
              onClick={() => onDeleteUrl(url.urlId)}
              className="btn btn-red flex justify-center item-center"
              title="Delete URL"
              disabled={loading}
            >
              <Trash2 className="icon-sm" />
            </button>
          </td>
        </tr>
      ))}
    </>
  );
};

export default AttackerRow;