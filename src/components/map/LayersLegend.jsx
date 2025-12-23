// File: src/components/map/LayersLegend.jsx

import React, { memo } from 'react';
import { Layers, Plus } from 'lucide-react';

// Legend item with colored dot
const LegendItem = memo(({ color, label }) => (
  <div className="flex items-center gap-2.5 py-1">
    <div 
      className="w-3 h-3 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
    <span className="text-sm text-gray-700">{label}</span>
  </div>
));

LegendItem.displayName = 'LegendItem';

const LayersLegend = memo(({ 
  selectedMunicipality = null,
  selectedRegion = null,
  municipalityType = null,  // 'SingleTier' or 'LowerTier'
  onAddLayer 
}) => {
  // Determine what legend items to show based on selection state
  const getLegendItems = () => {
    // When nothing is selected - show UpperTier and SingleTier
    if (!selectedMunicipality && !selectedRegion) {
      return [
        { color: '#f87171', label: 'Single-Tier Municipality' },  // Red
        { color: '#60a5fa', label: 'Upper-Tier Municipality' },   // Blue
      ];
    }
    
    // When UpperTier (region) is selected - show LowerTier children
    if (selectedRegion && !selectedMunicipality) {
      return [
        { color: '#f87171', label: 'Lower-Tier Municipality' },  // Red
      ];
    }
    
    // When SingleTier municipality is selected - show wards
    if (selectedMunicipality && municipalityType === 'SingleTier') {
      return [
        { color: '#f59e0b', label: 'Wards' },                     // Amber/Orange
        { color: 'silver', label: 'Property Parcels' },          // Purple
      ];
    }
    
    // When LowerTier municipality is selected - show parcels
    if (selectedMunicipality) {
      return [
        { color: 'silver', label: 'Property Parcels' },          // Purple
      
      ];
    }
    
    return [];
  };

  const legendItems = getLegendItems();

  // Don't render if no items
  if (legendItems.length === 0) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md shadow-lg border border-gray-100 rounded-xl overflow-hidden min-w-[220px]">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-sm text-gray-900">Layers Legend</span>
        </div>
        {onAddLayer && (
          <button 
            onClick={onAddLayer}
            className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Legend Items */}
      <div className="px-4 py-3 space-y-1">
        {legendItems.map((item, index) => (
          <LegendItem 
            key={index} 
            color={item.color} 
            label={item.label} 
          />
        ))}
      </div>
    </div>
  );
});

LayersLegend.displayName = 'LayersLegend';

export default LayersLegend;
