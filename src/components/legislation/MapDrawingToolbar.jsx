// File: src/components/legislation/MapDrawingToolbar.jsx

import React, { useState, useCallback } from 'react';
import { 
  MousePointer2, 
  Hand, 
  Square, 
  Pentagon, 
  Circle, 
  Pencil, 
  Ruler, 
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'pan', icon: Hand, label: 'Pan', shortcut: 'H' },
  { id: 'rectangle', icon: Square, label: 'Draw Rectangle', shortcut: 'R' },
  { id: 'polygon', icon: Pentagon, label: 'Draw Polygon', shortcut: 'P' },
  { id: 'circle', icon: Circle, label: 'Draw Circle', shortcut: 'C' },
  { id: 'freehand', icon: Pencil, label: 'Freehand Draw', shortcut: 'F' },
  { id: 'measure', icon: Ruler, label: 'Measure', shortcut: 'M' },
];

const MapDrawingToolbar = ({ 
  activeTool = 'select', 
  onToolChange,
  onUndo,
  onRedo,
  onDelete,
  onZoomIn,
  onZoomOut,
  onFitBounds,
  canUndo = false,
  canRedo = false,
  hasSelection = false,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(null);

  const handleToolClick = useCallback((toolId) => {
    onToolChange?.(toolId);
  }, [onToolChange]);

  return (
    <div className={`flex items-center gap-1 p-1.5 bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {/* Drawing Tools */}
      <div className="flex items-center gap-0.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <div key={tool.id} className="relative">
              <button
                type="button"
                onClick={() => handleToolClick(tool.id)}
                onMouseEnter={() => setShowTooltip(tool.id)}
                onMouseLeave={() => setShowTooltip(null)}
                className={`p-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={`${tool.label} (${tool.shortcut})`}
              >
                <Icon className="w-4 h-4" />
              </button>
              
              {/* Tooltip */}
              {showTooltip === tool.id && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                  {tool.label}
                  <span className="ml-1 text-gray-400">({tool.shortcut})</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Action Tools */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={!hasSelection}
          className="p-2 rounded-md text-gray-600 hover:bg-red-100 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Delete (Del)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Zoom Tools */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onZoomIn}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onFitBounds}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          title="Fit to Bounds"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MapDrawingToolbar;
