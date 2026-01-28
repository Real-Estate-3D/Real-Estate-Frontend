// File: src/components/map/InfoPanel.jsx

import React, { memo, useMemo } from 'react';
import { X, Download } from 'lucide-react';

// Memoized info row component
const InfoRow = memo(({ label, value, isBold = false }) => (
    <div className="flex flex-col">
        <span className="text-sm text-gray-500 mb-0.5">{label}</span>
        <span className={`text-sm text-gray-900 ${isBold ? 'font-semibold' : 'font-medium'}`}>{value || 'N/A'}</span>
    </div>
));

InfoRow.displayName = 'InfoRow';

// Helper to get first available property from multiple possible names
const getProperty = (properties, ...keys) => {
  for (const key of keys) {
    // Check exact key
    if (properties[key] !== undefined && properties[key] !== null && properties[key] !== '') {
      return properties[key];
    }
    // Check lowercase version
    const lowerKey = key.toLowerCase();
    if (properties[lowerKey] !== undefined && properties[lowerKey] !== null && properties[lowerKey] !== '') {
      return properties[lowerKey];
    }
  }
  return null;
};

// Helper to group properties by prefix (for combined data)
const groupPropertiesBySource = (properties) => {
  const groups = {
    parcel: {},
    zoning: {},
    land_use: {},
    address: {},
    other: {}
  };
  
  Object.entries(properties).forEach(([key, value]) => {
    if (key.startsWith('_')) return; // Skip metadata
    
    if (key.startsWith('zoning_')) {
      groups.zoning[key.replace('zoning_', '')] = value;
    } else if (key.startsWith('land_use_')) {
      groups.land_use[key.replace('land_use_', '')] = value;
    } else if (key.startsWith('address_')) {
      groups.address[key.replace('address_', '')] = value;
    } else {
      // Check if it's a known parcel field
      const parcelFields = ['parcel_id', 'arn', 'pin', 'trunk_roll_lot_number', 'plan_number', 
                            'legal_description', 'mpac_code', 'street_name', 'street_type',
                            'municipality', 'full_address', 'area_sq_m'];
      if (parcelFields.includes(key)) {
        groups.parcel[key] = value;
      } else {
        groups.other[key] = value;
      }
    }
  });
  
  return groups;
};

