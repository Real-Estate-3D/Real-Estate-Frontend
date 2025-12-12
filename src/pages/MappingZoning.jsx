import React, { useRef, useState, useCallback, useEffect, lazy, Suspense } from 'react';
import MapToolbar from '../components/map/MapToolBar.jsx';
import SearchBar from '../components/map/SearchBar.jsx';
import InfoPanel from '../components/map/InfoPanel.jsx';
import LayersPanel from '../components/map/LayersPanel.jsx';
import { TORONTO_BOUNDS } from '../utils/geoServerUtils.js';
import { useExportContext } from '../components/layout/Layout.jsx';
import { Loader2 } from 'lucide-react';

// Lazy load CesiumMap to improve initial page load
const CesiumMap = lazy(() => import('../components/map/CesiumMap.jsx'));

const MappingZoning = () => {
  const { exportLayer } = useExportContext();
  const mapRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [wmsLayerLoaded, setWmsLayerLoaded] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showSingleTierBoundary, setShowSingleTierBoundary] = useState(true);
  const [enabledLayers, setEnabledLayers] = useState({
    land_use: false,
    parking_lots: false,
    regions: false,
    zoning: false,
    zoning_policy_road_overlay: false,
  });

  const handleLocationSelect = (location) => {
    console.log('Selected location:', location);
    
    if (mapRef.current) {
      mapRef.current.flyToLocation(
        location.longitude,
        location.latitude,
        15000
      );
    }
  };

  const handleTorontoSelect = useCallback(() => {
    if (mapRef.current) {
      console.log('🗺️ Loading Toronto boundary...');
      if (showSingleTierBoundary) {
        mapRef.current.addWMSLayer();
        setWmsLayerLoaded(true);
      }
      mapRef.current.flyToLocation(
        TORONTO_BOUNDS.center.longitude,
        TORONTO_BOUNDS.center.latitude,
        TORONTO_BOUNDS.center.altitude
      );
    }
  }, [showSingleTierBoundary]);

  const handleWMSFeatureClick = useCallback((feature) => {
    console.log('✅ WFS Feature data received:', feature);
    setSelectedFeature(feature);
  }, []);

  const handlePanelClose = () => {
    setSelectedFeature(null);
  };

  const handleLayerToggle = useCallback((layerId, enabled, layerData) => {
    console.log(`Layer ${layerId} ${enabled ? 'enabled' : 'disabled'}`, layerData);
    setEnabledLayers(prev => ({
      ...prev,
      [layerId]: enabled
    }));

    if (mapRef.current && layerData) {
      if (layerData.type === 'wms' && layerData.layerName) {
        if (enabled) {
          mapRef.current.addSpecificWMSLayer(layerData.layerName, layerData.opacity || 0.7);
        } else {
          mapRef.current.removeSpecificWMSLayer(layerData.layerName);
        }
      }
    }
  }, []);

  const handleMapScopeToggle = useCallback((scopeId, enabled) => {
    console.log(`Map scope ${scopeId} ${enabled ? 'enabled' : 'disabled'}`);
    if (scopeId === 'single_tier_municipality') {
      setShowSingleTierBoundary(enabled);
      if (mapRef.current) {
        if (enabled) {
          mapRef.current.addWMSLayer();
          setWmsLayerLoaded(true);
        } else {
          mapRef.current.removeWMSLayer();
          setWmsLayerLoaded(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleExportEvent = (event) => {
      const { layerName, format, url } = event.detail;
      exportLayer({ layerName, format, url });
    };

    window.addEventListener('exportLayer', handleExportEvent);
    return () => window.removeEventListener('exportLayer', handleExportEvent);
  }, [exportLayer]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      
      <div className="absolute top-4 left-3 z-50 pointer-events-auto">
        <div className="space-y-3">
          <SearchBar 
            onLocationSelect={handleLocationSelect}
            onTorontoSelect={handleTorontoSelect}
          />
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-white/30 p-2 flex gap-1">
            <MapToolbar 
            setShowLayersPanel={setShowLayersPanel}

            />
          </div>
        </div>
      </div>

      

      {showLayersPanel && (
        <LayersPanel 
          onClose={() => setShowLayersPanel(false)} 
          onLayerToggle={handleLayerToggle}
          onMapScopeToggle={handleMapScopeToggle}
          enabledLayers={enabledLayers}
        />
      )}

      {selectedFeature && (
        <InfoPanel
          feature={selectedFeature}
          onClose={handlePanelClose}
          isLayersPanelOpen={showLayersPanel}
        />
      )}

      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-black">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-medium">Loading 3D Map...</p>
            <p className="text-gray-400 text-sm mt-2">Initializing Cesium Engine</p>
          </div>
        </div>
      }>
        <CesiumMap 
          key="cesium-map-instance" 
          ref={mapRef} 
          onWMSFeatureClick={handleWMSFeatureClick}
        />
      </Suspense>

    </div>
  );
};


export default MappingZoning;
