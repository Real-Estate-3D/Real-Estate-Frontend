// File: src/components/legislation/AddGISScheduleModal.jsx

import React, { useState, useMemo, useCallback } from 'react';
import { 
  X, 
  Search, 
  Check, 
  ChevronDown,
  Layers,
  MapPin,
  Navigation,
  Circle,
  AlertCircle
} from 'lucide-react';

// Available schedule types
const scheduleTypes = [
  { value: 'map_schedule', label: 'Map Schedule' },
  { value: 'zoning_schedule', label: 'Zoning Schedule' },
  { value: 'land_use', label: 'Land Use Schedule' },
  { value: 'height_density', label: 'Height & Density Schedule' },
  { value: 'parking', label: 'Parking Schedule' },
  { value: 'environmental', label: 'Environmental Schedule' },
  { value: 'heritage', label: 'Heritage Schedule' },
  { value: 'urban_design', label: 'Urban Design Schedule' },
];

// Available GIS Schedules to link (will come from API)
const availableGISSchedules = [
  { id: 'schedule_a', name: 'Schedule A - Land Use Designations', type: 'land_use' },
  { id: 'schedule_b', name: 'Schedule B - Urban Structure', type: 'urban_structure' },
  { id: 'schedule_c', name: 'Schedule C - Road Network', type: 'transportation' },
  { id: 'schedule_d', name: 'Schedule D - Natural Heritage', type: 'environmental' },
  { id: 'zoning_map_1', name: 'Zoning Map 1 - Residential Areas', type: 'zoning' },
  { id: 'zoning_map_2', name: 'Zoning Map 2 - Commercial Areas', type: 'zoning' },
];

// Available boundary/location options (will come from API based on jurisdiction)
const availableBoundaries = [
  { 
    id: 'boundary_1', 
    name: 'Zoning Boundary',
    description: 'Main zoning district boundary',
    coordinates: { lat: 43.7001, lng: -79.4163 },
    color: 'green'
  },
  { 
    id: 'boundary_2', 
    name: 'Heritage Area',
    description: 'Between Jarvis Street and Kennedy Park',
    coordinates: { lat: 43.6532, lng: -79.3832 },
    color: 'green'
  },
  { 
    id: 'boundary_3', 
    name: 'Commercial District',
    description: 'Downtown commercial zone',
    coordinates: { lat: 43.6515, lng: -79.3794 },
    color: 'pink'
  },
  { 
    id: 'boundary_4', 
    name: 'Residential Zone R1',
    description: 'Boundary extends between Bay St and Queen St',
    coordinates: { lat: 43.6547, lng: -79.3856 },
    color: 'green'
  },
  { 
    id: 'boundary_5', 
    name: 'Industrial Area',
    description: 'Eastern industrial corridor',
    coordinates: { lat: 43.6689, lng: -79.3155 },
    color: 'pink'
  },
];

// Available map layers to select (will come from API)
const availableMapLayers = [
  { 
    id: 'official_plan_map', 
    name: 'Official Plan Land Use', 
    type: 'WMS',
    description: 'Official plan land use designations',
    category: 'planning'
  },
  { 
    id: 'zoning_bylaw_map', 
    name: 'Zoning By-law Map', 
    type: 'WMS',
    description: 'Current zoning by-law classifications',
    category: 'zoning'
  },
  { 
    id: 'height_map', 
    name: 'Building Height Limits', 
    type: 'WMS',
    description: 'Maximum building height restrictions',
    category: 'planning'
  },
  { 
    id: 'density_map', 
    name: 'Density Provisions', 
    type: 'WMS',
    description: 'Floor space index and density limits',
    category: 'planning'
  },
  { 
    id: 'parking_overlay', 
    name: 'Parking Overlay', 
    type: 'WMS',
    description: 'Parking requirements overlay',
    category: 'zoning'
  },
  { 
    id: 'heritage_properties', 
    name: 'Heritage Properties', 
    type: 'WMS',
    description: 'Designated heritage properties',
    category: 'heritage'
  },
  { 
    id: 'natural_heritage_system', 
    name: 'Natural Heritage System', 
    type: 'WMS',
    description: 'Natural heritage features and areas',
    category: 'environment'
  },
  { 
    id: 'flood_hazard', 
    name: 'Flood Hazard Areas', 
    type: 'WMS',
    description: 'Floodplain and hazard lands',
    category: 'environment'
  },
  { 
    id: 'secondary_plan_areas', 
    name: 'Secondary Plan Areas', 
    type: 'WMS',
    description: 'Secondary plan boundaries and designations',
    category: 'planning'
  },
  { 
    id: 'holding_provisions', 
    name: 'Holding Provisions', 
    type: 'WMS',
    description: 'Properties with holding (H) symbols',
    category: 'zoning'
  },
];

