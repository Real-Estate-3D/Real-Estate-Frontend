// File: src/components/legislation/form/steps/GISSchedulesStep.jsx

import React, { useState, useCallback } from 'react';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Layers,
  Eye,
  MapPin,
  Info,
  MousePointer2,
  Edit2,
  X as CloseIcon
} from 'lucide-react';
import AddGISScheduleModal from '../../AddGISScheduleModal';
import { GradientTitleBar } from '../../../common';
import { DeleteIcon } from '../../../../utils/icons';

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
  onRequestDrawPolygon,
  onRequestSelectPolygon,
}) => {
  const [schedules, setSchedules] = useState(formData.gisSchedules || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedSchedules, setExpandedSchedules] = useState({});
  const [activeTab, setActiveTab] = useState('gis'); // 'gis' or 'municipal'
  const [showMunicipalNote, setShowMunicipalNote] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [editingScheduleName, setEditingScheduleName] = useState('');

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

  // Handle schedule name editing
  const handleStartEditingSchedule = useCallback((scheduleId, currentName) => {
    setEditingScheduleId(scheduleId);
    setEditingScheduleName(currentName);
  }, []);

  const handleSaveScheduleName = useCallback((scheduleId) => {
    const updatedSchedules = schedules.map(s =>
      s.id === scheduleId ? { ...s, name: editingScheduleName } : s
    );
    setSchedules(updatedSchedules);
    onChange('gisSchedules', updatedSchedules);
    setEditingScheduleId(null);
    setEditingScheduleName('');
  }, [schedules, editingScheduleName, onChange]);

  const handleCancelEditingSchedule = useCallback(() => {
    setEditingScheduleId(null);
    setEditingScheduleName('');
  }, []);

  // Handle polygon zone name change
  const handlePolygonZoneChange = useCallback((scheduleId, polygonId, zoneName) => {
    const updatedSchedules = schedules.map(s => {
      if (s.id === scheduleId && s.polygons) {
        const updatedPolygons = s.polygons.map(p =>
          p.id === polygonId ? { ...p, zoneName } : p
        );
        return { ...s, polygons: updatedPolygons };
      }
      return s;
    });
    setSchedules(updatedSchedules);
    onChange('gisSchedules', updatedSchedules);
  }, [schedules, onChange]);

  // Handle drawing mode for creating polygons - notify parent to show toolbar
  const handleStartDrawPolygon = useCallback((scheduleId) => {
    if (onRequestDrawPolygon) {
      onRequestDrawPolygon(scheduleId);
    }
  }, [onRequestDrawPolygon]);

  // Handle WFS polygon selection - notify parent to show toolbar
  const handleStartSelectPolygon = useCallback((scheduleId) => {
    if (onRequestSelectPolygon) {
      onRequestSelectPolygon(scheduleId);
    }
  }, [onRequestSelectPolygon]);

  return (
    <div className="flex flex-col h-full min-w-0 bg-white p-1">
      <GradientTitleBar title={'GIS Schedules'} collapsible className='rounded-lg'/>
      {/* Tabs - GIS Schedules / Municipal Level (Fixed Header) */}
      <div className="flex-none p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg w-full">
          <button
            type="button"
            onClick={() => setActiveTab('gis')}
            className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${
              activeTab === 'gis'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            GIS Schedules
          </button>
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('municipal');
                setShowMunicipalNote(true);
              }}
              onMouseEnter={() => activeTab === 'municipal' && setShowMunicipalNote(true)}
              onMouseLeave={() => setShowMunicipalNote(false)}
              className={`w-full px-2 py-1 text-xs font-medium rounded transition-all ${
                activeTab === 'municipal'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Municipal Level
            </button>
            {/* Municipal Level Note Tooltip */}
            {showMunicipalNote && activeTab === 'municipal' && (
              <div className="absolute top-full left-0 mt-2 w-56 p-2.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div className="flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-gray-900 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-medium text-gray-900">Note</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      Municipal Level Legislation is applicable across the entire municipality.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {activeTab === 'gis' ? (
          <>
            {/* Schedules List */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">GIS Schedules</div>
            </div>

            {schedules.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {schedules.map((schedule, index) => {
                  const isExpanded = expandedSchedules[schedule.id] !== false; // Default to expanded
                  const polygons = schedule.polygons || [];
                  
                  return (
                    <div
                      key={schedule.id}
                      className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                      {...(index === 0 ? { 'data-onboard': 'gis-schedule-card' } : {})}
                    >
                      {/* Schedule Header */}
                      <div className="relative">
                        <div
                          className="flex items-center justify-between p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-100"
                          onClick={() => toggleScheduleExpand(schedule.id)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button
                              type="button"
                              className="p-0.5 text-gray-400 shrink-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <div className="p-1 bg-white border border-gray-200 rounded shadow-sm shrink-0">
                              <MapPin className="w-3 h-3 text-gray-700" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                              {editingScheduleId === schedule.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={editingScheduleName}
                                    onChange={(e) => setEditingScheduleName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveScheduleName(schedule.id);
                                      } else if (e.key === 'Escape') {
                                        handleCancelEditingSchedule();
                                      }
                                    }}
                                    className="text-xs font-semibold text-gray-900 bg-white border border-blue-500 rounded px-1.5 py-0.5 flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveScheduleName(schedule.id)}
                                    className="p-0.5 text-green-600 hover:bg-green-50 rounded"
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEditingSchedule}
                                    className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <CloseIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditingSchedule(schedule.id, schedule.name || `Schedule ${index + 1}`)}
                                  className="text-left hover:text-blue-600 transition-colors"
                                >
                                  <span className="text-xs font-semibold text-gray-900 leading-none block truncate">
                                    {schedule.name || `Schedule ${index + 1}`}
                                  </span>
                                </button>
                              )}
                              {schedule.type && (
                                <span className="text-[9px] text-gray-500 mt-0.5 font-medium uppercase tracking-wide truncate">
                                  {schedule.type.replace(/_/g, ' ')}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                              title="Preview on map"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Delete Icon - Top Right Corner */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSchedule(schedule.id);
                          }}
                          className="absolute top-2 right-2 p-1 text-red-500 bg-white hover:bg-red-50 border border-red-200 rounded transition-colors"
                          title="Delete schedule"
                        >
                          <DeleteIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    {/* Schedule Details (Expanded) - Zone/Polygon List */}
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        {/* Quick Add Polygon Buttons */}
                        <div className="p-2 bg-gray-50 border-b border-gray-200">
                          <div className="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                            Create Polygon
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartDrawPolygon(schedule.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              title="Draw a new polygon on the map"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 21L21 21M3 21L3 3M21 21L21 3M3 3L21 3" />
                                <path d="M8 8L16 16M16 8L8 16" />
                              </svg>
                              Draw
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartSelectPolygon(schedule.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              title="Select an existing polygon from the map"
                            >
                              <MousePointer2 className="w-3.5 h-3.5" />
                              Select
                            </button>
                          </div>
                        </div>

                        {/* Polygons List */}
                        {polygons.map((polygon) => (
                          <div
                            key={polygon.id}
                            className="px-3 py-2.5 border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50"
                          >
                            {/* Row 1: Polygon Name */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-900">
                                {polygon.name}
                              </span>
                            </div>

                            {/* Row 2: Zone Input */}
                            <div className="mb-2">
                              <input
                                type="text"
                                value={polygon.zoneName || ''}
                                onChange={(e) => handlePolygonZoneChange(schedule.id, polygon.id, e.target.value)}
                                placeholder="Zone abc"
                                className="w-full px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            {/* Row 3: Color Picker and Progress */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-200"
                                  style={{ backgroundColor: getColorValue(polygon.color) }}
                                />
                                <ColorPicker
                                  value={polygon.color}
                                  onChange={(color) => handlePolygonColorChange(schedule.id, polygon.id, color)}
                                />
                                <span className="text-xs text-gray-600">#F32720</span>
                                <span className="text-xs text-gray-500">100%</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePolygon(schedule.id, polygon.id)}
                                className="p-1 text-red-500 hover:bg-red-50 border border-red-200 rounded transition-colors"
                                title="Delete polygon"
                              >
                                <DeleteIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add Polygon Button */}
                        <button
                          type="button"
                          onClick={() => handleAddPolygon(schedule.id)}
                          className="flex items-center gap-1.5 w-full px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Polygon</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

            {/* Add Schedule Button - Below the list */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              data-onboard="add-gis-schedule-btn"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mt-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add GIS Schedule
            </button>
        </>
      ) : (
        /* Municipal Level Tab Content */
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-900">Municipal Level Legislation</p>
              <p className="text-[10px] text-blue-700 mt-0.5">
                This legislation applies across the entire municipality. 
                No specific zones or boundaries need to be defined.
              </p>
            </div>
          </div>

          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white border border-gray-200 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">Entire Municipality</p>
                <p className="text-[10px] text-gray-500">All zones and areas are included</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-green-50 border border-green-200 rounded">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-green-700">Municipality-wide coverage enabled</span>
            </div>
          </div>

          {/* Hint */}
          <div className="flex items-start gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
            <Layers className="w-3.5 h-3.5 text-gray-500 mt-0.5 shrink-0" />
            <div className="text-[10px] text-gray-600">
              <p className="font-medium">Tip</p>
              <p className="mt-0.5">
                Use the Layers panel on the right to select which map layers should be visible 
                when viewing this municipal-level legislation.
              </p>
            </div>
          </div>
        </div>
      )}
      </div>

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
