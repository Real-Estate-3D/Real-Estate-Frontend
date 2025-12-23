// File: src/components/map/MapToolBar.jsx

import React, { memo, useCallback, useMemo } from 'react';
import { Maximize2, Plus } from 'lucide-react';

const MapToolbar = memo(({ setShowLayersPanel }) => {
  const handleExpand = useCallback(() => {
    console.log('Expand Map');
  }, []);

  const toolButtons = useMemo(() => [1, 2, 3, 4], []);

  return (
    <div className="flex items-center gap-2 pointer-events-auto">
      {/* Expand Map Button */}
      <button 
        className="flex items-center gap-2 px-3 py-2 bg-[#1e293b] text-white rounded-xl hover:bg-slate-700 transition-all duration-200 shadow-md"
        onClick={handleExpand}
      >
        <Maximize2 className="w-4 h-4" />
        <span className="text-sm font-medium">Expand Map</span>
      </button>

      {/* 4 Square Buttons (Placeholders as per screenshot) */}
      {toolButtons.map((_, idx) => (
        <button
          key={idx}
          className="w-8 h-8 flex items-center justify-center bg-white text-gray-600 rounded-xl shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
          onClick={() => console.log(`Tool ${idx + 1}`)}
        >
          <Plus className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
});

MapToolbar.displayName = 'MapToolbar';

export default MapToolbar;