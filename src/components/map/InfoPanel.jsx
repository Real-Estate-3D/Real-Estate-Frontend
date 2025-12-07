import React from 'react';
import { X, Building2, MapPin } from 'lucide-react';

const InfoPanel = ({ feature, onClose }) => {
  if (!feature) return null;

  const properties = feature.properties || {};
  const featureId = feature.id || 'Unknown';

  // Group properties by category (you can customize this logic)
  const groupedProperties = groupPropertiesByCategory(properties);

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Property Details</h2>
            <p className="text-xs text-gray-500">Feature ID: {featureId}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {/* Main Address/Title if available */}
          {(properties.address || properties.name || properties.label) && (
            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {properties.address || properties.name || properties.label}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Sections Based on Properties */}
          {Object.entries(groupedProperties).map(([category, props]) => (
            <Section key={category} title={category}>
              {Object.entries(props).map(([key, value]) => (
                <PropertyRow key={key} label={formatLabel(key)} value={value} />
              ))}
            </Section>
          ))}

          {/* If no grouped properties, show all flat */}
          {Object.keys(groupedProperties).length === 0 && (
            <Section title="Overview">
              {Object.entries(properties).map(([key, value]) => {
                // Skip null/undefined/empty values
                if (value === null || value === undefined || value === '') return null;
                
                // Skip geometry fields
                if (key === 'geom' || key === 'the_geom' || key === 'geometry' || key === 'bbox') return null;

                return (
                  <PropertyRow key={key} label={formatLabel(key)} value={value} />
                );
              })}
            </Section>
          )}

          {/* Export Button */}
          <div className="pt-4 border-t border-gray-200">
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Property Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      {children}
    </div>
  </div>
);

const PropertyRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0">
    <span className="text-sm text-gray-600 font-medium">{label}</span>
    <span className="text-sm text-gray-900 font-semibold text-right ml-4">
      {formatValue(value)}
    </span>
  </div>
);

// Utility Functions
const formatLabel = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();
};

const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A';
  
  if (typeof value === 'number') {
    // Format large numbers with commas
    if (value > 1000) {
      return value.toLocaleString();
    }
    return value;
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  // Truncate very long strings
  const str = String(value);
  if (str.length > 100) {
    return str.substring(0, 100) + '...';
  }
  
  return str;
};

// Group properties by category (customize based on your data structure)
const groupPropertiesByCategory = (properties) => {
  const groups = {};
  
  // Define category keywords
  const categoryKeywords = {
    'Overview': ['id', 'gid', 'name', 'address', 'label', 'type'],
    'Zoning': ['zone', 'zoning', 'land_use', 'landuse', 'use_code'],
    'Dimensions': ['area', 'perimeter', 'length', 'width', 'height', 'floor_area'],
    'Ownership': ['owner', 'occupant', 'tenant'],
    'Assessment': ['value', 'assessed', 'tax', 'price'],
    'Building': ['building', 'structure', 'year_built', 'stories', 'units'],
    'Municipal': ['ward', 'district', 'municipality', 'region'],
  };

  Object.entries(properties).forEach(([key, value]) => {
    // Skip null/undefined/empty
    if (value === null || value === undefined || value === '') return;
    
    // Skip geometry
    if (key === 'geom' || key === 'the_geom' || key === 'geometry' || key === 'bbox') return;

    // Find matching category
    let categoryFound = false;
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => key.toLowerCase().includes(keyword))) {
        if (!groups[category]) groups[category] = {};
        groups[category][key] = value;
        categoryFound = true;
        break;
      }
    }

    // If no category found, add to "Other"
    if (!categoryFound) {
      if (!groups['Other']) groups['Other'] = {};
      groups['Other'][key] = value;
    }
  });

  return groups;
};

export default InfoPanel;