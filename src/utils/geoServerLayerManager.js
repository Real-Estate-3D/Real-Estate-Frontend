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
function getFallbackLayers() {
  return [
    // Admin - Always visible at overview
    { name: "view_municipalities", title: "Municipalities", category: "admin", municipality: "all", visible: true, opacity: 1.0 },
    { name: "view_wards", title: "Wards", category: "admin", municipality: "all", visible: false, opacity: 0.8 },
    
    // Parcels - Show when drilled into municipality
    { name: "view_parcels", title: "Property Parcels", category: "parcels", municipality: "all", visible: false, opacity: 1.0 },
    
    // Planning - Toronto
    { name: "view_zoning___toronto", title: "Zoning", category: "planning", municipality: "toronto", visible: false, opacity: 0.6 },
    { name: "view_land_use___toronto", title: "Land Use", category: "planning", municipality: "toronto", visible: false, opacity: 0.7 },
    
    // Planning - Midland
    { name: "view_zoning___midland", title: "Zoning", category: "planning", municipality: "midland", visible: false, opacity: 0.6 },
    
    // Planning - Adjala
    { name: "view_zoning___adjala", title: "Zoning", category: "planning", municipality: "adjala-tosorontio", visible: false, opacity: 0.6 },
    { name: "view_zoning___adjala_tosorontio", title: "Zoning (Adjala-Tosorontio)", category: "planning", municipality: "adjala-tosorontio", visible: false, opacity: 0.6 },
    
    // Infrastructure - Toronto
    { name: "view_buildings___toronto", title: "Buildings", category: "infrastructure", municipality: "toronto", visible: false, opacity: 0.8 },
    { name: "view_parking___toronto", title: "Parking", category: "infrastructure", municipality: "toronto", visible: false, opacity: 0.7 },
    
    // Infrastructure - Midland
    { name: "view_parks___midland", title: "Parks", category: "infrastructure", municipality: "midland", visible: false, opacity: 0.7 },
    { name: "view_parking___midland", title: "Parking", category: "infrastructure", municipality: "midland", visible: false, opacity: 0.7 },
    
    // Infrastructure - Adjala
    { name: "view_parks___adjala", title: "Parks", category: "infrastructure", municipality: "adjala-tosorontio", visible: false, opacity: 0.7 },
    { name: "view_parking___adjala", title: "Parking", category: "infrastructure", municipality: "adjala-tosorontio", visible: false, opacity: 0.7 },
  ];
}

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