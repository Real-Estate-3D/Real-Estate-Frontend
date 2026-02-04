// File: src/components/legislation/SimulationPanel.jsx

import React, { useState, useCallback } from 'react';
import { Settings, Info, ChevronDown, Map, FileExclamationPoint, AlertTriangleIcon } from 'lucide-react';
import { GradientTitleBar } from '../common';

// Scenario type options
const scenarioTypes = [
  { value: 'by_right', label: 'By-Right' },
  { value: 'variance', label: 'Variance' },
  { value: 'rezoning', label: 'Rezoning' },
  { value: 'special_permit', label: 'Special Permit' },
];

// Reusable Select component
const SelectField = ({ value, onChange, options, className = '' }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none px-3 py-2.5 pr-10 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
);

const SimulationPanel = ({ 
  formData = {}, 
  onChange,
  className = '' 
}) => {
  const config = formData.simulationConfig || {};
  
  const [scenarioType, setScenarioType] = useState(config.scenarioType || 'by_right');
  const [timeHorizon, setTimeHorizon] = useState(config.timeHorizon || '2035');
  const [heightCap, setHeightCap] = useState(config.heightCap || '80 m');
  const [far, setFar] = useState(config.far || '2.5');
  const [coverage, setCoverage] = useState(config.coverage || '65%');
  const [landUse, setLandUse] = useState(config.landUse || {
    residential: true,
    retail: true,
    office: false,
  });

  // Update parent form data
  const updateConfig = useCallback((field, value) => {
    const newConfig = {
      ...config,
      [field]: value,
    };
    onChange?.('simulationConfig', newConfig);
  }, [config, onChange]);

  const handleScenarioChange = useCallback((value) => {
    setScenarioType(value);
    updateConfig('scenarioType', value);
  }, [updateConfig]);

  const handleTimeHorizonChange = useCallback((e) => {
    setTimeHorizon(e.target.value);
    updateConfig('timeHorizon', e.target.value);
  }, [updateConfig]);

  const handleHeightCapChange = useCallback((e) => {
    setHeightCap(e.target.value);
    updateConfig('heightCap', e.target.value);
  }, [updateConfig]);

  const handleFarChange = useCallback((e) => {
    setFar(e.target.value);
    updateConfig('far', e.target.value);
  }, [updateConfig]);

  const handleCoverageChange = useCallback((e) => {
    setCoverage(e.target.value);
    updateConfig('coverage', e.target.value);
  }, [updateConfig]);

  const handleLandUseChange = useCallback((type, checked) => {
    const newLandUse = { ...landUse, [type]: checked };
    setLandUse(newLandUse);
    updateConfig('landUse', newLandUse);
  }, [landUse, updateConfig]);

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-1 border-b border-gray-200">
        <GradientTitleBar title="Simulation Parameters" className='w-full rounded-lg' collapsible/>
      
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Info Banner */}
        <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-orange-50 border-orange-400 border-[1px] border-solid rounded-lg">
          <AlertTriangleIcon className="w-4 h-4 text-orange-800 flex-shrink-0" />
          <span className="text-xs text-orange-800 font-semibold">Simulation does not affect saved legislation.</span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Scenario Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Scenario Type</label>
            <SelectField
              value={scenarioType}
              onChange={handleScenarioChange}
              options={scenarioTypes}
            />
          </div>

          {/* Time Horizon */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Time Horizon</label>
            <input
              type="text"
              value={timeHorizon}
              onChange={handleTimeHorizonChange}
              className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Height Cap */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Height Cap</label>
            <input
              type="text"
              value={heightCap}
              onChange={handleHeightCapChange}
              className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* FAR */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">FAR</label>
            <input
              type="text"
              value={far}
              onChange={handleFarChange}
              className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Coverage */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Coverage</label>
            <input
              type="text"
              value={coverage}
              onChange={handleCoverageChange}
              className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Land Use */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Land Use</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={landUse.residential}
                  onChange={(e) => handleLandUseChange('residential', e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded focus:ring-blue-900"
                />
                <span className="text-sm text-gray-700">Residential</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={landUse.retail}
                  onChange={(e) => handleLandUseChange('retail', e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded focus:ring-blue-900"
                />
                <span className="text-sm text-gray-700">Retail</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={landUse.office}
                  onChange={(e) => handleLandUseChange('office', e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded focus:ring-blue-900"
                />
                <span className="text-sm text-gray-700">Office</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
