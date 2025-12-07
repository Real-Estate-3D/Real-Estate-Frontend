// src/utils/geoServerUtils.js

// GeoServer configuration
export const GEOSERVER_CONFIG = {
  baseUrl: 'https://acwaportal.pk/geoserver',
  workspace: 'realestate',
  srs: 'EPSG:4326'
};

// Available WMS layers
export const WMS_LAYERS = {
  ZONING: {
    id: 'zoning',
    name: 'realestate:zoning',
    displayName: 'Zoning',
  },
  REGIONS: {
    id: 'regions',
    name: 'realestate:regions',
    displayName: 'Parcels/Regions',
  }
};

// Get WMS URL
export const getWMSUrl = () => {
  return `${GEOSERVER_CONFIG.baseUrl}/${GEOSERVER_CONFIG.workspace}/wms`;
};

// Get WFS URL
export const getWFSUrl = () => {
  return `${GEOSERVER_CONFIG.baseUrl}/${GEOSERVER_CONFIG.workspace}/wfs`;
};

// Get WMS layer parameters for Cesium
export const getWMSLayerParams = (layerKey) => {
  // If a specific key is provided and exists, use that layer
  if (layerKey && WMS_LAYERS[layerKey]) {
    const layer = WMS_LAYERS[layerKey];
    return {
      url: getWMSUrl(),
      layers: layer.name,
      parameters: {
        service: 'WMS',
        version: '1.1.0',
        request: 'GetMap',
        transparent: true,
        format: 'image/png',
        srs: GEOSERVER_CONFIG.srs
      }
    };
  }

  // Default to both layers
  const defaultLayers = [
    WMS_LAYERS.ZONING.name,
    WMS_LAYERS.REGIONS.name,
  ].join(',');

  return {
    url: getWMSUrl(),
    layers: defaultLayers,
    parameters: {
      service: 'WMS',
      version: '1.1.0',
      request: 'GetMap',
      transparent: true,
      format: 'image/png',
      srs: GEOSERVER_CONFIG.srs
    }
  };
};

// Build GetFeatureInfo URL (WMS - for click detection)
export const buildGetFeatureInfoUrl = (layers, bbox, width, height, x, y) => {
  const layerNames = Array.isArray(layers) ? layers.join(',') : layers;

  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetFeatureInfo',
    FORMAT: 'image/png',
    TRANSPARENT: 'true',
    LAYERS: layerNames,
    QUERY_LAYERS: layerNames,
    BBOX: bbox.join(','),
    WIDTH: width,
    HEIGHT: height,
    X: Math.round(x),
    Y: Math.round(y),
    SRS: GEOSERVER_CONFIG.srs,
    INFO_FORMAT: 'application/json',
    FEATURE_COUNT: 10
  });

  return `${getWMSUrl()}?${params.toString()}`;
};

// Fetch feature info from WMS (this is what you should use for clicks)
export const fetchFeatureInfo = async (layers, bbox, width, height, x, y) => {
  try {
    const url = buildGetFeatureInfoUrl(layers, bbox, width, height, x, y);
    console.log('🔍 GetFeatureInfo URL:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GetFeatureInfo HTTP error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    console.log('📝 Response content-type:', contentType);

    const data = await response.json();
    console.log('📍 GetFeatureInfo response:', data);

    // Check for features
    if (data.features && Array.isArray(data.features)) {
      if (data.features.length > 0) {
        console.log(`✅ Found ${data.features.length} feature(s)`);
        return data.features[0]; // Return first feature
      } else {
        console.log('⚠️ Response has features array but it\'s empty');
        return null;
      }
    }

    // Check for error in response
    if (data.error || data.exceptions) {
      console.error('❌ GeoServer error in response:', data);
      return null;
    }

    console.log('⚠️ Unexpected response structure:', data);
    return null;

  } catch (error) {
    console.error('❌ Error fetching feature info:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return null;
  }
};

// Fetch detailed feature data from WFS (optional - only if you need more details)
export const fetchFeatureByIdFromWFS = async (layerName, featureId) => {
  try {
    // Extract layer name if it's in format "layername.123"
    let actualLayerName = layerName;
    let actualFeatureId = featureId;
    
    if (featureId && featureId.includes('.')) {
      const parts = featureId.split('.');
      actualLayerName = parts[0];
      actualFeatureId = featureId; // Use full ID
    }

    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: actualLayerName,
      featureID: actualFeatureId,
      outputFormat: 'application/json'
    });

    const url = `${getWFSUrl()}?${params.toString()}`;
    console.log('🔍 Fetching WFS feature:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ WFS HTTP error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ WFS feature data:', data);

    if (data.features && data.features.length > 0) {
      return data.features[0];
    }

    console.log('⚠️ No features in WFS response');
    return null;
    
  } catch (error) {
    console.error('❌ Error fetching WFS feature:', error);
    return null;
  }
};

// Toronto bounding box
export const TORONTO_BOUNDS = {
  west: -79.639305,
  south: 43.584209,
  east: -79.114792,
  north: 43.855450,
  center: {
    longitude: -79.3774,
    latitude: 43.718,
    altitude: 50000
  }
};

// Helper function to validate WMS response
export const validateWMSResponse = (data) => {
  if (!data) {
    console.log('⚠️ Response is null or undefined');
    return false;
  }

  if (typeof data !== 'object') {
    console.log('⚠️ Response is not an object:', typeof data);
    return false;
  }

  if (!data.features) {
    console.log('⚠️ Response has no features property');
    return false;
  }

  if (!Array.isArray(data.features)) {
    console.log('⚠️ features is not an array');
    return false;
  }

  return true;
};