const AddGISScheduleModal = ({ 
  isOpen, 
  onClose, 
  onAdd,
  existingSchedules = [],
  onBoundaryHover,
  onBoundarySelect,
}) => {
  const [scheduleData, setScheduleData] = useState({
    name: '',
    type: '',
    description: '',
    linkedSchedule: '',
    selectedLayers: [],
    selectedBoundaries: [],
  });
  const [layerSearchTerm, setLayerSearchTerm] = useState('');
  const [boundarySearchTerm, setBoundarySearchTerm] = useState('');
  const [step, setStep] = useState(1); // 1: Basic info, 2: Select boundaries, 3: Select layers
  const [hoveredBoundary, setHoveredBoundary] = useState(null);

  // Filter out already added layers and apply search
  const availableLayers = useMemo(() => {
    const existingLayerIds = existingSchedules.flatMap(s => 
      s.selectedLayers?.map(l => l.id) || []
    );
    
    return availableMapLayers.filter(layer => {
      const notAlreadyAdded = !existingLayerIds.includes(layer.id);
      const matchesSearch = !layerSearchTerm || 
        layer.name.toLowerCase().includes(layerSearchTerm.toLowerCase()) ||
        layer.description.toLowerCase().includes(layerSearchTerm.toLowerCase());
      return notAlreadyAdded && matchesSearch;
    });
  }, [existingSchedules, layerSearchTerm]);

  // Filter boundaries based on search
  const filteredBoundaries = useMemo(() => {
    return availableBoundaries.filter(boundary => {
      const matchesSearch = !boundarySearchTerm || 
        boundary.name.toLowerCase().includes(boundarySearchTerm.toLowerCase()) ||
        boundary.description.toLowerCase().includes(boundarySearchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [boundarySearchTerm]);

  const handleFieldChange = useCallback((field, value) => {
    setScheduleData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLayerToggle = useCallback((layer) => {
    setScheduleData(prev => {
      const isSelected = prev.selectedLayers.some(l => l.id === layer.id);
      const selectedLayers = isSelected
        ? prev.selectedLayers.filter(l => l.id !== layer.id)
        : [...prev.selectedLayers, layer];
      return { ...prev, selectedLayers };
    });
  }, []);

  const handleBoundaryToggle = useCallback((boundary) => {
    setScheduleData(prev => {
      const isSelected = prev.selectedBoundaries.some(b => b.id === boundary.id);
      const selectedBoundaries = isSelected
        ? prev.selectedBoundaries.filter(b => b.id !== boundary.id)
        : [...prev.selectedBoundaries, boundary];
      
      // Notify parent about boundary selection for map display
      if (onBoundarySelect) {
        onBoundarySelect(selectedBoundaries);
      }
      
      return { ...prev, selectedBoundaries };
    });
  }, [onBoundarySelect]);

  const handleBoundaryHover = useCallback((boundary, isHovering) => {
    setHoveredBoundary(isHovering ? boundary : null);
    if (onBoundaryHover) {
      onBoundaryHover(isHovering ? boundary : null);
    }
  }, [onBoundaryHover]);

  const handleSelectAllLayers = useCallback(() => {
    setScheduleData(prev => ({
      ...prev,
      selectedLayers: [...availableLayers],
    }));
  }, [availableLayers]);

  const handleClearLayers = useCallback(() => {
    setScheduleData(prev => ({
      ...prev,
      selectedLayers: [],
    }));
  }, []);

  const handleSelectAllBoundaries = useCallback(() => {
    const newBoundaries = [...filteredBoundaries];
    setScheduleData(prev => ({
      ...prev,
      selectedBoundaries: newBoundaries,
    }));
    if (onBoundarySelect) {
      onBoundarySelect(newBoundaries);
    }
  }, [filteredBoundaries, onBoundarySelect]);

  const handleClearBoundaries = useCallback(() => {
    setScheduleData(prev => ({
      ...prev,
      selectedBoundaries: [],
    }));
    if (onBoundarySelect) {
      onBoundarySelect([]);
    }
  }, [onBoundarySelect]);

  const handleAdd = useCallback(() => {
    if (scheduleData.name && (scheduleData.selectedLayers.length > 0 || scheduleData.selectedBoundaries.length > 0)) {
      onAdd({
        id: Date.now(),
        ...scheduleData,
        createdAt: new Date().toISOString(),
      });
      // Reset and close
      setScheduleData({
        name: '',
        type: '',
        description: '',
        linkedSchedule: '',
        selectedLayers: [],
        selectedBoundaries: [],
      });
      setLayerSearchTerm('');
      setBoundarySearchTerm('');
      setStep(1);
      onClose();
    }
  }, [scheduleData, onAdd, onClose]);

  const handleClose = useCallback(() => {
    setScheduleData({
      name: '',
      type: '',
      description: '',
      linkedSchedule: '',
      selectedLayers: [],
      selectedBoundaries: [],
    });
    setLayerSearchTerm('');
    setBoundarySearchTerm('');
    setStep(1);
    if (onBoundarySelect) {
      onBoundarySelect([]);
    }
    onClose();
  }, [onClose, onBoundarySelect]);

  const isStep1Valid = scheduleData.name.trim() !== '';
  const isStep2Valid = scheduleData.selectedBoundaries.length > 0;
  const isStep3Valid = scheduleData.selectedLayers.length > 0 || scheduleData.selectedBoundaries.length > 0;

  const totalSteps = 3;
  const stepLabels = ['Schedule Info', 'Select Location', 'Select Layers'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-xl max-h-[95vh] sm:max-h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Add GIS Schedule</h2>
              <p className="text-xs text-gray-500">
                {stepLabels[step - 1]}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-3 bg-gray-50 border-b border-gray-200 overflow-x-auto">
          {[1, 2, 3].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className={`flex items-center gap-1 sm:gap-2 shrink-0 ${step >= stepNum ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full shrink-0 ${
                  step > stepNum ? 'bg-blue-600 text-white' : step === stepNum ? 'bg-blue-100 text-blue-600' : 'bg-gray-200'
                }`}>
                  {step > stepNum ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </span>
                <span className="text-xs sm:text-sm font-medium hidden xs:inline sm:inline">{stepLabels[stepNum - 1]}</span>
              </div>
              {stepNum < 3 && <div className="flex-1 h-px bg-gray-300 mx-2" />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {step === 1 ? (
            /* Step 1: Schedule Info */
            <div className="flex flex-col gap-4">
              {/* Select Existing GIS Schedule (optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Link to Existing Schedule
                </label>
                <div className="relative">
                  <select
                    value={scheduleData.linkedSchedule}
                    onChange={(e) => handleFieldChange('linkedSchedule', e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="">Select GIS Schedule (optional)</option>
                    {availableGISSchedules.map(schedule => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500">
                  Optionally link this to an existing GIS schedule for reference
                </p>
              </div>

              {/* Schedule Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Schedule Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={scheduleData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="e.g., Schedule A - Land Use"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Schedule Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Schedule Type
                </label>
                <div className="relative">
                  <select
                    value={scheduleData.type}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="">Select schedule type</option>
                    {scheduleTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={scheduleData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Enter a description for this schedule..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          ) : step === 2 ? (
            /* Step 2: Select Location/Boundaries */
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Navigation className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Select the location</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Choose one or more boundaries/locations to include in this schedule. 
                    Selected areas will be highlighted on the map.
                  </p>
                </div>
              </div>

              {/* Search and actions */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={boundarySearchTerm}
                    onChange={(e) => setBoundarySearchTerm(e.target.value)}
                    placeholder="Search boundaries..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllBoundaries}
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  Select All
                </button>
                {scheduleData.selectedBoundaries.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearBoundaries}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Selected count */}
              {scheduleData.selectedBoundaries.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    {scheduleData.selectedBoundaries.length} location{scheduleData.selectedBoundaries.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              )}

              {/* Boundaries list */}
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {filteredBoundaries.map((boundary) => {
                  const isSelected = scheduleData.selectedBoundaries.some(b => b.id === boundary.id);
                  const isHovered = hoveredBoundary?.id === boundary.id;
                  
                  return (
                    <label
                      key={boundary.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : isHovered
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onMouseEnter={() => handleBoundaryHover(boundary, true)}
                      onMouseLeave={() => handleBoundaryHover(boundary, false)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleBoundaryToggle(boundary)}
                        className="mt-0.5 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Circle 
                            className={`w-3 h-3 ${
                              boundary.color === 'green' ? 'text-green-500 fill-green-500' : 'text-pink-500 fill-pink-500'
                            }`} 
                          />
                          <span className={`text-sm font-medium ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                            {boundary.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {boundary.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-green-600 shrink-0" />
                      )}
                    </label>
                  );
                })}

                {filteredBoundaries.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MapPin className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No boundaries found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try a different search term
                    </p>
                  </div>
                )}
              </div>

              {/* Skip option */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500">
                  You can skip this step if locations will be added later
                </p>
              </div>
            </div>
          ) : (
            /* Step 3: Select Layers */
            <div className="flex flex-col gap-4">
              {/* Search and actions */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={layerSearchTerm}
                    onChange={(e) => setLayerSearchTerm(e.target.value)}
                    placeholder="Search layers..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllLayers}
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Select All
                </button>
                {scheduleData.selectedLayers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearLayers}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Selected count */}
              {scheduleData.selectedLayers.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {scheduleData.selectedLayers.length} layer{scheduleData.selectedLayers.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              )}

              {/* Layers list */}
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {availableLayers.map((layer) => {
                  const isSelected = scheduleData.selectedLayers.some(l => l.id === layer.id);
                  
                  return (
                    <label
                      key={layer.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleLayerToggle(layer)}
                        className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {layer.name}
                          </span>
                          <span className="px-1.5 py-0.5 text-xs text-gray-500 bg-gray-100 rounded">
                            {layer.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {layer.description}
                        </p>
                      </div>
                    </label>
                  );
                })}

                {availableLayers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MapPin className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No layers available</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {layerSearchTerm ? 'Try a different search term' : 'All layers have been assigned'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Step {step} of {totalSteps}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            ) : step === 2 ? (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {scheduleData.selectedBoundaries.length > 0 ? 'Continue' : 'Skip'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!isStep3Valid}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add Schedule
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGISScheduleModal;
