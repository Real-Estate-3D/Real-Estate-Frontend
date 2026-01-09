// File: src/components/legislation/CreateBranchModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateBranchModal = ({ isOpen, onClose, onCreateBranch, baseBranches = [] }) => {
  const [formData, setFormData] = useState({
    branchName: '',
    baseBranch: '',
    description: '',
  });

  const defaultBaseBranches = baseBranches.length > 0 ? baseBranches : [
    { id: '1', name: 'Zoning amendment 2024-01-17 - v1' },
    { id: '2', name: 'Zoning amendment 2024-01-06 - Main' },
    { id: '3', name: 'Zoning amendment 2023-12-15 - v2' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateBranch?.(formData);
    setFormData({ branchName: '', baseBranch: '', description: '' });
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Branch</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Branch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Branch Name
            </label>
            <input
              type="text"
              value={formData.branchName}
              onChange={(e) => handleChange('branchName', e.target.value)}
              placeholder="Enter branch name"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          {/* Base Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Base Branch
            </label>
            <select
              value={formData.baseBranch}
              onChange={(e) => handleChange('baseBranch', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              required
            >
              <option value="">Select base branch</option>
              {defaultBaseBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter description"
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBranchModal;
