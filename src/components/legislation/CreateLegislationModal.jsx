// File: src/components/legislation/CreateLegislationModal.jsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Layers, ChevronRight, Search, GitBranch } from 'lucide-react';
import CesiumMap from '../map/CesiumMap';
import StepIndicator from './form/StepIndicator';
import ContextScopeStep from './form/steps/ContextScopeStep';
import GISSchedulesStep from './form/steps/GISSchedulesStep';
import SubdivisionStep from './form/steps/SubdivisionStep';
import ParametersStep from './form/steps/ParametersStep';
import RequiredWorkflowsStep from './form/steps/RequiredWorkflowsStep';
import MissingSimulationStep from './form/steps/MissingSimulationStep';
import ReviewPublishStep from './form/steps/ReviewPublishStep';
import LegislationLayersPanel from './LegislationLayersPanel';
import MapDrawingToolbar from './MapDrawingToolbar';
import TransformPanel from './TransformPanel';
import SimulationPanel from './SimulationPanel';
import LayerLegend from './LayerLegend';
import PolygonDrawingToolbar from './PolygonDrawingToolbar';
import BranchingModal from './BranchingModal';
import { useFeatureOnboardingFlow } from '../../hooks/useOnboardingFlow';

const steps = [
  { id: 1, label: 'Context & Scope', component: ContextScopeStep },
  { id: 2, label: 'GIS Schedules', component: GISSchedulesStep },
  { id: 3, label: 'Subdivision', component: SubdivisionStep },
  { id: 4, label: 'Parameters', component: ParametersStep },
  { id: 5, label: 'Required Workflows', component: RequiredWorkflowsStep },
  { id: 6, label: 'Massing Simulation', component: MissingSimulationStep },
  { id: 7, label: 'Review & Publish', component: ReviewPublishStep },
];

const initialFormData = {
  // Step 1: Context & Scope
  title: '',
  jurisdiction: '',
  effectiveFrom: '',
  effectiveTo: '',
  legislationType: '',
  baseTemplate: '',
  note: '',
  linkedSchedules: [], // Pre-linked GIS schedules from dropdown
  
  // Step 2: GIS Schedules
  gisSchedules: [],
  selectedLayers: [],
  selectedBoundaries: [], // Selected map boundaries
  
  // Step 3: Subdivision
  subdivisionEnabled: false,
  subdivisionType: '',
  subdivisionDetails: '',
  
  // Step 4: Parameters
  parameters: [],
  
  // Step 5: Required Workflows
  requiredWorkflows: [],
  
  // Step 6: Missing Simulation
  simulationEnabled: false,
  simulationConfig: {},
  
  // Step 7: Review - uses all above data
};

