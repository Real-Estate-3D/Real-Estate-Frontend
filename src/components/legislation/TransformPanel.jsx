// File: src/components/legislation/TransformPanel.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronDown, Trash2, CheckCircle, StopCircle } from 'lucide-react';
import { GradientTitleBar } from '../common';

// Transform types
const transformTypes = [
  { value: '', label: 'Select Transform' },
  { value: 'merge', label: 'Merge' },
  { value: 'union', label: 'Union' },
  { value: 'intersect', label: 'Intersect' },
  { value: 'buffer', label: 'Buffer' },
  { value: 'clip', label: 'Clip' },
  { value: 'dissolve', label: 'Dissolve' },
];

// Available layers for selection
const availableLayers = [
  { value: '', label: 'Select Input Layer' },
  { value: 'settlement_areas', label: 'Settlement Areas' },
  { value: 'natural_heritage', label: 'Natural Heritage Systems' },
  { value: 'hazard_lands', label: 'Hazard Lands' },
  { value: 'agricultural_areas', label: 'Agricultural Areas' },
  { value: 'greenbelt', label: 'Greenbelt' },
  { value: 'official_plan', label: 'Official Plan' },
];

// Merge options (dynamic based on selected layers)
const getMergeOptions = (layers) => {
  const options = [{ value: '', label: 'Select Merge Option' }];
  layers.forEach(layer => {
    if (layer) {
      const layerLabel = availableLayers.find(l => l.value === layer)?.label || layer;
      options.push({ 
        value: `use_${layer}`, 
        label: `Use the value from the ${layerLabel}` 
      });
    }
  });
  return options;
};

const SelectField = ({ value, onChange, options, className = '' }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none px-3 py-2.5 pr-10 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
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

const TransformPanel = ({ 
  formData = {}, 
  onChange,
  className = '' 
}) => {
  const [transform, setTransform] = useState('merge'); // Default to merge to show all sections
  const [inputLayers, setInputLayers] = useState(['settlement_areas', 'natural_heritage', '']); // Sample data
  const [outputLayer, setOutputLayer] = useState('');
  const [mergeOption, setMergeOption] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Handle transform change
  const handleTransformChange = useCallback((value) => {
    setTransform(value);
    setIsCompleted(false);
    setProgress(0);
    if (!value) {
      setInputLayers(['']);
      setOutputLayer('');
      setMergeOption('');
    }
  }, []);

  // Handle input layer change
  const handleInputLayerChange = useCallback((index, value) => {
    setInputLayers(prev => {
      const updated = [...prev];
      updated[index] = value;
      // Add empty row if last one is filled
      if (index === updated.length - 1 && value) {
        updated.push('');
      }
      return updated;
    });
    setIsCompleted(false);
  }, []);

  // Remove input layer
  const handleRemoveInputLayer = useCallback((index) => {
    setInputLayers(prev => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Handle merge
  const handleMerge = useCallback(() => {
    setIsProcessing(true);
    setProgress(0);
    setIsCompleted(false);

    // Fake progress simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setIsCompleted(true);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
  }, []);

  const filledInputLayers = inputLayers.filter(l => l !== '');
  const mergeOptions = getMergeOptions(filledInputLayers);
  const canMerge = transform && filledInputLayers.length >= 2 && outputLayer && mergeOption;

  return (
    <div className={`bg-white ${className}`}>
      <div>
        <GradientTitleBar title='Subdivision' className='m-1 rounded-lg' collapsible/>
        {/* GENERAL Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            General
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-900">Transform</label>
            <SelectField
              value={transform}
              onChange={handleTransformChange}
              options={transformTypes}
            />
          </div>
        </div>

        {/* INPUT Section - Only show when transform is selected */}
        {transform && (
          <div className="p-4 border-b border-gray-100" data-onboard="subdivision-input">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Input
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">Input Layers</label>
              <div className="flex flex-col gap-2">
                {inputLayers.map((layer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <SelectField
                      value={layer}
                      onChange={(value) => handleInputLayerChange(index, value)}
                      options={availableLayers}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInputLayer(index)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OUTPUT Section */}
        {transform && (
          <div className="p-4 border-b border-gray-100" data-onboard="subdivision-output">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Output
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">Output Layer</label>
              <SelectField
                value={outputLayer}
                onChange={setOutputLayer}
                options={availableLayers}
              />
            </div>
          </div>
        )}

        {/* MERGE Section */}
        {transform && (
          <div className="p-4" data-onboard="subdivision-merge">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Merge
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">Merge Options</label>
              <SelectField
                value={mergeOption}
                onChange={setMergeOption}
                options={mergeOptions}
              />
            </div>

            {/* Progress or Completion */}
            {isProcessing && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Merging</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <StopCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-900 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {isCompleted && !isProcessing && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-900" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Merging Completed</p>
                    <button
                      type="button"
                      className="text-sm text-gray-900 underline hover:no-underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Merge Button */}
            {!isProcessing && !isCompleted && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleMerge}
                  disabled={!canMerge}
                  className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Merge
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransformPanel;
