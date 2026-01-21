// File: src/components/legislation/form/steps/RequiredWorkflowsStep.jsx

import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';

const availableWorkflows = [
  {
    id: 'site_plan_review',
    name: 'Site Plan Review',
    description: 'Review of site plans and development proposals',
    category: 'Planning',
  },
  {
    id: 'environmental_assessment',
    name: 'Environmental Assessment',
    description: 'Environmental impact evaluation and mitigation',
    category: 'Environment',
  },
  {
    id: 'traffic_study',
    name: 'Traffic Impact Study',
    description: 'Analysis of traffic patterns and infrastructure needs',
    category: 'Infrastructure',
  },
  {
    id: 'heritage_review',
    name: 'Heritage Review',
    description: 'Assessment of heritage properties and conservation',
    category: 'Heritage',
  },
  {
    id: 'public_consultation',
    name: 'Public Consultation',
    description: 'Community engagement and public feedback process',
    category: 'Community',
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
  {
    id: 'servicing_agreement',
    name: 'Servicing Agreement',
    description: 'Municipal services and infrastructure agreements',
    category: 'Infrastructure',
  },
];

const RequiredWorkflowsStep = ({ formData, onChange, errors }) => {
  const [selectedWorkflows, setSelectedWorkflows] = useState(
    formData.requiredWorkflows || []
  );

  const handleToggleWorkflow = (workflowId) => {
    let updated;
    if (selectedWorkflows.includes(workflowId)) {
      updated = selectedWorkflows.filter(id => id !== workflowId);
    } else {
      updated = [...selectedWorkflows, workflowId];
    }
    setSelectedWorkflows(updated);
    onChange('requiredWorkflows', updated);
  };

  const handleSelectAll = () => {
    const allIds = availableWorkflows.map(w => w.id);
    setSelectedWorkflows(allIds);
    onChange('requiredWorkflows', allIds);
  };

  const handleClearAll = () => {
    setSelectedWorkflows([]);
    onChange('requiredWorkflows', []);
  };

  // Group workflows by category
  const groupedWorkflows = availableWorkflows.reduce((acc, workflow) => {
    if (!acc[workflow.category]) {
      acc[workflow.category] = [];
    }
    acc[workflow.category].push(workflow);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Required Workflows</h3>
          <p className="text-xs text-gray-500 mt-1">
            Select the workflows required for this legislation ({selectedWorkflows.length} selected)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {Object.entries(groupedWorkflows).map(([category, workflows]) => (
          <div key={category}>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              {category}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {workflows.map((workflow) => {
                const isSelected = selectedWorkflows.includes(workflow.id);
                return (
                  <button
                    key={workflow.id}
                    type="button"
                    onClick={() => handleToggleWorkflow(workflow.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}
                      >
                        {workflow.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {workflow.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequiredWorkflowsStep;
