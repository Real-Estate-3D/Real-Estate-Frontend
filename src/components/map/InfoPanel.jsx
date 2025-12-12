import React from 'react';
import { X, Building2, Download } from 'lucide-react';

const InfoPanel = ({ feature, onClose, isLayersPanelOpen = false }) => {
  if (!feature) return null;

  const properties = feature.properties || {};
  const featureId = feature.id || 'Unknown';

  const positionClass = isLayersPanelOpen ? 'right-[25rem]' : 'right-0';

  return (
    <div className={`absolute top-0 ${positionClass} h-full w-96 z-40 flex flex-col transition-all duration-300`}>
      <div className="bg-white shadow-xl m-2 rounded-lg flex-1 flex flex-col border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-900">Parcel Info</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            
            {(properties.address || properties.name || properties.IDENT) && (
              <div className="pb-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  {properties.address || properties.name || properties.IDENT || 'Unknown Location'}
                </h3>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Overview</h4>
              <div className="space-y-2">
                {properties.area && (
                  <PropertyRow label="Area" value={`${properties.area} m²`} />
                )}
                {properties.IDENT && (
                  <PropertyRow label="Parcel ID" value={properties.IDENT} />
                )}
                {featureId && featureId !== 'Unknown' && (
                  <PropertyRow label="Feature ID" value={featureId} />
                )}
              </div>
            </div>

            {(properties.zone || properties.ZONE || properties.zoning) && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Zoning</h4>
                <div className="space-y-2">
                  <PropertyRow label="Zone" value={properties.zone || properties.ZONE || properties.zoning} />
                  {properties.zoning_law && (
                    <PropertyRow label="Zoning Law" value={properties.zoning_law} />
                  )}
                  {properties.height_limit && (
                    <PropertyRow label="Height limit" value={properties.height_limit} />
                  )}
                  {properties.floor_area_ratio && (
                    <PropertyRow label="Floor Area Ratio" value={properties.floor_area_ratio} />
                  )}
                  {properties.permitted_uses && (
                    <PropertyRow label="Permitted Uses" value={properties.permitted_uses} />
                  )}
                </div>
              </div>
            )}

            {(properties.designation || properties.density_target || properties.planned_changes) && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Official Plan</h4>
                <div className="space-y-2">
                  {properties.designation && (
                    <PropertyRow label="Designation" value={properties.designation} />
                  )}
                  {properties.density_target && (
                    <PropertyRow label="Density target" value={properties.density_target} />
                  )}
                  {properties.planned_changes && (
                    <PropertyRow label="Planned changes" value={properties.planned_changes} />
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Layer Style</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Layer Color</span>
                </div>
                <div className="w-full h-8 bg-pink-300 border border-gray-300 rounded"></div>
              </div>
            </div>

            {Object.keys(properties).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">All Properties</h4>
                <div className="space-y-2">
                  {Object.entries(properties).map(([key, value]) => {
                    if (value === null || value === undefined || value === '') return null;
                    if (key === 'geom' || key === 'the_geom' || key === 'geometry' || key === 'bbox') return null;
                    return (
                      <PropertyRow key={key} label={formatLabel(key)} value={value} />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200">
              <button className="w-full py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Export Parcel Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-1.5">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm text-gray-900 font-medium text-right ml-4">
      {formatValue(value)}
    </span>
  </div>
);

const formatLabel = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();
};

const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A';
  
  if (typeof value === 'number') {
    if (value > 1000) {
      return value.toLocaleString();
    }
    return value;
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  const str = String(value);
  if (str.length > 100) {
    return str.substring(0, 100) + '...';
  }
  
  return str;
};

export default InfoPanel;
