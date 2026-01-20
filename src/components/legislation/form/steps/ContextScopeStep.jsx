// File: src/components/legislation/form/steps/ContextScopeStep.jsx

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { TextInput, SelectInput, DateInput, TextArea } from '../FormField';
import { Search, ChevronDown, X, Plus, Check } from 'lucide-react';

const jurisdictionOptions = [
  { value: 'toronto', label: 'City of Toronto' },
  { value: 'mississauga', label: 'City of Mississauga' },
  { value: 'brampton', label: 'City of Brampton' },
  { value: 'markham', label: 'City of Markham' },
  { value: 'vaughan', label: 'City of Vaughan' },
  { value: 'oakville', label: 'Town of Oakville' },
  { value: 'richmond_hill', label: 'City of Richmond Hill' },
  { value: 'burlington', label: 'City of Burlington' },
];

const legislationTypeOptions = [
  { value: 'zoning_bylaw', label: 'Zoning By-law' },
  { value: 'official_plan', label: 'Official Plan' },
  { value: 'site_specific_zoning', label: 'Site-Specific Zoning' },
  { value: 'subdivision_control', label: 'Subdivision Control' },
];

const baseTemplateOptions = [
  { value: 'template_1', label: 'Base Template 1' },
  { value: 'template_2', label: 'Base Template 2' },
  { value: 'template_123', label: 'Base Template 123' },
  { value: 'custom', label: 'Custom Template' },
];

// Available GIS Schedules (mock data - will come from API)
const availableGISSchedules = [
  { id: 'schedule_a', name: 'Schedule A - Land Use', type: 'land_use' },
  { id: 'schedule_b', name: 'Schedule B - Urban Structure', type: 'urban_structure' },
  { id: 'schedule_c', name: 'Schedule C - Transportation', type: 'transportation' },
  { id: 'zoning_map_1', name: 'Zoning Map 1 - Residential', type: 'zoning' },
  { id: 'zoning_map_2', name: 'Zoning Map 2 - Commercial', type: 'zoning' },
  { id: 'op_schedule_1', name: 'Official Plan Schedule 1', type: 'official_plan' },
  { id: 'op_schedule_2', name: 'Official Plan Schedule 2', type: 'official_plan' },
  { id: 'heritage_map', name: 'Heritage Conservation Map', type: 'heritage' },
  { id: 'environmental', name: 'Environmental Protection Areas', type: 'environmental' },
  { id: 'flood_map', name: 'Flood Hazard Areas Map', type: 'flood' },
];

// Searchable Multi-Select Dropdown Component
const ScheduleSearchSelect = ({ label, selectedSchedules = [], onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSchedules = useMemo(() => {
    return availableGISSchedules.filter(schedule =>
      schedule.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleToggleSchedule = useCallback((schedule) => {
    const isSelected = selectedSchedules.some(s => s.id === schedule.id);
    let updated;
    if (isSelected) {
      updated = selectedSchedules.filter(s => s.id !== schedule.id);
    } else {
      updated = [...selectedSchedules, schedule];
    }
    onChange('linkedSchedules', updated);
  }, [selectedSchedules, onChange]);

  const handleRemoveSchedule = useCallback((scheduleId, e) => {
    e.stopPropagation();
    const updated = selectedSchedules.filter(s => s.id !== scheduleId);
    onChange('linkedSchedules', updated);
  }, [selectedSchedules, onChange]);

  return (
    <div className="flex flex-col gap-1.5" ref={dropdownRef}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      {/* Selected schedules display */}
      <div
        className={`min-h-10 px-3 py-2 border rounded-lg bg-white cursor-pointer transition-colors ${
          isOpen ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-300 hover:border-gray-400'
        } ${error ? 'border-red-500' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedSchedules.length === 0 ? (
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <span>Select GIS Schedules...</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedSchedules.map(schedule => (
              <span
                key={schedule.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md"
              >
                {schedule.name}
                <button
                  type="button"
                  onClick={(e) => handleRemoveSchedule(schedule.id, e)}
                  className="p-0.5 hover:bg-blue-200 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search schedules..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredSchedules.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No schedules found
              </div>
            ) : (
              filteredSchedules.map(schedule => {
                const isSelected = selectedSchedules.some(s => s.id === schedule.id);
                return (
                  <div
                    key={schedule.id}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSchedule(schedule);
                    }}
                  >
                    <div className={`w-4 h-4 flex items-center justify-center rounded border ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{schedule.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{schedule.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick add button */}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              className="flex items-center gap-1.5 w-full px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // This would open the Add GIS Schedule modal
                setIsOpen(false);
              }}
            >
              <Plus className="w-4 h-4" />
              Add New Schedule
            </button>
          </div>
        </div>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

const ContextScopeStep = ({ formData, onChange, errors }) => {
  return (
    <div className="flex flex-col gap-5">
      <TextInput
        label="Title"
        name="title"
        value={formData.title}
        onChange={onChange}
        placeholder="Enter Title"
        error={errors.title}
        required
      />

      <SelectInput
        label="Jurisdiction"
        name="jurisdiction"
        value={formData.jurisdiction}
        onChange={onChange}
        options={jurisdictionOptions}
        placeholder="Select Jurisdiction"
        error={errors.jurisdiction}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <DateInput
          label="Effective From"
          name="effectiveFrom"
          value={formData.effectiveFrom}
          onChange={onChange}
          placeholder="Select Effective From"
          error={errors.effectiveFrom}
          required
        />

        <DateInput
          label="Effective To"
          name="effectiveTo"
          value={formData.effectiveTo}
          onChange={onChange}
          placeholder="Select Effective To"
          min={formData.effectiveFrom}
        />
      </div>

      <SelectInput
        label="Legislation Type"
        name="legislationType"
        value={formData.legislationType}
        onChange={onChange}
        options={legislationTypeOptions}
        placeholder="Select Legislation Type"
        error={errors.legislationType}
        required
      />

      <SelectInput
        label="Base Template"
        name="baseTemplate"
        value={formData.baseTemplate}
        onChange={onChange}
        options={baseTemplateOptions}
        placeholder="Select Base Template"
      />

      {/* GIS Schedule Search/Select */}
      <div className="relative">
        <ScheduleSearchSelect
          label="GIS Schedules"
          selectedSchedules={formData.linkedSchedules || []}
          onChange={onChange}
          error={errors.linkedSchedules}
        />
      </div>

      <TextArea
        label="Note"
        name="note"
        value={formData.note}
        onChange={onChange}
        placeholder="Enter Note"
        rows={3}
      />
    </div>
  );
};

export default ContextScopeStep;
