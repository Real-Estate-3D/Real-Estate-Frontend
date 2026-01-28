// File: src/components/map/LayersLegend.jsx

import React, { memo, useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import { GradientTitleBar } from '../common';

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
  municipalityType = null,  // 'single_tier' or 'lower_tier'
  onAddLayer
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Determine what legend items to show based on selection state
  const getLegendItems = () => {
    // When nothing is selected - show upper_tier and single_tier
    if (!selectedMunicipality && !selectedRegion) {
      return [
        { color: '#f87171', label: 'Single-Tier Municipality' },  // Red
        { color: '#60a5fa', label: 'Upper-Tier Municipality' },   // Blue
      ];
    }

    // When upper_tier (region) is selected - show lower_tier children
    if (selectedRegion && !selectedMunicipality) {
      return [
        { color: '#f87171', label: 'Lower-Tier Municipality' },  // Red
      ];
    }

    // When single_tier municipality is selected - show wards
    if (selectedMunicipality && municipalityType === 'single_tier') {
      return [
        { color: '#f59e0b', label: 'Wards' },                     // Amber/Orange
        { color: 'silver', label: 'Property Parcels' },          // Purple
      ];
    }

    // When lower_tier municipality is selected - show parcels
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
      {/* Header with Gradient */}
      <GradientTitleBar
        title="Layers Legend"
        icon={Layers}
        variant="blue"
        collapsible
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        actions={
          onAddLayer && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddLayer();
              }}
              className="p-1 hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4 text-white/80" />
            </button>
          )
        }
      />

      {/* Legend Items */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-1">
          {legendItems.map((item, index) => (
            <LegendItem
              key={index}
              color={item.color}
              label={item.label}
            />
          ))}
        </div>
      )}
    </div>
  );
});

LayersLegend.displayName = 'LayersLegend';

export default LayersLegend;
