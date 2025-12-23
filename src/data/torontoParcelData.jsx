// File: src/data/torontoParcelData.jsx
// Static parcel data for Toronto, ON
// These are realistic parcels covering different areas of Toronto

export const torontoParcelData = [
  // Downtown Core - Financial District
  {
    id: 'parcel-001',
    coordinates: [
      [-79.3832, 43.6426],
      [-79.3825, 43.6426],
      [-79.3825, 43.6432],
      [-79.3832, 43.6432],
      [-79.3832, 43.6426]
    ],
    properties: {
      address: '100 King Street West',
      owner: 'First Canadian Properties',
      zoning: 'C2 - Commercial',
      area: '2,450 sq m',
      landUse: 'Commercial Office',
      buildingType: 'High-Rise Office',
      yearBuilt: 1975,
      assessedValue: '$45,000,000',
      municipality: 'Single-Tier Municipality',
      ward: 'Ward 10 - Spadina-Fort York'
    }
  },
  
  // Etobicoke - Residential Area
  {
    id: 'parcel-002',
    coordinates: [
      [-79.5450, 43.6200],
      [-79.5440, 43.6200],
      [-79.5440, 43.6210],
      [-79.5450, 43.6210],
      [-79.5450, 43.6200]
    ],
    properties: {
      address: '45 Burnhamthorpe Road',
      owner: 'Private Residential',
      zoning: 'R1 - Residential',
      area: '850 sq m',
      landUse: 'Residential',
      buildingType: 'Single Family Home',
      yearBuilt: 1968,
      assessedValue: '$1,200,000',
      municipality: 'Single-Tier Municipality',
      ward: 'Ward 3 - Etobicoke-Lakeshore'
    }
  },

  // North York - Commercial
  {
    id: 'parcel-003',
    coordinates: [
      [-79.4110, 43.7615],
      [-79.4100, 43.7615],
      [-79.4100, 43.7625],
      [-79.4110, 43.7625],
      [-79.4110, 43.7615]
    ],
    properties: {
      address: '5650 Yonge Street',
      owner: 'North York Properties Ltd',
      zoning: 'C2 - Commercial',
      area: '3,200 sq m',
      landUse: 'Mixed Use',
      buildingType: 'Mid-Rise Commercial',
      yearBuilt: 1985,
      assessedValue: '$8,500,000',
      municipality: 'Single-Tier Municipality',
      ward: 'Ward 8 - Eglinton-Lawrence'
    }
  },

  // Scarborough - Residential
  {
    id: 'parcel-004',
    coordinates: [
      [-79.2300, 43.7730],
      [-79.2290, 43.7730],
      [-79.2290, 43.7740],
      [-79.2300, 43.7740],
      [-79.2300, 43.7730]
    ],
    properties: {
      address: '1520 Ellesmere Road',
      owner: 'Private Residential',
      zoning: 'R2 - Residential',
      area: '600 sq m',
      landUse: 'Residential',
      buildingType: 'Townhouse',
      yearBuilt: 1992,
      assessedValue: '$750,000',
      municipality: 'Single-Tier Municipality',
      ward: 'Ward 21 - Scarborough Centre'
    }
  },

  // Downtown - Mixed Use
  {
    id: 'parcel-005',
    coordinates: [
      [-79.3900, 43.6550],
      [-79.3890, 43.6550],
      [-79.3890, 43.6560],
      [-79.3900, 43.6560],
      [-79.3900, 43.6550]
    ],
    properties: {
      address: '250 Dundas Street West',
      owner: 'Urban Development Corp',
      zoning: 'M1 - Industrial',
      area: '1,800 sq m',
      landUse: 'Mixed Use',
      buildingType: 'Mixed Residential/Commercial',
      yearBuilt: 2010,
      assessedValue: '$12,000,000',
      municipality: 'Single-Tier Municipality',
      ward: 'Ward 11 - University-Rosedale'
    }
  },

  // Etobicoke - Industrial
  {
    id: 'parcel-006',
    coordinates: [
      [-79.5600, 43.6450],
      [-79.5585, 43.6450],
      [-79.5585, 43.6465],
      [-79.5600, 43.6465],
      [-79.5600, 43.6450]
    ],
    properties: {
      address: '88 Industry Drive',
      owner: 'Industrial Holdings Inc',
      zoning: 'M2 - Industrial',
      area: '5,500 sq m',
      landUse: 'Industrial',
      buildingType: 'Warehouse',
      yearBuilt: 1982,
      assessedValue: '$3,200,000',
      municipality: 'Single-Tier Municipality',
      ward: 'Ward 2 - Etobicoke Centre'
    }
  },

  // York - Residential
  {
    id: 'parcel-007',
    coordinates: [
      [-79.4650, 43.6850],
      [-79.4640, 43.6850],
      [-79.4640, 43.6860],
      [-79.4650, 43.6860],
      [-79.4650, 43.6850]
    ],
    properties: {
      address: '1200 Dufferin Street',
      owner: 'Private Residential',
      zoning: 'R3 - Residential',
      area: '450 sq m',
      landUse: 'Residential',
      buildingType: 'Semi-Detached',
      yearBuilt: 1955,
      assessedValue: '$980,000',
      municipality: 'Single-Tier Municipality',
      ward: 'Ward 9 - Davenport'
    }
  },

  // East York - Parks
  {
    id: 'parcel-008',
    coordinates: [
      [-79.3200, 43.6900],
      [-79.3180, 43.6900],
      [-79.3180, 43.6920],
      [-79.3200, 43.6920],
      [-79.3200, 43.6900]
    ],
    properties: {
      address: 'Stan Wadlow Park',
      owner: 'City of Toronto',
      zoning: 'Parks & Open Space',
      area: '8,200 sq m',
      landUse: 'Recreational',
      buildingType: 'Park',
      yearBuilt: 1965,
      assessedValue: '$0',
      municipality: 'Single-Tier Municipality',
      ward: 'Ward 19 - Beaches-East York'
    }
  }
];

