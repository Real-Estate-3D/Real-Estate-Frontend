// File: src/components/legislation/PolygonDrawingToolbar.jsx

import React from 'react';
import { MousePointer2, X, Check, Info } from 'lucide-react';

const PolygonDrawingToolbar = ({
  mode,
  scheduleName,
  onComplete,
  onCancel,
  infoText
}) => {
  if (!mode) return null;

  const isDrawMode = mode === 'draw';
  const isSelectMode = mode === 'select';

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with mode indicator */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
        <div className="flex items-center gap-2">
          {isDrawMode ? (
            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21L21 21M3 21L3 3M21 21L21 3M3 3L21 3" />
              <path d="M8 8L16 16M16 8L8 16" />
            </svg>
          ) : (
            <MousePointer2 className="w-4 h-4 text-blue-600" />
          )}
          <div>
            <span className="text-xs font-semibold text-blue-900">
              {isDrawMode ? 'Drawing Polygon' : 'Select Existing Polygon'}
            </span>
            {scheduleName && (
              <span className="text-[10px] text-blue-700 ml-2">
                for {scheduleName}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onComplete}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Complete"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info/Instructions */}
      <div className="px-4 py-2 bg-white">
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-700">
            {infoText || (isDrawMode
              ? 'Click on the map to draw polygon vertices. Double-click or press Enter to complete.'
              : 'Click on an existing polygon on the map to select it.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolygonDrawingToolbar;
