// File: src/components/legislation/MergeBranchesModal.jsx
import React, { useState } from 'react';
import { X, AlertCircle, GitMerge } from 'lucide-react';

const MergeBranchesModal = ({ 
  isOpen, 
  onClose, 
  onMergeBranches, 
  branches = [],
  conflicts = [] 
}) => {
  const [formData, setFormData] = useState({
    mergeBranch: '',
    targetBranch: '',
    mergeTitle: '',
  });
  const [showConflicts, setShowConflicts] = useState(false);
  const [detectedConflicts, setDetectedConflicts] = useState([]);

  const defaultBranches = branches.length > 0 ? branches : [
    { id: '1', name: 'Zoning amendment 2024-01-17', version: 'v1' },
    { id: '2', name: 'Zoning amendment 2024-01-06', version: 'Main' },
    { id: '3', name: 'Zoning amendment 2023-12-15', version: 'v2' },
    { id: '4', name: 'Zoning amendment 2023-11-20', version: 'v3' },
  ];

  // Mock conflicts that might be detected
  const mockConflicts = [
    'Max Height',
    'Max Storeys',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate conflict detection
    if (!showConflicts && formData.mergeBranch && formData.targetBranch) {
      // Check if branches would have conflicts (simulated)
      const hasConflicts = formData.mergeBranch !== formData.targetBranch;
      if (hasConflicts && mockConflicts.length > 0) {
        setDetectedConflicts(mockConflicts);
        setShowConflicts(true);
        return;
      }
    }
    
    onMergeBranches?.({
      ...formData,
      resolvedConflicts: showConflicts ? detectedConflicts : [],
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({ mergeBranch: '', targetBranch: '', mergeTitle: '' });
    setShowConflicts(false);
    setDetectedConflicts([]);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset conflicts when changing branches
    if (field === 'mergeBranch' || field === 'targetBranch') {
      setShowConflicts(false);
      setDetectedConflicts([]);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Merge Branches</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Merge Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Merge Branch
            </label>
            <select
              value={formData.mergeBranch}
              onChange={(e) => handleChange('mergeBranch', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              required
            >
              <option value="">Select branch to merge</option>
              {defaultBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} - {branch.version}
                </option>
              ))}
            </select>
          </div>

          {/* Target Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Branch
            </label>
            <select
              value={formData.targetBranch}
              onChange={(e) => handleChange('targetBranch', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              required
            >
              <option value="">Select target branch</option>
              {defaultBranches
                .filter(b => b.id !== formData.mergeBranch)
                .map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} - {branch.version}
                  </option>
                ))}
            </select>
          </div>

          {/* Merge Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Merge Title
            </label>
            <input
              type="text"
              value={formData.mergeTitle}
              onChange={(e) => handleChange('mergeTitle', e.target.value)}
              placeholder="Enter merge title"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Conflicts Warning */}
          {showConflicts && detectedConflicts.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">
                    Branches has conflicts
                  </h4>
                  <ul className="space-y-1">
                    {detectedConflicts.map((conflict, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-amber-700">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        {conflict}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showConflicts ? 'Merge and resolve' : 'Merge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MergeBranchesModal;
