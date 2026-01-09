// File: src/components/legislation/PoliciesTable.jsx

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const PoliciesTable = ({ 
  data = [], 
  pagination = { page: 1, perPage: 10, total: 0 },
  onPageChange,
  onPerPageChange,
  onRowClick,
}) => {
  const totalPages = Math.ceil(pagination.total / pagination.perPage);
  const startItem = (pagination.page - 1) * pagination.perPage + 1;
  const endItem = Math.min(pagination.page * pagination.perPage, pagination.total);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange?.(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange?.(1)}
              className="w-8 h-8 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-400">...</span>}
          </>
        )}
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange?.(page)}
            className={`w-8 h-8 text-sm font-medium rounded ${
              page === pagination.page
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
            <button
              onClick={() => onPageChange?.(totalPages)}
              className="w-8 h-8 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange?.(pagination.page + 1)}
          disabled={pagination.page === totalPages}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Policy
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rules
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((policy) => (
              <tr
                key={policy.id}
                onClick={() => onRowClick?.(policy)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer">
                    {policy.name}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{policy.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{policy.rules}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
        <div className="text-sm text-gray-500">
          Total Items: {pagination.total}
        </div>
        
        <div className="flex items-center gap-4">
          {renderPagination()}
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show per Page</span>
            <div className="relative">
              <select
                value={pagination.perPage}
                onChange={(e) => onPerPageChange?.(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesTable;
