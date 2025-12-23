// File: src/components/map/InfoPanel.jsx

import React, { memo, useMemo } from 'react';
import { X, Download } from 'lucide-react';

// Memoized info row component
const InfoRow = memo(({ label, value, isBold = false }) => (
    <div className="flex flex-col">
        <span className="text-sm text-gray-500 mb-0.5">{label}</span>
        <span className={`text-sm text-gray-900 ${isBold ? 'font-semibold' : 'font-medium'}`}>{value}</span>
    </div>
));

InfoRow.displayName = 'InfoRow';

const InfoPanel = memo(({ feature, onClose }) => {
  // Memoize property extraction to prevent recalculation
  const panelData = useMemo(() => {
    if (!feature) return null;

    const properties = feature.properties || {};
    
    // Extract actual data from properties
    const title = properties.address_full || properties.ADDRESS || properties.FULL_ADDRESS || "Property Details";
    const parcelId = properties.roll_number || properties.ROLL_NUMBER || properties.ARN || properties.id || "N/A";
    
    // Calculate area from geometry if available
    let area = "N/A";
    if (properties.Shape__Are || properties.SHAPE_AREA || properties.area) {
      const areaValue = properties.Shape__Are || properties.SHAPE_AREA || properties.area;
      area = `${parseFloat(areaValue).toFixed(2)} m²`;
    }
    
    // Zoning information
    const zone = properties.ZN_ZONE || properties.ZONE_1 || properties.zone || "N/A";
    const zoningLaw = properties.BYLAW_CHAP || properties.bylaw || "N/A";
    const heightLimit = properties.height_limit || properties.HEIGHT_LIMIT || "N/A";
    const far = properties.ZN_FSI_DEN || properties.floor_area_ratio || properties.FSI_TOTAL || "N/A";
    const permittedUses = properties.permitted_uses || properties.PERMITTED_USES || "N/A";
    
    // Official Plan
    const designation = properties.ZN_LU_CATE || properties.designation || "N/A";
    const densityTarget = properties.density_target || properties.DENSITY || "N/A";
    const plannedChanges = properties.planned_changes || properties.ZN_STATUS || "None";

    return {
      title,
      parcelId,
      area,
      zone,
      zoningLaw,
      heightLimit,
      far,
      permittedUses,
      designation,
      densityTarget,
      plannedChanges
    };
  }, [feature]);

  if (!panelData) return null;

  const {
    title,
    parcelId,
    area,
    zone,
    zoningLaw,
    heightLimit,
    far,
    permittedUses,
    designation,
    densityTarget,
    plannedChanges
  } = panelData;

  return (
    <div className="w-full mt-2 mb-2 flex-1 min-h-0 bg-white rounded-xl flex flex-col overflow-hidden shadow-lg border border-gray-100">
      {/* Header */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between border-b border-gray-100 shrink-0">
        <div className="min-w-0 flex-1 pr-2">
           <h2 className="text-sm font-semibold text-gray-900 truncate">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
        
        {/* Overview Section */}
        <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Overview</h3>
            <div className="space-y-3">
                <InfoRow label="Area" value={area} isBold />
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-0.5">Parcel ID</span>
                    <span className="text-sm font-medium text-gray-900">{parcelId}</span>
                </div>
            </div>
        </div>

        <div className="h-px bg-gray-100"></div>

        {/* Zoning Section */}
        <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Zoning</h3>
            <div className="space-y-3">
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-0.5">Zone</span>
                    <span className="text-sm font-semibold text-gray-900">{zone}</span>
                </div>
                <InfoRow label="Zoning Law" value={zoningLaw} isBold />
                <InfoRow label="Height Limit" value={heightLimit} isBold />
                <InfoRow label="Floor Area Ratio" value={far} isBold />
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-0.5">Permitted Uses</span>
                    <span className="text-sm font-semibold text-gray-900">{permittedUses}</span>
                </div>
            </div>
        </div>

        <div className="h-px bg-gray-100"></div>

        {/* Official Plan Section */}
         <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Official Plan</h3>
            <div className="space-y-3">
                <InfoRow label="Designation" value={designation} isBold />
                <InfoRow label="Density Target" value={densityTarget} isBold />
                <InfoRow label="Planned Changes" value={plannedChanges} isBold />
            </div>
        </div>

         {/* Export Button */}
         <div className="pt-2">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium transition-all duration-200">
                <Download className="w-4 h-4" />
                Export Parcel Info
            </button>
         </div>

      </div>
    </div>
  );
});

InfoPanel.displayName = 'InfoPanel';

export default InfoPanel;