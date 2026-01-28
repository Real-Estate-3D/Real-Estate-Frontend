// File: src/components/legislation/BranchingModal.jsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  X,
  GitBranch,
  Plus,
  GitMerge,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MoreHorizontal,
  ExternalLink,
  Loader2
} from 'lucide-react';
import CreateBranchModal from './CreateBranchModal';
import DeleteBranchModal from './DeleteBranchModal';
import MergeBranchesModal from './MergeBranchesModal';
import branchService from '../../services/branchService';

// Helper to generate month headers for timeline
const getMonthHeaders = (startDate, months = 6) => {
  const headers = [];
  const date = new Date(startDate);
  for (let i = 0; i < months; i++) {
    headers.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
    });
    date.setMonth(date.getMonth() + 1);
  }
  return headers;
};

// Branch Timeline Gantt Component
const BranchTimelineGantt = ({ branches, onBranchSelect, selectedBranch, appliedBranches, onToggleApply }) => {
  const monthHeaders = getMonthHeaders('2024-01-01', 8);
  const monthWidth = 80; // pixels per month

  // Calculate position and width for branch bars
  const calculateBarStyle = (branch) => {
    const startMonth = branch.startMonth || 0;
    const endMonth = branch.endMonth || (branch.status === 'active' ? 7 : startMonth + 2);
    return {
      left: `${startMonth * monthWidth}px`,
      width: `${(endMonth - startMonth + 1) * monthWidth - 8}px`,
    };
  };

  return (
    <div className="relative overflow-x-auto">
      {/* Month Headers */}
      <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0">
        <div className="w-48 shrink-0 px-3 py-2 text-xs font-medium text-gray-500 border-r border-gray-200">
          Branch
        </div>
        <div className="w-16 shrink-0 px-2 py-2 text-xs font-medium text-gray-500 border-r border-gray-200 text-center">
          Apply
        </div>
        <div className="flex">
          {monthHeaders.map((header, index) => (
            <div
              key={index}
              className="text-center py-2 text-xs font-medium text-gray-500 border-r border-gray-100"
              style={{ width: `${monthWidth}px` }}
            >
              {header.month}
            </div>
          ))}
        </div>
      </div>

      {/* Branch Rows */}
      {branches.map((branch) => {
        const barStyle = calculateBarStyle(branch);
        const isApplied = appliedBranches?.has(branch.id) || branch.isMain;

        return (
          <div
            key={branch.id}
            className={`flex items-center border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              selectedBranch?.id === branch.id ? 'bg-blue-50' : ''
            }`}
          >
            {/* Branch Name */}
            <div
              className="w-48 shrink-0 px-3 py-3 cursor-pointer"
              onClick={() => onBranchSelect(branch)}
            >
              <div className="flex items-center gap-2">
                <GitBranch className={`w-4 h-4 ${branch.isMain ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-900 truncate" title={branch.name}>
                  {branch.name}
                </span>
              </div>
              {branch.isMain && (
                <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                  Main
                </span>
              )}
            </div>

            {/* Apply Checkbox */}
            <div className="w-16 shrink-0 px-2 py-3 flex items-center justify-center border-r border-gray-200">
              <input
                type="checkbox"
                checked={isApplied}
                onChange={() => onToggleApply?.(branch.id)}
                disabled={branch.isMain}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title={branch.isMain ? 'Main branch is always applied' : 'Toggle apply'}
              />
            </div>

            {/* Timeline Bar */}
            <div className="relative flex-1 h-12" style={{ minWidth: `${monthHeaders.length * monthWidth}px` }}>
              <div
                className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-full flex items-center px-2 cursor-pointer transition-all ${
                  branch.isMain
                    ? 'bg-blue-600 text-white'
                    : branch.status === 'merged'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-400 text-white hover:bg-gray-500'
                }`}
                style={barStyle}
                onClick={() => onBranchSelect(branch)}
              >
                <span className="text-xs font-medium truncate">{branch.version || ''}</span>
                {/* Merge indicator */}
                {branch.status === 'merged' && (
                  <GitMerge className="w-3 h-3 ml-auto shrink-0" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Legacy Branch Timeline Component (simple node view)
const BranchTimeline = ({ branches, onBranchSelect, selectedBranch }) => {
  return (
    <div className="relative py-4 overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max px-4">
        {/* Timeline line */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2" />

        {branches.map((branch, index) => (
          <div key={branch.id} className="relative flex flex-col items-center">
            {/* Branch node */}
            <button
              onClick={() => onBranchSelect(branch)}
              className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedBranch?.id === branch.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : branch.isMain
                  ? 'bg-blue-100 border-blue-400 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:border-blue-400'
              }`}
            >
              <GitBranch className="w-4 h-4" />
            </button>

            {/* Branch label */}
            <div className="mt-2 text-center">
              <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
                {branch.name}
              </p>
              {branch.isMain && (
                <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                  Main
                </span>
              )}
              {branch.version && !branch.isMain && (
                <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  {branch.version}
                </span>
              )}
            </div>

            {/* Connecting line to child branches */}
            {branch.children && branch.children.length > 0 && (
              <div className="absolute top-8 left-1/2 w-0.5 h-6 bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Version History Table Component
const VersionHistoryTable = ({ versions, onViewInMap, currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {versions.map((version) => (
              <tr key={version.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {version.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {version.version}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {version.date}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {version.author}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {version.size}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                    version.status === 'Published' 
                      ? 'bg-green-100 text-green-700'
                      : version.status === 'Draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {version.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                  {version.description}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewInMap(version)}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View in Map
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 text-sm rounded ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock branches data for fallback
const mockBranches = [
  {
    id: '1',
    name: 'Main Branch',
    isMain: true,
    status: 'active',
    startMonth: 0,
    endMonth: 7,
  },
  {
    id: '2',
    name: 'Zoning amendment 2024-01-06',
    version: 'v1.1',
    status: 'merged',
    startMonth: 1,
    endMonth: 3,
  },
  {
    id: '3',
    name: 'Zoning amendment 2024-03-15',
    version: 'v1.2',
    status: 'active',
    startMonth: 3,
    endMonth: 5,
  },
  {
    id: '4',
    name: 'Height limit revision',
    version: 'v2.0',
    status: 'active',
    startMonth: 5,
    endMonth: 7,
  },
];

const BranchingModal = ({ isOpen, onClose, legislationId, zoningLawName = 'Zoning By-Law Amendment' }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const [isDeleteBranchOpen, setIsDeleteBranchOpen] = useState(false);
  const [isMergeBranchesOpen, setIsMergeBranchesOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [appliedBranches, setAppliedBranches] = useState(new Set());
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch branches when modal opens
  useEffect(() => {
    if (isOpen && legislationId) {
      fetchBranches();
    }
  }, [isOpen, legislationId]);

  const fetchBranches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await branchService.getAll(legislationId);
      if (result.data && result.data.length > 0) {
        setBranches(result.data);
        // Initialize applied branches from API data
        const applied = new Set();
        result.data.forEach(branch => {
          if (branch.isMain || branch.isApplied) {
            applied.add(branch.id);
          }
        });
        setAppliedBranches(applied);
      } else {
        // Use mock data if no branches returned
        setBranches(mockBranches);
        setAppliedBranches(new Set(['1']));
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      setError(err.message);
      // Fallback to mock data on error
      setBranches(mockBranches);
      setAppliedBranches(new Set(['1']));
    } finally {
      setIsLoading(false);
    }
  };

  // Mock versions data
  const versions = [
    {
      id: '1',
      name: 'Main',
      version: 'v1.0',
      date: '28/11/2025',
      author: 'John Doe',
      size: 'Setback: 3.2 m',
      status: 'Published',
      description: 'Setback: 4.4 m',
    },
    {
      id: '2',
      name: 'Zoning amendment 2024-07-06',
      version: 'v1.4',
      date: '01/11/2025',
      author: 'John Doe',
      size: 'Setback: 3.2 m',
      status: 'Published',
      description: 'Setback: 4.4 m',
    },
    {
      id: '3',
      name: 'Zoning amendment 2024-07-06',
      version: 'v1.5',
      date: '01/12/2025',
      author: 'John Doe',
      size: 'Max Height: 523 m',
      status: 'Draft',
      description: 'Max Height: 455 m',
    },
    {
      id: '4',
      name: 'Zoning amendment 2024-07-06',
      version: 'v1.1',
      date: '07/01/2025',
      author: 'John Doe',
      size: 'Max Height: 523 m',
      status: 'Published',
      description: 'Max Height: 455 m',
    },
    {
      id: '5',
      name: 'Zoning amendment 2024-07-06',
      version: 'v1.2',
      date: '07/02/2025',
      author: 'John Doe',
      size: 'Max Height: 523 m',
      status: 'Published',
      description: 'Max Height: 455 m',
    },
    {
      id: '6',
      name: 'Zoning amendment 2024-07-06',
      version: 'v1.3',
      date: '07/05/2025',
      author: 'John Doe',
      size: 'Max Height: 523 m',
      status: 'Published',
      description: 'Max Height: 455 m',
    },
    {
      id: '7',
      name: 'Zoning amendment 2024-07-06',
      version: 'v1.6',
      date: '07/10/2025',
      author: 'John Doe',
      size: 'Max Height: 523 m',
      status: 'Draft',
      description: 'Max Height: 455 m',
    },
    {
      id: '8',
      name: 'Zoning amendment 2024-07-06',
      version: 'v1.7',
      date: '07/15/2025',
      author: 'John Doe',
      size: 'Max Height: 523 m',
      status: 'Published',
      description: 'Max Height: 455 m',
    },
  ];

  const totalPages = 3;

  const handleBranchSelect = useCallback((branch) => {
    setSelectedBranch(branch);
  }, []);

  const handleViewInMap = useCallback((version) => {
    console.log('View in map:', version);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleCreateBranch = useCallback(async (data) => {
    if (!legislationId) {
      console.log('Create branch (mock):', data);
      return;
    }
    try {
      await branchService.create(legislationId, data);
      await fetchBranches(); // Refresh the list
      setIsCreateBranchOpen(false);
    } catch (err) {
      console.error('Failed to create branch:', err);
    }
  }, [legislationId]);

  const handleDeleteBranch = useCallback(async () => {
    if (!legislationId || !branchToDelete) {
      console.log('Delete branch (mock):', branchToDelete);
      setBranchToDelete(null);
      return;
    }
    try {
      await branchService.delete(legislationId, branchToDelete.id);
      await fetchBranches(); // Refresh the list
      setBranchToDelete(null);
      setIsDeleteBranchOpen(false);
    } catch (err) {
      console.error('Failed to delete branch:', err);
    }
  }, [legislationId, branchToDelete]);

  const handleMergeBranches = useCallback(async (data) => {
    if (!legislationId) {
      console.log('Merge branches (mock):', data);
      return;
    }
    try {
      await branchService.mergeBranch(legislationId, data.sourceBranchId, data.targetBranchId);
      await fetchBranches(); // Refresh the list
      setIsMergeBranchesOpen(false);
    } catch (err) {
      console.error('Failed to merge branches:', err);
    }
  }, [legislationId]);

  const handleToggleApply = useCallback(async (branchId) => {
    const isCurrentlyApplied = appliedBranches.has(branchId);

    // Optimistically update UI
    setAppliedBranches(prev => {
      const next = new Set(prev);
      if (next.has(branchId)) {
        next.delete(branchId);
      } else {
        next.add(branchId);
      }
      return next;
    });

    // Call API if legislationId is available
    if (legislationId) {
      try {
        await branchService.applyBranch(legislationId, branchId, !isCurrentlyApplied);
      } catch (err) {
        console.error('Failed to toggle apply:', err);
        // Revert on error
        setAppliedBranches(prev => {
          const next = new Set(prev);
          if (isCurrentlyApplied) {
            next.add(branchId);
          } else {
            next.delete(branchId);
          }
          return next;
        });
      }
    }
  }, [legislationId, appliedBranches]);

  const openDeleteModal = useCallback((branch) => {
    setBranchToDelete(branch);
    setIsDeleteBranchOpen(true);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50" 
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <GitBranch className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Branching</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading branches...</span>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">Failed to load branches: {error}</p>
                <button
                  onClick={fetchBranches}
                  className="mt-2 text-sm text-red-700 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Branches Section */}
            {!isLoading && (
            <>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Branches</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMergeBranchesOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <GitMerge className="w-4 h-4" />
                    Merge
                  </button>
                  <button
                    onClick={() => setIsCreateBranchOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Branch
                  </button>
                </div>
              </div>
              
              {/* Branch Timeline - Gantt View */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <BranchTimelineGantt
                  branches={branches}
                  onBranchSelect={handleBranchSelect}
                  selectedBranch={selectedBranch}
                  appliedBranches={appliedBranches}
                  onToggleApply={handleToggleApply}
                />
              </div>
            </div>

            {/* Version History Section */}
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Version History</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <VersionHistoryTable
                  versions={versions}
                  onViewInMap={handleViewInMap}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
            </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Create Branch Modal */}
      <CreateBranchModal
        isOpen={isCreateBranchOpen}
        onClose={() => setIsCreateBranchOpen(false)}
        onCreateBranch={handleCreateBranch}
      />

      {/* Delete Branch Modal */}
      <DeleteBranchModal
        isOpen={isDeleteBranchOpen}
        onClose={() => {
          setIsDeleteBranchOpen(false);
          setBranchToDelete(null);
        }}
        onDeleteBranch={handleDeleteBranch}
        branchName={branchToDelete?.name || 'Zoning amendment 2024-06-14'}
      />

      {/* Merge Branches Modal */}
      <MergeBranchesModal
        isOpen={isMergeBranchesOpen}
        onClose={() => setIsMergeBranchesOpen(false)}
        onMergeBranches={handleMergeBranches}
      />
    </>
  );
};

export default BranchingModal;
