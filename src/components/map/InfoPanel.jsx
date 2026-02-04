// File: src/components/map/InfoPanel.jsx
// Updated to show combined parcel data from multiple GeoServer layers

import React, { memo, useMemo, useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { generateParcelPDFReport } from '../../utils/pdfGenerator.js';
import { fetchGeoServerLayers } from '../../utils/geoServerLayerManager.js';

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
  if (!properties) return null;
  
  for (const key of keys) {
    if (!key) continue; // Skip null/undefined keys
    
    // Check exact key
    if (properties[key] !== undefined && properties[key] !== null && properties[key] !== '') {
      return properties[key];
    }
    // Check lowercase version
    const lowerKey = typeof key === 'string' ? key.toLowerCase() : null;
    if (lowerKey && properties[lowerKey] !== undefined && properties[lowerKey] !== null && properties[lowerKey] !== '') {
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

const InfoPanel = memo(({ feature, onClose, mapRef, enabledLayers = [] }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
    const isParcel = isCombined || !!arn || !!pin || properties._layerName === "Parcel (Combined)";
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

  // PDF generation handler
  const handleGeneratePDF = async () => {
    if (!feature || !mapRef?.current) {
      alert('Unable to generate PDF: Map or feature data not available');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const viewer = mapRef.current.getViewer();
      console.log('=== PDF Generation Debug ===');
      console.log('Viewer available:', !!viewer && !viewer.isDestroyed());
      console.log('Scene available:', !!viewer?.scene);
      console.log('Canvas available:', !!viewer?.scene?.canvas);
      console.log('Canvas dimensions:', viewer?.scene?.canvas?.width, 'x', viewer?.scene?.canvas?.height);
      console.log('MapRef current:', !!mapRef.current);
      console.log('Feature:', feature);
      
      if (!viewer || viewer.isDestroyed()) {
        throw new Error('Map viewer is not available');
      }

      // Get all available layers for the report
      const allLayers = await fetchGeoServerLayers();
      
      // Mark which layers are currently enabled
      const layersWithStatus = allLayers.map(layer => ({
        ...layer,
        isEnabled: enabledLayers.includes(layer.name)
      }));

      await generateParcelPDFReport(feature, viewer, layersWithStatus);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report: ' + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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

  return (
    <div className="w-full mt-2 mb-2 flex-1 min-h-0 bg-white rounded-xl flex flex-col overflow-hidden shadow-lg border border-gray-100">
      {/* Header */}
      <div
        style={{
          background: 'radial-gradient(104.2% 1049.87% at 1.2% 119.64%, rgba(0, 115, 252, 0.228) 0%, rgba(0, 115, 252, 0.08) 39.42%, rgba(0, 115, 252, 0.228) 58.17%, rgba(0, 115, 252, 0.08) 86.54%), #FFFFFF',
        }}
        className="px-3 py-2.5 flex items-center justify-between border-b border-slate-200/70 shrink-0 rounded-t-lg"
      >
        <div className="min-w-0 flex-1 pr-2">
           <h2 className="text-sm font-semibold text-gray-900 truncate">
             {isMunicipality ? municipalityName : (streetName !== "N/A" ? `${streetName}${streetType ? ` ${streetType}` : ''}` : title)}
           </h2>
           {isCombined && dataSources && (
             <span className="text-xs text-gray-500">
               {dataSources}
             </span>
           )}
           {tierType && (
             <span className="text-xs text-gray-500">
               {tierType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
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
        
        {/* Parcel Information Section */}
        {isParcel && (
          <>
            <div>
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Parcel Information</h3>
              <div className="space-y-3">
                {arn !== "N/A" && <InfoRow label="ARN" value={arn} isBold />}
                {pin !== "N/A" && <InfoRow label="PIN" value={pin} isBold />}
                {rollNumber !== "N/A" && <InfoRow label="Roll Number" value={rollNumber} />}
                {planNumber !== "N/A" && <InfoRow label="Plan Number" value={planNumber} />}
                {area !== "N/A" && <InfoRow label="Area" value={area} isBold />}
                {legalDesc !== "N/A" && <InfoRow label="Legal Description" value={legalDesc} />}
                {mpacCode !== "N/A" && <InfoRow label="MPAC Code" value={mpacCode} />}
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* Address Section */}
            <div>
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Address</h3>
              <div className="space-y-3">
                {unitNumber && <InfoRow label="Unit" value={unitNumber} />}
                {streetName !== "N/A" && (
                  <InfoRow label="Street" value={`${streetName}${streetType ? ` ${streetType}` : ''}`} isBold />
                )}
                {municipality !== "N/A" && <InfoRow label="Municipality" value={municipality} />}
                {postalCode !== "N/A" && <InfoRow label="Postal Code" value={postalCode} />}
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* Zoning Section */}
            <div>
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Zoning</h3>
              <div className="space-y-3">
                <InfoRow label="Zone Code" value={zoneCode} isBold />
                {zoneName && <InfoRow label="Zone Name" value={zoneName} />}
                {bylawNumber !== "N/A" && <InfoRow label="Bylaw Number" value={bylawNumber} />}
                {permittedUses !== "N/A" && <InfoRow label="Permitted Uses" value={permittedUses} />}
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* Land Use Section */}
            <div>
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Land Use (Official Plan)</h3>
              <div className="space-y-3">
                <InfoRow label="Designation Code" value={designationCode} isBold />
                {designationName && <InfoRow label="Designation" value={designationName} />}
                {amendment && <InfoRow label="Amendment" value={amendment} />}
              </div>
            </div>

             {/* PDF Report Button */}
             <div className="pt-2">
              <button 
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-xl text-blue-600 hover:text-blue-700 text-sm font-medium transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                    Generate PDF Report
                  </>
                )}
              </button>
             </div>
          </>
        )}

        {/* Municipality Section */}
        {isMunicipality && (
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Overview</h3>
            <div className="space-y-3">
              {parentName && <InfoRow label="Region" value={parentName} />}
              {population && <InfoRow label="Population" value={parseInt(population).toLocaleString()} isBold />}
            </div>
          </div>
        )}

      </div>
    </div>
  );
});

InfoPanel.displayName = 'InfoPanel';

export default InfoPanel;
