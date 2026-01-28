// File: src/utils/geoServerLayerManager.js

// Centralized runtime config (env-backed)
export { GEOSERVER_CONFIG } from "./runtimeConfig";

// Fetch layers (instant - returns hardcoded list)
export async function fetchGeoServerLayers() {
  // Return immediately - no API call
  return Promise.resolve(getFallbackLayers());
  
  // Future: uncomment to use API
  /*
  try {
    const response = await fetch('/api/layers');
    const data = await response.json();
    return data.layers || getFallbackLayers();
  } catch (error) {
    console.error("Failed to fetch layers:", error);
    return getFallbackLayers();
  }
  */
}

// Fallback hardcoded layers if API fails
// Layer configuration matching GeoServer published layers
function getFallbackLayers() {
  return [
    // === BOUNDARIES (Admin) ===
    // Primary boundary layers - used for navigation hierarchy
    { name: "boundaries_all_municipalities", title: "All Municipalities", category: "admin", municipality: "all", visible: true, opacity: 1.0, description: "Materialized view of all municipalities" },
    { name: "boundaries_upper_tier", title: "Upper Tier (Regions)", category: "admin", municipality: "all", visible: false, opacity: 0.8, description: "Regional municipalities" },
    { name: "boundaries_lower_tier", title: "Lower Tier (Cities/Towns)", category: "admin", municipality: "all", visible: false, opacity: 0.8, description: "Towns and cities within regions" },
    { name: "boundaries_single_tier", title: "Single Tier Municipalities", category: "admin", municipality: "all", visible: false, opacity: 0.8, description: "Single-tier cities" },
    { name: "boundaries_wards", title: "Electoral Wards", category: "admin", municipality: "all", visible: false, opacity: 0.7, description: "Municipal ward boundaries" },
    
    // === PARCELS ===
    { name: "landuse_parcels", title: "Property Parcels", category: "parcels", municipality: "all", visible: false, opacity: 1.0, description: "Property parcels" },
    
    // === PLANNING & ZONING ===
    { name: "landuse_zoning", title: "Zoning Districts", category: "planning", municipality: "all", visible: false, opacity: 0.6, description: "Zoning bylaws" },
    { name: "landuse_land_use", title: "Land Use Designations", category: "planning", municipality: "all", visible: false, opacity: 0.7, description: "Official plan land use designations" },
    
    // === INFRASTRUCTURE ===
    { name: "infrastructure_buildings", title: "Buildings", category: "infrastructure", municipality: "all", visible: false, opacity: 0.8, description: "Building footprints" },
    { name: "infrastructure_roads", title: "Roads", category: "infrastructure", municipality: "all", visible: false, opacity: 0.7, description: "Road network" },
    { name: "infrastructure_trails", title: "Trails", category: "infrastructure", municipality: "all", visible: false, opacity: 0.6, description: "Recreational trails" },
    { name: "infrastructure_parking", title: "Parking Facilities", category: "infrastructure", municipality: "all", visible: false, opacity: 0.7, description: "Parking facilities" },
    { name: "infrastructure_address_points", title: "Address Points", category: "infrastructure", municipality: "all", visible: false, opacity: 0.8, description: "Civic address points" },
    { name: "landuse_parks", title: "Parks & Green Spaces", category: "infrastructure", municipality: "all", visible: false, opacity: 0.7, description: "Parks and green spaces" },
  ];
}

// Layer name constants for easy reference throughout the app
export const LAYER_NAMES = {
  // Boundaries
  ALL_MUNICIPALITIES: "boundaries_all_municipalities",
  UPPER_TIER: "boundaries_upper_tier",
  LOWER_TIER: "boundaries_lower_tier",
  SINGLE_TIER: "boundaries_single_tier",
  WARDS: "boundaries_wards",
  // Parcels
  PARCELS: "landuse_parcels",
  // Planning
  ZONING: "landuse_zoning",
  LAND_USE: "landuse_land_use",
  // Infrastructure
  BUILDINGS: "infrastructure_buildings",
  ROADS: "infrastructure_roads",
  TRAILS: "infrastructure_trails",
  PARKING: "infrastructure_parking",
  ADDRESS_POINTS: "infrastructure_address_points",
  PARKS: "landuse_parks",
};

// CQL filter field mappings based on database schema
export const CQL_FIELDS = {
  // For boundaries.all_municipalities (materialized view)
  TIER_TYPE: "tier_type",           // 'upper_tier', 'lower_tier', 'single_tier'
  ADMIN_NAME: "admin_name",         // Municipality name
  ADMIN_ID: "admin_id",             // UUID for the municipality
  MUNICIPALITY_ID: "municipality_id", // Alias for admin_id in the view
  PARENT_NAME: "parent_name",       // Parent municipality name (for lower_tier)
  PARENT_ID: "parent_id",           // Parent municipality ID
  
  // For wards
  LOWER_TIER_ID: "lower_tier_id",   // FK to lower_tier
  SINGLE_TIER_ID: "single_tier_id", // FK to single_tier
  WARD_ID: "ward_id",
  
  // For infrastructure/landuse tables
  // These use lower_tier_id and/or single_tier_id for filtering
};

export function groupLayersByCategory(layers) {
  const categories = {
    admin: { title: "Administrative Boundaries", layers: [] },
    parcels: { title: "Property Parcels", layers: [] },
    planning: { title: "Planning & Zoning", layers: [] },
    infrastructure: { title: "Infrastructure", layers: [] }
  };
  
  layers.forEach(layer => {
    const cat = categories[layer.category];
    if (cat) cat.layers.push(layer);
  });
  
  return Object.entries(categories)
    .filter(([_, cat]) => cat.layers.length > 0)
    .map(([id, cat]) => ({ id, ...cat }));
}

// Get a specific layer configuration by name
export function getLayerByName(layerName) {
  const layers = getFallbackLayers();
  return layers.find(l => l.name === layerName) || null;
}

// Build a CQL filter for municipality-based queries
export function buildMunicipalityCqlFilter(municipalityId, tierType = null) {
  if (!municipalityId) return null;
  
  // For layers that have lower_tier_id and single_tier_id
  return `(lower_tier_id = '${municipalityId}' OR single_tier_id = '${municipalityId}')`;
}

export function filterLayersByMunicipality(layers, municipality) {
  if (!municipality) {
    return layers.filter(l => l.municipality === "all" || l.category === "admin");
  }
  
  const normalized = municipality.toLowerCase().trim();
  
  return layers.filter(l => {
    if (l.municipality === "all" || l.category === "admin") {
      return true;
    }
    
    // Direct match
    if (l.municipality === normalized) {
      return true;
    }
    
    // Partial match (e.g., "adjala" matches "adjala-tosorontio")
    if (normalized.includes(l.municipality) || l.municipality.includes(normalized)) {
      return true;
    }
    
    return false;
  });
}