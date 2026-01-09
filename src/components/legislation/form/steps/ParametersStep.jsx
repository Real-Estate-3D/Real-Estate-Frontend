// File: src/components/legislation/form/steps/ParametersStep.jsx

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const parameterTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'select', label: 'Dropdown' },
];

const ParametersStep = ({ formData, onChange, errors }) => {
  const [parameters, setParameters] = useState(formData.parameters || []);

  const handleAddParameter = () => {
    const newParameter = {
      id: Date.now(),
      name: '',
      type: 'text',
      required: false,
      defaultValue: '',
      options: [],
    };
    const updatedParameters = [...parameters, newParameter];
    setParameters(updatedParameters);
    onChange('parameters', updatedParameters);
  };

  const handleRemoveParameter = (id) => {
    const updatedParameters = parameters.filter(p => p.id !== id);
    setParameters(updatedParameters);
    onChange('parameters', updatedParameters);
  };

  const handleParameterChange = (id, field, value) => {
    const updatedParameters = parameters.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setParameters(updatedParameters);
    onChange('parameters', updatedParameters);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Parameters</h3>
          <p className="text-xs text-gray-500 mt-1">
            Define custom parameters for this legislation
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddParameter}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Parameter
        </button>
      </div>

      {parameters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No parameters defined</p>
          <button
            type="button"
            onClick={handleAddParameter}
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Add your first parameter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {parameters.map((param, index) => (
            <div
              key={param.id}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
            >
              <div className="pt-2 text-gray-400 cursor-move">
                <GripVertical className="w-4 h-4" />
              </div>

              <div className="flex-1 grid grid-cols-12 gap-3">
                <div className="col-span-4">
                  <label className="text-xs text-gray-500 mb-1 block">Parameter Name</label>
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => handleParameterChange(param.id, 'name', e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-3">
                  <label className="text-xs text-gray-500 mb-1 block">Type</label>
                  <select
                    value={param.type}
                    onChange={(e) => handleParameterChange(param.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    {parameterTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="text-xs text-gray-500 mb-1 block">Default Value</label>
                  <input
                    type="text"
                    value={param.defaultValue}
                    onChange={(e) => handleParameterChange(param.id, 'defaultValue', e.target.value)}
                    placeholder="Default"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2 flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={param.required}
                      onChange={(e) => handleParameterChange(param.id, 'required', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-600">Required</span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveParameter(param.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParametersStep;