const InfoPanel = memo(({ feature, onClose }) => {
  // Memoize property extraction to prevent recalculation
  const panelData = useMemo(() => {
    if (!feature) return null;

    const properties = feature.properties || {};
    const groups = groupPropertiesBySource(properties);
    
    // Check if this is combined data from multiple layers
    const isCombined = properties._dataLayers && properties._dataLayers.includes(',');
    
    // Title/Address - from parcel or address data
    const title = getProperty(properties, 
      'street_name', 'full_address', 'address', 'civic_address',
      'ADDRESS', 'FULL_ADDRESS'
    ) || getProperty(groups.address, 'street_name', 'full_address', 'address') || "Property Details";
    
    // Parcel Information
    const arn = getProperty(groups.parcel, 'arn', properties.arn) || "N/A";
    const pin = getProperty(groups.parcel, 'pin', properties.pin) || "N/A";
    const rollNumber = getProperty(groups.parcel, 'trunk_roll_lot_number', properties.trunk_roll_lot_number) || "N/A";
    const planNumber = getProperty(groups.parcel, 'plan_number', properties.plan_number) || "N/A";
    const legalDesc = getProperty(groups.parcel, 'legal_description', properties.legal_description) || "N/A";
    const mpacCode = getProperty(groups.parcel, 'mpac_code', properties.mpac_code) || "N/A";
    
    // Address Information
    const streetName = getProperty(groups.address, 'street_name', properties.street_name) || "N/A";
    const streetType = getProperty(groups.address, 'street_type', properties.street_type) || "";
    const municipality = getProperty(groups.address, 'municipality', properties.municipality) || "N/A";
    const postalCode = getProperty(groups.address, 'postal_code', properties.postal_code) || "N/A";
    const unitNumber = getProperty(groups.address, 'unit_number', properties.unit_number) || "";
    
    // Area calculation
    let area = "N/A";
    const areaValue = getProperty(groups.parcel, 'area_sq_m', properties.area_sq_m, properties.shape_area);
    if (areaValue) {
      const numValue = parseFloat(areaValue);
      if (numValue > 10000) {
        area = `${(numValue / 10000).toFixed(2)} ha`;
      } else {
        area = `${numValue.toFixed(2)} m²`;
      }
    }
    
    // Zoning Information (from zoning layer)
    const zoneCode = getProperty(groups.zoning, 'zone_code', 'zoning_id', properties.zone_code) || "N/A";
    const zoneName = getProperty(groups.zoning, 'zone_name', properties.zone_name) || "";
    const bylawNumber = getProperty(groups.zoning, 'bylaw_number', properties.bylaw_number) || "N/A";
    const permittedUses = getProperty(groups.zoning, 'permitted_uses', 'zone_standards', properties.permitted_uses) || "N/A";
    
    // Land Use Information (from land_use layer)
    const designationCode = getProperty(groups.land_use, 'designation_code', properties.designation_code, properties.land_use_designation_code) || "N/A";
    const designationName = getProperty(groups.land_use, 'designation_name', properties.designation_name, properties.land_use_designation_name) || "";
    const amendment = getProperty(groups.land_use, 'amendment_number', properties.amendment_number) || "";
    
    // Municipality/Boundary info
    const municipalityName = getProperty(properties, 'admin_name', 'municipality_name', 'name');
    const tierType = getProperty(properties, 'tier_type', 'type', 'admin_type');
    const parentName = getProperty(properties, 'parent_name', 'region', 'county');
    const population = getProperty(properties, 'population', 'pop_total');
    
    // Determine feature type
    const isParcel = isCombined || !!arn || !!pin;
    const isMunicipality = !!tierType;

    return {
      title,
      isCombined,
      isParcel,
      isMunicipality,
      // Parcel data
      arn,
      pin,
      rollNumber,
      planNumber,
      legalDesc,
      mpacCode,
      area,
      // Address data
      streetName,
      streetType,
      municipality,
      postalCode,
      unitNumber,
      // Zoning data
      zoneCode,
      zoneName,
      bylawNumber,
      permittedUses,
      // Land use data
      designationCode,
      designationName,
      amendment,
      // Municipality data
      municipalityName,
      tierType,
      parentName,
      population,
      // Data sources
      dataSources: properties._dataLayers,
    };
  }, [feature]);

  if (!panelData) return null;

  const {
    title,
    isCombined,
    isParcel,
    isMunicipality,
    arn, pin, rollNumber, planNumber, legalDesc, mpacCode, area,
    streetName, streetType, municipality, postalCode, unitNumber,
    zoneCode, zoneName, bylawNumber, permittedUses,
    designationCode, designationName, amendment,
    municipalityName, tierType, parentName, population,
    dataSources,
  } = panelData;

  // Format tier type for display
  const formatTierType = (type) => {
    if (!type) return '';
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="w-full mt-2 mb-2 flex-1 min-h-0 bg-white rounded-xl flex flex-col overflow-hidden shadow-lg border border-gray-100">
      {/* Header */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between border-b border-gray-100 shrink-0">
        <div className="min-w-0 flex-1 pr-2">
           <h2 className="text-sm font-semibold text-gray-900 truncate">
             {isMunicipality ? municipalityName : isWard ? (wardName || `Ward ${wardNumber}`) : isBuilding ? (buildingType || 'Building') : title}
           </h2>
           {tierType && (
             <span className="text-xs text-gray-500">
               {formatTierType(tierType)}
             </span>
           )}
           {parentName && (
             <span className="text-xs text-gray-400 ml-1">
               • {parentName}
             </span>
           )}
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
                {area !== "N/A" && <InfoRow label="Area" value={area} isBold />}
                {isParcel && (
                  <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-0.5">Parcel ID</span>
                      <span className="text-sm font-medium text-gray-900">{parcelId}</span>
                  </div>
                )}
                {population && (
                  <InfoRow label="Population" value={parseInt(population).toLocaleString()} isBold />
                )}
                {isBuilding && stories && (
                  <InfoRow label="Stories" value={stories} isBold />
                )}
                {isWard && wardNumber && (
                  <InfoRow label="Ward Number" value={wardNumber} isBold />
                )}
            </div>
        </div>

        {/* Parcel-specific sections */}
        {isParcel && (
          <>
            <div className="h-px bg-gray-100"></div>

            {/* Zoning Section */}
            <div>
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Zoning</h3>
                <div className="space-y-3">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 mb-0.5">Zone</span>
                        <span className="text-sm font-semibold text-gray-900">{zone}{zoneName ? ` - ${zoneName}` : ''}</span>
                    </div>
                    <InfoRow label="Zoning Bylaw" value={zoningLaw} isBold />
                    <InfoRow label="Height Limit" value={heightLimit} isBold />
                    <InfoRow label="Floor Space Index" value={far} isBold />
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
                    <InfoRow label="Status" value={plannedChanges} isBold />
                </div>
            </div>

             {/* Export Button */}
             <div className="pt-2">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium transition-all duration-200">
                    <Download className="w-4 h-4" />
                    Export Parcel Info
                </button>
             </div>
          </>
        )}

        {/* Building-specific info */}
        {isBuilding && !isParcel && (
          <>
            <div className="h-px bg-gray-100"></div>
            <div>
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Building Info</h3>
                <div className="space-y-3">
                    <InfoRow label="Building Type" value={buildingType} isBold />
                    {stories && <InfoRow label="Stories" value={stories} isBold />}
                </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
});

InfoPanel.displayName = 'InfoPanel';

export default InfoPanel;
