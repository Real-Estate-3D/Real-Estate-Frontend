// File: src/components/legislation/form/steps/GISSchedulesStep.jsx

import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Eye, 
  MapPin, 
  Circle, 
  Info, 
  MousePointer2,
  Palette,
  Check
} from 'lucide-react';
import AddGISScheduleModal from '../../AddGISScheduleModal';

// Available colors for zones/polygons
const zoneColors = [
  { id: 'green', value: '#22c55e', label: 'Green' },
  { id: 'pink', value: '#ec4899', label: 'Pink' },
  { id: 'blue', value: '#3b82f6', label: 'Blue' },
  { id: 'orange', value: '#f97316', label: 'Orange' },
  { id: 'purple', value: '#a855f7', label: 'Purple' },
  { id: 'yellow', value: '#eab308', label: 'Yellow' },
  { id: 'cyan', value: '#06b6d4', label: 'Cyan' },
  { id: 'red', value: '#ef4444', label: 'Red' },
];

// Transform types
const transformTypes = [
  { value: '', label: 'Select Transform' },
  { value: 'merge', label: 'Merge' },
  { value: 'union', label: 'Union' },
  { value: 'intersect', label: 'Intersect' },
  { value: 'difference', label: 'Difference' },
  { value: 'buffer', label: 'Buffer' },
];

// Available input layers for transform operations
const availableInputLayers = [
  { id: 'settlement_areas', name: 'Settlement Areas', color: 'blue' },
  { id: 'natural_heritage', name: 'Natural Heritage Systems', color: 'green' },
  { id: 'hazard_lands', name: 'Hazard Lands', color: 'orange' },
  { id: 'agricultural_areas', name: 'Agricultural Areas', color: 'yellow' },
  { id: 'greenbelt_area', name: 'Greenbelt Area', color: 'green' },
  { id: 'protected_countryside', name: 'Protected Countryside', color: 'cyan' },
];

// Merge options
const mergeOptions = [
  { value: '', label: 'Select Merge Option' },
  { value: 'use_settlement', label: 'Use the value from the Settlement Areas' },
  { value: 'use_heritage', label: 'Use the value from Natural Heritage' },
  { value: 'use_first', label: 'Use the first value' },
  { value: 'use_last', label: 'Use the last value' },
  { value: 'combine_all', label: 'Combine all values' },
];

