// File: src/components/legislation/form/steps/SubdivisionStep.jsx

import React from 'react';
import { Toggle, SelectInput, TextArea } from '../FormField';

const subdivisionTypeOptions = [
  { value: 'residential', label: 'Residential Subdivision' },
  { value: 'commercial', label: 'Commercial Subdivision' },
  { value: 'mixed_use', label: 'Mixed-Use Subdivision' },
  { value: 'industrial', label: 'Industrial Subdivision' },
  { value: 'condominium', label: 'Condominium Subdivision' },
];

const SubdivisionStep = ({ formData, onChange, errors }) => {
  return (
    <div className="flex flex-col gap-5">
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Toggle
          label="Enable Subdivision Requirements"
          name="subdivisionEnabled"
          checked={formData.subdivisionEnabled}
          onChange={onChange}
        />
        <p className="text-xs text-gray-500 mt-2 ml-14">
          Enable this to add subdivision-specific requirements to the legislation
        </p>
      </div>

      {formData.subdivisionEnabled && (
        <>
          <SelectInput
            label="Subdivision Type"
            name="subdivisionType"
            value={formData.subdivisionType}
            onChange={onChange}
            options={subdivisionTypeOptions}
            placeholder="Select Subdivision Type"
            error={errors.subdivisionType}
          />

          <TextArea
            label="Subdivision Details"
            name="subdivisionDetails"
            value={formData.subdivisionDetails}
            onChange={onChange}
            placeholder="Enter subdivision details and requirements..."
            rows={4}
          />

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Subdivision Guidelines
            </h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>All subdivision plans must comply with local zoning bylaws</li>
              <li>Environmental assessments may be required</li>
              <li>Traffic impact studies should be included</li>
              <li>Servicing agreements must be in place</li>
            </ul>
          </div>
        </>
      )}

      {!formData.subdivisionEnabled && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            Subdivision requirements are disabled
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Toggle the switch above to enable subdivision settings
          </p>
        </div>
      )}
    </div>
  );
};

export default SubdivisionStep;
