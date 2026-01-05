// File: src/components/legislation/form/steps/ReviewPublishStep.jsx

import React, { useState } from 'react';
import { Check, AlertCircle, Info, Pencil, Plus, ChevronDown, Search, X } from 'lucide-react';

const availableWorkflows = [
  { id: 'submit_application', name: 'Submit Application' },
  { id: 'environmental_impact_review', name: 'Environmental Impact Review' },
  { id: 'review_by_planner', name: 'Review by Planner' },
  { id: 'approve_by_council', name: 'Approve by Council' },
  { id: 'public_meeting', name: 'Public Meeting' },
];

const ReviewPublishStep = ({ formData, onChange, errors }) => {
  const [complianceChecks, setComplianceChecks] = useState({
    heritageZone: false,
  });
  const [isWorkflowDropdownOpen, setIsWorkflowDropdownOpen] = useState(false);
  const [workflowSearch, setWorkflowSearch] = useState('');

  // Get schedules from form data
  const schedules = formData.gisSchedules || [];
  
  // Get workflows from form data
  const workflows = formData.requiredWorkflows || [];
  const addedWorkflowIds = workflows.map(w => w.id);

  const filteredWorkflows = availableWorkflows.filter(w => 
    !addedWorkflowIds.includes(w.id) &&
    w.name.toLowerCase().includes(workflowSearch.toLowerCase())
  );

  const handleAddWorkflow = (workflow) => {
    const newWorkflow = {
      ...workflow,
      status: 'pending',
      order: workflows.length + 1,
    };
    const updated = [...workflows, newWorkflow];
    onChange('requiredWorkflows', updated);
    setIsWorkflowDropdownOpen(false);
    setWorkflowSearch('');
  };

  const handleComplianceChange = (key, checked) => {
    setComplianceChecks(prev => ({
      ...prev,
      [key]: checked,
    }));
  };

  // Calculate completion status
  const requiredFields = ['title', 'jurisdiction', 'effectiveFrom', 'legislationType'];
  const completedRequired = requiredFields.filter(field => formData[field]).length;
  const isComplete = completedRequired === requiredFields.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Status Banner */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-700">
            Check all details below before creating the Legislation. You can edit any section before submission.
          </p>
        </div>
      </div>

      {/* Diff View Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-gray-900">Diff View</h3>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Polygon
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Parameter
                </th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Archive
                </th>
                <th scope="col" className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.length > 0 ? (
                schedules.map((schedule, index) => (
                  <tr key={schedule.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {schedule.name || `Schedule ${index + 1}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Downtown Mixed Use Zone
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Zone abc
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Min Lot Front Setback
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      1.0 m
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      4.0 m
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs text-red-600 hover:text-red-700 font-medium">
                          Delete
                        </button>
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  {/* Sample rows when no schedules */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">Schedule 1</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Downtown Mixed Use Zone</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Zone abc</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Min Lot Front Setback</td>
                    <td className="px-4 py-3 text-sm text-gray-600">1.0 m</td>
                    <td className="px-4 py-3 text-sm text-gray-600">4.0 m</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs text-red-600 hover:text-red-700 font-medium">Delete</button>
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">Schedule 2</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Downtown Mixed Use Zone</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Zone abc</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Max Building Height</td>
                    <td className="px-4 py-3 text-sm text-gray-600">20.0 m</td>
                    <td className="px-4 py-3 text-sm text-gray-600">32.0 m</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs text-red-600 hover:text-red-700 font-medium">Delete</button>
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Required Workflows Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-gray-900">Required Workflows</h3>
        
        {/* Workflows List */}
        {workflows.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-2">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {workflows.map((workflow, index) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{workflow.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs text-red-600 hover:text-red-700 font-medium">
                          Delete
                        </button>
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Workflow Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsWorkflowDropdownOpen(!isWorkflowDropdownOpen)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-dashed border-gray-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Workflow
          </button>

          {isWorkflowDropdownOpen && (
            <div className="absolute z-20 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
              {/* Search */}
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={workflowSearch}
                    onChange={(e) => setWorkflowSearch(e.target.value)}
                    placeholder="Search..."
                    autoFocus
                    className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {workflowSearch && (
                    <button
                      type="button"
                      onClick={() => setWorkflowSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Workflow List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredWorkflows.length > 0 ? (
                  <ul className="py-1">
                    {filteredWorkflows.map((workflow) => (
                      <li key={workflow.id}>
                        <button
                          type="button"
                          onClick={() => handleAddWorkflow(workflow)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {workflow.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-4 text-center">
                    <p className="text-sm text-gray-500">
                      {addedWorkflowIds.length === availableWorkflows.length 
                        ? 'All workflows added' 
                        : 'No matching workflows'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-gray-900">Compliance</h3>
        
        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={complianceChecks.heritageZone}
            onChange={(e) => handleComplianceChange('heritageZone', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Overlap with existing heritage zone</span>
        </label>
      </div>
    </div>
  );
};

export default ReviewPublishStep;
