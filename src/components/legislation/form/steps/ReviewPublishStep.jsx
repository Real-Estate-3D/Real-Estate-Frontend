// File: src/components/legislation/form/steps/ReviewPublishStep.jsx

import React from 'react';
import { Check, AlertCircle, FileText, Calendar, MapPin, Tag, Settings, GitBranch } from 'lucide-react';

const legislationTypeLabels = {
  zoning_bylaw: 'Zoning By-law',
  official_plan: 'Official Plan',
  site_specific_zoning: 'Site-Specific Zoning',
  subdivision_control: 'Subdivision Control',
};

const jurisdictionLabels = {
  toronto: 'City of Toronto',
  mississauga: 'City of Mississauga',
  brampton: 'City of Brampton',
  markham: 'City of Markham',
  vaughan: 'City of Vaughan',
  oakville: 'Town of Oakville',
  richmond_hill: 'City of Richmond Hill',
  burlington: 'City of Burlington',
};

const ReviewPublishStep = ({ formData, onChange, errors }) => {
  const sections = [
    {
      title: 'Context & Scope',
      icon: FileText,
      items: [
        { label: 'Title', value: formData.title || 'Not specified' },
        { label: 'Jurisdiction', value: jurisdictionLabels[formData.jurisdiction] || 'Not specified' },
        { label: 'Effective From', value: formData.effectiveFrom || 'Not specified' },
        { label: 'Effective To', value: formData.effectiveTo || 'Not specified' },
        { label: 'Legislation Type', value: legislationTypeLabels[formData.legislationType] || 'Not specified' },
        { label: 'Base Template', value: formData.baseTemplate || 'None' },
      ],
    },
    {
      title: 'GIS Schedules',
      icon: MapPin,
      items: [
        { 
          label: 'Schedules Added', 
          value: formData.gisSchedules?.length 
            ? `${formData.gisSchedules.length} schedule(s)` 
            : 'No schedules added' 
        },
        ...(formData.gisSchedules?.length ? formData.gisSchedules.map(schedule => ({
          label: schedule.name,
          value: schedule.selectedLayers?.length 
            ? `${schedule.selectedLayers.length} layer(s)`
            : 'No layers'
        })) : []),
        { 
          label: 'Map Layers Selected', 
          value: formData.selectedLayers?.length 
            ? `${formData.selectedLayers.length} layer(s)` 
            : 'No map layers selected' 
        },
      ],
    },
    {
      title: 'Subdivision',
      icon: Tag,
      items: [
        { label: 'Enabled', value: formData.subdivisionEnabled ? 'Yes' : 'No' },
        ...(formData.subdivisionEnabled ? [
          { label: 'Type', value: formData.subdivisionType || 'Not specified' },
        ] : []),
      ],
    },
    {
      title: 'Parameters',
      icon: Settings,
      items: [
        { 
          label: 'Custom Parameters', 
          value: formData.parameters?.length 
            ? `${formData.parameters.length} parameter(s)` 
            : 'No parameters defined' 
        },
      ],
    },
    {
      title: 'Required Workflows',
      icon: GitBranch,
      items: [
        { 
          label: 'Workflows Selected', 
          value: formData.requiredWorkflows?.length 
            ? `${formData.requiredWorkflows.length} workflow(s)` 
            : 'No workflows selected' 
        },
      ],
    },
    {
      title: 'Missing Simulation',
      icon: AlertCircle,
      items: [
        { label: 'Enabled', value: formData.simulationEnabled ? 'Yes' : 'No' },
        ...(formData.simulationEnabled ? [
          { label: 'Mode', value: formData.simulationConfig?.mode || 'Not specified' },
          { label: 'Policy', value: formData.simulationConfig?.policy || 'Not specified' },
        ] : []),
      ],
    },
  ];

  // Calculate completion status
  const requiredFields = ['title', 'jurisdiction', 'effectiveFrom', 'legislationType'];
  const completedRequired = requiredFields.filter(field => formData[field]).length;
  const isComplete = completedRequired === requiredFields.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Completion Status */}
      <div
        className={`p-4 rounded-lg border ${
          isComplete
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {isComplete ? (
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          )}
          <div>
            <h3
              className={`text-sm font-medium ${
                isComplete ? 'text-green-800' : 'text-amber-800'
              }`}
            >
              {isComplete ? 'Ready to Publish' : 'Review Required'}
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                isComplete ? 'text-green-600' : 'text-amber-600'
              }`}
            >
              {isComplete
                ? 'All required fields have been completed'
                : `${completedRequired} of ${requiredFields.length} required fields completed`}
            </p>
          </div>
        </div>
      </div>

      {/* Review Sections */}
      <div className="flex flex-col gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-900">
                  {section.title}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-sm text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Note Preview */}
      {formData.note && (
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Note</h4>
          <p className="text-sm text-gray-600">{formData.note}</p>
        </div>
      )}

      {/* Publish Options */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Publish Options</h4>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Publish immediately after creation
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Notify stakeholders via email
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Enable public comments
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ReviewPublishStep;
