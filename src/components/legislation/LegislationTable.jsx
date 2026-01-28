// File: src/components/legislation/LegislationTable.jsx

import React from 'react';
import { Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';

// Skeleton row component for loading state
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div className="w-4 h-4 bg-gray-200 rounded skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-48 skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-40 skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="h-6 bg-gray-200 rounded-full w-24 skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-24 skeleton" />
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-7 bg-gray-200 rounded w-16 skeleton" />
        <div className="h-7 bg-gray-200 rounded w-14 skeleton" />
      </div>
    </td>
  </tr>
);

const statusStyles = {
  active: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  pending: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  'awaiting-approval': 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  rejected: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  cancelled: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  draft: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  completed: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
};

const statusLabels = {
  active: 'Active',
  pending: 'Awaiting Approval',
  'awaiting-approval': 'Awaiting Approval',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  draft: 'Draft',
  completed: 'Completed',
};

const LegislationTable = ({
  data,
  pagination,
  onPageChange,
  onPerPageChange,
  onEdit,
  onDelete,
  onSwap,
  isLoading = false,
}) => {
  const totalPages = Math.ceil(pagination.total / pagination.perPage);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-[#ECECF4] border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left w-10">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-black rounded border-gray-300" 
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Process
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Steps
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Updated Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No legislation found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-black rounded border-gray-300" 
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => onEdit(item.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                    >
                      {item.title}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {item.process || 'Submission, Review, Approval'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        statusStyles[item.status] || statusStyles.draft
                      }`}
                    >
                      {statusLabels[item.status] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {item.effectiveFrom ? new Date(item.effectiveFrom).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }).replace(/\//g, '.') : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
        <div className="text-sm text-gray-600">
          Total Items: {pagination.total}
        </div>

        <div className="flex items-center gap-4">
          {/* Page numbers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[32px] h-8 px-2 text-sm rounded transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 3 && (
              <>
                <span className="text-gray-400">...</span>
                <button
                  onClick={() => onPageChange(totalPages)}
                  className={`min-w-[32px] h-8 px-2 text-sm rounded transition-colors ${
                    pagination.page === totalPages
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Per page selector */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Show per Page</span>
            <select
              value={pagination.perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="px-2 py-1 text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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

export default LegislationTable;
