// File: src/components/legislation/form/steps/ReviewPublishStep.jsx

import React from 'react';
import { Info, Pencil, Trash2, AlertTriangle } from 'lucide-react';

const ReviewPublishStep = ({ formData, onChange, errors }) => {
  // Get workflows from form data - default to sample if empty
  const workflows = formData.requiredWorkflows?.length > 0 
    ? formData.requiredWorkflows 
    : [
        { id: 'submit_application', name: 'Submit Application' },
        { id: 'environmental_impact_review', name: 'Environmental Impact Review' },
        { id: 'review_by_planner', name: 'Review by Planner' },
        { id: 'approve_by_council', name: 'Approve by Council' },
      ];

  // Sample diff data
  const diffData = [
    {
      id: 1,
      schedule: 'Downtown Mixed Use Zone',
      polygon: 'Zone abc',
      change: 'Min Lot Front Setback',
      currentParameter: '1.0 m',
      newParameter: '4.0 m',
    },
    {
      id: 2,
      schedule: 'Downtown Mixed Use Zone',
      polygon: 'Zone abc',
      change: 'Max Building Height',
      currentParameter: '20.0 m',
      newParameter: '32.0 m',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Info Banner */}
      <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <Info className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
        <p className="text-sm text-gray-600">
          Check all details below before creating the Legislation. You can edit any section before submission.
        </p>
      </div>

      {/* Diff View Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Diff View</h3>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Schedule
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Polygon
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Change
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Current Parameter
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    New Parameter
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {diffData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {row.schedule}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {row.polygon}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {row.change}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {row.currentParameter}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {row.newParameter}
                    </td>
                    <td className="px-4 py-3">
                      <button className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Required Workflows Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-gray-900">Required Workflows</h3>
        
        <div className="flex flex-col border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">{workflow.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-gray-900">Compliance</h3>
        
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">Overlap with existing heritage zone</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewPublishStep;
