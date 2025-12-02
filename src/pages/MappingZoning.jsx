import React, { useRef, useState } from 'react';
import CesiumMap from '../components/map/CesiumMap.jsx';
import MapToolbar from '../components/map/MapToolBar.jsx';
import SearchBar from '../components/map/SearchBar.jsx';
import InfoPanel from '../components/map/InfoPanel.jsx';

const MappingZoning = () => {
  const cesiumMapRef = useRef(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [layerStates, setLayerStates] = useState({});

  // Handle location selection from search
  const handleLocationSelect = (location) => {
    console.log('Selected location:', location);
    
    // Fly to the selected location
    if (cesiumMapRef.current) {
      cesiumMapRef.current.flyToLocation(
        location.longitude,
        location.latitude,
        2000
      );
    }
  };

  // Handle parcel click
  const handleParcelClick = (parcel) => {
    console.log('Parcel clicked:', parcel);
    setSelectedParcel(parcel);
    setShowLayersPanel(false);
  };

  // Handle layers button click
  const handleLayersClick = () => {
    setShowLayersPanel(true);
    setSelectedParcel(null);
  };

  // Handle panel close
  const handlePanelClose = () => {
    setSelectedParcel(null);
    setShowLayersPanel(false);
  };

  // Handle layer toggle
  const handleLayerToggle = (layerId) => {
    setLayerStates(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
    console.log('Layer toggled:', layerId);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      
      {/* Floating Panel – Search & Toolbar */}
      <div className="absolute top-4 left-3 z-50 pointer-events-auto">
        <div className="space-y-3">
          
          {/* Search Bar with Autocomplete */}
          <SearchBar onLocationSelect={handleLocationSelect} />

          {/* Horizontal Toolbar */}
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-white/30 p-2 flex gap-1">
            <MapToolbar onLayersClick={handleLayersClick} />
          </div>
        </div>
      </div>

      {/* Legend - Bottom Left */}
      <div className="absolute bottom-4 left-3 z-40 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-white/30 p-4 min-w-48">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Layer Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-red-400/60 border-2 border-red-600 rounded"></div>
              <span className="text-xs text-gray-700">Parcels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel - Right Side (Parcel Info or Layers) */}
      {(selectedParcel || showLayersPanel) && (
        <InfoPanel
          parcel={selectedParcel}
          layers={showLayersPanel ? layerStates : null}
          onClose={handlePanelClose}
          onLayerToggle={handleLayerToggle}
        />
      )}

      <CesiumMap ref={cesiumMapRef} onParcelClick={handleParcelClick} />
    </div>
  );
};

export default MappingZoning;