// OnlineAttackers.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Notification from './Notification';

interface OnlineAttacker {
  attackerId: string;
  attackerName: string;
  attackCount: number;
  lastAttackRecorded: string | null;
}

interface Message {
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

function OnlineAttackers() {
  const navigate = useNavigate();
  const [onlineAttackers, setOnlineAttackers] = useState<OnlineAttacker[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchOnlineAttackers(currentPage);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    console.log('totalPages updated:', totalPages); // Log whenever totalPages changes
  }, [totalPages]);

  const fetchOnlineAttackers = async (page: number) => {
    setLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const response = await axios.post<OnlineAttacker[]>(
        'http://localhost:3000/server/ransommonitor/getOnlineAttackers',
        {
          page: page,
          limit: itemsPerPage,
          searchTerm: searchTerm
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOnlineAttackers(response.data);
      console.log('API Response Data:', response);
      console.log('API Response Headers:', response.headers);

      const totalCountHeader = response.headers['x-total-count'];
      if (totalCountHeader) {
        const totalCount = parseInt(totalCountHeader, 10);
        const calculatedTotalPages = Math.ceil(totalCount / itemsPerPage);
        if (calculatedTotalPages !== totalPages) {
          setTotalPages(calculatedTotalPages);
          console.log('totalPages set to:', calculatedTotalPages, 'based on totalCount:', totalCount);
        } else {
          console.log('totalPages remains:', totalPages);
        }
      } else {
        console.warn('X-Total-Count header not found in the API response.');
        if (totalPages !== 1) {
          setTotalPages(1);
          console.log('totalPages set to fallback: 1');
        }
      }

    } catch (err: any) {
      console.error('Error fetching online attackers:', err.message);
      if (err.response && err.response.status === 401) {
        setMessage({ text: 'You are not authorized to view this page. Please log in again.', type: 'error' });
        // sessionStorage.removeItem('token');
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        setMessage({ text: 'Failed to fetch online attackers.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    const pages = [];
    if (totalPages <= 7) {
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
    } else {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          className={`px-2 py-1 mx-1 rounded ${
            currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-blue-300 hover:text-white'
          }`}
          disabled={loading || currentPage === 1}
        >
          Previous
        </button>
      );

      const showFirst = currentPage > 4;
      const showLast = currentPage < totalPages - 3;
      const startPage = showFirst ? Math.max(1, currentPage - 3) : 1;
      const endPage = showLast ? Math.min(totalPages, currentPage + 3) : totalPages;

      if (showFirst) {
        pages.push(
          <button
            key={1}
            onClick={() => handlePageChange(1)}
            className={`px-2 py-1 mx-1 rounded ${
              currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-300 hover:text-white'
            }`}
            disabled={loading}
          >
            1
          </button>
        );
        if (startPage > 2) {
          pages.push(<span key="ellipsis-start" className="mx-2">...</span>);
        }
      }

      for (let i = startPage; i <= endPage; i++) {
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

      if (showLast) {
        if (endPage < totalPages - 2) {
          pages.push(<span key="ellipsis-end" className="mx-2">...</span>);
        }
        pages.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className={`px-2 py-1 mx-1 rounded ${
              currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-300 hover:text-white'
            }`}
            disabled={loading}
          >
            {totalPages}
          </button>
        );
      }

      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          className={`px-2 py-1 mx-1 rounded ${
            currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-blue-300 hover:text-white'
          }`}
          disabled={loading || currentPage === totalPages}
        >
          Next
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
    fetchOnlineAttackers(1);
  };

  const handleCloseMessage = () => {
    setMessage(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-full relative">
      <Notification message={message} onClose={handleCloseMessage} />

      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Online Attackers</h1>
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
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Attacker Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Attacks
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Last Attack Recorded
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {onlineAttackers.map((attacker) => (
              <tr key={attacker.attackerId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{attacker.attackerName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{attacker.attackCount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{attacker.lastAttackRecorded || 'N/A'}</div>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-center">
                  Loading online attackers...
                </td>
              </tr>
            )}
            {!loading && onlineAttackers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-center">
                  No online attackers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && renderPagination()}
    </div>
  );
}

export default OnlineAttackers;