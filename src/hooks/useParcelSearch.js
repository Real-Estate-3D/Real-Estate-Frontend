// File: src/hooks/useParcelSearch.js
// Custom hook for parcel search with debouncing and caching

import { useState, useRef, useCallback } from 'react';
// import { GEOSERVER_CONFIG } from '../utils/runtimeConfig';

const GEOSERVER_CONFIG = {
  baseUrl: import.meta.env.VITE_GEOSERVER_BASE_URL,
  workspace: import.meta.env.VITE_GEOSERVER_WORKSPACE,
  wmsUrl: `${import.meta.env.VITE_GEOSERVER_BASE_URL}/${import.meta.env.VITE_GEOSERVER_WORKSPACE}/wms`,
  wfsUrl: `${import.meta.env.VITE_GEOSERVER_BASE_URL}/${import.meta.env.VITE_GEOSERVER_WORKSPACE}/wfs`,
  srs: "EPSG:4326",
};

const GEOSERVER_WFS_URL = GEOSERVER_CONFIG.wfsUrl;
const WORKSPACE = GEOSERVER_CONFIG.workspace;
const MAX_RESULTS = 5;

export const useParcelSearch = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  const searchParcels = useCallback(async (searchTerm) => {
    // Clear previous results if search term is too short
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      setError(null);
      return [];
    }

    // Check cache first
    const cacheKey = searchTerm.toLowerCase().trim();
    if (cacheRef.current.has(cacheKey)) {
      const cachedResults = cacheRef.current.get(cacheKey);
      setResults(cachedResults);
      return cachedResults;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeNames: `${WORKSPACE}:parcel_search`,
        outputFormat: 'application/json',
        count: MAX_RESULTS.toString(),
        viewparams: `search_term:${encodeURIComponent(searchTerm)}`
      });

      const response = await fetch(`${GEOSERVER_WFS_URL}?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform features into search results
      const searchResults = (data.features || []).slice(0, MAX_RESULTS).map((feature, index) => ({
        id: feature.id || `parcel-${index}`,
        properties: feature.properties || {},
        geometry: feature.geometry,
        // Extract commonly used fields for display
        displayName: extractDisplayName(feature.properties),
        address: feature.properties?.address || feature.properties?.full_address || '',
        pin: feature.properties?.pin || feature.properties?.parcel_id || feature.properties?.arn || '',
        municipality: feature.properties?.municipality || feature.properties?.muni_name || '',
        bbox: feature.bbox || calculateBbox(feature.geometry)
      }));

      // Cache results
      cacheRef.current.set(cacheKey, searchResults);
      
      // Limit cache size
      if (cacheRef.current.size > 50) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      setResults(searchResults);
      setIsLoading(false);
      return searchResults;

    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled, don't update state
        return [];
      }
      
      console.error('Parcel search error:', err);
      setError(err.message);
      setResults([]);
      setIsLoading(false);
      return [];
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    results,
    isLoading,
    error,
    searchParcels,
    clearResults,
    clearCache
  };
};

// Helper to extract a display name from parcel properties
function extractDisplayName(props) {
  if (!props) return 'Unknown Parcel';
  
  // Try common field names in order of preference
  const nameFields = [
    'address_full',
    'address', 'full_address', 'street_address',
    'pin', 'parcel_id', 'arn', 'roll_number',
    'owner', 'owner_name',
    'legal_description'
  ];

  for (const field of nameFields) {
    if (props[field] && typeof props[field] === 'string' && props[field].trim()) {
      return props[field].trim();
    }
  }

  // Fallback to first string property
  for (const value of Object.values(props)) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return 'Parcel';
}

// Calculate bounding box from geometry
function calculateBbox(geometry) {
  if (!geometry || !geometry.coordinates) return null;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  const processCoords = (coords) => {
    if (typeof coords[0] === 'number') {
      // This is a point [x, y]
      minX = Math.min(minX, coords[0]);
      maxX = Math.max(maxX, coords[0]);
      minY = Math.min(minY, coords[1]);
      maxY = Math.max(maxY, coords[1]);
    } else {
      // This is an array of coordinates
      coords.forEach(processCoords);
    }
  };

  try {
    processCoords(geometry.coordinates);
    return [minX, minY, maxX, maxY];
  } catch {
    return null;
  }
}

export default useParcelSearch;
