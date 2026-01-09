// File: src/components/legislation/BranchingModal.jsx
import React, { useState, useCallback } from 'react';
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
  ExternalLink
} from 'lucide-react';
import CreateBranchModal from './CreateBranchModal';
import DeleteBranchModal from './DeleteBranchModal';
import MergeBranchesModal from './MergeBranchesModal';

// Branch Timeline Component
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

const BranchingModal = ({ isOpen, onClose, zoningLawName = 'Zoning By-Law Amendment' }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const [isDeleteBranchOpen, setIsDeleteBranchOpen] = useState(false);
  const [isMergeBranchesOpen, setIsMergeBranchesOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  // Mock branches data
  const branches = [
    { id: '1', name: 'Zoning amendment 2024-01-17', isMain: true },
    { id: '2', name: 'Zoning amendment 2024-01-06', version: 'v1' },
    { id: '3', name: 'Zoning amendment 2023-07-15', version: 'v2' },
  ];

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

  const handleCreateBranch = useCallback((data) => {
    console.log('Create branch:', data);
  }, []);

  const handleDeleteBranch = useCallback((data) => {
    console.log('Delete branch:', data, branchToDelete);
    setBranchToDelete(null);
  }, [branchToDelete]);

  const handleMergeBranches = useCallback((data) => {
    console.log('Merge branches:', data);
  }, []);

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
            {/* Branches Section */}
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
              
              {/* Branch Timeline */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <BranchTimeline
                  branches={branches}
                  onBranchSelect={handleBranchSelect}
                  selectedBranch={selectedBranch}
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
