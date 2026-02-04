// File: src/components/legislation/ZoningLawsGrid.jsx

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ZoningLawCard from './ZoningLawCard';

// Skeleton card component for loading state
const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 skeleton" />
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-2 skeleton" />
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20 skeleton" />
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2">
      <div className="h-4 bg-gray-200 rounded w-full skeleton" />
      <div className="h-4 bg-gray-200 rounded w-full skeleton" />
    </div>
    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
      <div className="h-6 bg-gray-200 rounded w-16 skeleton" />
      <div className="h-6 bg-gray-200 rounded w-12 skeleton" />
      <div className="h-6 bg-gray-200 rounded w-20 skeleton" />
    </div>
  </div>
);

const ZoningLawsGrid = ({
  data,
  pagination,
  onPageChange,
  onPerPageChange,
  onRowClick,
  onEdit,
  onDelete,
  onDuplicate,
  isLoading = false,
}) => {
  const { page, perPage, total } = pagination;
  const totalPages = Math.ceil(total / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedData = data.slice(startIndex, startIndex + perPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No zoning laws found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedData.map((item) => (
              <ZoningLawCard
                key={item.id}
                item={item}
                onClick={onRowClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">Total Items: {total}</div>

        <div className="flex items-center gap-4">
          {/* Pagination */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((pageNum, index) =>
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-8 h-8 px-2 text-sm font-medium rounded transition-colors ${
                    page === pageNum
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>

          {/* Per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show per Page</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoningLawsGrid;
