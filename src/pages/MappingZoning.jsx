// File: src/pages/MappingZoning.jsx
// ENHANCED VERSION - Matching Screenshot Layout

import React, { useRef, useState, useCallback, useEffect, lazy, Suspense, useMemo, startTransition } from 'react';
import MapToolbar from '../components/map/MapToolBar.jsx';
import SearchBar from '../components/map/SearchBar.jsx';
import InfoPanel from '../components/map/InfoPanel.jsx';
import LayersPanel from '../components/map/LayersPanel.jsx';
import LayersLegend from '../components/map/LayersLegend.jsx';
import MeasurementPanel from '../components/map/MeasurementPanel.jsx';
import MeasurementTypeSelector from '../components/map/MeasurementTypeSelector.jsx';
import { useExportContext } from '../components/layout/Layout.jsx';
import { LAYER_NAMES } from '../utils/geoServerLayerManager.js';
import { Loader2, Home } from 'lucide-react';

// Onboarding hooks
import { useOnboardingFlow, useFeatureOnboardingFlow } from '../hooks/useOnboardingFlow.js';

const CesiumMap = lazy(() => import('../components/map/CesiumMap.jsx'));

const MappingZoning = () => {
  const { exportLayer } = useExportContext();
  const mapRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [currentMunicipality, setCurrentMunicipality] = useState(null);
  const [currentMunicipalityType, setCurrentMunicipalityType] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [viewHierarchy, setViewHierarchy] = useState([]);
  const [enabledLayers, setEnabledLayers] = useState({});
  const [loadingLayers, setLoadingLayers] = useState({});

  // Measurement state
  const [measurements, setMeasurements] = useState([]);
  const [measurementType, setMeasurementType] = useState(null);
  const [showMeasurementTypeSelector, setShowMeasurementTypeSelector] = useState(false);
  const [activeMeasurementId, setActiveMeasurementId] = useState(null);

  // ======================================
  // ONBOARDING HOOKS
  // ======================================

  // Page onboarding - shows on first visit to Mapping & Zoning page
  useOnboardingFlow('pages', 'mapping');

  // Feature onboarding - shows on first parcel click
  const { trigger: triggerParcelInfo } = useFeatureOnboardingFlow('parcel-info');

  // Memoized handlers to prevent re-renders
  const handleLocationSelect = useCallback((location) => {
    console.log('Selected location:', location);
    
    if (mapRef.current) {
      // Check if this is a parcel selection with geometry
      if (location.isParcel && location.geometry) {
        mapRef.current.flyToParcel({
          bbox: location.bbox,
          geometry: location.geometry,
          properties: location.properties
        });
      } else {
        mapRef.current.flyToLocation(
          location.longitude,
          location.latitude,
          location.isParcel ? 800 : 50000
        );
      }
    }
  }, []);

  // Handle parcel selection from search - flies to parcel beautifully
  const handleParcelSelect = useCallback((parcel) => {
    console.log('Parcel selected:', parcel);
    
    if (mapRef.current) {
      mapRef.current.flyToParcel({
        bbox: parcel.bbox,
        geometry: parcel.geometry,
        properties: parcel.properties
      });
    }
  }, []);

  // Handle municipality selection from search - drills down to municipality
  const handleMunicipalitySelect = useCallback((municipality) => {
    console.log('Municipality selected from search:', municipality);
    
    if (mapRef.current) {
      // Use the drillDownToMunicipality method from CesiumMap
      mapRef.current.drillDownToMunicipality({
        name: municipality.name,
        type: municipality.type,
        id: municipality.id,
        geometry: municipality.geometry,
        properties: municipality.properties
      });
      
      // Update local state
      if (municipality.type === 'upper_tier') {
        setCurrentRegion(municipality.name);
        setCurrentMunicipality(null);
        setCurrentMunicipalityType(null);
        // Don't show LayersPanel for upper_tier
        setShowLayersPanel(false);
      } else {
        setCurrentMunicipality(municipality.name);
        setCurrentMunicipalityType(municipality.type);
        // Show LayersPanel for lower_tier and single_tier
        setShowLayersPanel(true);
      }
      
      // Update view hierarchy after a short delay using requestAnimationFrame
      requestAnimationFrame(() => {
        if (mapRef.current) {
          const hierarchy = mapRef.current.getViewHierarchy();
          setViewHierarchy(hierarchy || []);
        }
      });
    }
  }, []);

  const handleWMSFeatureClick = useCallback((feature) => {
    console.log('Feature data received:', feature);

    // Trigger parcel info onboarding on first parcel click
    if (feature && feature.properties) {
      triggerParcelInfo();

      // Dispatch event for onboarding step completion
      window.dispatchEvent(new CustomEvent('parcelClicked'));
    }

    setSelectedFeature(feature);
  }, [triggerParcelInfo]);

  const handleMunicipalityClick = useCallback((municipalityName, config) => {
    console.log('Municipality drilled down:', municipalityName, config);
    
    // Use startTransition for non-urgent state updates
    startTransition(() => {
      if (config.type === 'upper_tier') {
        setCurrentRegion(municipalityName);
        setCurrentMunicipality(null);
        setCurrentMunicipalityType(null);
        setShowLayersPanel(false);
      } else {
        setCurrentMunicipality(municipalityName);
        setCurrentMunicipalityType(config.type);
        setShowLayersPanel(true);
        
        // Auto-enable layers based on municipality type
        if (config.type === 'single_tier') {
          setEnabledLayers(prev => ({
            ...prev,
            [LAYER_NAMES.WARDS]: true,
            [LAYER_NAMES.PARCELS]: true
          }));
        } else if (config.type === 'lower_tier') {
          setEnabledLayers(prev => ({
            ...prev,
            [LAYER_NAMES.ALL_MUNICIPALITIES]: true,
            [LAYER_NAMES.PARCELS]: true
          }));
        }
      }
    });
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      if (mapRef.current) {
        const hierarchy = mapRef.current.getViewHierarchy();
        console.log('Updated hierarchy:', hierarchy);
        setViewHierarchy(hierarchy || []);
      }
    });
  }, []);

  const handleResetToOverview = useCallback(() => {
    console.log('Resetting to overview...');
    if (mapRef.current) {
      mapRef.current.resetToOverview();
      setCurrentMunicipality(null);
      setCurrentMunicipalityType(null);
      setCurrentRegion(null);
      setViewHierarchy([]);
      setSelectedFeature(null);
      setShowLayersPanel(false);
    }
  }, []);

  // Debug: Log hierarchy changes
  useEffect(() => {
    console.log('View Hierarchy Updated:', viewHierarchy);
    console.log('Current Municipality:', currentMunicipality);
    console.log('Current Region:', currentRegion);
  }, [viewHierarchy, currentMunicipality, currentRegion]);

  const handlePanelClose = useCallback(() => {
    setSelectedFeature(null);
    // Clear parcel highlight when closing the panel
    if (mapRef.current?.clearParcelHighlight) {
      mapRef.current.clearParcelHighlight();
    }
  }, []);

  const handleLayerToggle = useCallback((layerId, enabled, layerData) => {
    console.log(`Layer ${layerId} ${enabled ? 'enabled' : 'disabled'}`, layerData);
    
    // Set loading state
    setLoadingLayers(prev => ({ ...prev, [layerId]: true }));
    
    // Update map immediately for responsive UI
    if (mapRef.current && layerData && layerData.layerName) {
      mapRef.current.toggleLayer(layerData.layerName, enabled);
    }
    
    // Batch state update
    setEnabledLayers(prev => ({
      ...prev,
      [layerId]: enabled
    }));
    
    // Clear loading state after a short delay to show feedback
    setTimeout(() => {
      setLoadingLayers(prev => ({ ...prev, [layerId]: false }));
    }, 300);
  }, []);

  useEffect(() => {
    const handleExportEvent = (event) => {
      const { layerName, format, url } = event.detail;
      exportLayer({ layerName, format, url });
    };

    window.addEventListener('exportLayer', handleExportEvent);
    return () => window.removeEventListener('exportLayer', handleExportEvent);
  }, [exportLayer]);

  // Measurement handlers
  const handleMeasurementClick = useCallback(() => {
    // Show measurement type selector
    setShowMeasurementTypeSelector(prev => !prev);
  }, []);

  const handleMeasurementTypeSelect = useCallback((type) => {
    setMeasurementType(type);
    setShowMeasurementTypeSelector(false);

    // Generate a unique ID for this measurement
    const measurementId = `measurement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setActiveMeasurementId(measurementId);

    // Calculate the measurement name based on existing measurements of the same type
    const sameTypeCount = measurements.filter(m => m.type === type).length;
    const measurementName = type === 'area'
      ? `Area ${sameTypeCount + 1}`
      : `Distance ${sameTypeCount + 1}`;

    // Trigger measurement tool on the map with the selected type
    if (mapRef.current?.startMeasurement) {
      mapRef.current.startMeasurement(type, measurementId, measurementName);
    }
    console.log('Measurement tool activated with type:', type, 'id:', measurementId, 'name:', measurementName);
  }, [measurements]);

  const handleAddMeasurement = useCallback(() => {
    // Show measurement type selector
    setShowMeasurementTypeSelector(true);
  }, []);

  const handleToggleMeasurement = useCallback((id, visible) => {
    // Find the measurement to get its entities
    const measurement = measurements.find(m => m.id === id);

    // Toggle visibility of entities on the map
    if (measurement && measurement.entities && mapRef.current?.getViewer) {
      const viewer = mapRef.current.getViewer();
      if (viewer) {
        measurement.entities.forEach(entity => {
          if (entity) {
            entity.show = visible;
          }
        });
        viewer.scene.requestRender();
      }
    }
  }, [measurements]);

  const handleDeleteMeasurement = useCallback((id) => {
    // Find the measurement to get its entities
    const measurement = measurements.find(m => m.id === id);

    // Remove entities from the map
    if (measurement && measurement.entities && mapRef.current?.getViewer) {
      const viewer = mapRef.current.getViewer();
      if (viewer) {
        measurement.entities.forEach(entity => {
          if (entity) {
            viewer.entities.remove(entity);
          }
        });
        viewer.scene.requestRender();
      }
    }

    // Remove from state
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, [measurements]);

  const handleMeasurementComplete = useCallback((measurement) => {
    setMeasurements(prev => [...prev, measurement]);
    // Clear active measurement ID when done
    setActiveMeasurementId(null);
  }, []);

  const handleCancelDrawing = useCallback(() => {
    // Cancel current drawing by calling cancel method on map
    if (mapRef.current?.cancelMeasurement) {
      mapRef.current.cancelMeasurement();
    }
    // Clear active measurement state
    setActiveMeasurementId(null);
    setMeasurementType(null);
  }, []);

  // Listen for measurement complete events
  useEffect(() => {
    const handleMeasurementCompleteEvent = (event) => {
      handleMeasurementComplete(event.detail);
    };

    window.addEventListener('measurementComplete', handleMeasurementCompleteEvent);
    return () => window.removeEventListener('measurementComplete', handleMeasurementCompleteEvent);
  }, [handleMeasurementComplete]);

  // Map control handlers
  const handleExpandMap = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current?.zoomIn) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current?.zoomOut) {
      mapRef.current.zoomOut();
    }
  }, []);

  const handleRefresh = useCallback(() => {
    if (mapRef.current?.resetView) {
      mapRef.current.resetView();
    }
  }, []);

  return (
    <div className="relative w-full h-full p-2 bg-[#f0f2f5] overflow-hidden flex rounded-xl">
      
      {/* Map Container */}
      <div className="flex-1 relative rounded-xl overflow-hidden">
        {/* Floating Controls (Top Left) */}
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-3 pointer-events-none">
          <MapToolbar
            setShowLayersPanel={setShowLayersPanel}
            onMeasurementClick={handleMeasurementClick}
            onExpandMap={handleExpandMap}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRefresh={handleRefresh}
          />

          {/* Measurement Type Selector */}
          {showMeasurementTypeSelector && (
            <MeasurementTypeSelector
              onSelectType={handleMeasurementTypeSelect}
              onClose={() => setShowMeasurementTypeSelector(false)}
            />
          )}

          {/* Search Bar - Onboarding Target */}
          <div data-onboard="global-search" className="pointer-events-auto">
            <SearchBar
              onLocationSelect={handleLocationSelect}
              onParcelSelect={handleParcelSelect}
              onMunicipalitySelect={handleMunicipalitySelect}
            />
          </div>

          {/* Back to Overview Button - Always visible when drilled down */}
          {(viewHierarchy.length > 0 || currentMunicipality || currentRegion) && (
            <div className="pointer-events-auto">
              <button
                onClick={handleResetToOverview}
                className="flex items-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white backdrop-blur-md rounded-xl shadow-lg border border-blue-500/50 transition-all hover:shadow-xl"
              >
                <Home className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-sm font-medium">Back to Overview</div>
                  {viewHierarchy.length > 0 && (
                    <div className="text-xs opacity-90">
                      {viewHierarchy.map(h => h.name).join(' > ')}
                    </div>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Measurement Panel - Left side below other controls */}
          {(measurements.length > 0 || activeMeasurementId) && (
            <MeasurementPanel
              measurements={measurements}
              onDeleteMeasurement={handleDeleteMeasurement}
              onAddMeasurement={handleAddMeasurement}
              onToggleMeasurement={handleToggleMeasurement}
              activeMeasurementId={activeMeasurementId}
              onCancelDrawing={handleCancelDrawing}
            />
          )}
        </div>

        {/* 3D Map */}
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-700 text-base font-medium">Loading 3D Map...</p>
              <p className="text-gray-400 text-sm mt-1">Initializing Cesium Engine</p>
            </div>
          </div>
        }>
          <div data-onboard="map-canvas" className="w-full h-full">
            <CesiumMap
              key="cesium-map-instance"
              ref={mapRef}
              onWMSFeatureClick={handleWMSFeatureClick}
              onMunicipalityClick={handleMunicipalityClick}
            />
          </div>
        </Suspense>

        {/* Bottom Left Legend - Onboarding Target */}
        <div className="absolute bottom-4 left-4 z-30 pointer-events-auto" data-onboard="map-legend">
          <LayersLegend
            selectedMunicipality={currentMunicipality}
            selectedRegion={currentRegion}
            municipalityType={currentMunicipalityType}
          />
        </div>
      </div>

      {/* Right Side Panel Area - Side by side panels */}
      <div className="absolute right-2 top-2 bottom-2 z-40 overflow-hidden pointer-events-none flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* Info Panel - Shows when parcel selected - Onboarding Target */}
        {selectedFeature && (
          <div className="w-[min(20rem,90vw)] max-h-[45vh] sm:max-h-full pointer-events-auto flex flex-col" data-onboard="parcel-info-box">
            <InfoPanel
              feature={selectedFeature}
              onClose={handlePanelClose}
            />
          </div>
        )}
        
        {/* Layers Panel - Always visible when enabled */}
        {showLayersPanel && (
          <div className="w-[min(20rem,90vw)] max-h-[45vh] sm:max-h-full pointer-events-auto flex flex-col">
            <LayersPanel 
              onClose={() => setShowLayersPanel(false)} 
              onLayerToggle={handleLayerToggle}
              enabledLayers={enabledLayers}
              loadingLayers={loadingLayers}
              currentMunicipality={currentMunicipality}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default MappingZoning;