// src/components/Pagination.tsx
import React from "react";
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface PaginationProps {
    totalItems: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
}

const Pagination = ({ totalItems, currentPage, onPageChange, itemsPerPage }: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const renderPageNumbers = () => {
        const visiblePageNumbers: (number | "...")[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            return pageNumbers.map(num => (
                <button
                    key={num}
                    onClick={() => onPageChange(num)}
                    className={`px-3 py-2 rounded-md ${currentPage === num ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                >
                    {num}
                </button>
            ));
        }

        if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
            for (let i = 1; i <= Math.min(totalPages, maxVisiblePages); i++) {
                visiblePageNumbers.push(i);
            }
            if (totalPages > maxVisiblePages) visiblePageNumbers.push("...", totalPages);
        } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
            visiblePageNumbers.push(1, "...");
            for (let i = Math.max(1, totalPages - maxVisiblePages + 1); i <= totalPages; i++) {
                visiblePageNumbers.push(i);
            }
        } else {
            visiblePageNumbers.push(1, "...");
            const middle = Math.floor(maxVisiblePages / 2);
            for (let i = currentPage - middle + (maxVisiblePages % 2 === 0 ? 0 : 1); i <= currentPage + middle; i++) {
                visiblePageNumbers.push(i);
            }
            visiblePageNumbers.push("...", totalPages);
        }

        return visiblePageNumbers.map((num, index) => {
            if (num === "...") {
                return <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-700">...</span>;
            }
            return (
                <button
                    key={num}
                    onClick={() => onPageChange(num as number)}
                    className={`px-3 py-2 rounded-md ${currentPage === num ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                >
                    {num}
                </button>
            );
        });
    };

    return (
        <div className="flex justify-center mt-6">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className="px-3 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-200 mr-2"
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            {renderPageNumbers()}
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className="px-3 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-200 ml-2"
                disabled={currentPage === totalPages || totalPages === 0}
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

export default Pagination;