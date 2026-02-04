// File: src/components/legislation/form/steps/ParametersStep.jsx

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, Map, AlertTriangle } from 'lucide-react';

// Sample data for dropdowns
const scheduleOptions = [
  { value: '', label: 'Select Schedule' },
  { value: 'downtown_mixed', label: 'Downtown Mixed Use Zone' },
  { value: 'residential_low', label: 'Residential Low Density' },
  { value: 'commercial', label: 'Commercial Zone' },
  { value: 'industrial', label: 'Industrial Zone' },
];

const polygonOptions = [
  { value: '', label: 'Select Polygon' },
  { value: 'zone_abc', label: 'Zone abc' },
  { value: 'zone_def', label: 'Zone def' },
  { value: 'zone_ghi', label: 'Zone ghi' },
];

const requirementTypes = [
  { value: '', label: 'Requirement...' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'range', label: 'Range' },
  { value: 'exact', label: 'Exact' },
];

const variableOptions = [
  { value: '', label: 'Variable' },
  { value: 'lot_front_setback', label: 'Lot Front Setback' },
  { value: 'lot_rear_setback', label: 'Lot Rear Setback' },
  { value: 'lot_side_setback', label: 'Lot Side Setback' },
  { value: 'building_height', label: 'Building Height' },
  { value: 'lot_coverage', label: 'Lot Coverage' },
  { value: 'density', label: 'Density' },
  { value: 'fsi', label: 'FSI' },
];

const unitOptions = [
  { value: '', label: 'Unit' },
  { value: 'm', label: 'm' },
  { value: 'ft', label: 'ft' },
  { value: 'sqm', label: 'sq m' },
  { value: 'sqft', label: 'sq ft' },
  { value: 'percent', label: '%' },
];

// Reusable Select component
const SelectField = ({ value, onChange, options, className = '' }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none px-3 py-2 pr-8 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
);

// Check for conflicts in parameters
const checkConflicts = (parameters) => {
  const conflicts = [];
  
  // Group parameters by variable
  const byVariable = {};
  parameters.forEach(p => {
    if (!byVariable[p.variable]) byVariable[p.variable] = [];
    byVariable[p.variable].push(p);
  });

  // Check for min > max conflicts
  Object.entries(byVariable).forEach(([variable, params]) => {
    const minParam = params.find(p => p.requirementType === 'min');
    const maxParam = params.find(p => p.requirementType === 'max');
    
    if (minParam && maxParam) {
      const minVal = parseFloat(minParam.value) || 0;
      const maxVal = parseFloat(maxParam.value) || 0;
      if (minVal > maxVal) {
        const varLabel = variableOptions.find(v => v.value === variable)?.label || variable;
        conflicts.push({
          type: 'min_exceeds_max',
          message: `Conflict: Min ${varLabel} (${minVal} ${minParam.unit}) exceeds Max ${varLabel} (${maxVal} ${maxParam.unit}).`
        });
      }
    }
  });

  return conflicts;
};

