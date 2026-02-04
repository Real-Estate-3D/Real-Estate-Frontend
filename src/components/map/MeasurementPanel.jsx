// File: src/components/map/MeasurementPanel.jsx

import React, { useState } from 'react';
import { X, Eye, EyeOff, Pencil, XCircle } from 'lucide-react';
import GradientTitleBar from '../common/GradientTitleBar';
import { RulerIcon } from '../../utils/icons';

const MeasurementPanel = ({
  measurements = [],
  onDeleteMeasurement,
  onAddMeasurement,
  onToggleMeasurement,
  activeMeasurementId = null,
  onCancelDrawing = null
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeMeasurements, setActiveMeasurements] = useState(
    measurements.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  );

  // Update active measurements when measurements prop changes
  React.useEffect(() => {
    setActiveMeasurements(prev => {
      const updated = { ...prev };
      measurements.forEach(m => {
        if (!(m.id in updated)) {
          updated[m.id] = true; // New measurements are active by default
        }
      });
      return updated;
    });
  }, [measurements]);

  const handleToggleVisibility = (measurementId) => {
    const newState = !activeMeasurements[measurementId];
    setActiveMeasurements(prev => ({
      ...prev,
      [measurementId]: newState
    }));

    // Notify parent to toggle visibility on map
    if (onToggleMeasurement) {
      onToggleMeasurement(measurementId, newState);
    }
  };

  // Show panel if there are measurements OR if currently drawing
  if (measurements.length === 0 && !activeMeasurementId) return null;

  return (
    <div
      className="w-96 bg-white rounded-xl overflow-hidden pointer-events-auto transition-all duration-200"
      data-onboard="measurement-panel"
      style={{
        boxShadow: '0px 3px 15px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Collapsible Header */}
      <GradientTitleBar
        title="Measurements"
        icon={RulerIcon}
        variant="blue"
        collapsible={true}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        actions={
          measurements.length > 0 && (
            <span className="px-2 py-0.5 bg-slate-900/10 text-slate-900 text-xs font-semibold rounded-full">
              {measurements.length}
            </span>
          )
        }
      />

      {/* Measurements List */}
      {isExpanded && (
        <>
          {/* Currently Drawing Indicator */}
          {activeMeasurementId && (
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse ring-2 ring-blue-200" />
                  <div>
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Drawing in Progress</div>
                    <div className="text-xs text-blue-600 mt-0.5">Click to add points, double-click to finish</div>
                  </div>
                </div>
                <button
                  onClick={onCancelDrawing}
                  className="p-2 text-red-600 hover:bg-red-100 bg-red-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                  title="Cancel and clear drawing"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto">
            {measurements.map((measurement, index) => {
              const isVisible = activeMeasurements[measurement.id] !== false;
              // Use measurement name from data, or fall back to index-based name
              const displayName = measurement.name || (measurement.type === 'area' ? `Area ${index + 1}` : `Distance ${index + 1}`);

              return (
                <div
                  key={measurement.id}
                  className={`
                    group relative flex items-center gap-3 px-4 py-3.5 border-b border-gray-100
                    transition-all duration-200
                    ${isVisible
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-gray-50 hover:bg-gray-100 opacity-70'
                    }
                  `}
                >
                  {/* Status Indicator */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`
                        w-3 h-3 rounded-full transition-all duration-200 shadow-sm
                        ${isVisible ? 'bg-green-500' : 'bg-gray-400'}
                      `}
                    />
                  </div>

                  {/* Measurement Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`
                        text-sm font-semibold transition-colors duration-200
                        ${isVisible ? 'text-gray-900' : 'text-gray-500'}
                      `}>
                        {measurement.type === 'area' ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 border-2 border-current rounded-sm" />
                            {displayName}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-current rounded-full" />
                              <span className="w-3 h-0.5 bg-current" />
                              <span className="w-1.5 h-1.5 bg-current rounded-full" />
                            </span>
                            {displayName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`
                      text-base font-bold mt-1 transition-colors duration-200
                      ${isVisible ? 'text-gray-900' : 'text-gray-400'}
                    `}>
                      {measurement.value}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Toggle Visibility Button */}
                    <button
                      onClick={() => handleToggleVisibility(measurement.id)}
                      className={`
                        p-2 rounded-lg transition-all duration-200
                        ${isVisible
                          ? 'text-green-600 hover:bg-green-50 bg-green-50/50'
                          : 'text-gray-400 hover:bg-gray-200 bg-gray-100'
                        }
                      `}
                      title={isVisible ? "Hide measurement" : "Show measurement"}
                    >
                      {isVisible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    {/* Permanent Delete Button */}
                    <button
                      onClick={() => onDeleteMeasurement(measurement.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Permanently delete measurement"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Measurement Button */}
          <div className="px-4 py-3 bg-gradient-to-br from-gray-50 to-blue-50/30 border-t border-gray-200">
            <button
              onClick={onAddMeasurement}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Add New Measurement
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MeasurementPanel;
