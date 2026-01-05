// File: src/components/legislation/DeleteBranchModal.jsx
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const DeleteBranchModal = ({ isOpen, onClose, onDeleteBranch, branchName = 'Zoning amendment 2024-06-14' }) => {
  const [formData, setFormData] = useState({
    reason: '',
    confirmName: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.confirmName === branchName) {
      onDeleteBranch?.(formData);
      setFormData({ reason: '', confirmName: '' });
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isConfirmValid = formData.confirmName === branchName;

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
          <h2 className="text-lg font-semibold text-gray-900">Delete Branch</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              Are you sure you want to delete the <span className="font-medium">{branchName}</span>?
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Enter reason for deletion"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Confirm Branch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name Branch
            </label>
            <input
              type="text"
              value={formData.confirmName}
              onChange={(e) => handleChange('confirmName', e.target.value)}
              placeholder="Type branch name to confirm"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Type "<span className="font-medium">{branchName}</span>" to confirm deletion
            </p>
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
              disabled={!isConfirmValid}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteBranchModal;
