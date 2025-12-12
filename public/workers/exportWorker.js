// Web Worker for handling GeoServer exports
// Note: Web Workers don't support ES6 imports, using fetch-based approach

// Load JSZip from CDN
importScripts('https://unpkg.com/@mapbox/shp-write@latest/shpwrite.js');

self.onmessage = async function(e) {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'FETCH_GEOJSON':
        await fetchGeoJSON(data);
        break;
      case 'CONVERT_TO_SHP':
        await convertToShapefile(data);
        break;
      case 'CONVERT_TO_KML':
        await convertToKML(data);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message
    });
  }
};

async function fetchGeoJSON({ url, layerName, format = 'application/json' }) {
  try {
    self.postMessage({
      type: 'PROGRESS',
      progress: 0,
      message: 'Initiating download...'
    });

    const wfsUrl = `${url}?service=WFS&version=1.0.0&request=GetFeature&typeName=${layerName}&outputFormat=${format}&maxFeatures=50000`;
    
    self.postMessage({
      type: 'PROGRESS',
      progress: 10,
      message: 'Connecting to server...'
    });

    const response = await fetch(wfsUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10);
    let loaded = 0;

    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      const progress = contentLength ? Math.round((loaded / total) * 70) + 10 : 50;
      
      self.postMessage({
        type: 'PROGRESS',
        progress,
        message: `Downloading data... ${Math.round(loaded / 1024)}KB`
      });
    }

    self.postMessage({
      type: 'PROGRESS',
      progress: 80,
      message: 'Processing data...'
    });

    const blob = new Blob(chunks);
    const text = await blob.text();
    const geojson = JSON.parse(text);

    self.postMessage({
      type: 'PROGRESS',
      progress: 100,
      message: 'Download complete!'
    });

    self.postMessage({
      type: 'GEOJSON_COMPLETE',
      data: geojson,
      layerName
    });

  } catch (error) {
    throw new Error(`Failed to fetch GeoJSON: ${error.message}`);
  }
}

async function convertToKML({ geojson, layerName }) {
  try {
    self.postMessage({
      type: 'PROGRESS',
      progress: 0,
      message: 'Converting to KML...'
    });

    // Simple GeoJSON to KML conversion
    const kmlString = geojsonToKML(geojson, layerName);

    self.postMessage({
      type: 'PROGRESS',
      progress: 50,
      message: 'Creating KML file...'
    });

    const blob = new Blob([kmlString], { type: 'application/vnd.google-earth.kml+xml' });

    self.postMessage({
      type: 'PROGRESS',
      progress: 100,
      message: 'Conversion complete!'
    });

    self.postMessage({
      type: 'KML_COMPLETE',
      data: blob,
      layerName
    });

  } catch (error) {
    throw new Error(`Failed to convert to KML: ${error.message}`);
  }
}

// Simple GeoJSON to KML converter
function geojsonToKML(geojson, documentName) {
  let kml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  kml += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
  kml += '<Document>\n';
  kml += `  <name>${escapeXML(documentName)}</name>\n`;
  
  if (geojson.features && Array.isArray(geojson.features)) {
    geojson.features.forEach((feature, index) => {
      kml += '  <Placemark>\n';
      
      // Add name from properties if available
      if (feature.properties && feature.properties.name) {
        kml += `    <name>${escapeXML(feature.properties.name)}</name>\n`;
      } else {
        kml += `    <name>Feature ${index + 1}</name>\n`;
      }
      
      // Add description with all properties
      if (feature.properties) {
        kml += '    <description><![CDATA[';
        Object.entries(feature.properties).forEach(([key, value]) => {
          kml += `<b>${escapeXML(key)}:</b> ${escapeXML(String(value))}<br/>`;
        });
        kml += ']]></description>\n';
      }
      
      // Add geometry
      if (feature.geometry) {
        kml += convertGeometryToKML(feature.geometry);
      }
      
      kml += '  </Placemark>\n';
    });
  }
  
  kml += '</Document>\n';
  kml += '</kml>';
  
  return kml;
}

function convertGeometryToKML(geometry) {
  let kml = '';
  
  switch (geometry.type) {
    case 'Point':
      kml += '    <Point>\n';
      kml += `      <coordinates>${geometry.coordinates[0]},${geometry.coordinates[1]},0</coordinates>\n`;
      kml += '    </Point>\n';
      break;
      
    case 'LineString':
      kml += '    <LineString>\n';
      kml += '      <coordinates>\n';
      kml += geometry.coordinates.map(coord => `        ${coord[0]},${coord[1]},0`).join('\n');
      kml += '\n      </coordinates>\n';
      kml += '    </LineString>\n';
      break;
      
    case 'Polygon':
      kml += '    <Polygon>\n';
      kml += '      <outerBoundaryIs>\n';
      kml += '        <LinearRing>\n';
      kml += '          <coordinates>\n';
      kml += geometry.coordinates[0].map(coord => `            ${coord[0]},${coord[1]},0`).join('\n');
      kml += '\n          </coordinates>\n';
      kml += '        </LinearRing>\n';
      kml += '      </outerBoundaryIs>\n';
      kml += '    </Polygon>\n';
      break;
      
    case 'MultiPolygon':
      kml += '    <MultiGeometry>\n';
      geometry.coordinates.forEach(polygon => {
        kml += '      <Polygon>\n';
        kml += '        <outerBoundaryIs>\n';
        kml += '          <LinearRing>\n';
        kml += '            <coordinates>\n';
        kml += polygon[0].map(coord => `              ${coord[0]},${coord[1]},0`).join('\n');
        kml += '\n            </coordinates>\n';
        kml += '          </LinearRing>\n';
        kml += '        </outerBoundaryIs>\n';
        kml += '      </Polygon>\n';
      });
      kml += '    </MultiGeometry>\n';
      break;
  }
  
  return kml;
}

function escapeXML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function convertToShapefile({ geojson, layerName }) {
  try {
    self.postMessage({
      type: 'PROGRESS',
      progress: 0,
      message: 'Converting to Shapefile...'
    });
    
    self.postMessage({
      type: 'PROGRESS',
      progress: 20,
      message: 'Creating shapefile components...'
    });

    const options = {
      folder: layerName,
      filename: layerName,
      outputType: "blob",
      compression: "DEFLATE",
      types: {
        point: `${layerName}_points`,
        polygon: `${layerName}_polygons`,
        polyline: `${layerName}_lines`
      },
    };

    self.postMessage({
      type: 'PROGRESS',
      progress: 40,
      message: 'Generating shapefile...'
    });

    // shpwrite.zip returns a Promise, so we need to await it
    const zipData = await shpwrite.zip(geojson, options);

    self.postMessage({
      type: 'PROGRESS',
      progress: 80,
      message: 'Compressing files...'
    });

    self.postMessage({
      type: 'PROGRESS',
      progress: 100,
      message: 'Shapefile ZIP created successfully!'
    });

    self.postMessage({
      type: 'SHP_COMPLETE',
      data: zipData,
      layerName,
      note: 'Shapefile ZIP exported successfully'
    });

  } catch (error) {
    throw new Error(`Failed to convert to Shapefile: ${error.message}`);
  }
}
