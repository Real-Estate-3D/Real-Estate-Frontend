import React, { useRef, useState, useCallback } from 'react';
import CesiumMap from '../components/map/CesiumMap.jsx';
import MapToolbar from '../components/map/MapToolBar.jsx';
import SearchBar from '../components/map/SearchBar.jsx';
import InfoPanel from '../components/map/InfoPanel.jsx';
import { TORONTO_BOUNDS } from '../utils/geoServerUtils.js';

const MappingZoning = () => {
  const mapRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [wmsLayerLoaded, setWmsLayerLoaded] = useState(false);

  // Handle location selection from search
  const handleLocationSelect = (location) => {
    console.log('Selected location:', location);
    
    if (mapRef.current) {
      mapRef.current.flyToLocation(
        location.longitude,
        location.latitude,
        50000
      );
    }
  };

  // Handle Toronto selection - load WMS layers
  const handleTorontoSelect = useCallback(() => {
    if (mapRef.current) {
      console.log('🗺️ Loading Toronto WMS layers...');
      
      // Add WMS layers (zoning + regions)
      mapRef.current.addWMSLayer();
      setWmsLayerLoaded(true);
      
      // Fly to Toronto bounds
      mapRef.current.flyToLocation(
        TORONTO_BOUNDS.center.longitude,
        TORONTO_BOUNDS.center.latitude,
        TORONTO_BOUNDS.center.altitude
      );
    }
  }, []);

  // Handle WMS feature click - receives full WFS data
  const handleWMSFeatureClick = useCallback((feature) => {
    console.log('✅ WFS Feature data received:', feature);
    setSelectedFeature(feature);
  }, []);

  // Handle panel close
  const handlePanelClose = () => {
    setSelectedFeature(null);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      
      {/* Floating Panel – Search & Toolbar */}
      <div className="absolute top-4 left-3 z-50 pointer-events-auto">
        <div className="space-y-3">
          
          {/* Search Bar with Autocomplete */}
          <SearchBar 
            onLocationSelect={handleLocationSelect}
            onTorontoSelect={handleTorontoSelect}
          />

          {/* Horizontal Toolbar */}
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-white/30 p-2 flex gap-1">
            <MapToolbar />
          </div>
        </div>
      </div>

      {/* Legend - Bottom Left */}
      <div className="absolute bottom-4 left-3 z-40 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-white/30 p-4 min-w-48">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Layer Legend</h3>
          <div className="space-y-2">
            {wmsLayerLoaded && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 bg-blue-400/60 border-2 border-blue-600 rounded"></div>
                  <span className="text-xs text-gray-700">Zoning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 bg-purple-400/60 border-2 border-purple-600 rounded"></div>
                  <span className="text-xs text-gray-700">Regions</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Panel - Right Side (Shows WFS Data) */}
      {selectedFeature && (
        <InfoPanel
          feature={selectedFeature}
          onClose={handlePanelClose}
        />
      )}

      <CesiumMap 
        key="cesium-map-instance" 
        ref={mapRef} 
        onWMSFeatureClick={handleWMSFeatureClick}
      />
    </div>
  );
};

export default MappingZoning;