// Single Schedule Card component
const ScheduleCard = ({ 
  schedule, 
  index, 
  onDelete, 
  onUpdate,
  onPreview 
}) => {
  const [newParam, setNewParam] = useState({
    requirementType: '',
    variable: '',
    value: '0.0',
    unit: '',
    note: '',
  });

  const handleAddParameter = useCallback(() => {
    if (newParam.requirementType && newParam.variable) {
      onUpdate(schedule.id, {
        ...schedule,
        parameters: [
          ...schedule.parameters,
          { id: Date.now(), ...newParam }
        ]
      });
      setNewParam({
        requirementType: '',
        variable: '',
        value: '0.0',
        unit: '',
        note: '',
      });
    }
  }, [newParam, schedule, onUpdate]);

  const handleRemoveParameter = useCallback((paramId) => {
    onUpdate(schedule.id, {
      ...schedule,
      parameters: schedule.parameters.filter(p => p.id !== paramId)
    });
  }, [schedule, onUpdate]);

  const isAddDisabled = !newParam.requirementType || !newParam.variable;
  
  // Check for conflicts
  const conflicts = useMemo(() => checkConflicts(schedule.parameters), [schedule.parameters]);

  return (
    <div className="border border-gray-200 rounded-xl bg-white">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900">
          Schedule {index + 1}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(schedule.id)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onPreview(schedule.id)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Map className="w-4 h-4" />
            Preview on Map
          </button>
        </div>
      </div>

      {/* Schedule & Polygon Selection */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-900">Schedule</label>
            <SelectField
              value={schedule.scheduleType || ''}
              onChange={(value) => onUpdate(schedule.id, { ...schedule, scheduleType: value })}
              options={scheduleOptions}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-900">Polygon</label>
            <SelectField
              value={schedule.polygon || ''}
              onChange={(value) => onUpdate(schedule.id, { ...schedule, polygon: value })}
              options={polygonOptions}
            />
          </div>
        </div>
      </div>

      {/* Parameters Table */}
      <div className="px-5 pb-4">
        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-200">
            <div className="col-span-2">Requirement Type</div>
            <div className="col-span-2">Variable</div>
            <div className="col-span-1">Value</div>
            <div className="col-span-1">Unit</div>
            <div className="col-span-4">Notes / Justification</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Parameters List */}
          {schedule.parameters.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500 border-b border-gray-200">
              No parameters added yet.
            </div>
          ) : (
            <div>
              {schedule.parameters.map((param) => (
                <div key={param.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center text-sm border-b border-gray-200 bg-white">
                  <div className="col-span-2 text-gray-900">
                    {requirementTypes.find(r => r.value === param.requirementType)?.label || param.requirementType}
                  </div>
                  <div className="col-span-2 text-gray-900">
                    {variableOptions.find(v => v.value === param.variable)?.label || param.variable}
                  </div>
                  <div className="col-span-1 text-gray-900">{param.value}</div>
                  <div className="col-span-1 text-gray-900">
                    {unitOptions.find(u => u.value === param.unit)?.label || param.unit}
                  </div>
                  <div className="col-span-4 text-gray-600 truncate">{param.note || '-'}</div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveParameter(param.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Parameter Row */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3 items-center bg-white">
            <div className="col-span-2">
              <SelectField
                value={newParam.requirementType}
                onChange={(value) => setNewParam(prev => ({ ...prev, requirementType: value }))}
                options={requirementTypes}
              />
            </div>
            <div className="col-span-2">
              <SelectField
                value={newParam.variable}
                onChange={(value) => setNewParam(prev => ({ ...prev, variable: value }))}
                options={variableOptions}
              />
            </div>
            <div className="col-span-1">
              <input
                type="text"
                value={newParam.value}
                onChange={(e) => setNewParam(prev => ({ ...prev, value: e.target.value }))}
                placeholder="0.0"
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="col-span-1">
              <SelectField
                value={newParam.unit}
                onChange={(value) => setNewParam(prev => ({ ...prev, unit: value }))}
                options={unitOptions}
              />
            </div>
            <div className="col-span-4">
              <input
                type="text"
                value={newParam.note}
                onChange={(e) => setNewParam(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Note"
                className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                type="button"
                onClick={handleAddParameter}
                disabled={isAddDisabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Conflict Warnings */}
        {conflicts.length > 0 && (
          <div className="mt-4">
            {conflicts.map((conflict, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span className="text-sm text-gray-900">{conflict.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ParametersStep = ({ formData, onChange, errors }) => {
  const [schedules, setSchedules] = useState(formData.parameterSchedules || [
    {
      id: 1,
      scheduleType: 'downtown_mixed',
      polygon: 'zone_abc',
      parameters: [
        {
          id: 101,
          requirementType: 'min',
          variable: 'lot_front_setback',
          value: '10.0',
          unit: 'm',
          note: 'Ensure pedestrian-friendly frontage'
        }
      ]
    }
  ]);

  const handleAddSchedule = useCallback(() => {
    const newSchedule = {
      id: Date.now(),
      scheduleType: '',
      polygon: '',
      parameters: []
    };
    const updated = [...schedules, newSchedule];
    setSchedules(updated);
    onChange('parameterSchedules', updated);
  }, [schedules, onChange]);

  const handleDeleteSchedule = useCallback((id) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    onChange('parameterSchedules', updated);
  }, [schedules, onChange]);

  const handleUpdateSchedule = useCallback((id, updatedSchedule) => {
    const updated = schedules.map(s => s.id === id ? updatedSchedule : s);
    setSchedules(updated);
    onChange('parameterSchedules', updated);
  }, [schedules, onChange]);

  const handlePreviewSchedule = useCallback((id) => {
    // TODO: Implement map preview
    console.log('Preview schedule:', id);
  }, []);

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Schedule Cards */}
      {schedules.map((schedule, index) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          index={index}
          onDelete={handleDeleteSchedule}
          onUpdate={handleUpdateSchedule}
          onPreview={handlePreviewSchedule}
        />
      ))}

      {/* Add Schedule Button */}
      <div>
        <button
          type="button"
          onClick={handleAddSchedule}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Schedule
        </button>
      </div>
    </div>
  );
};

export default ParametersStep;
