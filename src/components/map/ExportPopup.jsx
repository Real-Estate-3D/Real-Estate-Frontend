// File: src/components/map/ExportPopup.jsx

import React from 'react';
import { X, Download, FileJson, Map, Layers, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ExportPopup = ({ exports, onClose, onClearExport, onClearAll }) => {
  const activeExports = exports.filter(exp => exp.status === 'processing');
  const completedExports = exports.filter(exp => exp.status === 'completed');
  const failedExports = exports.filter(exp => exp.status === 'error');

  const getFormatIcon = (format) => {
    switch (format) {
      case 'geojson':
        return <FileJson className="w-4 h-4" />;
      case 'kml':
        return <Map className="w-4 h-4" />;
      case 'shp':
        return <Layers className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getFormatLabel = (format) => {
    switch (format) {
      case 'geojson':
        return 'GeoJSON';
      case 'kml':
        return 'KML';
      case 'shp':
        return 'Shapefile';
      default:
        return format.toUpperCase();
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString();
  };

  return (
    <div className="fixed top-16 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-gray-700" />
          <h3 className="text-base font-semibold text-gray-900">Export Manager</h3>
          {activeExports.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {activeExports.length} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {exports.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {exports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Download className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">No exports yet</p>
            <p className="text-xs text-gray-500">Export layers from the Layers panel to see them here</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {exports.map((exp) => (
              <div
                key={exp.id}
                className={`p-3 rounded-lg border ${
                  exp.status === 'processing'
                    ? 'border-blue-200 bg-blue-50'
                    : exp.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className={`p-1.5 rounded ${
                        exp.status === 'processing'
                          ? 'bg-blue-100 text-blue-600'
                          : exp.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {getFormatIcon(exp.format)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {exp.layerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getFormatLabel(exp.format)} · {formatTime(exp.startedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {exp.status === 'processing' && (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    )}
                    {exp.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {exp.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <button
                      onClick={() => onClearExport(exp.id)}
                      className="p-1 hover:bg-white/50 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {exp.status === 'processing' && (
                  <>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>{exp.message}</span>
                        <span className="font-medium">{exp.progress}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-300 ease-out"
                          style={{ width: `${exp.progress}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {exp.status === 'completed' && (
                  <p className="text-xs text-green-700 font-medium">{exp.message}</p>
                )}

                {exp.status === 'error' && (
                  <p className="text-xs text-red-700 font-medium">{exp.message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {(completedExports.length > 0 || failedExports.length > 0) && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {completedExports.length > 0 && (
                <span className="text-green-600 font-medium">
                  {completedExports.length} completed
                </span>
              )}
              {failedExports.length > 0 && (
                <span className="text-red-600 font-medium">
                  {failedExports.length} failed
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPopup;