const CreateLegislationModal = ({ isOpen, onClose, onSubmit }) => {
  // Onboarding triggers for each form step
  const { trigger: triggerStep1 } = useFeatureOnboardingFlow('create-legislation-step1');
  const { trigger: triggerStep2 } = useFeatureOnboardingFlow('create-legislation-step2');
  const { trigger: triggerStep3 } = useFeatureOnboardingFlow('create-legislation-step3');
  const { trigger: triggerStep4 } = useFeatureOnboardingFlow('create-legislation-step4');
  const { trigger: triggerStep5 } = useFeatureOnboardingFlow('create-legislation-step5');
  const { trigger: triggerStep6 } = useFeatureOnboardingFlow('create-legislation-step6');
  const { trigger: triggerStep7 } = useFeatureOnboardingFlow('create-legislation-step7');
  const { trigger: triggerSuccess } = useFeatureOnboardingFlow('create-legislation-success');

  const [currentStep, setCurrentStep] = useState(1);

  // Trigger appropriate onboarding when step changes
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure step content is rendered
    const timer = setTimeout(() => {
      switch (currentStep) {
        case 1: triggerStep1(); break;
        case 2: triggerStep2(); break;
        case 3: triggerStep3(); break;
        case 4: triggerStep4(); break;
        case 5: triggerStep5(); break;
        case 6: triggerStep6(); break;
        case 7: triggerStep7(); break;
        default: break;
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isOpen, currentStep, triggerStep1, triggerStep2, triggerStep3, triggerStep4, triggerStep5, triggerStep6, triggerStep7]);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true);
  const [enabledLayers, setEnabledLayers] = useState({});
  const [hoveredBoundary, setHoveredBoundary] = useState(null);
  const [selectedBoundaries, setSelectedBoundaries] = useState([]);
  const [activeDrawingTool, setActiveDrawingTool] = useState('pan');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [polygonDrawingMode, setPolygonDrawingMode] = useState(null); // null, 'draw', or 'select'
  const [activeScheduleForDrawing, setActiveScheduleForDrawing] = useState(null);
  const [drawingScheduleName, setDrawingScheduleName] = useState('');
  const [isBranchingModalOpen, setIsBranchingModalOpen] = useState(false);
  const mapRef = useRef(null);

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const handleLayerToggle = useCallback((layerId, enabled, layerData) => {
    setEnabledLayers(prev => ({ ...prev, [layerId]: enabled }));
    
    // Toggle layer on map
    if (mapRef.current?.toggleLayer) {
        mapRef.current.toggleLayer(layerId, enabled);
    }

    // Update selectedLayers in formData
    setFormData(prev => {
      const selectedLayers = enabled 
        ? [...(prev.selectedLayers || []), { id: layerId, ...layerData }]
        : (prev.selectedLayers || []).filter(l => l.id !== layerId);
      return { ...prev, selectedLayers };
    });
  }, []);

  // Handle drawing tool changes
  const handleToolChange = useCallback((toolId) => {
    setActiveDrawingTool(toolId);
    
    const viewer = mapRef.current?.getViewer?.();
    if (!viewer) return;

    // Handle zoom tools
    if (toolId === 'zoomIn') {
      const currentHeight = viewer.camera.positionCartographic.height;
      viewer.camera.zoomIn(currentHeight * 0.3);
      setActiveDrawingTool('pan'); // Reset to pan after zoom
      return;
    }
    
    if (toolId === 'zoomOut') {
      const currentHeight = viewer.camera.positionCartographic.height;
      viewer.camera.zoomOut(currentHeight * 0.3);
      setActiveDrawingTool('pan');
      return;
    }

    if (toolId === 'rotate') {
      // Reset camera orientation
      viewer.camera.setView({
        orientation: {
          heading: 0,
          pitch: -Math.PI / 2,
          roll: 0
        }
      });
      setActiveDrawingTool('pan');
      return;
    }

    if (toolId === 'satellite') {
      // Toggle between satellite and default imagery
      // This is a simplified toggle - in production you'd want to track state
      setActiveDrawingTool('pan');
      return;
    }

    if (toolId === 'layers') {
      setIsLayersPanelOpen(prev => !prev);
      setActiveDrawingTool('pan');
      return;
    }
  }, []);

  const validateStep = useCallback((stepId) => {
    const newErrors = {};
    
    if (stepId === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!formData.jurisdiction) {
        newErrors.jurisdiction = 'Jurisdiction is required';
      }
      if (!formData.effectiveFrom) {
        newErrors.effectiveFrom = 'Effective From date is required';
      }
      if (!formData.legislationType) {
        newErrors.legislationType = 'Legislation Type is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  }, [currentStep, validateStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = useCallback(() => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
      // Trigger success onboarding
      triggerSuccess();
      // Reset form
      setFormData(initialFormData);
      setCurrentStep(1);
      setErrors({});
    }
  }, [currentStep, formData, onSubmit, validateStep, triggerSuccess]);

  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setErrors({});
    setEnabledLayers({});
    setIsLayersPanelOpen(true);
    setSelectedBoundaries([]);
    setHoveredBoundary(null);
    setShowOnboarding(true);
    setPolygonDrawingMode(null);
    setActiveScheduleForDrawing(null);
    setDrawingScheduleName('');
    onClose();
  }, [onClose]);

  // Handlers for boundary selection from AddGISScheduleModal
  const handleBoundaryHover = useCallback((boundary) => {
    setHoveredBoundary(boundary);
  }, []);

  const handleBoundarySelect = useCallback((boundaries) => {
    setSelectedBoundaries(boundaries);
    setFormData(prev => ({ ...prev, selectedBoundaries: boundaries }));
  }, []);

  // Handle polygon drawing requests from GISSchedulesStep
  const handleRequestDrawPolygon = useCallback((scheduleId) => {
    // Find schedule name
    const schedule = formData.gisSchedules?.find(s => s.id === scheduleId);
    const scheduleName = schedule?.name || 'GIS Schedule';

    setPolygonDrawingMode('draw');
    setActiveScheduleForDrawing(scheduleId);
    setDrawingScheduleName(scheduleName);

    // Start Cesium drawing handler
    if (mapRef.current?.startDrawingPolygon) {
      mapRef.current.startDrawingPolygon((polygonGeoJSON) => {
        console.log('Polygon drawn:', polygonGeoJSON);

        // Add the drawn polygon to the schedule
        const updatedSchedules = formData.gisSchedules?.map(s => {
          if (s.id === scheduleId) {
            const polygons = s.polygons || [];
            const newPolygon = {
              id: `polygon_${Date.now()}`,
              name: `Polygon ${polygons.length + 1}`,
              color: 'blue',
              type: 'drawn',
              geometry: polygonGeoJSON
            };
            return { ...s, polygons: [...polygons, newPolygon] };
          }
          return s;
        });

        handleFieldChange('gisSchedules', updatedSchedules);

        // Reset drawing state
        setPolygonDrawingMode(null);
        setActiveScheduleForDrawing(null);
        setDrawingScheduleName('');
      });
    }
  }, [formData.gisSchedules, handleFieldChange]);

  const handleRequestSelectPolygon = useCallback((scheduleId) => {
    // Find schedule name
    const schedule = formData.gisSchedules?.find(s => s.id === scheduleId);
    const scheduleName = schedule?.name || 'GIS Schedule';

    setPolygonDrawingMode('select');
    setActiveScheduleForDrawing(scheduleId);
    setDrawingScheduleName(scheduleName);

    // Enable click-to-select mode on the map
    // User can click on any existing polygon on the map to select it
    console.log('Starting polygon selection for schedule:', scheduleId);

    // TODO: In a full implementation, you would:
    // 1. Make a WFS GetFeature request to fetch available polygons
    // 2. Highlight them on the map
    // 3. Enable click handler to select one
    // For now, we'll use the existing map click functionality
    // and wait for user to manually complete/cancel
  }, [formData.gisSchedules]);

  const handleCompletePolygonDrawing = useCallback(() => {
    console.log('Completing polygon drawing/selection');

    // Complete the drawing in Cesium
    if (mapRef.current?.completePolygonDrawing) {
      mapRef.current.completePolygonDrawing();
    }

    setPolygonDrawingMode(null);
    setActiveScheduleForDrawing(null);
    setDrawingScheduleName('');
  }, []);

  const handleCancelPolygonDrawing = useCallback(() => {
    console.log('Cancelling polygon drawing/selection');

    // Cancel the drawing in Cesium
    if (mapRef.current?.cancelPolygonDrawing) {
      mapRef.current.cancelPolygonDrawing();
    }

    setPolygonDrawingMode(null);
    setActiveScheduleForDrawing(null);
    setDrawingScheduleName('');
  }, []);

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep - 1].component;
  const showMapPanel = currentStep === 2 || currentStep === 3; // Show map for GIS Schedules and Subdivision steps
  const showSimulationMap = currentStep === 6; // Massing Simulation step uses map with simulation panel

  // Combine all boundaries to display on map
  const allBoundariesToShow = [
    ...selectedBoundaries,
    ...(hoveredBoundary && !selectedBoundaries.find(b => b.id === hoveredBoundary.id) ? [hoveredBoundary] : [])
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Full-screen Modal */}
      <div className={`relative w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-slide-in ${
        showMapPanel || showSimulationMap
          ? 'sm:w-[98vw] sm:h-[95vh] lg:w-[95vw] lg:h-[90vh]'
          : 'sm:w-[90vw] sm:h-[90vh] lg:w-[800px] lg:h-[85vh]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Create New Legislation</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBranchingModalOpen(true)}
              data-onboard="branches-btn"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              Branches
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative bg-gray-50">
          {/* Scenario 1: Massing Simulation Step (Map with Simulation Panel, no left panel) */}
          {showSimulationMap ? (
            <div className="absolute inset-0 w-full h-full bg-gray-100 overflow-hidden">
              {/* Map Background */}
              <div className="absolute inset-0 z-0">
                <CesiumMap ref={mapRef} />
              </div>

              {/* Floating UI Container */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Top Left: Search Bar + Toolbar */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
                  {/* Search Bar */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search"
                      className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  {/* Drawing Toolbar */}
                  <MapDrawingToolbar 
                    activeTool={activeDrawingTool}
                    onToolChange={handleToolChange}
                  />
                </div>

                {/* Bottom Left: Layer Legend */}
                <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
                  <LayerLegend />
                </div>

                {/* Right Side: Simulation Panel */}
                <div className="absolute top-4 right-4 bottom-4 w-64 z-20 pointer-events-auto">
                  <SimulationPanel
                    formData={formData}
                    onChange={handleFieldChange}
                  />
                </div>
              </div>
            </div>
          ) : showMapPanel ? (
            /* Scenario 2: GIS Schedules/Subdivision Step (Full Screen Map with Floating Panels) */
            <div className="absolute inset-0 w-full h-full bg-gray-100 overflow-hidden">
              {/* Map Background */}
              <div className="absolute inset-0 z-0">
                <CesiumMap ref={mapRef} />
              </div>

              {/* Floating UI Container */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                
                {/* Left Side: Search + Toolbar + Panel */}
                <div className="absolute top-4 left-4 z-20 w-64 sm:w-72 flex flex-col gap-2 pointer-events-auto">
                  {/* Search Bar */}
                  {/* <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search location..."
                      className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div> */}

                  {/* Drawing Toolbar */}
                  <MapDrawingToolbar 
                    activeTool={activeDrawingTool}
                    onToolChange={handleToolChange}
                  />
                  
                  {/* Left Panel Content - Changes based on step */}
                  <div
                    className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-y-scroll"
                    style={{ maxHeight: '400px' }}
                    data-onboard={currentStep === 2 ? 'gis-schedules-panel' : 'subdivision-panel'}
                  >
                    {currentStep === 2 ? (
                      <CurrentStepComponent
                         formData={formData}
                         onChange={handleFieldChange}
                         errors={errors}
                         enabledLayers={enabledLayers}
                         onBoundaryHover={handleBoundaryHover}
                         onBoundarySelect={handleBoundarySelect}
                         onRequestDrawPolygon={handleRequestDrawPolygon}
                         onRequestSelectPolygon={handleRequestSelectPolygon}
                      />
                    ) : currentStep === 3 ? (
                      <TransformPanel
                        formData={formData}
                        onChange={handleFieldChange}
                      />
                    ) : null}
                  </div>
                </div>

                {/* Top Center: Polygon Drawing Toolbar */}
                {polygonDrawingMode && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                    <PolygonDrawingToolbar
                      mode={polygonDrawingMode}
                      scheduleName={drawingScheduleName}
                      onComplete={handleCompletePolygonDrawing}
                      onCancel={handleCancelPolygonDrawing}
                    />
                  </div>
                )}

                {/* Right Panel: Layers */}
                <div
                  className={`absolute top-4 right-4 bottom-4 w-72 z-20 pointer-events-auto transition-transform duration-300 ${!isLayersPanelOpen ? 'translate-x-[calc(100%+16px)]' : ''}`}
                  data-onboard="legislation-layers-panel"
                >
                   <LegislationLayersPanel
                      isOpen={isLayersPanelOpen}
                      onClose={() => setIsLayersPanelOpen(false)}
                      enabledLayers={enabledLayers}
                      onLayerToggle={handleLayerToggle}
                   />
                </div>

                {/* Toggle Layers Button (when closed) */}
                {!isLayersPanelOpen && (
                  <button
                    onClick={() => setIsLayersPanelOpen(true)}
                    className="absolute top-4 right-4 z-20 pointer-events-auto p-2.5 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <Layers className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Scenario 3: Standard Form Steps (Centered) */
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-center bg-gray-50 relative">

              <div
                className="w-full max-w-3xl"
                data-onboard={`legislation-form-step${currentStep}`}
              >
                <CurrentStepComponent
                  formData={formData}
                  onChange={handleFieldChange}
                  errors={errors}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-gray-200 bg-white">
          <div className="text-xs text-gray-500">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].label}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
              >
                Create Legislation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Branching Modal */}
      <BranchingModal
        isOpen={isBranchingModalOpen}
        onClose={() => setIsBranchingModalOpen(false)}
      />
    </div>
  );
};

export default CreateLegislationModal;