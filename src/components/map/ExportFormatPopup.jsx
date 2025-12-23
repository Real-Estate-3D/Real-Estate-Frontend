// File: src/components/map/ExportFormatPopup.jsx

import React from 'react';
import { X, FileJson, Map, Archive } from 'lucide-react';

const ExportFormatPopup = ({ layer, onClose, onExport }) => {
  const formats = [
    {
      id: 'geojson',
      name: 'GeoJSON',
      icon: FileJson,
      color: 'blue',
      description: 'Standard geographic data format'
    },
    {
      id: 'kml',
      name: 'KML',
      icon: Map,
      color: 'green',
      description: 'Google Earth compatible format'
    },
    {
      id: 'shp',
      name: 'Shapefile',
      icon: Archive,
      color: 'purple',
      description: 'ESRI Shapefile format'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
      green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
      purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
    };
    return colors[color] || colors.blue;
  };

  const handleExport = (format) => {
    onExport(layer, format);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Export {layer.name}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600 mb-4">Choose export format:</p>
          
          {formats.map((format) => {
            const Icon = format.icon;
            return (
              <button
                key={format.id}
                onClick={() => handleExport(format.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${getColorClasses(format.color)}`}
              >
                <Icon className="w-6 h-6" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">{format.name}</div>
                  <div className="text-xs opacity-75">{format.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <p className="text-xs text-gray-500">
            Export will start in the background. Check the export manager for progress.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportFormatPopup;
