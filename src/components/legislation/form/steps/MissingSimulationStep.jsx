// File: src/components/legislation/form/steps/MissingSimulationStep.jsx

import React from 'react';
import { Toggle, SelectInput, TextInput } from '../FormField';
import { AlertCircle, Info } from 'lucide-react';

const simulationModeOptions = [
  { value: 'basic', label: 'Basic Simulation' },
  { value: 'advanced', label: 'Advanced Simulation' },
  { value: 'custom', label: 'Custom Configuration' },
];

const policyTypeOptions = [
  { value: 'strict', label: 'Strict - Block on missing data' },
  { value: 'warn', label: 'Warning - Allow with notifications' },
  { value: 'permissive', label: 'Permissive - Skip missing checks' },
];

const MissingSimulationStep = ({ formData, onChange, errors }) => {
  const handleConfigChange = (field, value) => {
    onChange('simulationConfig', {
      ...formData.simulationConfig,
      [field]: value,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-800">
              Missing Data Simulation
            </h4>
            <p className="text-xs text-amber-700 mt-1">
              Configure how the system handles missing or incomplete data during
              legislation processing and validation.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Toggle
          label="Enable Missing Data Simulation"
          name="simulationEnabled"
          checked={formData.simulationEnabled}
          onChange={onChange}
        />
        <p className="text-xs text-gray-500 mt-2 ml-14">
          When enabled, the system will simulate scenarios with missing data
        </p>
      </div>

      {formData.simulationEnabled && (
        <>
          <SelectInput
            label="Simulation Mode"
            name="simulationMode"
            value={formData.simulationConfig?.mode || ''}
            onChange={(name, value) => handleConfigChange('mode', value)}
            options={simulationModeOptions}
            placeholder="Select Simulation Mode"
          />

          <SelectInput
            label="Missing Data Policy"
            name="missingDataPolicy"
            value={formData.simulationConfig?.policy || ''}
            onChange={(name, value) => handleConfigChange('policy', value)}
            options={policyTypeOptions}
            placeholder="Select Policy"
          />

          <TextInput
            label="Default Fallback Value"
            name="fallbackValue"
            value={formData.simulationConfig?.fallbackValue || ''}
            onChange={(name, value) => handleConfigChange('fallbackValue', value)}
            placeholder="Enter default value for missing data"
          />

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">
              Simulation Options
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.simulationConfig?.logMissing || false}
                  onChange={(e) => handleConfigChange('logMissing', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm text-gray-700">Log Missing Data</span>
                  <p className="text-xs text-gray-500">Track all missing fields</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.simulationConfig?.notifyAdmin || false}
                  onChange={(e) => handleConfigChange('notifyAdmin', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm text-gray-700">Notify Admin</span>
                  <p className="text-xs text-gray-500">Send alerts on issues</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.simulationConfig?.autoResolve || false}
                  onChange={(e) => handleConfigChange('autoResolve', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm text-gray-700">Auto-Resolve</span>
                  <p className="text-xs text-gray-500">Attempt automatic fixes</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.simulationConfig?.generateReport || false}
                  onChange={(e) => handleConfigChange('generateReport', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm text-gray-700">Generate Report</span>
                  <p className="text-xs text-gray-500">Create summary reports</p>
                </div>
              </label>
            </div>
          </div>
        </>
      )}

      {!formData.simulationEnabled && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            Missing data simulation is disabled
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Enable the toggle above to configure simulation settings
          </p>
        </div>
      )}
    </div>
  );
};

export default MissingSimulationStep;
