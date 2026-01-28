// File: src/components/legislation/MapDrawingToolbar.jsx

import React, { useState, useCallback } from 'react';
import {
  ZoomInIcon,
  ZoomOutIcon,
  PanIcon,
  RotateIcon,
  DrawIcon,
  SaveIcon,
  SelectIcon,
  PolygonIcon,
  MeasureIcon,
} from './icons/MapToolIcons';
import { MinusMagnifierIcon, PlusMagnifierIcon, RefreshIcon } from '../../utils/icons';

const tools = [
  { id: 'zoomIn', icon: PlusMagnifierIcon, label: 'Zoom In', shortcut: '+' },
  { id: 'zoomOut', icon: MinusMagnifierIcon, label: 'Zoom Out', shortcut: '-' },
  { id: 'refresh', icon: RefreshIcon, label: 'Refresh', shortcut: 'R' },
 
];

const MapDrawingToolbar = ({ 
  activeTool = 'pan', 
  onToolChange,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(null);

  const handleToolClick = useCallback((toolId) => {
    onToolChange?.(toolId);
  }, [onToolChange]);

  return (
    <div className={`w-full flex flex-row items-center p-0 gap-2 justify-start rounded-lg shadow-md pt-1 ${className}`}>
      {tools.map((tool, index) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        
        return (
          <React.Fragment key={tool.id}>
            <div className="relative">
              <button
                type="button"
                onClick={() => handleToolClick(tool.id)}
                onMouseEnter={() => setShowTooltip(tool.id)}
                onMouseLeave={() => setShowTooltip(null)}
                className={`p-1 rounded-md bg-white cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={`${tool.label} (${tool.shortcut})`}
              >
                <Icon className="w-7 m-0 h-8 aspect-square" />
              </button>
              
              {/* Tooltip */}
              {showTooltip === tool.id && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                  {tool.label}
                  <span className="ml-1 text-gray-400">({tool.shortcut})</span>
                </div>
              )}
            </div>
          
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MapDrawingToolbar;
