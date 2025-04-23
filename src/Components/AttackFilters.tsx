
import React from "react";
import {
    Filter,
    ChevronDown,
    ChevronUp,
    Calendar,
} from "lucide-react";

interface Filters {
    attackerName: string;
    country: string;
    createdStart: string;
    createdEnd: string;
    category: string;
}

interface AttackFiltersProps {
    filters: Filters;
    onApplyFilters: (filters: Filters) => void;
    resetFilters: () => void;
    setShowFilters: (show: boolean) => void;
    showFilters: boolean;
    setLocalFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const AttackFilters = ({ filters, onApplyFilters, resetFilters, setShowFilters, showFilters, setLocalFilters }: AttackFiltersProps) => {
    const handleInputChange = (key: keyof Filters, value: string) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm border border-gray-200">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-secondary flex items-center gap-2 form-input2"
                >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                    {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
            </div>

            {showFilters && (
                <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="attackerName" className="block text-sm font-medium text-gray-700">Attacker Name</label>
                            <input
                                type="text"
                                id="attackerName"
                                value={filters.attackerName}
                                onChange={(e) => handleInputChange("attackerName", e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm form-input"
                                placeholder="Enter attacker name"
                            />
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                            <input
                                type="text"
                                id="country"
                                value={filters.country}
                                onChange={(e) => handleInputChange("country", e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm form-input"
                                placeholder="Enter country"
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <input
                                type="text"
                                id="category"
                                value={filters.category}
                                onChange={(e) => handleInputChange("category", e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm form-input"
                                placeholder="Enter category"
                            />
                        </div>
                        <div>
                            <label htmlFor="createdStart" className="block text-sm font-medium text-gray-700">Created Start</label>
                            <input
                                type="date"
                                id="createdStart"
                                value={filters.createdStart}
                                onChange={(e) => handleInputChange("createdStart", e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm form-input"
                            />
                        </div>
                        <div>
                            <label htmlFor="createdEnd" className="block text-sm font-medium text-gray-700">Created End</label>
                            <input
                                type="date"
                                id="createdEnd"
                                value={filters.createdEnd}
                                onChange={(e) => handleInputChange("createdEnd", e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm form-input"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={resetFilters}
                            className="btn btn-secondary form-input2"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => {
                                onApplyFilters(filters);
                                setShowFilters(false);
                            }}
                            className="btn btn-primary ml-2 form-input2"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttackFilters;