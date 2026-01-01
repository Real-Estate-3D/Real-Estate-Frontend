// File: src/hooks/useMunicipalitySearch.js
// Custom hook for municipality search using WFS with CQL filter

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
const LAYER_NAME = 'view_municipalities';
const MAX_RESULTS = 5;

export const useMunicipalitySearch = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  const searchMunicipalities = useCallback(async (searchTerm) => {
    // Clear previous results if search term is too short
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      setError(null);
      return [];
    }

    // Check cache first
    const cacheKey = `muni-${searchTerm.toLowerCase().trim()}`;
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
      // Build CQL filter for case-insensitive search on name fields
      // Try common municipality name field names
      const searchPattern = `%${searchTerm}%`;
      const cqlFilter = `name ILIKE '${searchPattern}'`;
      
      const params = new URLSearchParams({
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeNames: `${WORKSPACE}:${LAYER_NAME}`,
        outputFormat: 'application/json',
        count: MAX_RESULTS.toString(),
        CQL_FILTER: cqlFilter
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
        id: feature.id || `municipality-${index}`,
        properties: feature.properties || {},
        geometry: feature.geometry,
        // Extract municipality info
        name: extractMunicipalityName(feature.properties),
        type: feature.properties?.type || feature.properties?.TYPE || feature.properties?.muni_type || 'SingleTier',
        population: feature.properties?.population || feature.properties?.POPULATION || null,
        region: feature.properties?.region || feature.properties?.county || feature.properties?.upper_tier || '',
        bbox: feature.bbox || calculateBbox(feature.geometry),
        // Calculate centroid for flying
        centroid: calculateCentroid(feature.geometry)
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
      
      console.error('Municipality search error:', err);
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
    searchMunicipalities,
    clearResults,
    clearCache
  };
};

// Helper to extract municipality name from properties
function extractMunicipalityName(props) {
  if (!props) return 'Unknown Municipality';
  
  // Try common field names in order of preference
  const nameFields = [
    'name', 'NAME',
    'municipal_name', 'MUNICIPAL_NAME',
    'mun_name', 'MUN_NAME',
    'MUNICIPAL',
    'municipality', 'MUNICIPALITY'
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

  return 'Municipality';
}

// Calculate bounding box from geometry
function calculateBbox(geometry) {
  if (!geometry || !geometry.coordinates) return null;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  const processCoords = (coords) => {
    if (typeof coords[0] === 'number') {
      minX = Math.min(minX, coords[0]);
      maxX = Math.max(maxX, coords[0]);
      minY = Math.min(minY, coords[1]);
      maxY = Math.max(maxY, coords[1]);
    } else {
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

// Calculate centroid from geometry
function calculateCentroid(geometry) {
  if (!geometry || !geometry.coordinates) return null;

  let sumX = 0, sumY = 0, count = 0;

  const processCoords = (coords) => {
    if (typeof coords[0] === 'number') {
      sumX += coords[0];
      sumY += coords[1];
      count++;
    } else {
      coords.forEach(processCoords);
    }
  };

  try {
    processCoords(geometry.coordinates);
    if (count === 0) return null;
    return {
      longitude: sumX / count,
      latitude: sumY / count
    };
  } catch {
    return null;
  }
}

export default useMunicipalitySearch;
