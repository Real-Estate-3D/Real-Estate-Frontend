// File: src/components/legislation/form/steps/RequiredWorkflowsStep.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, Search, GripVertical } from 'lucide-react';

// Available workflows to add
const availableWorkflows = [
  { id: 'submit_application', name: 'Submit Application' },
  { id: 'environmental_impact_review', name: 'Environmental Impact Review' },
  { id: 'review_by_planner', name: 'Review by Planner' },
  { id: 'review_by_council', name: 'Review by Council' },
  { id: 'approve_by_council', name: 'Approve by Council' },
  { id: 'public_meeting', name: 'Public Meeting' },
  { id: 'site_plan_review', name: 'Site Plan Review' },
  { id: 'heritage_review', name: 'Heritage Review' },
  { id: 'traffic_study', name: 'Traffic Impact Study' },
  { id: 'zoning_compliance', name: 'Zoning Compliance Check' },
  { id: 'building_permit', name: 'Building Permit Review' },
];

const RequiredWorkflowsStep = ({ formData, onChange, errors }) => {
  // Initialize with sample workflows
  const [workflows, setWorkflows] = useState(formData.requiredWorkflows || [
    { id: 'submit_application', name: 'Submit Application', order: 1 },
    { id: 'environmental_impact_review', name: 'Environmental Impact Review', order: 2 },
    { id: 'review_by_planner', name: 'Review by Planner', order: 3 },
    { id: 'approve_by_council', name: 'Approve by Council', order: 4 },
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
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
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isDropdownOpen]);

  // Get IDs of already added workflows
  const addedWorkflowIds = workflows.map(w => w.id);
  
  // Filter available workflows based on search and already added
  const filteredWorkflows = availableWorkflows.filter(workflow => 
    !addedWorkflowIds.includes(workflow.id) &&
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add a workflow
  const handleAddWorkflow = useCallback((workflow) => {
    const newWorkflow = {
      id: workflow.id,
      name: workflow.name,
      order: workflows.length + 1,
    };
    const updated = [...workflows, newWorkflow];
    setWorkflows(updated);
    onChange('requiredWorkflows', updated);
    setIsDropdownOpen(false);
    setSearchQuery('');
  }, [workflows, onChange]);

  // Remove a workflow
  const handleRemoveWorkflow = useCallback((workflowId) => {
    const updated = workflows.filter(w => w.id !== workflowId);
    // Re-order remaining workflows
    const reordered = updated.map((w, idx) => ({ ...w, order: idx + 1 }));
    setWorkflows(reordered);
    onChange('requiredWorkflows', reordered);
  }, [workflows, onChange]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    const updated = [...workflows];
    const draggedWorkflow = updated[draggedItem];
    updated.splice(draggedItem, 1);
    updated.splice(index, 0, draggedWorkflow);
    
    // Update order
    const reordered = updated.map((w, idx) => ({ ...w, order: idx + 1 }));
    setWorkflows(reordered);
    setDraggedItem(index);
  }, [draggedItem, workflows]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    onChange('requiredWorkflows', workflows);
  }, [workflows, onChange]);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
    if (isDropdownOpen) {
      setSearchQuery('');
    }
  }, [isDropdownOpen]);

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900">Required Workflows</h3>

      {/* Workflow List */}
      <div className="flex flex-col">
        {workflows.map((workflow, index) => (
          <div
            key={workflow.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white hover:bg-gray-50 cursor-move transition-colors ${
              draggedItem === index ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{workflow.name}</span>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveWorkflow(workflow.id)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Workflow Button with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={toggleDropdown}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Workflow
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workflows"
                  className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Workflow Options */}
            <div className="max-h-60 overflow-y-auto">
              {filteredWorkflows.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {searchQuery ? 'No workflows found' : 'All workflows added'}
                </div>
              ) : (
                filteredWorkflows.map((workflow) => (
                  <button
                    key={workflow.id}
                    type="button"
                    onClick={() => handleAddWorkflow(workflow)}
                    className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {workflow.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequiredWorkflowsStep;
