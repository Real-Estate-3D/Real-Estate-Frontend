// File: src/components/map/MeasurementTypeSelector.jsx

import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

// Custom Polygon icon with dots on corners
const PolygonIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Polygon outline */}
    <path d="M 6 6 L 18 6 L 18 18 L 6 18 Z" />
    {/* Corner dots */}
    <circle cx="6" cy="6" r="1.5" fill="currentColor" />
    <circle cx="18" cy="6" r="1.5" fill="currentColor" />
    <circle cx="18" cy="18" r="1.5" fill="currentColor" />
    <circle cx="6" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

const MeasurementTypeSelector = ({ onSelectType, onClose }) => {
  return (
    <div
      className="w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden pointer-events-auto"
      data-onboard="measurement-type-selector"
    >
      {/* Distance Option */}
      <button
        onClick={() => onSelectType('distance')}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-200"
        data-measurement-type="distance"
      >
        <ArrowLeftRight className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-900">Distance</span>
      </button>

      {/* Area Option */}
      <button
        onClick={() => onSelectType('area')}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
        data-measurement-type="area"
      >
        <PolygonIcon className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-900">Area</span>
      </button>
    </div>
  );
};

export default MeasurementTypeSelector;
