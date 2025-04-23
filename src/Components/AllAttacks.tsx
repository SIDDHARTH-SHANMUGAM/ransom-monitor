// src/components/AllAttacks.tsx
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Attack, Filters } from "../types/Attack";
import AttackFilters from "./AttackFilters";
import AttacksTable from "./AttacksTable";
import Pagination from "./Pagination";

interface AllAttacksProps {
  name?: string;
}

interface GetAllAttacksResponse {
  attacks: Attack[];
  totalCount: number;
  error?: string;
}

interface Message {
  text: string;
  type: 'success' | 'error';
}

const itemsPerPage = 10;

function AllAttacks({ name }: AllAttacksProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [localFilters, setLocalFilters] = useState<Filters>({
    attackerName: location.state?.attackerName || (name && name !== null ? name : ""),
    country: "",
    createdStart: "",
    createdEnd: "",
    category: ""
  });
  const [currentFilters, setCurrentFilters] = useState<Filters>(localFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAttack, setExpandedAttack] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAttacks, setTotalAttacks] = useState(0);

  useEffect(() => {
    const fetchAttacks = async () => {
      try {
        setLoading(true);
        setError("");
        const token = sessionStorage.getItem('token');
        const requestBody = {
          page: currentPage,
          limit: itemsPerPage,
          attackerName: currentFilters.attackerName || null,
          country: currentFilters.country || null,
          category: currentFilters.category || null,
          createdStart: currentFilters.createdStart || null,
          createdEnd: currentFilters.createdEnd || null,
        };

        const response: AxiosResponse<GetAllAttacksResponse> = await axios.post(
          "http://localhost:3000/server/ransommonitor/getAllAttacks",
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setAttacks(response.data.attacks);
          setTotalAttacks(response.data.totalCount);
          console.log("Paginated Attacks (POST):", response.data.attacks);
          console.log("Total Count (POST):", response.data.totalCount);
        } else {
          setError(response.data.error || "Failed to fetch attacks with status " + response.status);
        }
      } catch (err: any) {
        console.error("Error fetching attacks:", err);
        if (err.response && err.response.status === 401) {
          setMessage({ text: 'You are not authorized to view this page. Please log in again.', type: 'error' });
          // sessionStorage.removeItem('token');
          setTimeout(() => {
            navigate('/app');
          }, 1500);
        } else {
          setError("Failed to fetch attacks due to a network error.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttacks();
  }, [currentPage, currentFilters, navigate]);

  const handleApplyFilters = (filters: Filters) => {
    setCurrentFilters(filters);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setLocalFilters({
      attackerName: "",
      country: "",
      createdStart: "",
      createdEnd: "",
      category: ""
    });
    setCurrentFilters({
      attackerName: "",
      country: "",
      createdStart: "",
      createdEnd: "",
      category: ""
    });
    setCurrentPage(1);
  };

  const toggleExpandAttack = (attackId: number) => {
    setExpandedAttack(expandedAttack === attackId ? null : attackId);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading && attacks.length === 0) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="container mx-auto p-6">
        <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative`} role="alert">
          <strong className="font-bold">Unauthorized! </strong>
          <span className="block sm:inline">{message.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-full">
      <AttackFilters
        filters={localFilters}
        onApplyFilters={handleApplyFilters}
        resetFilters={resetFilters}
        setShowFilters={setShowFilters}
        showFilters={showFilters}
        setLocalFilters={setLocalFilters}
      />

      <AttacksTable
        filteredAttacks={attacks}
        toggleExpandAttack={toggleExpandAttack}
        expandedAttack={expandedAttack}
      />

      <Pagination
        totalItems={totalAttacks}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}

export default AllAttacks;