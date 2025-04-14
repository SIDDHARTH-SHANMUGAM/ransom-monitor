import React, { useEffect, useState } from "react";
import { Filter, ChevronDown, ChevronUp, X,
  Calendar, Globe, User,
  Shield, Target, Clock, DollarSign, Activity,
  FileText
} from "lucide-react";
import axios from "axios";
import AttackDetails from "./AttackDetails";
import { useLocation } from "react-router-dom";

interface Attack {

  attackId: number;
  attacker: {
    attackerName: string;
    email: string;
    toxId: string;
    description: string;
  };
  victim: {
    victimName: string;
    country: string;
    description: string;
    victimURL: string;
    revenue: number;
  };
  deadlines: string;
  isPublished: boolean;
  isForSale: boolean;
  postedAt: string;
  noOfVisits: number;
  dataSizes: string;
  description: string;
  lastVisitedAt: string;
  category: string;
  isNegotiated: boolean;
  ransomAmount: string;
  saleAmount: string;
  updatedAt: string;
  downloadUrls: {
    downloadUrlId: number;
    downloadUrl: string;
  }[];
  images: {
    imageId: number;
    image: string;
  }[];
}

interface Filters {
  attackerName: string;
  country: string;
  deadlineStart: string;
  deadlineEnd: string;
  createdStart: string;
  createdEnd: string;
  category: string;
  status: string;
}

const displayField = (value: any) => {
  if (value === null || value === undefined || value === "" || value === "Not Mentioned") {
    return "N/A";
  }
  return value;
};

const displayNumericField = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  return value.toLocaleString();
};

interface AllAttacksProps {
  name?: string;
}


