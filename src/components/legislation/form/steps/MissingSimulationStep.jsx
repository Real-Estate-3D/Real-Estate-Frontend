// File: src/components/legislation/form/steps/MissingSimulationStep.jsx

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { GradientTitleBar } from '../../../common';

const scenarioTypes = [
  { value: 'by_right', label: 'By-Right' },
  { value: 'variance', label: 'Variance' },
  { value: 'rezoning', label: 'Rezoning' },
  { value: 'special_permit', label: 'Special Permit' },
];

const MissingSimulationStep = ({ formData, onChange, errors }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  const handleConfigChange = (field, value) => {
    onChange('simulationConfig', {
      ...formData.simulationConfig,
      [field]: value,
    });
  };

  const handleLandUseChange = (type, checked) => {
    const currentLandUse = formData.simulationConfig?.landUse || {};
    handleConfigChange('landUse', {
      ...currentLandUse,
      [type]: checked,
    });
  };

  const config = formData.simulationConfig || {};

  return (
    <div className="flex flex-col h-full -mx-4 sm:-mx-6 -my-4">
      {/* Main Content - Split View */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Left Side - 3D Map Simulation View */}
        <div className="flex-1 relative bg-gray-900 overflow-hidden min-h-[300px] lg:min-h-0">
          {/* Map Toolbar */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button className="p-2 hover:bg-gray-100 border-r border-gray-200" title="Zoom In">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 border-r border-gray-200" title="Zoom Out">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 border-r border-gray-200" title="Rotate">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 border-r border-gray-200" title="Pan">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100" title="Reset View">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
            </div>
          </div>

          {/* 3D Building Simulation Placeholder */}
          <div className="absolute inset-0 bg-linear-to-b from-gray-800 to-gray-900">
            {/* Ground Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="simGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#4B5563" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#simGrid)" />
            </svg>

            {/* 3D Buildings Representation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative" style={{ perspective: '1000px' }}>
                {/* Building cluster */}
                <div className="flex items-end gap-4" style={{ transform: 'rotateX(20deg) rotateY(-15deg)' }}>
                  {/* Building 1 - Exceeds limit (red) */}
                  <div className="relative">
                    <div 
                      className="w-20 bg-red-500/80 border border-red-400 shadow-lg"
                      style={{ height: '140px' }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-600 rounded px-2 py-1 whitespace-nowrap">
                      <p className="text-xs text-white font-medium">Height Limits</p>
                      <div className="w-2 h-2 bg-gray-900 border-b border-r border-gray-600 absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45" />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-red-400 whitespace-nowrap">
                      Exceeds max building height by 8.5m
                    </div>
                  </div>
                  {/* Building 2 - Within limit (gray) */}
                  <div 
                    className="w-16 bg-gray-400/60 border border-gray-500 shadow-lg"
                    style={{ height: '80px' }}
                  />
                  {/* Building 3 - Within limit (gray) */}
                  <div 
                    className="w-24 bg-gray-400/60 border border-gray-500 shadow-lg"
                    style={{ height: '100px' }}
                  />
                  {/* Building 4 - Exceeds limit (red) */}
                  <div 
                    className="w-14 bg-red-500/80 border border-red-400 shadow-lg"
                    style={{ height: '120px' }}
                  />
                </div>
              </div>
            </div>

            {/* Info tooltip */}
            <div className="absolute top-1/4 left-1/4 bg-white rounded-lg shadow-lg p-2 border border-gray-200 max-w-[180px]">
              <div className="flex items-start gap-2">
                <div className="w-1 h-full bg-red-500 rounded-full shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-900">Height Limits</p>
                  <p className="text-xs text-gray-500 mt-0.5">Exceeds max building height by 8.5m</p>
                </div>
                <button className="shrink-0 text-gray-400 hover:text-gray-600">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Layer Legend */}
          {showLegend && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-700">Layer Legend</p>
                <button 
                  onClick={() => setShowLegend(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                    className="w-3.5 h-3.5 accent-black border-gray-300 rounded focus:ring-gray-900"
                  />
                  <div className="w-3 h-3 bg-red-500 rounded-sm" />
                  <span className="text-xs text-gray-600">Height Limits</span>
                </label>
              </div>
            </div>
          )}

          {!showLegend && (
            <button
              onClick={() => setShowLegend(true)}
              className="absolute bottom-4 left-4 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50"
              title="Show Legend"
            >
              <Layers className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Right Side - Simulation Parameters Panel */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col max-h-[50vh] lg:max-h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <GradientTitleBar title="Simulation Parameters" collapsible/>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Note */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-500">
                Simulation does not affect saved legislation.
              </p>
            </div>
          </div>

          {/* Parameters Form */}
          {isExpanded && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {/* Scenario Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Scenario Type
                  </label>
                  <select
                    value={config.scenarioType || 'by_right'}
                    onChange={(e) => handleConfigChange('scenarioType', e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    {scenarioTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Time Horizon */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Time Horizon
                  </label>
                  <input
                    type="text"
                    value={config.timeHorizon || '2035'}
                    onChange={(e) => handleConfigChange('timeHorizon', e.target.value)}
                    placeholder="2035"
                    className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                {/* Height Cap */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Height Cap
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={config.heightCap || '80'}
                      onChange={(e) => handleConfigChange('heightCap', e.target.value)}
                      placeholder="80"
                      className="w-full px-3 py-2 pr-8 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">m</span>
                  </div>
                </div>

                {/* FAR (Floor Area Ratio) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    FAR
                  </label>
                  <input
                    type="text"
                    value={config.far || '2.5'}
                    onChange={(e) => handleConfigChange('far', e.target.value)}
                    placeholder="2.5"
                    className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                {/* Coverage */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Coverage
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={config.coverage || '65'}
                      onChange={(e) => handleConfigChange('coverage', e.target.value)}
                      placeholder="65"
                      className="w-full px-3 py-2 pr-8 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                  </div>
                </div>

                {/* Land Use */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Land Use
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.landUse?.residential || false}
                        onChange={(e) => handleLandUseChange('residential', e.target.checked)}
                        className="w-4 h-4 accent-black border-gray-300 rounded focus:ring-gray-900"
                      />
                      <span className="text-sm text-gray-700">Residential</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.landUse?.retail || false}
                        onChange={(e) => handleLandUseChange('retail', e.target.checked)}
                        className="w-4 h-4 accent-black border-gray-300 rounded focus:ring-gray-900"
                      />
                      <span className="text-sm text-gray-700">Retail</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.landUse?.office || false}
                        onChange={(e) => handleLandUseChange('office', e.target.checked)}
                        className="w-4 h-4 accent-black border-gray-300 rounded focus:ring-gray-900"
                      />
                      <span className="text-sm text-gray-700">Office</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissingSimulationStep;
