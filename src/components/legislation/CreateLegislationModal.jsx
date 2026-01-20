// File: src/components/legislation/CreateLegislationModal.jsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Layers, ChevronRight } from 'lucide-react';
import StepIndicator from './form/StepIndicator';
import ContextScopeStep from './form/steps/ContextScopeStep';
import GISSchedulesStep from './form/steps/GISSchedulesStep';
import SubdivisionStep from './form/steps/SubdivisionStep';
import ParametersStep from './form/steps/ParametersStep';
import RequiredWorkflowsStep from './form/steps/RequiredWorkflowsStep';
import MissingSimulationStep from './form/steps/MissingSimulationStep';
import ReviewPublishStep from './form/steps/ReviewPublishStep';
import LegislationLayersPanel from './LegislationLayersPanel';

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
  const mapContainerRef = useRef(null);

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
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep - 1].component;
  const showMapPanel = currentStep === 1 || currentStep === 2; // Show map for Context & GIS steps

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Full-screen Modal */}
      <div className="relative w-[95vw] h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
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
          {/* Left Side - Form Content */}
          <div className={`flex flex-col ${showMapPanel ? 'w-1/2' : 'w-full'} border-r border-gray-200`}>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <CurrentStepComponent
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                enabledLayers={enabledLayers}
              />
            </div>
          </div>

          {/* Right Side - Map and Layers Panel (for GIS-related steps) */}
          {showMapPanel && (
            <div className="w-1/2 flex relative bg-gray-100">
              {/* Map Container */}
              <div 
                ref={mapContainerRef}
                className={`flex-1 relative transition-all duration-300 ${isLayersPanelOpen ? 'mr-72' : ''}`}
              >
                {/* Placeholder for CesiumMap - will be integrated when needed */}
                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layers className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Map Preview</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Select layers from the panel to preview
                    </p>
                  </div>
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].label}
          </div>
          
          <div className="flex items-center gap-3">
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
