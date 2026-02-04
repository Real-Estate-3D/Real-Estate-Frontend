// File: src/components/legislation/VersionHistoryModal.jsx

import React, { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, RotateCcw, Check, Clock } from 'lucide-react';

// Mock version history data
const mockVersionHistory = [
  {
    id: 1,
    version: 'v1.0',
    date: '2024-01-15',
    author: 'John Smith',
    status: 'Published',
    changes: 'Initial version created',
    originalValue: '-',
    amendmentValue: 'Initial creation',
    approvalStatus: 'Approved',
    isCurrent: false,
  },
  {
    id: 2,
    version: 'v1.1',
    date: '2024-03-20',
    author: 'Sarah Johnson',
    status: 'Published',
    changes: 'Updated setback requirements from 8m to 10m',
    originalValue: 'Setback: 8m',
    amendmentValue: 'Setback: 10m',
    approvalStatus: 'Approved',
    isCurrent: false,
  },
  {
    id: 3,
    version: 'v1.2',
    date: '2024-06-10',
    author: 'Michael Chen',
    status: 'Published',
    changes: 'Added new workflow requirements for environmental review',
    originalValue: 'No environmental review',
    amendmentValue: 'Environmental review required',
    approvalStatus: 'Approved',
    isCurrent: false,
  },
  {
    id: 4,
    version: 'v2.0',
    date: '2024-09-05',
    author: 'Emily Davis',
    status: 'Published',
    changes: 'Major revision: Updated height limits, added density provisions',
    originalValue: 'Height: 25m, Density: 150 units/ha',
    amendmentValue: 'Height: 35m, Density: 200 units/ha',
    approvalStatus: 'Approved',
    isCurrent: false,
  },
  {
    id: 5,
    version: 'v2.1',
    date: '2024-11-18',
    author: 'Robert Wilson',
    status: 'Draft',
    changes: 'Proposed changes to parking requirements',
    originalValue: 'Parking: 2 spaces/unit',
    amendmentValue: 'Parking: 1.5 spaces/unit',
    approvalStatus: 'Pending',
    isCurrent: false,
  },
  {
    id: 6,
    version: 'v2.2',
    date: '2025-01-10',
    author: 'John Smith',
    status: 'Current',
    changes: 'Current active version with all approved amendments',
    originalValue: 'Previous consolidated version',
    amendmentValue: 'Current consolidated version',
    approvalStatus: 'Approved',
    isCurrent: true,
  },
];

const VersionHistoryModal = ({
  isOpen,
  onClose,
  zoningLawName = 'Zoning By-Law Amendment',
  onRestoreVersion,
  onViewVersion,
  onConsolidateAmendments,
}) => {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState(new Set());
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 5,
    total: mockVersionHistory.length,
  });

  const totalPages = Math.ceil(pagination.total / pagination.perPage);
  const startIndex = (pagination.page - 1) * pagination.perPage;
  const paginatedVersions = mockVersionHistory.slice(startIndex, startIndex + pagination.perPage);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleViewVersion = useCallback((version) => {
    setSelectedVersion(version);
    onViewVersion?.(version);
  }, [onViewVersion]);

  const handleRestoreVersion = useCallback((version) => {
    onRestoreVersion?.(version);
  }, [onRestoreVersion]);

  // Checkbox selection handlers
  const handleToggleVersion = useCallback((versionId) => {
    setSelectedVersions(prev => {
      const next = new Set(prev);
      if (next.has(versionId)) {
        next.delete(versionId);
      } else {
        next.add(versionId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const selectableVersions = paginatedVersions.filter(v => !v.isCurrent && v.status !== 'Draft');
    const allSelected = selectableVersions.every(v => selectedVersions.has(v.id));

    if (allSelected) {
      // Deselect all
      setSelectedVersions(prev => {
        const next = new Set(prev);
        selectableVersions.forEach(v => next.delete(v.id));
        return next;
      });
    } else {
      // Select all
      setSelectedVersions(prev => {
        const next = new Set(prev);
        selectableVersions.forEach(v => next.add(v.id));
        return next;
      });
    }
  }, [paginatedVersions, selectedVersions]);

  const handleConsolidateAmendments = useCallback(async () => {
    if (selectedVersions.size < 2) return;

    setIsConsolidating(true);
    try {
      await onConsolidateAmendments?.(Array.from(selectedVersions));
      setSelectedVersions(new Set());
    } finally {
      setIsConsolidating(false);
    }
  }, [selectedVersions, onConsolidateAmendments]);

  const selectableVersions = paginatedVersions.filter(v => !v.isCurrent && v.status !== 'Draft');
  const isAllSelected = selectableVersions.length > 0 && selectableVersions.every(v => selectedVersions.has(v.id));

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'current':
        return 'bg-green-100 text-green-700';
      case 'published':
        return 'bg-gray-100 text-gray-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'archived':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getApprovalColor = (approval) => {
    switch (approval?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
              <p className="text-sm text-gray-500">{zoningLawName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Original
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Amendment
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVersions.map((version) => {
                  const isSelectable = !version.isCurrent && version.status !== 'Draft';
                  return (
                  <tr
                    key={version.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedVersion?.id === version.id ? 'bg-gray-100' : ''
                    } ${version.isCurrent ? 'bg-green-50/50' : ''}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedVersions.has(version.id)}
                        onChange={() => handleToggleVersion(version.id)}
                        disabled={!isSelectable}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{version.author}</span>
                        {version.isCurrent && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                            <Check className="w-3 h-3" />
                            Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(version.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-gray-500 truncate max-w-[140px]" title={version.originalValue}>
                        {version.originalValue || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]" title={version.amendmentValue}>
                        {version.amendmentValue || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getApprovalColor(version.approvalStatus)}`}>
                        {version.approvalStatus || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewVersion(version)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="View this version"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        {!version.isCurrent && version.status !== 'Draft' && (
                          <button
                            onClick={() => handleRestoreVersion(version)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="Restore this version"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Restore</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + pagination.perPage, pagination.total)} of {pagination.total} versions
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
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
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            {selectedVersions.size >= 2 && (
              <button
                onClick={handleConsolidateAmendments}
                disabled={isConsolidating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isConsolidating ? 'Consolidating...' : `Consolidate Amendments (${selectedVersions.size})`}
              </button>
            )}
            {selectedVersions.size === 1 && (
              <span className="text-sm text-gray-500">Select at least 2 versions to consolidate</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal;
