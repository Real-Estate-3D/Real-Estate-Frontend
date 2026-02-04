// File: src/components/legislation/ChangeHistoryTable.jsx

import React from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

// Skeleton row component for loading state
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-24 skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-96 skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="flex flex-col gap-1">
        <div className="h-4 bg-gray-200 rounded w-40 skeleton" />
        <div className="h-4 bg-gray-200 rounded w-32 skeleton" />
      </div>
    </td>
  </tr>
);

const ChangeHistoryTable = ({
  data = [],
  pagination = { page: 1, perPage: 10, total: 0 },
  onPageChange,
  onPerPageChange,
  onEntityClick,
  isLoading = false,
}) => {
  const totalPages = Math.ceil(pagination.total / pagination.perPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (pagination.page <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (pagination.page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(pagination.page);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Affected Laws & Processes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                  No change history found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{formatDate(item.date)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{item.description}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {item.affectedEntities && item.affectedEntities.length > 0 ? (
                        item.affectedEntities.map((entity, idx) => (
                          <button
                            key={idx}
                            onClick={() => onEntityClick?.(entity)}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {entity.title || entity.url || `${entity.type}/${entity.id}`}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          Total Items: {pagination.total}
        </div>

        <div className="flex items-center gap-4">
          {/* Pagination */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={`min-w-8 h-8 px-2 text-sm font-medium rounded transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            ))}

            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === totalPages || totalPages === 0}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>

          {/* Per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show per Page</span>
            <select
              value={pagination.perPage}
              onChange={(e) => onPerPageChange?.(Number(e.target.value))}
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

export default ChangeHistoryTable;
