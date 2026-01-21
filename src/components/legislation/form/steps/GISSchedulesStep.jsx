// File: src/components/legislation/form/steps/GISSchedulesStep.jsx

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, FileText, ChevronDown, ChevronRight, Layers, Eye, Edit2, MapPin } from 'lucide-react';
import AddGISScheduleModal from '../../AddGISScheduleModal';

const GISSchedulesStep = ({ formData, onChange, errors, enabledLayers = {} }) => {
  const [schedules, setSchedules] = useState(formData.gisSchedules || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedSchedules, setExpandedSchedules] = useState({});

  const handleAddSchedule = useCallback((scheduleData) => {
    const updatedSchedules = [...schedules, scheduleData];
    setSchedules(updatedSchedules);
    onChange('gisSchedules', updatedSchedules);
    // Auto-expand newly added schedule
    setExpandedSchedules(prev => ({ ...prev, [scheduleData.id]: true }));
  }, [schedules, onChange]);

  const handleRemoveSchedule = useCallback((id) => {
    const updatedSchedules = schedules.filter(s => s.id !== id);
    setSchedules(updatedSchedules);
    onChange('gisSchedules', updatedSchedules);
  }, [schedules, onChange]);

  const toggleScheduleExpand = useCallback((id) => {
    setExpandedSchedules(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Count active layers from sidebar
  const activeLayerCount = Object.values(enabledLayers).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">GIS Schedules</h3>
          <p className="text-xs text-gray-500 mt-1">
            Add GIS schedule files and map layers for this legislation
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add GIS Schedule
        </button>
      </div>

      {/* Active Layers from Sidebar Info */}
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

      {/* Schedules List */}
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
            const isExpanded = expandedSchedules[schedule.id];
            const layerCount = schedule.selectedLayers?.length || 0;
            
            return (
              <div
                key={schedule.id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              >
                {/* Schedule Header */}
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleScheduleExpand(schedule.id)}
                >
                  <div className="flex items-center gap-3">
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
                    <div className="p-2 bg-white border border-gray-200 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {schedule.name || `Schedule ${index + 1}`}
                        </span>
                        {schedule.type && (
                          <span className="px-1.5 py-0.5 text-xs text-gray-500 bg-gray-100 rounded">
                            {schedule.type.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {layerCount} layer{layerCount !== 1 ? 's' : ''} included
                      </span>
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

                {/* Schedule Details (Expanded) */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200">
                    {schedule.description && (
                      <p className="text-sm text-gray-600 mb-4">{schedule.description}</p>
                    )}
                    
                    {/* Included Layers */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        Included Layers
                      </span>
                      {schedule.selectedLayers && schedule.selectedLayers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {schedule.selectedLayers.map((layer) => (
                            <div
                              key={layer.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg"
                            >
                              <Layers className="w-3 h-3" />
                              {layer.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No layers selected</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Hint about layers panel */}
      {schedules.length > 0 && (
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Layers className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">Tip: Use the Layers panel</p>
            <p className="mt-0.5">
              Toggle layers in the right panel to preview them on the map before finalizing your schedules.
            </p>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      <AddGISScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSchedule}
        existingSchedules={schedules}
      />
    </div>
  );
};

export default GISSchedulesStep;
