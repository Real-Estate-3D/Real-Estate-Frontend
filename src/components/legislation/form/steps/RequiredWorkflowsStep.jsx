// File: src/components/legislation/form/steps/RequiredWorkflowsStep.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, Search, X } from 'lucide-react';

const availableWorkflows = [
  {
    id: 'submit_application',
    name: 'Submit Application',
    description: 'Initial application submission process',
    category: 'Application',
  },
  {
    id: 'environmental_impact_review',
    name: 'Environmental Impact Review',
    description: 'Environmental impact evaluation and mitigation',
    category: 'Review',
  },
  {
    id: 'review_by_planner',
    name: 'Review by Planner',
    description: 'Professional planner review and assessment',
    category: 'Review',
  },
  {
    id: 'approve_by_council',
    name: 'Approve by Council',
    description: 'Council approval and decision process',
    category: 'Approval',
  },
  {
    id: 'public_meeting',
    name: 'Public Meeting',
    description: 'Community engagement and public consultation',
    category: 'Community',
  },
  {
    id: 'site_plan_review',
    name: 'Site Plan Review',
    description: 'Review of site plans and development proposals',
    category: 'Review',
  },
  {
    id: 'heritage_review',
    name: 'Heritage Review',
    description: 'Assessment of heritage properties and conservation',
    category: 'Heritage',
  },
  {
    id: 'traffic_study',
    name: 'Traffic Impact Study',
    description: 'Analysis of traffic patterns and infrastructure needs',
    category: 'Infrastructure',
  },
  {
    id: 'zoning_compliance',
    name: 'Zoning Compliance Check',
    description: 'Verification of compliance with zoning bylaws',
    category: 'Planning',
  },
  {
    id: 'building_permit',
    name: 'Building Permit Review',
    description: 'Technical review for building code compliance',
    category: 'Permits',
  },
];

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-gray-100 text-gray-800' },
];

const RequiredWorkflowsStep = ({ formData, onChange, errors }) => {
  const [workflows, setWorkflows] = useState(formData.requiredWorkflows || []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const addedWorkflowIds = workflows.map(w => w.id);
  
  const filteredWorkflows = availableWorkflows.filter(workflow => 
    !addedWorkflowIds.includes(workflow.id) &&
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddWorkflow = (workflow) => {
    const newWorkflow = {
      ...workflow,
      status: 'pending',
      startDate: '',
      endDate: '',
      order: workflows.length + 1,
    };
    const updated = [...workflows, newWorkflow];
    setWorkflows(updated);
    onChange('requiredWorkflows', updated);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleRemoveWorkflow = (workflowId) => {
    const updated = workflows.filter(w => w.id !== workflowId);
    setWorkflows(updated);
    onChange('requiredWorkflows', updated);
  };

  const handleUpdateWorkflow = (workflowId, field, value) => {
    const updated = workflows.map(w => 
      w.id === workflowId ? { ...w, [field]: value } : w
    );
    setWorkflows(updated);
    onChange('requiredWorkflows', updated);
  };

  const handleEditClick = (workflow) => {
    setEditingWorkflow(editingWorkflow?.id === workflow.id ? null : workflow);
  };

  const getStatusBadge = (status) => {
    const option = statusOptions.find(s => s.value === status) || statusOptions[0];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${option.color}`}>
        {option.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Required Workflows</h3>
          <p className="text-xs text-gray-500 mt-1">
            Add and configure the workflows required for this legislation
          </p>
        </div>
      </div>

      {/* Workflow Table */}
      {workflows.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workflows.map((workflow) => (
                <React.Fragment key={workflow.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{workflow.name}</span>
                        <span className="text-xs text-gray-500">{workflow.description}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(workflow.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {workflow.startDate || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {workflow.endDate || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(workflow)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkflow(workflow.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Inline Edit Row */}
                  {editingWorkflow?.id === workflow.id && (
                    <tr className="bg-blue-50">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select
                              value={workflow.status}
                              onChange={(e) => handleUpdateWorkflow(workflow.id, 'status', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={workflow.startDate}
                              onChange={(e) => handleUpdateWorkflow(workflow.id, 'startDate', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                            <input
                              type="date"
                              value={workflow.endDate}
                              onChange={(e) => handleUpdateWorkflow(workflow.id, 'endDate', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => setEditingWorkflow(null)}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {workflows.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-500 mb-2">No workflows added yet</p>
          <p className="text-xs text-gray-400">Click the button below to add required workflows</p>
        </div>
      )}

      {/* Add Workflow Button with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Workflow
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-20 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workflows..."
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Workflow List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredWorkflows.length > 0 ? (
                <ul className="py-1">
                  {filteredWorkflows.map((workflow) => (
                    <li key={workflow.id}>
                      <button
                        type="button"
                        onClick={() => handleAddWorkflow(workflow)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{workflow.name}</span>
                          <span className="text-xs text-gray-500">{workflow.description}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-500">
                    {addedWorkflowIds.length === availableWorkflows.length 
                      ? 'All workflows have been added' 
                      : 'No matching workflows found'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Workflow Count */}
      {workflows.length > 0 && (
        <p className="text-xs text-gray-500">
          {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} configured
        </p>
      )}
    </div>
  );
};

export default RequiredWorkflowsStep;