function AllAttacks({ name }: AllAttacksProps) {
  const location = useLocation();
  const [selectedAttack, setSelectedAttack] = useState<Attack | null>(null);
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>({
    attackerName: location.state?.attackerName || (name && name !== null ? name : ""),
    country: "",
    deadlineStart: "",
    deadlineEnd: "",
    createdStart: "",
    createdEnd: "",
    category: "",
    status: ""
  });
  console.log(name);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAttack, setExpandedAttack] = useState<number | null>(null);

  useEffect(() => {
    const fetchAttacks = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Attack[]>("http://localhost:3000/server/ransommonitor/getAllAttacks");
        setAttacks(response.data);
        console.log(response.data)
      } catch (err) {
        setError("Failed to fetch attacks");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttacks();
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      attackerName: "",
      country: "",
      deadlineStart: "",
      deadlineEnd: "",
      createdStart: "",
      createdEnd: "",
      category: "",
      status: ""
    });
  };

  const compareDates = (dateString: string | undefined, filterDate: string | undefined, isAfter: boolean) => {
    if (!dateString || !filterDate) return true;
    try {
      const date = new Date(dateString);
      const filter = new Date(filterDate);
      return isAfter ? date >= filter : date <= filter;
    } catch {
      return true;
    }
  };

  const filteredAttacks = attacks.filter((attack) => {
    const matchesName = filters.attackerName === "" || 
      (attack.attacker?.attackerName?.toLowerCase().includes(filters.attackerName.toLowerCase()));

    const matchesCountry = filters.country === "" || 
      (attack.victim?.country?.toLowerCase().includes(filters.country.toLowerCase()));

    const matchesDeadline = compareDates(attack.deadlines, filters.deadlineStart, true) &&
      compareDates(attack.deadlines, filters.deadlineEnd, false);

    return matchesName && matchesCountry && matchesDeadline;
    });
  

  const toggleExpandAttack = (attackId: number) => {
    setExpandedAttack(expandedAttack === attackId ? null : attackId);
  };

  if (selectedAttack) {
    return <AttackDetails attack={selectedAttack} onBack={() => setSelectedAttack(null)} />;
  }


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

  return (
    <div className="container mx-auto p-6 max-w-full">

      {/* Enhanced Filter Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {showFilters ? (
              <>
                <X className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Hide Filters</span>
              </>
            ) : (
              <>
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Show Filters</span>
              </>
            )}
            {Object.values(filters).some(f => f !== "") && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {showFilters && (
  <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Attacker Name Filter */}
      <div className="space-y-2 filter-group">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <User className="icon-sm text-blue-600" />
          <span>Attacker Name</span>
        </label>
        <input
          type="text"
          value={filters.attackerName}
          onChange={(e) => handleFilterChange("attackerName", e.target.value)}
          className="form-input"
          placeholder="Enter attacker name..."
        />
      </div>

      {/* Country Filter */}
      <div className="space-y-2 filter-group">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Globe className="icon-sm text-green-600" />
          <span>Country</span>
        </label>
        <input
          type="text"
          value={filters.country}
          onChange={(e) => handleFilterChange("country", e.target.value)}
          className="form-input"
          placeholder="Enter country..."
        />
      </div>

      {/* Deadline Range Filter */}
      <div className="space-y-2 filter-group">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Clock className="icon-sm text-orange-600" />
          <span>Deadline Range</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={filters.deadlineStart}
            onChange={(e) => handleFilterChange("deadlineStart", e.target.value)}
            className="form-input"
            placeholder="From"
          />
          <input
            type="date"
            value={filters.deadlineEnd}
            onChange={(e) => handleFilterChange("deadlineEnd", e.target.value)}
            className="form-input"
            placeholder="To"
          />
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="flex justify-end mt-6 border-t pt-4 filter-group">
      <button
        onClick={resetFilters}
        className="btn btn-secondary form-input2"
      >
        Reset
      </button>
      <button
        onClick={() => setShowFilters(false)}
        className="btn btn-primary ml-2 form-input2"
      >
        Apply
      </button>
    </div>
  </div>
)}

      </div>

      {/* Enhanced Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Attacker</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-600" />
                  <span>Victim</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  <span>Country</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <span>Category</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  <span>Posted</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span>Deadline</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                  <span>Status</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAttacks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No attacks found matching your filters
                </td>
              </tr>
            ) : (
              filteredAttacks.map((attack) => (
                <React.Fragment key={attack.attackId}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpandAttack(attack.attackId)}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-blue-700">{displayField(attack.attacker.attackerName)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-red-700">{displayField(attack.victim.victimName)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {displayField(attack.victim.country)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{displayField(attack.category)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{displayField(attack.postedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        attack.deadlines && new Date(attack.deadlines) < new Date() 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {displayField(attack.deadlines)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        attack.isPublished ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {attack.isPublished ? "Published" : "Draft"}
                        {attack.isForSale && " • For Sale"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandAttack(attack.attackId);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          {expandedAttack === attack.attackId ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedAttack === attack.attackId && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Attack Details Section */}
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <Shield className="h-5 w-5 text-indigo-600" />
                              <span>Attack Details</span>
                            </h3>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-sm text-gray-500">Status</p>
                                  <p className="text-sm font-medium">
                                    {attack.isPublished ? "Published" : "Draft"}
                                    {attack.isForSale && " • For Sale"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Negotiated</p>
                                  <p className="text-sm font-medium">{attack.isNegotiated ? "Yes" : "No"}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Ransom Amount</p>
                                <p className="text-sm font-medium">{displayField(attack.ransomAmount)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Sale Price</p>
                                <p className="text-sm font-medium">{displayField(attack.saleAmount)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="text-sm font-medium">{displayField(attack.description)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Statistics Section */}
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <Activity className="h-5 w-5 text-purple-600" />
                              <span>Statistics</span>
                            </h3>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-sm text-gray-500">Visits</p>
                                  <p className="text-sm font-medium">{displayNumericField(attack.noOfVisits)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Data Size</p>
                                  <p className="text-sm font-medium">{displayField(attack.dataSizes)}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Last Visited</p>
                                <p className="text-sm font-medium">{displayField(attack.lastVisitedAt)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Updated At</p>
                                <p className="text-sm font-medium">{displayField(attack.updatedAt)}</p>
                              </div>
                            </div>
                          </div>

                          {(attack.downloadUrls?.length > 0) && (
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span>All Available URLs ({attack.downloadUrls?.length})</span>
                              </h3>
                              
                              <div className="space-y-2">
                                {/* Display download URLs */}
                                {attack.downloadUrls?.map((url) => (
                                  <div key={url.downloadUrlId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <a 
                                      href={url.downloadUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:underline truncate"
                                    >
                                      {url.downloadUrl}
                                    </a>
                                  </div>
                                ))}
                                </div>
                            </div>
                          )}
                          {(attack.images?.length > 0) &&
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <span>All Images ({attack.images?.length})</span>
                            </h3>
                            <div className="space-y-2">
                                {attack.images?.map((img) => (
                                  <div key={img.imageId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    {img.image ? (
                                      <>
                                        <a 
                                          href={img.image} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline truncate"
                                        >
                                          {img.image}
                                        </a>
                                      </>
                                    ) : (
                                      <span className="text-sm text-gray-500">
                                        Image ID {img.imageId} (No URL available)
                                      </span>
                                    )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            }
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
export default AllAttacks;