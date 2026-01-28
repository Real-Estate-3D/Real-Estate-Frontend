// File: src/components/legislation/AddGISScheduleModal.jsx

import React, { useState, useCallback } from 'react';
import { X, Upload, ChevronDown } from 'lucide-react';

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

const AddGISScheduleModal = ({ 
  isOpen, 
  onClose, 
  onAdd,
  existingSchedules = [],
  onBoundaryHover,
  onBoundarySelect,
}) => {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'upload'
  const [scheduleData, setScheduleData] = useState({
    name: '',
    type: '',
    description: '',
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFieldChange = useCallback((field, value) => {
    setScheduleData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  }, []);

  const handleAdd = useCallback(() => {
    if (scheduleData.name.trim()) {
      onAdd({
        id: Date.now(),
        ...scheduleData,
        uploadedFile: uploadedFile?.name || null,
        createdAt: new Date().toISOString(),
        selectedLayers: [],
        selectedBoundaries: [],
        polygons: [
          { id: `polygon_${Date.now()}`, name: 'Polygon 1', color: 'green', type: 'custom' }
        ]
      });
      // Reset and close
      setScheduleData({
        name: '',
        type: '',
        description: '',
      });
      setUploadedFile(null);
      setActiveTab('manual');
      onClose();
    }
  }, [scheduleData, uploadedFile, onAdd, onClose]);

  const handleClose = useCallback(() => {
    setScheduleData({
      name: '',
      type: '',
      description: '',
    });
    setUploadedFile(null);
    setActiveTab('manual');
    onClose();
  }, [onClose]);

  const isValid = scheduleData.name.trim() !== '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Add GIS Schedule</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'manual'
                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50'
            }`}
          >
            Manual GIS Schedule
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50'
            }`}
          >
            Upload GIS Schedule
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          {activeTab === 'upload' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Upload File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".geojson,.json,.kml,.shp,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                  id="gis-file-upload"
                />
                <label
                  htmlFor="gis-file-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm text-gray-600 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploadedFile ? uploadedFile.name : 'Click to upload file'}
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: GeoJSON, KML, Shapefile (.zip)
              </p>
            </div>
          )}

          {/* Schedule Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Schedule Name
            </label>
            <input
              type="text"
              value={scheduleData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Enter Schedule Name"
              className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                className="w-full appearance-none px-3 py-2.5 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
              >
                <option value="" className="text-gray-400">Select Schedule Type</option>
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
              placeholder="Enter Description"
              rows={3}
              className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGISScheduleModal;