// Color picker dropdown component
const ColorPicker = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedColor = zoneColors.find(c => c.id === value) || zoneColors[0];

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <div 
          className="w-4 h-4 rounded-full border border-gray-200" 
          style={{ backgroundColor: selectedColor.value }}
        />
        <span className="text-xs text-gray-600">Color</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="grid grid-cols-4 gap-1.5">
              {zoneColors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => {
                    onChange(color.id);
                    setIsOpen(false);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    value === color.id ? 'border-gray-800' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const GISSchedulesStep = ({ 
  formData, 
  onChange, 
  errors, 
  enabledLayers = {},
  onBoundaryHover,
  onBoundarySelect,
}) => {
  const [schedules, setSchedules] = useState(formData.gisSchedules || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedSchedules, setExpandedSchedules] = useState({});
  const [activeTab, setActiveTab] = useState('gis'); // 'gis' or 'municipal'
  const [showMunicipalNote, setShowMunicipalNote] = useState(false);
  
  // Transform state
  const [transformType, setTransformType] = useState('');
  const [selectedInputLayers, setSelectedInputLayers] = useState([]);
  const [outputLayer, setOutputLayer] = useState('');
  const [mergeOption, setMergeOption] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeCompleted, setMergeCompleted] = useState(false);

  // Add a new input layer row
  const handleAddInputLayer = useCallback((layerId) => {
    if (layerId && !selectedInputLayers.includes(layerId)) {
      setSelectedInputLayers(prev => [...prev, layerId]);
    }
  }, [selectedInputLayers]);

  // Remove an input layer row
  const handleRemoveInputLayer = useCallback((layerId) => {
    setSelectedInputLayers(prev => prev.filter(id => id !== layerId));
  }, []);

  // Change a selected input layer
  const handleChangeInputLayer = useCallback((oldLayerId, newLayerId) => {
    if (newLayerId && !selectedInputLayers.includes(newLayerId)) {
      setSelectedInputLayers(prev => prev.map(id => id === oldLayerId ? newLayerId : id));
    }
  }, [selectedInputLayers]);

  // Handle merge operation with progress simulation
  const handleMerge = useCallback(() => {
    if (transformType && selectedInputLayers.length > 0 && outputLayer) {
      setIsMerging(true);
      setMergeProgress(0);
      setMergeCompleted(false);
      
      // Simulate merge progress
      const interval = setInterval(() => {
        setMergeProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsMerging(false);
            setMergeCompleted(true);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
    }
  }, [transformType, selectedInputLayers, outputLayer]);

  // Reset merge state
  const handleResetMerge = useCallback(() => {
    setMergeCompleted(false);
    setMergeProgress(0);
  }, []);

  // Get color value from color id
  const getColorValue = (colorId) => {
    const color = zoneColors.find(c => c.id === colorId);
    return color ? color.value : '#22c55e';
  };

  const handleAddSchedule = useCallback((scheduleData) => {
    // Initialize with default polygons structure
    const newSchedule = {
      ...scheduleData,
      polygons: scheduleData.polygons || [
        { id: `polygon_${Date.now()}`, name: 'Polygon 1', color: 'green', type: 'custom' }
      ]
    };
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    onChange('gisSchedules', updatedSchedules);
    // Auto-expand newly added schedule
    setExpandedSchedules(prev => ({ ...prev, [scheduleData.id]: true }));
    
    // Update selected boundaries in parent
    if (scheduleData.selectedBoundaries && onBoundarySelect) {
      const allBoundaries = updatedSchedules.flatMap(s => s.selectedBoundaries || []);
      onBoundarySelect(allBoundaries);
    }
  }, [schedules, onChange, onBoundarySelect]);

  const handleRemoveSchedule = useCallback((id) => {
    const updatedSchedules = schedules.filter(s => s.id !== id);
    setSchedules(updatedSchedules);
    onChange('gisSchedules', updatedSchedules);
    
    // Update selected boundaries in parent
    if (onBoundarySelect) {
      const allBoundaries = updatedSchedules.flatMap(s => s.selectedBoundaries || []);
      onBoundarySelect(allBoundaries);
    }
  }, [schedules, onChange, onBoundarySelect]);

  const toggleScheduleExpand = useCallback((id) => {
    setExpandedSchedules(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Count active layers from sidebar
  const activeLayerCount = Object.values(enabledLayers).filter(Boolean).length;
  
  // Count total boundaries across all schedules
  const totalBoundaries = schedules.reduce((acc, s) => acc + (s.selectedBoundaries?.length || 0), 0);

  // Handle polygon operations for a schedule
  const handleAddPolygon = useCallback((scheduleId) => {
    const updatedSchedules = schedules.map(s => {
      if (s.id === scheduleId) {
        const polygons = s.polygons || [];
        const newPolygon = {
          id: `polygon_${Date.now()}`,
          name: `Polygon ${polygons.length + 1}`,
          color: zoneColors[polygons.length % zoneColors.length].id,
          type: 'custom'
        };
        return { ...s, polygons: [...polygons, newPolygon] };
      }
      return s;
    });
    setSchedules(updatedSchedules);
    onChange('gisSchedules', updatedSchedules);
  }, [schedules, onChange]);

  const handleSelectExistingPolygon = useCallback((scheduleId) => {
    // This would open a modal to select from existing polygons on the map
    console.log('Select existing polygon for schedule:', scheduleId);
  }, []);

  const handlePolygonColorChange = useCallback((scheduleId, polygonId, color) => {
    const updatedSchedules = schedules.map(s => {
      if (s.id === scheduleId && s.polygons) {
        const updatedPolygons = s.polygons.map(p => 
          p.id === polygonId ? { ...p, color } : p
        );
        return { ...s, polygons: updatedPolygons };
      }
      return s;
    });
    setSchedules(updatedSchedules);
    onChange('gisSchedules', updatedSchedules);
  }, [schedules, onChange]);

  const handleRemovePolygon = useCallback((scheduleId, polygonId) => {
    const updatedSchedules = schedules.map(s => {
      if (s.id === scheduleId && s.polygons) {
        const updatedPolygons = s.polygons.filter(p => p.id !== polygonId);
        return { ...s, polygons: updatedPolygons };
      }
      return s;
    });
    setSchedules(updatedSchedules);
    onChange('gisSchedules', updatedSchedules);
  }, [schedules, onChange]);

  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* Tabs - GIS Schedules / Municipal Level */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('gis')}
          className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'gis'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          GIS Schedules
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setActiveTab('municipal');
              setShowMunicipalNote(true);
            }}
            onMouseEnter={() => activeTab === 'municipal' && setShowMunicipalNote(true)}
            onMouseLeave={() => setShowMunicipalNote(false)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'municipal'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Municipal Level
          </button>
          {/* Municipal Level Note Tooltip */}
          {showMunicipalNote && activeTab === 'municipal' && (
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-900">Note</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Municipal Level Legislation is applicable across the entire municipality.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'gis' ? (
        <>
          {/* Transform Section */}
          <div className="flex flex-col gap-4 pb-4 border-b border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">General</div>
            
            {/* Transform Type Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Transform</label>
              <div className="relative">
                <select
                  value={transformType}
                  onChange={(e) => setTransformType(e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  {transformTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Show additional options when transform type is selected */}
            {transformType && (
              <>
                {/* Input Section */}
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">Input</div>
                
                {/* Input Layers - Individual Dropdown Rows */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Input Layers</label>
                  
                  {/* Selected Input Layer Rows */}
                  {selectedInputLayers.map((layerId, index) => {
                    const layer = availableInputLayers.find(l => l.id === layerId);
                    return (
                      <div key={layerId} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <select
                            value={layerId}
                            onChange={(e) => handleChangeInputLayer(layerId, e.target.value)}
                            className="w-full appearance-none px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                          >
                            <option value={layerId}>{layer?.name || 'Unknown Layer'}</option>
                            {availableInputLayers
                              .filter(l => !selectedInputLayers.includes(l.id) || l.id === layerId)
                              .map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                              ))
                            }
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveInputLayer(layerId)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove layer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Add New Input Layer Dropdown */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddInputLayer(e.target.value);
                          }
                        }}
                        className="w-full appearance-none px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-gray-500"
                      >
                        <option value="">Select Input Layer</option>
                        {availableInputLayers
                          .filter(l => !selectedInputLayers.includes(l.id))
                          .map(layer => (
                            <option key={layer.id} value={layer.id}>{layer.name}</option>
                          ))
                        }
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <button
                      type="button"
                      disabled
                      className="p-2 text-gray-300 rounded-lg cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Output Section */}
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">Output</div>
                
                {/* Output Layer Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Output Layer</label>
                  <div className="relative">
                    <select
                      value={outputLayer}
                      onChange={(e) => setOutputLayer(e.target.value)}
                      className="w-full appearance-none px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="">Select Output Layer</option>
                      {availableInputLayers.map(layer => (
                        <option key={layer.id} value={layer.id}>
                          {layer.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Merge Section (shown when transform type is 'merge') */}
                {transformType === 'merge' && (
                  <>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">Merge</div>
                    
                    {/* Merge Options Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Merge Options</label>
                      <div className="relative">
                        <select
                          value={mergeOption}
                          onChange={(e) => setMergeOption(e.target.value)}
                          className="w-full appearance-none px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                        >
                          {mergeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </>
                )}

                {/* Progress Bar - shown during merging */}
                {isMerging && (
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Merging</span>
                      <span className="text-sm font-medium text-gray-900">{Math.min(Math.round(mergeProgress), 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(mergeProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Merge Completed State */}
                {mergeCompleted && (
                  <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="p-1 bg-green-500 rounded-full">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-green-800">Merging Completed</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => console.log('View merge details')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                )}

                {/* Merge Button - hidden when merging or completed */}
                {!isMerging && !mergeCompleted && (
                  <button
                    type="button"
                    onClick={handleMerge}
                    disabled={!transformType || selectedInputLayers.length === 0 || !outputLayer}
                    className="mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors w-fit"
                  >
                    {transformType === 'merge' ? 'Merge' : 'Transform'}
                  </button>
                )}

                {/* Reset button after completion */}
                {mergeCompleted && (
                  <button
                    type="button"
                    onClick={handleResetMerge}
                    className="mt-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-fit"
                  >
                    Start New Transform
                  </button>
                )}
              </>
            )}
          </div>

          {/* Schedules List with Zone Panels */}
          {schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-500">No GIS schedules added yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Add schedules to define map layers for this legislation
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add your first schedule
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {schedules.map((schedule, index) => {
                const isExpanded = expandedSchedules[schedule.id] !== false; // Default to expanded
                const polygons = schedule.polygons || [];
                
                return (
                  <div
                    key={schedule.id}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                  >
                    {/* Schedule Header */}
                    <div 
                      className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleScheduleExpand(schedule.id)}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-0.5 text-gray-400"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <div className="p-1.5 bg-white border border-gray-200 rounded">
                          <MapPin className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {schedule.name || `Schedule ${index + 1}`}
                          </span>
                          {schedule.type && (
                            <span className="ml-2 text-xs text-gray-500">
                              {schedule.type.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                          title="Preview on map"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(schedule.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Schedule Details (Expanded) - Zone/Polygon List */}
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        {/* Polygons List */}
                        {polygons.map((polygon, pIndex) => (
                          <div
                            key={polygon.id}
                            className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getColorValue(polygon.color) }}
                              />
                              <span className="text-sm text-gray-700">{polygon.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ColorPicker
                                value={polygon.color}
                                onChange={(color) => handlePolygonColorChange(schedule.id, polygon.id, color)}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePolygon(schedule.id, polygon.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                title="Remove polygon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Select Existing Polygon Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectExistingPolygon(schedule.id)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <MousePointer2 className="w-4 h-4 text-gray-400" />
                          <span>Select Existing Polygon</span>
                        </button>

                        {/* Add Polygon Button */}
                        <button
                          type="button"
                          onClick={() => handleAddPolygon(schedule.id)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Polygon</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add GIS Schedule Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 border-dashed"
          >
            <Plus className="w-4 h-4" />
            Add GIS Schedule
          </button>

          {/* Summary of selected boundaries */}
          {totalBoundaries > 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <MapPin className="w-4 h-4 text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  {totalBoundaries} location{totalBoundaries !== 1 ? 's' : ''} selected across schedules
                </p>
                <p className="text-xs text-green-600">
                  Selected locations are displayed on the map preview
                </p>
              </div>
            </div>
          )}

          {/* Active Layers Info */}
          {activeLayerCount > 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Layers className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  {activeLayerCount} layer{activeLayerCount !== 1 ? 's' : ''} selected from map
                </p>
                <p className="text-xs text-green-600">
                  Toggle layers in the right panel to preview on map
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Municipal Level Tab Content */
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Municipal Level Legislation</p>
              <p className="text-xs text-blue-700 mt-1">
                This legislation applies across the entire municipality. 
                No specific zones or boundaries need to be defined.
              </p>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white border border-gray-200 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Entire Municipality</p>
                <p className="text-xs text-gray-500">All zones and areas are included</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-green-700">Municipality-wide coverage enabled</span>
            </div>
          </div>

          {/* Hint */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Layers className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
            <div className="text-xs text-gray-600">
              <p className="font-medium">Tip</p>
              <p className="mt-0.5">
                Use the Layers panel on the right to select which map layers should be visible 
                when viewing this municipal-level legislation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      <AddGISScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSchedule}
        existingSchedules={schedules}
        onBoundaryHover={onBoundaryHover}
        onBoundarySelect={onBoundarySelect}
      />
    </div>
  );
};

export default GISSchedulesStep;