// Layer configuration data
export const layerCategories = {
  mapScope: [
    { id: 'single-tier', label: 'Single-Tier Municipality', enabled: true },
    { id: 'upper-tier', label: 'Upper-Tier Municipality', enabled: false }
  ],
  provincialPolicy: [
    { id: 'settlement-areas', label: 'Settlement Areas', icon: '🏘️', enabled: false },
    { id: 'natural-heritage', label: 'Natural Heritage Systems', icon: '🌲', enabled: false },
    { id: 'hazard-lands', label: 'Hazard Lands', icon: '⚠️', enabled: false },
    { id: 'agricultural-areas', label: 'Agricultural Areas', icon: '🌾', enabled: false },
    { id: 'greenbelt', label: 'Greenbelt Protected Areas', enabled: false },
    { id: 'natural-core', label: 'Natural Core Areas', enabled: false },
    { id: 'countryside', label: 'Countryside Areas', enabled: false }
  ],
  officialPlan: [
    { id: 'residential', label: 'Residential', enabled: false },
    { id: 'commercial', label: 'Commercial', enabled: false },
    { id: 'mixed-use', label: 'Mixed-use', enabled: false },
    { id: 'employment', label: 'Employment areas', enabled: false },
    { id: 'parks', label: 'Parks & Open space', enabled: false }
  ],
  waterWastewater: [
    { id: 'infrastructure', label: 'Existing Infrastructure', enabled: false },
    { id: 'planned-infrastructure', label: 'Planned Infrastructure', enabled: false },
    { id: 'service-areas', label: 'Service Areas', enabled: false }
  ],
  zoning: [
    { id: 'r1-residential', label: 'R1 - Residential', enabled: false },
    { id: 'r2-residential', label: 'R2 - Residential', enabled: false },
    { id: 'r3-residential', label: 'R3 - Residential', enabled: false },
    { id: 'c1-commercial', label: 'C1 - Commercial', enabled: false },
    { id: 'c2-commercial', label: 'C2 - Commercial', enabled: false },
    { id: 'c3-commercial', label: 'C3 - Commercial', enabled: false },
    { id: 'm1-industrial', label: 'M1 - Industrial', enabled: false },
    { id: 'm2-industrial', label: 'M2 - Industrial', enabled: false },
    { id: 'm3-industrial', label: 'M3 - Industrial', enabled: false },
    { id: 'm4-mixed', label: 'M4 - Mixed use', enabled: false },
    { id: 'max-building', label: 'Maximum Building Heights', enabled: false },
    { id: 'floor-area', label: 'Floor Area Ratio', enabled: false }
  ],
  routes: [
    { id: 'environmental-study', label: 'Environmental Impact Study', enabled: false },
    { id: 'traffic-study', label: 'Traffic Impact Study', enabled: false }
  ],
  trafficPatterns: [],
  environmentalRisks: [],
  infrastructure: []
};