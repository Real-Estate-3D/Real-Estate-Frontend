// File: src/components/legislation/ZoningLawsTable.jsx

import React from 'react';
import { ChevronLeft, ChevronRight, Pencil, Trash2, Copy } from 'lucide-react';

// Skeleton row component for loading state
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div className="w-4 h-4 bg-gray-200 rounded skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-52 skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-20 skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-28 skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-24 skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="h-6 bg-gray-200 rounded-full w-20 skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center justify-end gap-2">
        <div className="h-4 bg-gray-200 rounded w-12 skeleton" />
        <div className="h-4 bg-gray-200 rounded w-10 skeleton" />
        <div className="h-4 bg-gray-200 rounded w-16 skeleton" />
      </div>
    </td>
  </tr>
);

const validityStyles = {
  Active: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  Valid: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  Expired: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  Pending: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  Draft: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  Superseded: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
};

const ZoningLawsTable = ({
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
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#ECECF4] sticky top-0">
            <tr>
              <th scope="col" className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zoning Law
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Number
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effective date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Validation
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
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
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No zoning laws found
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick?.(item)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900 hover:text-gray-600 hover:underline">
                    {item.title}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.number}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.type}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.effectiveFrom}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600" title={item.validationMessage || item.validityStatus}>
                    {item.validationMessage || item.validityStatus || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onDelete?.(item.id)}
                      className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => onRowClick?.(item)}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDuplicate?.(item)}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Duplicate
                    </button>
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
          Total Items: {total}
        </div>

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
            
            {getPageNumbers().map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
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
            ))}
            
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

export default ZoningLawsTable;
