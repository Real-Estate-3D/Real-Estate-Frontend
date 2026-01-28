// File: src/components/map/MapToolBar.jsx

import React, { memo, useCallback } from 'react';
import { Maximize2, ZoomIn, ZoomOut, RotateCw, Ruler } from 'lucide-react';
import { ExpandMapIcon, MinusMagnifierIcon, PlusMagnifierIcon, RefreshIcon, RulerIcon } from '../../utils/icons';

const MapToolbar = memo(({ setShowLayersPanel, onMeasurementClick, onExpandMap, onZoomIn, onZoomOut, onRefresh }) => {
  const handleExpand = useCallback(() => {
    onExpandMap?.();
  }, [onExpandMap]);

  const handleZoomIn = useCallback(() => {
    onZoomIn?.();
  }, [onZoomIn]);

  const handleZoomOut = useCallback(() => {
    onZoomOut?.();
  }, [onZoomOut]);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  const handleMeasurement = useCallback(() => {
    onMeasurementClick?.();
  }, [onMeasurementClick]);

  return (
    <div className="flex items-center gap-2 pointer-events-auto" data-onboard="map-tools">
      {/* Expand Map Button */}
      {/* <button
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 border border-slate-700/60 transition-all duration-200 shadow-sm"
        onClick={handleExpand}
      >
        <Maximize2 className="w-4 h-4" />
        <span className="text-sm font-medium">Expand Map</span>
      </button> */}
      <div className='flex p-1 items-center gap-2 bg-black rounded-lg'>
        <div className='bg-white rounded-lg p-1'>
          <ExpandMapIcon className='text-black'/>
        </div>
      <button>

</button>
        <p className='text-white text-sm font-semibold pr-3'>Expand Map</p>
      </div>


      {/* Zoom In Button */}
      <button
        className="w-10 h-10 flex items-center justify-center bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 border border-gray-200"
        onClick={handleZoomIn}
        title="Zoom In"
        data-tool="zoom-in"
      >
        <PlusMagnifierIcon className="w-5 h-5" />
      </button>

      {/* Zoom Out Button */}
      <button
        className="w-10 h-10 flex items-center justify-center bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 border border-gray-200"
        onClick={handleZoomOut}
        title="Zoom Out"
      >
        <MinusMagnifierIcon className="w-5 h-5" />
      </button>

      {/* Refresh Button */}
      <button
        className="w-10 h-10 flex items-center justify-center bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 border border-gray-200"
        onClick={handleRefresh}
        title="Refresh"
      >
        <RefreshIcon className="w-5 h-5" />
      </button>

      {/* Measurement Button */}
      <button
        className="w-10 h-10 flex items-center justify-center bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 border border-gray-200"
        onClick={handleMeasurement}
        title="Add Measurement"
        data-tool="measurement"
      >
        <RulerIcon className="w-5 h-5" />
      </button>
    </div>
  );
});

MapToolbar.displayName = 'MapToolbar';

export default MapToolbar;