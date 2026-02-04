// File: src/components/legislation/LayerLegend.jsx

import React, { useState, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Legend items with colors
const defaultLegendItems = [
  { id: 'height_limits', name: 'Height Limits', color: '#EF4444', enabled: true },
];

const LayerLegend = ({ 
  items = defaultLegendItems,
  onToggle,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [legendItems, setLegendItems] = useState(items);

  const handleToggle = useCallback((id) => {
    setLegendItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
    onToggle?.(id);
  }, [onToggle]);

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-900">Layer Legend</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Legend Items */}
      {isExpanded && (
        <div className="px-3 pb-3">
          {legendItems.map((item) => (
            <label 
              key={item.id}
              className="flex items-center gap-2 py-1 cursor-pointer"
            >
              <div 
                className="w-4 h-4 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.color, opacity: item.enabled ? 1 : 0.4 }}
              />
              <span className={`text-sm ${item.enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default LayerLegend;
