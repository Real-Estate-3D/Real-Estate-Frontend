// File: src/components/legislation/CreateLegislationModal.jsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Layers, ChevronRight, Circle, Search } from 'lucide-react';
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

const steps = [
  { id: 1, label: 'Context & Scope', component: ContextScopeStep },
  { id: 2, label: 'GIS Schedules', component: GISSchedulesStep },
  { id: 3, label: 'Subdivision', component: SubdivisionStep },
  { id: 4, label: 'Parameters', component: ParametersStep },
  { id: 5, label: 'Required Workflows', component: RequiredWorkflowsStep },
  { id: 6, label: 'Missing Simulation', component: MissingSimulationStep },
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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true);
  const [enabledLayers, setEnabledLayers] = useState({});
  const [hoveredBoundary, setHoveredBoundary] = useState(null);
  const [selectedBoundaries, setSelectedBoundaries] = useState([]);
  const [activeDrawingTool, setActiveDrawingTool] = useState('select');
  const [searchQuery, setSearchQuery] = useState('');
  const mapContainerRef = useRef(null);

  // Drawing tool handlers
  const handleToolChange = useCallback((toolId) => {
    setActiveDrawingTool(toolId);
  }, []);

  const handleUndo = useCallback(() => {
    console.log('Undo action');
  }, []);

  const handleRedo = useCallback(() => {
    console.log('Redo action');
  }, []);

  const handleDelete = useCallback(() => {
    console.log('Delete action');
  }, []);

  const handleZoomIn = useCallback(() => {
    console.log('Zoom in');
  }, []);

  const handleZoomOut = useCallback(() => {
    console.log('Zoom out');
  }, []);

  const handleFitBounds = useCallback(() => {
    console.log('Fit bounds');
  }, []);

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
    // Update selectedLayers in formData
    setFormData(prev => {
      const selectedLayers = enabled 
        ? [...(prev.selectedLayers || []), { id: layerId, ...layerData }]
        : (prev.selectedLayers || []).filter(l => l.id !== layerId);
      return { ...prev, selectedLayers };
    });
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
      // Reset form
      setFormData(initialFormData);
      setCurrentStep(1);
      setErrors({});
    }
  }, [currentStep, formData, onSubmit, validateStep]);

  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setErrors({});
    setEnabledLayers({});
    setIsLayersPanelOpen(true);
    setSelectedBoundaries([]);
    setHoveredBoundary(null);
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

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep - 1].component;
  const showMapPanel = currentStep === 1 || currentStep === 2; // Show map for Context & GIS steps
  const isFullWidthStep = currentStep === 6; // Missing Simulation step uses full width with its own layout

  // Combine all boundaries to display on map
  const allBoundariesToShow = [
    ...selectedBoundaries,
    ...(hoveredBoundary && !selectedBoundaries.find(b => b.id === hoveredBoundary.id) ? [hoveredBoundary] : [])
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Full-screen Modal */}
      <div className="relative w-full h-full sm:w-[98vw] sm:h-[95vh] lg:w-[95vw] lg:h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Create New Legislation</h2>
            {formData.title && (
              <span className="text-sm text-gray-500">— {formData.title}</span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Main Content Area - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Full Width Step (Missing Simulation) */}
          {isFullWidthStep ? (
            <div className="flex-1 flex flex-col">
              <CurrentStepComponent
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
              />
            </div>
          ) : (
            <>
              {/* Left Side - Form Content */}
              <div className={`flex flex-col min-w-0 ${showMapPanel ? 'w-full lg:w-1/2' : 'w-full'} border-r border-gray-200`}>
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                  <CurrentStepComponent
                    formData={formData}
                    onChange={handleFieldChange}
                    errors={errors}
                    enabledLayers={enabledLayers}
                    onBoundaryHover={handleBoundaryHover}
                    onBoundarySelect={handleBoundarySelect}
                  />
                </div>
              </div>

              {/* Right Side - Map and Layers Panel (for GIS-related steps) */}
              {showMapPanel && (
                <div className="hidden lg:flex w-full lg:w-1/2 relative bg-gray-100">
                  {/* Map Container */}
                  <div 
                    ref={mapContainerRef}
                    className={`flex-1 relative transition-all duration-300 min-w-0 ${isLayersPanelOpen ? 'mr-0 xl:mr-72' : ''}`}
                  >
                    {/* Search Bar */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Toronto, ON"
                          className="pl-9 pr-4 py-2 w-36 xl:w-48 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Drawing Toolbar */}
                    <div className="absolute top-14 left-3 xl:top-3 xl:left-44 z-10">
                  <MapDrawingToolbar
                    activeTool={activeDrawingTool}
                    onToolChange={handleToolChange}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onDelete={handleDelete}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onFitBounds={handleFitBounds}
                    canUndo={false}
                    canRedo={false}
                    hasSelection={selectedBoundaries.length > 0}
                  />
                </div>

                {/* Placeholder for CesiumMap - will be integrated when needed */}
                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 overflow-hidden">
                  {/* Mock map background with grid */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Boundary markers */}
                  {allBoundariesToShow.length > 0 ? (
                    <div className="absolute inset-0">
                      {allBoundariesToShow.map((boundary, index) => {
                        // Position markers in different locations for visual effect
                        const positions = [
                          { top: '30%', left: '25%' },
                          { top: '45%', left: '60%' },
                          { top: '60%', left: '35%' },
                          { top: '25%', left: '70%' },
                          { top: '70%', left: '55%' },
                        ];
                        const pos = positions[index % positions.length];
                        const isHovered = hoveredBoundary?.id === boundary.id;
                        const isSelected = selectedBoundaries.some(b => b.id === boundary.id);
                        
                        return (
                          <div
                            key={boundary.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                              isHovered ? 'scale-125 z-10' : 'z-0'
                            }`}
                            style={{ top: pos.top, left: pos.left }}
                          >
                            {/* Outer ring animation */}
                            {isSelected && (
                              <div 
                                className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                                  boundary.color === 'green' ? 'bg-green-400' : 'bg-pink-400'
                                }`}
                                style={{ width: '48px', height: '48px', margin: '-8px' }}
                              />
                            )}
                            {/* Main marker */}
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                                boundary.color === 'green' 
                                  ? 'bg-green-500 border-2 border-green-600' 
                                  : 'bg-pink-500 border-2 border-pink-600'
                              }`}
                            >
                              <Circle className="w-4 h-4 text-white fill-white" />
                            </div>
                            {/* Label */}
                            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow ${
                              boundary.color === 'green' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-pink-100 text-pink-800'
                            }`}>
                              {boundary.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center relative z-10">
                      <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Map Preview</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Select layers from the panel to preview
                      </p>
                    </div>
                  )}

                  {/* Legend for markers */}
                  {allBoundariesToShow.length > 0 && (
                    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-20">
                      <p className="text-xs font-medium text-gray-700 mb-2">Legend</p>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-xs text-gray-600">Approved Area</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-pink-500" />
                          <span className="text-xs text-gray-600">Pending Review</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Toggle Layers Panel Button */}
                {!isLayersPanelOpen && (
                  <button
                    onClick={() => setIsLayersPanelOpen(true)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors z-10"
                    title="Open Layers Panel"
                  >
                    <Layers className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>

              {/* Layers Panel */}
              {isLayersPanelOpen && (
                <LegislationLayersPanel
                  isOpen={isLayersPanelOpen}
                  onClose={() => setIsLayersPanelOpen(false)}
                  enabledLayers={enabledLayers}
                  onLayerToggle={handleLayerToggle}
                  jurisdiction={formData.jurisdiction}
                />
              )}
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].label}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Legislation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLegislationModal;
