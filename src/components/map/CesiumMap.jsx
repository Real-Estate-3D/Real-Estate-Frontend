// File: src/components/map/CesiumMap.jsx

import React, {
  useRef,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  memo,
} from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import {
  fetchGeoServerLayers,
  filterLayersByMunicipality,
  LAYER_NAMES,
} from "../../utils/geoServerLayerManager";
import { CESIUM_ION_TOKEN, GEOSERVER_CONFIG } from "../../utils/runtimeConfig";

if (CESIUM_ION_TOKEN) {
  Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN;
} else {
  // Cesium can still render with some assets without Ion, but many features require a token.
  // Keep this as a warning rather than throwing.
  console.warn(
    "Missing VITE_CESIUM_ION_TOKEN. Set it in your .env file to enable Cesium Ion assets."
  );
}

// CQL Filters for tier-based municipality visibility
const CQL_FILTERS = {
  // Initial view: Show only UpperTier and SingleTier municipalities
  INITIAL: "tier_type IN ('upper_tier', 'single_tier')",
  // Show all municipalities
  ALL: null,
  // Show children of a specific municipality using both parent_id and tier_type
  regionDrillDown: (municipalityId) => `tier_type = 'lower_tier' AND parent_id = '${municipalityId}'`,
};

const MUNICIPALITY_CONFIG = {
  "simcoe county": { lat: 44.4, lon: -79.7, height: 150000, type: "upper_tier" },
  toronto: { lat: 43.7, lon: -79.4, height: 80000, type: "single_tier" },
  midland: { lat: 44.75, lon: -79.88, height: 25000, type: "lower_tier" },
  "adjala-tosorontio": {
    lat: 44.15,
    lon: -79.95,
    height: 35000,
    type: "lower_tier",
  },
  barrie: { lat: 44.37, lon: -79.69, height: 30000, type: "lower_tier" },
  orillia: { lat: 44.61, lon: -79.42, height: 25000, type: "lower_tier" },
};

const INITIAL_CAMERA = {
  longitude: -79.6,
  latitude: 44.0,
  height: 300000,
  heading: 0,
  pitch: -90,
  roll: 0,
};

const VIEW_LEVELS = {
  OVERVIEW: "overview", // High altitude - see all regions
  REGION: "region", // upper_tier - see lower_tier municipalities
  MUNICIPALITY: "municipality", // single_tier or lower_tier - see parcels
  PARCEL: "parcel", // Individual parcel selected
};

const CesiumMap = forwardRef(
  ({ onWMSFeatureClick, onMunicipalityClick }, ref) => {
    const cesiumContainer = useRef(null);
    const viewerRef = useRef(null);
    const layersRef = useRef([]);
    const layerConfigRef = useRef([]);
    const highlightEntityRef = useRef(null);
    const currentCqlFilterRef = useRef(CQL_FILTERS.INITIAL);
    const selectedDivisionIdRef = useRef(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [currentMunicipality, setCurrentMunicipality] = useState(null);
    const [viewLevel, setViewLevel] = useState(VIEW_LEVELS.OVERVIEW);
    const [currentRegion, setCurrentRegion] = useState(null);
    const [viewHierarchy, setViewHierarchy] = useState([]);
    
    // Measurement state ref
    const measurementStateRef = useRef(null);

    // Polygon drawing state ref
    const polygonDrawingStateRef = useRef(null);

    // Refs to hold latest values for use in click handler without causing re-initialization
    const viewLevelRef = useRef(viewLevel);
    const callbacksRef = useRef({ onWMSFeatureClick, onMunicipalityClick });
    const functionsRef = useRef({});

    // Keep refs updated
    viewLevelRef.current = viewLevel;
    callbacksRef.current = { onWMSFeatureClick, onMunicipalityClick };

    const queryMunicipality = useCallback(
      async (lat, lon, preferredType = null) => {
        const buffer = 0.001;
        const bbox = `${lon - buffer},${lat - buffer},${lon + buffer},${
          lat + buffer
        }`;

        const params = new URLSearchParams({
          service: "WMS",
          version: "1.1.1",
          request: "GetFeatureInfo",
          layers: `${GEOSERVER_CONFIG.workspace}:${LAYER_NAMES.ALL_MUNICIPALITIES}`,
          query_layers: `${GEOSERVER_CONFIG.workspace}:${LAYER_NAMES.ALL_MUNICIPALITIES}`,
          info_format: "application/json",
          bbox: bbox,
          width: 101,
          height: 101,
          srs: GEOSERVER_CONFIG.srs,
          x: 50,
          y: 50,
          feature_count: 10, // Get multiple features to find the right one
        });

        // Add current CQL filter to match what's visible
        if (currentCqlFilterRef.current) {
          params.append("CQL_FILTER", currentCqlFilterRef.current);
        }

        const url = `${GEOSERVER_CONFIG.wmsUrl}?${params.toString()}`;

        try {
          const response = await fetch(url);
          const data = await response.json();

          if (data.features && data.features.length > 0) {
            // If we have multiple features, prioritize based on preferredType
            let feature = data.features[0];

            if (preferredType && data.features.length > 1) {
              // Look for a feature matching the preferred type
              const preferredFeature = data.features.find((f) => {
                const fType =
                  f.properties?.type ||
                  f.properties?.TYPE ||
                  f.properties?.muni_type;
                return fType === preferredType;
              });
              if (preferredFeature) {
                feature = preferredFeature;
              }
            }

            const props = feature.properties;

            // Extract name and type from new schema
            const name =
              props.admin_name ||
              props.name ||
              props.municipal_name ||
              props.mun_name ||
              props.MUNICIPAL ||
              props.NAME ||
              Object.values(props)[0];
            const type =
              props.tier_type || props.type || props.TYPE || props.muni_type || "single_tier";
            
            // Get ID - in boundaries_all_municipalities view, the column is called municipality_id for all tier types
            const id = props.municipality_id || props.admin_id || props.id || props.ID;
            console.log(`${type} ID extracted: ${id}, from props:`, props);

            // If geometry is not included, fetch it via WFS
            let geometry = feature.geometry;
            if (!geometry && id && name) {
              try {
                // Use admin_name for filtering since it's more reliable
                const wfsParams = new URLSearchParams({
                  service: "WFS",
                  version: "1.1.0",
                  request: "GetFeature",
                  typeName: `${GEOSERVER_CONFIG.workspace}:${LAYER_NAMES.ALL_MUNICIPALITIES}`,
                  outputFormat: "application/json",
                  CQL_FILTER: `admin_name = '${name.replace(/'/g, "''")}'`,
                  srsName: GEOSERVER_CONFIG.srs,
                });
                const wfsUrl = `${
                  GEOSERVER_CONFIG.wfsUrl
                }?${wfsParams.toString()}`;
                const wfsResponse = await fetch(wfsUrl);
                const wfsData = await wfsResponse.json();
                if (wfsData.features && wfsData.features.length > 0) {
                  geometry = wfsData.features[0].geometry;
                  console.log(`Fetched geometry via WFS for: ${name}`);
                }
              } catch (wfsError) {
                console.warn("Failed to fetch geometry via WFS:", wfsError);
              }
            }

            return {
              name,
              type,
              id,
              properties: props,
              geometry,
            };
          }
          return null;
        } catch (error) {
          console.error("Error querying municipality:", error);
          return null;
        }
      },
      []
    );

    const queryFeatureInfo = useCallback(async (lat, lon, layerName) => {
      const buffer = 0.0001;
      const bbox = `${lon - buffer},${lat - buffer},${lon + buffer},${
        lat + buffer
      }`;

      const params = new URLSearchParams({
        service: "WMS",
        version: "1.1.1",
        request: "GetFeatureInfo",
        layers: `${GEOSERVER_CONFIG.workspace}:${layerName}`,
        query_layers: `${GEOSERVER_CONFIG.workspace}:${layerName}`,
        info_format: "application/json",
        bbox: bbox,
        width: 101,
        height: 101,
        srs: GEOSERVER_CONFIG.srs,
        x: 50,
        y: 50,
        feature_count: 1,
      });

      const url = `${GEOSERVER_CONFIG.wmsUrl}?${params.toString()}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          return {
            ...feature,
            properties: {
              ...feature.properties,
              _layerName: layerName,
              _coordinates: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
              _featureType: feature.geometry?.type || "Unknown",
            },
          };
        }
        return null;
      } catch (error) {
        console.error("Error fetching feature info:", error);
        return null;
      }
    }, []);

    // Helper to convert GeoJSON geometry to WKT for CQL filters
    const convertGeoJSONToWKT = useCallback((geometry) => {
      if (!geometry || !geometry.type || !geometry.coordinates) {
        return null;
      }

      const coordsToWKT = (coords) => {
        return coords.map(c => `${c[0]} ${c[1]}`).join(', ');
      };

      switch (geometry.type) {
        case 'Point':
          return `POINT(${geometry.coordinates[0]} ${geometry.coordinates[1]})`;
        
        case 'Polygon':
          const rings = geometry.coordinates.map(ring => 
            `(${coordsToWKT(ring)})`
          ).join(', ');
          return `POLYGON(${rings})`;
        
        case 'MultiPolygon':
          const polygons = geometry.coordinates.map(polygon => {
            const polyRings = polygon.map(ring => `(${coordsToWKT(ring)})`).join(', ');
            return `(${polyRings})`;
          }).join(', ');
          return `MULTIPOLYGON(${polygons})`;
        
        default:
          console.warn(`Unsupported geometry type for WKT conversion: ${geometry.type}`);
          return null;
      }
    }, []);

    // Fetch a single parcel feature via WFS using a point intersection
    // Utility: approximate squared distance (deg space) between two lon/lat points
    const squaredDistanceDeg = (lon1, lat1, lon2, lat2) => {
      const dx = lon1 - lon2;
      const dy = lat1 - lat2;
      return dx * dx + dy * dy;
    };

    // Utility: quick centroid for polygon/multipolygon; falls back to first coord
    const getFeatureCentroid = (geometry) => {
      if (!geometry || !geometry.coordinates) return null;

      if (geometry.type === "Point") {
        return geometry.coordinates;
      }

      // Flatten coordinates for centroid calc
      let coords = [];
      if (geometry.type === "Polygon") {
        coords = geometry.coordinates[0] || [];
      } else if (geometry.type === "MultiPolygon") {
        geometry.coordinates.forEach((poly) => {
          if (poly && poly[0]) {
            coords = coords.concat(poly[0]);
          }
        });
      }

      if (!coords.length) return null;

      const sum = coords.reduce(
        (acc, c) => {
          acc.lon += c[0];
          acc.lat += c[1];
          return acc;
        },
        { lon: 0, lat: 0 }
      );
      return [sum.lon / coords.length, sum.lat / coords.length];
    };

    const fetchParcelFeatureByPoint = useCallback(async (lat, lon) => {
      // Try multiple strategies/fields to be resilient to schema or precision issues
      const geomFields = ["geom", "the_geom"];
      const srid = (GEOSERVER_CONFIG.srs || "EPSG:4326").replace("EPSG:", "");
      const pointLiteral = `SRID=${srid};POINT(${lon} ${lat})`;
      const bufferMeters = 8; // small buffer for precision mismatches

      for (const geomField of geomFields) {
        const strategies = [
          // 1) Use DWITHIN with tiny buffer in meters (units supported by GeoServer)
          `DWITHIN(${geomField}, ${pointLiteral}, ${bufferMeters}, meters)`,
          // 2) Fallback to WITHIN on a degree buffer (very small)
          `WITHIN(${geomField}, BUFFER(${pointLiteral}, 0.0001))`,
          // 3) Last resort: plain INTERSECTS
          `INTERSECTS(${geomField}, ${pointLiteral})`,
        ];

        for (const cql of strategies) {
          const wfsParams = new URLSearchParams({
            service: "WFS",
            version: "1.1.0",
            request: "GetFeature",
            typeName: `${GEOSERVER_CONFIG.workspace}:${LAYER_NAMES.PARCELS}`,
            outputFormat: "application/json",
            srsName: GEOSERVER_CONFIG.srs,
            maxFeatures: "10",
            CQL_FILTER: cql,
          });

          const wfsUrl = `${GEOSERVER_CONFIG.wfsUrl}?${wfsParams.toString()}`;

          try {
            const response = await fetch(wfsUrl);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
              // Pick the feature whose centroid is closest to the click
              let best = null;
              let bestDist = Infinity;
              data.features.forEach((feature) => {
                const centroid = getFeatureCentroid(feature.geometry);
                if (centroid) {
                  const d = squaredDistanceDeg(centroid[0], centroid[1], lon, lat);
                  if (d < bestDist) {
                    bestDist = d;
                    best = feature;
                  }
                } else if (!best) {
                  best = feature;
                }
              });

              if (best) {
                return {
                  geometry: best.geometry,
                  properties: best.properties,
                  bbox: best.bbox,
                  id: best.id,
                  geomField,
                  strategy: cql,
                };
              }
            }
          } catch (error) {
            console.error(`Error fetching parcel via WFS (${geomField}) with ${cql}:`, error);
          }
        }

        // BBOX fallback with tiny envelope around the click (in degrees)
        const bboxSize = 0.0002;
        const bboxParams = new URLSearchParams({
          service: "WFS",
          version: "1.1.0",
          request: "GetFeature",
          typeName: `${GEOSERVER_CONFIG.workspace}:${LAYER_NAMES.PARCELS}`,
          outputFormat: "application/json",
          srsName: GEOSERVER_CONFIG.srs,
          maxFeatures: "1",
          bbox: `${lon - bboxSize},${lat - bboxSize},${lon + bboxSize},${lat + bboxSize},${GEOSERVER_CONFIG.srs}`,
        });

        const bboxUrl = `${GEOSERVER_CONFIG.wfsUrl}?${bboxParams.toString()}`;
        try {
          const response = await fetch(bboxUrl);
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            let best = null;
            let bestDist = Infinity;
            data.features.forEach((feature) => {
              const centroid = getFeatureCentroid(feature.geometry);
              if (centroid) {
                const d = squaredDistanceDeg(centroid[0], centroid[1], lon, lat);
                if (d < bestDist) {
                  bestDist = d;
                  best = feature;
                }
              } else if (!best) {
                best = feature;
              }
            });

            if (best) {
              return {
                geometry: best.geometry,
                properties: best.properties,
                bbox: best.bbox,
                id: best.id,
                geomField,
                strategy: "bbox fallback",
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching parcel via WFS bbox fallback (${geomField}):`, error);
        }
      }

      return null;
    }, []);

    // Query multiple layers for parcel information and combine the data
    const queryParcelWithRelatedData = useCallback(async (lat, lon, parcelGeometry) => {
      console.log("Querying parcel and related data...");
      
      // First, get parcel, zoning, and land use via WMS (same location query)
      const [parcelData, zoningData, landUseData] = await Promise.all([
        queryFeatureInfo(lat, lon, LAYER_NAMES.PARCELS),
        queryFeatureInfo(lat, lon, LAYER_NAMES.ZONING),
        queryFeatureInfo(lat, lon, LAYER_NAMES.LAND_USE),
      ]);

      // Fetch full parcel geometry via WFS for accurate highlighting
      let parcelWfsData = null;
      try {
        parcelWfsData = await fetchParcelFeatureByPoint(lat, lon);
      } catch (error) {
        console.error("Error fetching parcel via WFS:", error);
      }

      // For address points, use WFS with spatial intersection if we have parcel geometry
      let addressData = null;
      const parcelGeometryForIntersection = parcelWfsData?.geometry || parcelData?.geometry;
      if (parcelGeometryForIntersection) {
        try {
          console.log("Querying address point within parcel via WFS...");
          
          // Build WFS query with INTERSECTS filter
          const geometryWKT = convertGeoJSONToWKT(parcelGeometryForIntersection);
          const wfsParams = new URLSearchParams({
            service: "WFS",
            version: "1.1.0",
            request: "GetFeature",
            typeName: `${GEOSERVER_CONFIG.workspace}:${LAYER_NAMES.ADDRESS_POINTS}`,
            outputFormat: "application/json",
            srsName: GEOSERVER_CONFIG.srs,
            maxFeatures: "1",
          });
          
          // Add CQL filter for spatial intersection
          wfsParams.append("CQL_FILTER", `INTERSECTS(geom, ${geometryWKT})`);
          
          const wfsUrl = `${GEOSERVER_CONFIG.wfsUrl}?${wfsParams.toString()}`;
          console.log("Address WFS query:", wfsUrl);
          
          const response = await fetch(wfsUrl);
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            addressData = {
              geometry: data.features[0].geometry,
              properties: data.features[0].properties,
            };
            console.log("Found address point:", addressData.properties);
          } else {
            console.log("No address point found within parcel");
          }
        } catch (error) {
          console.error("Error querying address point:", error);
        }
      } else {
        console.log("No parcel geometry available for address point query");
      }

      // Combine all the data
      const parcelProps = parcelWfsData?.properties || parcelData?.properties || {};
      const combinedProperties = {
        // Parcel information (primary)
        ...parcelProps,
        
        // Zoning information (prefixed)
        ...(zoningData?.properties && Object.fromEntries(
          Object.entries(zoningData.properties)
            .filter(([key]) => !key.startsWith('_'))
            .map(([key, value]) => [`zoning_${key}`, value])
        )),
        
        // Land use information (prefixed)
        ...(landUseData?.properties && Object.fromEntries(
          Object.entries(landUseData.properties)
            .filter(([key]) => !key.startsWith('_'))
            .map(([key, value]) => [`land_use_${key}`, value])
        )),
        
        // Address point information (prefixed)
        ...(addressData?.properties && Object.fromEntries(
          Object.entries(addressData.properties)
            .filter(([key]) => !key.startsWith('_'))
            .map(([key, value]) => [`address_${key}`, value])
        )),
        
        // Metadata
        _layerName: parcelWfsData ? "Parcel (WFS + related)" : "Parcel (Combined)",
        _coordinates: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        _featureType: (parcelWfsData?.geometry || parcelData?.geometry || parcelGeometry)?.type || "Polygon",
        _dataLayers: [
          parcelWfsData && "",
          parcelData && "",
          zoningData && "",
          landUseData && "",
          addressData && ""
        ].filter(Boolean).join(", "),
      };

      console.log("Combined parcel data:", {
        parcel: !!parcelData || !!parcelWfsData,
        zoning: !!zoningData,
        landUse: !!landUseData,
        address: !!addressData,
      });

      return {
        geometry: parcelWfsData?.geometry || parcelData?.geometry || parcelGeometry,
        properties: combinedProperties,
      };
    }, [fetchParcelFeatureByPoint, queryFeatureInfo, convertGeoJSONToWKT]);

    // Function to update municipality layer with new CQL filter
    const updateMunicipalityLayerFilter = useCallback((cqlFilter) => {
      if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

      const viewer = viewerRef.current;
      const imageryLayers = viewer.imageryLayers;

      // Find the municipalities layer in our ref
      const layerIndex = layersRef.current.findIndex(
        (l) => l.config.name === LAYER_NAMES.ALL_MUNICIPALITIES
      );
      if (layerIndex === -1) {
        console.warn("Municipality layer not found in layersRef");
        return;
      }

      const layerEntry = layersRef.current[layerIndex];
      const config = layerEntry.config;

      // Find and remove the old layer from Cesium's imagery layers
      let cesiumLayerIndex = -1;
      if (layerEntry.cesiumLayer) {
        cesiumLayerIndex = imageryLayers.indexOf(layerEntry.cesiumLayer);
        if (cesiumLayerIndex !== -1) {
          imageryLayers.remove(layerEntry.cesiumLayer, false);
        }
      }

      // Create new provider with updated CQL filter
      const parameters = {
        service: "WMS",
        version: "1.1.1",
        format: "image/png",
        transparent: "true",
        tiled: "true",
        tilesOrigin: "-180,-90",
        styles: "",
      };

      // Add CQL_FILTER if provided
      if (cqlFilter) {
        parameters.CQL_FILTER = cqlFilter;
      }

      const provider = new Cesium.WebMapServiceImageryProvider({
        url: GEOSERVER_CONFIG.wmsUrl,
        layers: `${GEOSERVER_CONFIG.workspace}:${config.name}`,
        parameters,
        enablePickFeatures: true,
      });
      
      // Debug: Log the WMS request details
      console.log(`WMS Layer: ${GEOSERVER_CONFIG.workspace}:${config.name}`);
      console.log(`WMS URL: ${GEOSERVER_CONFIG.wmsUrl}`);
      console.log(`CQL Filter: ${parameters.CQL_FILTER || 'none'}`);

      // Add the new layer - use the Cesium layer index if we found it
      const cesiumLayer =
        cesiumLayerIndex !== -1
          ? imageryLayers.addImageryProvider(provider, cesiumLayerIndex)
          : imageryLayers.addImageryProvider(provider);

      cesiumLayer.alpha = config.opacity;
      cesiumLayer.show = true; // Always show after filter update

      // Update the reference
      layersRef.current[layerIndex] = { config, cesiumLayer, provider };
      currentCqlFilterRef.current = cqlFilter;

      console.log(
        `Municipality layer CQL filter updated: ${
          cqlFilter || "none"
        }, visible: ${cesiumLayer.show}, alpha: ${cesiumLayer.alpha}`
      );
      
      // Force scene to render with new layer and invalidate tile cache
      if (viewer && !viewer.isDestroyed()) {
        // Invalidate all tiles to force reload with new filter
        if (cesiumLayer.imageryProvider && cesiumLayer.imageryProvider._reload) {
          cesiumLayer.imageryProvider._reload();
        }
        viewer.scene.requestRender();
        // Additional render request after a short delay to ensure tiles are fetched
        setTimeout(() => {
          if (viewer && !viewer.isDestroyed()) {
            viewer.scene.requestRender();
          }
        }, 100);
      }
      
      // Test: Query GeoServer to verify the filter returns features
      if (cqlFilter) {
        const testUrl = `${GEOSERVER_CONFIG.wfsUrl}?service=WFS&version=1.1.0&request=GetFeature&typeName=${GEOSERVER_CONFIG.workspace}:${config.name}&outputFormat=application/json&CQL_FILTER=${encodeURIComponent(cqlFilter)}&maxFeatures=10`;
        console.log('Testing WFS query:', testUrl);
        fetch(testUrl)
          .then(r => r.json())
          .then(data => {
            console.log(`WFS Test Result: Found ${data.features?.length || 0} features with filter: ${cqlFilter}`);
            if (data.features && data.features.length > 0) {
              console.log('Sample features:', data.features.map(f => f.properties?.admin_name || f.properties?.name).slice(0, 5));
            } else {
              console.warn('⚠️ NO FEATURES RETURNED - Check if parent_name matches exactly in database!');
            }
          })
          .catch(e => console.error('WFS test failed:', e));
      }
    }, []);

    // Function to update parcels layer with CQL filter based on municipality ID
    const updateParcelsLayerFilter = useCallback((municipalityId) => {
      if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

      const viewer = viewerRef.current;
      const imageryLayers = viewer.imageryLayers;

      // Find the parcels layer
      const layerIndex = layersRef.current.findIndex(
        (l) => l.config.name === LAYER_NAMES.PARCELS
      );
      if (layerIndex === -1) {
        console.warn("Parcels layer not found");
        return;
      }

      const layerEntry = layersRef.current[layerIndex];
      const config = layerEntry.config;

      // Remove the old layer
      if (layerEntry.cesiumLayer) {
        imageryLayers.remove(layerEntry.cesiumLayer, false);
      }

      // Create new provider with CQL filter for municipality
      const parameters = {
        service: "WMS",
        version: "1.1.1",
        format: "image/png",
        transparent: "true",
        tiled: "true",
        tilesOrigin: "-180,-90",
        styles: "",
      };

      // Add CQL_FILTER if municipalityId is provided
      // Note: Parcels can have either lower_tier_id or single_tier_id
      if (municipalityId) {
        parameters.CQL_FILTER = `(lower_tier_id = '${municipalityId}' OR single_tier_id = '${municipalityId}')`;
        console.log(
          `Applying parcels CQL filter for municipality: ${municipalityId}`
        );
      }

      const provider = new Cesium.WebMapServiceImageryProvider({
        url: GEOSERVER_CONFIG.wmsUrl,
        layers: `${GEOSERVER_CONFIG.workspace}:${config.name}`,
        parameters,
        enablePickFeatures: true,
      });

      // Add the new layer at the same position
      const cesiumLayer = imageryLayers.addImageryProvider(
        provider,
        layerIndex
      );
      cesiumLayer.alpha = config.opacity;
      cesiumLayer.show = municipalityId ? true : false; // Show only when filtered

      // Update the reference
      layersRef.current[layerIndex] = { config, cesiumLayer, provider };
      selectedDivisionIdRef.current = municipalityId;

      console.log(
        `Parcels layer updated with municipality_id: ${municipalityId || "none"}`
      );
    }, []);

    // Function to update wards layer with CQL filter based on municipality ID
    const updateWardsLayerFilter = useCallback((municipalityId, show = true) => {
      if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

      const viewer = viewerRef.current;
      const imageryLayers = viewer.imageryLayers;

      // Find the wards layer
      const layerIndex = layersRef.current.findIndex(
        (l) => l.config.name === LAYER_NAMES.WARDS
      );
      if (layerIndex === -1) {
        console.warn("Wards layer not found");
        return;
      }

      const layerEntry = layersRef.current[layerIndex];
      const config = layerEntry.config;

      // Find and remove the old layer
      let cesiumLayerIndex = -1;
      if (layerEntry.cesiumLayer) {
        cesiumLayerIndex = imageryLayers.indexOf(layerEntry.cesiumLayer);
        if (cesiumLayerIndex !== -1) {
          imageryLayers.remove(layerEntry.cesiumLayer, false);
        }
      }

      // Create new provider with CQL filter
      const parameters = {
        service: "WMS",
        version: "1.1.1",
        format: "image/png",
        transparent: "true",
        tiled: "true",
        tilesOrigin: "-180,-90",
        styles: "",
      };

      // Add CQL_FILTER using lower_tier_id or single_tier_id
      if (municipalityId && show) {
        parameters.CQL_FILTER = `(lower_tier_id = '${municipalityId}' OR single_tier_id = '${municipalityId}')`;
        console.log(`Applying wards CQL filter for municipality: ${municipalityId}`);
      }

      const provider = new Cesium.WebMapServiceImageryProvider({
        url: GEOSERVER_CONFIG.wmsUrl,
        layers: `${GEOSERVER_CONFIG.workspace}:${config.name}`,
        parameters,
        enablePickFeatures: true,
      });

      // Add the new layer
      const cesiumLayer =
        cesiumLayerIndex !== -1
          ? imageryLayers.addImageryProvider(provider, cesiumLayerIndex)
          : imageryLayers.addImageryProvider(provider);

      cesiumLayer.alpha = config.opacity;
      cesiumLayer.show = show && municipalityId ? true : false;

      // Update the reference
      layersRef.current[layerIndex] = { config, cesiumLayer, provider };

      console.log(
        `Wards layer updated for municipality_id: ${municipalityId || "none"}, visible: ${
          cesiumLayer.show
        }`
      );
    }, []);

    // Function to hide/show municipalities layer
    const setMunicipalitiesLayerVisible = useCallback((visible) => {
      const layerEntry = layersRef.current.find(
        (l) => l.config.name === LAYER_NAMES.ALL_MUNICIPALITIES
      );
      if (layerEntry && layerEntry.cesiumLayer) {
        layerEntry.cesiumLayer.show = visible;
        console.log(`Municipalities layer visibility: ${visible}`);
      }
    }, []);

    // Function to update lower_tier layer with CQL filter based on upper_tier_id
    const updateLowerTierLayerFilter = useCallback((cqlFilter, show = true) => {
      if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

      const viewer = viewerRef.current;
      const imageryLayers = viewer.imageryLayers;

      // Find the lower_tier layer
      const layerIndex = layersRef.current.findIndex(
        (l) => l.config.name === LAYER_NAMES.LOWER_TIER
      );
      if (layerIndex === -1) {
        console.warn("Lower tier layer not found");
        return;
      }

      const layerEntry = layersRef.current[layerIndex];
      const config = layerEntry.config;

      // Find and remove the old layer
      let cesiumLayerIndex = -1;
      if (layerEntry.cesiumLayer) {
        cesiumLayerIndex = imageryLayers.indexOf(layerEntry.cesiumLayer);
        if (cesiumLayerIndex !== -1) {
          imageryLayers.remove(layerEntry.cesiumLayer, false);
        }
      }

      // Create new provider with CQL filter
      const parameters = {
        service: "WMS",
        version: "1.1.1",
        format: "image/png",
        transparent: "true",
        tiled: "true",
        tilesOrigin: "-180,-90",
        styles: "",
      };

      if (cqlFilter) {
        parameters.CQL_FILTER = cqlFilter;
      }

      const provider = new Cesium.WebMapServiceImageryProvider({
        url: GEOSERVER_CONFIG.wmsUrl,
        layers: `${GEOSERVER_CONFIG.workspace}:${config.name}`,
        parameters,
        enablePickFeatures: true,
      });

      // Debug logging
      console.log(`Lower Tier WMS Layer: ${GEOSERVER_CONFIG.workspace}:${config.name}`);
      console.log(`CQL Filter: ${parameters.CQL_FILTER || 'none'}`);

      // Add the new layer
      const cesiumLayer =
        cesiumLayerIndex !== -1
          ? imageryLayers.addImageryProvider(provider, cesiumLayerIndex)
          : imageryLayers.addImageryProvider(provider);

      cesiumLayer.alpha = config.opacity;
      cesiumLayer.show = show;

      // Update the reference
      layersRef.current[layerIndex] = { config, cesiumLayer, provider };

      console.log(
        `Lower tier layer updated with filter: ${cqlFilter || "none"}, visible: ${cesiumLayer.show}`
      );

      // Force render
      if (viewer && !viewer.isDestroyed()) {
        viewer.scene.requestRender();
      }

      // Test WFS query
      if (cqlFilter) {
        const testUrl = `${GEOSERVER_CONFIG.wfsUrl}?service=WFS&version=1.1.0&request=GetFeature&typeName=${GEOSERVER_CONFIG.workspace}:${config.name}&outputFormat=application/json&CQL_FILTER=${encodeURIComponent(cqlFilter)}&maxFeatures=10`;
        console.log('Testing Lower Tier WFS query:', testUrl);
        fetch(testUrl)
          .then(r => r.json())
          .then(data => {
            console.log(`Lower Tier WFS Result: Found ${data.features?.length || 0} features`);
            if (data.features && data.features.length > 0) {
              console.log('Lower tier municipalities:', data.features.map(f => f.properties?.admin_name || f.properties?.name).slice(0, 5));
            } else {
              console.warn('⚠️ NO LOWER TIER FEATURES RETURNED');
            }
          })
          .catch(e => console.error('Lower tier WFS test failed:', e));
      }
    }, []);

    const switchLayerContext = useCallback((tierType, municipalityKey) => {
      console.log(
        `Switching context - Tier: ${tierType}, Municipality: ${municipalityKey}`
      );

      layersRef.current.forEach(({ config, cesiumLayer }) => {
        if (!cesiumLayer) return;

        if (tierType === "upper_tier") {
          // REGION VIEW: Show only municipalities layer (filtered to children via parent_id)
          if (config.category === "admin") {
            if (config.name === LAYER_NAMES.ALL_MUNICIPALITIES) {
              // Show municipalities layer (will be filtered by parent_id)
              cesiumLayer.show = true;
              cesiumLayer.alpha = config.opacity;
              console.log(`Showing all_municipalities layer: ${config.name}`);
            } else {
              // Hide wards and other admin layers
              cesiumLayer.show = false;
            }
          } else {
            // Hide all non-admin layers
            cesiumLayer.show = false;
          }
        } else if (tierType === "lower_tier" || tierType === "single_tier") {
          // MUNICIPALITY VIEW: Show parcels and municipality-specific layers
          if (config.category === "admin") {
            // Keep boundaries visible but dimmed
            cesiumLayer.show = true;
            cesiumLayer.alpha =
              config.name === LAYER_NAMES.ALL_MUNICIPALITIES ? 0.2 : 0.3;
          } else if (config.category === "parcels") {
            // Always show parcels at this level
            cesiumLayer.show = true;
            cesiumLayer.alpha = config.opacity;
          } else if (
            config.municipality === municipalityKey ||
            config.municipality === "all"
          ) {
            // Show only layers matching this municipality
            cesiumLayer.show = config.visible || false;
            cesiumLayer.alpha = config.opacity;
          } else {
            cesiumLayer.show = false;
          }
        }
      });
    }, []);

    const resetToOverview = useCallback(() => {
      console.log("Resetting to overview...");
      setViewLevel(VIEW_LEVELS.OVERVIEW);
      setCurrentMunicipality(null);
      setCurrentRegion(null);
      setViewHierarchy([]);
      setSelectedFeature(null);

      // Clear any parcel highlight
      if (viewerRef.current && highlightEntityRef.current) {
        viewerRef.current.entities.remove(highlightEntityRef.current);
        highlightEntityRef.current = null;
      }

      // Reset municipality layer CQL filter to initial state
      // (show only UpperTier and SingleTier)
      updateMunicipalityLayerFilter(CQL_FILTERS.INITIAL);

      // Clear parcels filter (hide parcels at overview level)
      updateParcelsLayerFilter(null);

      // Hide wards layer
      updateWardsLayerFilter(null, false);

      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        // Force a render to ensure the new layer tiles are requested
        viewerRef.current.scene.requestRender();

        viewerRef.current.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            INITIAL_CAMERA.longitude,
            INITIAL_CAMERA.latitude,
            INITIAL_CAMERA.height
          ),
          orientation: new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(INITIAL_CAMERA.heading),
            Cesium.Math.toRadians(INITIAL_CAMERA.pitch),
            Cesium.Math.toRadians(INITIAL_CAMERA.roll)
          ),
          duration: 2.0,
        });
      }
    }, [
      updateMunicipalityLayerFilter,
      updateParcelsLayerFilter,
      updateWardsLayerFilter,
    ]);

    const drillDownToMunicipality = useCallback(
      async (municipalityData) => {
        let { name, type, id, geometry } = municipalityData;
        const normalizedName = name.toLowerCase().trim();

        console.log(`Drilling down to: ${name} (Type: ${type})`);

        // Find configuration
        let targetConfig = null;
        for (const [key, config] of Object.entries(MUNICIPALITY_CONFIG)) {
          if (normalizedName.includes(key) || key.includes(normalizedName)) {
            targetConfig = config;
            break;
          }
        }

        if (!targetConfig) {
          // Use default based on type
          targetConfig = {
            lat: 44.0,
            lon: -79.6,
            height:
              type === "upper_tier"
                ? 150000
                : type === "single_tier"
                ? 80000
                : 35000,
            type: type,
          };
        }

        // If geometry is missing, fetch it via WFS
        if (!geometry) {
          try {
            console.log(`Fetching geometry for: ${name} (${type})`);
            const wfsParams = new URLSearchParams({
              service: "WFS",
              version: "1.1.0",
              request: "GetFeature",
              typeName: `${GEOSERVER_CONFIG.workspace}:${LAYER_NAMES.ALL_MUNICIPALITIES}`,
              outputFormat: "application/json",
              CQL_FILTER: `admin_name = '${name.replace(/'/g, "''")}' AND tier_type = '${type}'`,
              srsName: GEOSERVER_CONFIG.srs,
            });
            const wfsUrl = `${GEOSERVER_CONFIG.wfsUrl}?${wfsParams.toString()}`;
            const wfsResponse = await fetch(wfsUrl);
            const wfsData = await wfsResponse.json();
            if (wfsData.features && wfsData.features.length > 0) {
              geometry = wfsData.features[0].geometry;
              console.log(`Fetched geometry for ${name}:`, geometry?.type);
            }
          } catch (wfsError) {
            console.warn("Failed to fetch geometry via WFS:", wfsError);
          }
        }
        
        // For upper_tier, also fetch the collective bounds of all lower_tier children to fit better
        if (type === "upper_tier" && !geometry) {
          try {
            console.log(`Fetching collective bounds of lower_tier children for: ${name}`);
            const wfsParams = new URLSearchParams({
              service: "WFS",
              version: "1.1.0",
              request: "GetFeature",
              typeName: `${GEOSERVER_CONFIG.workspace}:${LAYER_NAMES.ALL_MUNICIPALITIES}`,
              outputFormat: "application/json",
              CQL_FILTER: `tier_type = 'lower_tier' AND parent_name = '${name.replace(/'/g, "''")}'`,
              srsName: GEOSERVER_CONFIG.srs,
            });
            const wfsUrl = `${GEOSERVER_CONFIG.wfsUrl}?${wfsParams.toString()}`;
            const wfsResponse = await fetch(wfsUrl);
            const wfsData = await wfsResponse.json();
            
            if (wfsData.features && wfsData.features.length > 0) {
              // Calculate collective bounds from all children
              let minLon = Infinity, maxLon = -Infinity;
              let minLat = Infinity, maxLat = -Infinity;
              
              wfsData.features.forEach(feature => {
                if (feature.geometry && feature.geometry.coordinates) {
                  let coords = [];
                  if (feature.geometry.type === "Polygon") {
                    coords = feature.geometry.coordinates[0] || [];
                  } else if (feature.geometry.type === "MultiPolygon") {
                    feature.geometry.coordinates.forEach(polygon => {
                      if (polygon && polygon[0]) {
                        coords = coords.concat(polygon[0]);
                      }
                    });
                  }
                  
                  coords.forEach(coord => {
                    minLon = Math.min(minLon, coord[0]);
                    maxLon = Math.max(maxLon, coord[0]);
                    minLat = Math.min(minLat, coord[1]);
                    maxLat = Math.max(maxLat, coord[1]);
                  });
                }
              });
              
              if (minLon !== Infinity) {
                // Create a bounding box polygon from children
                console.log(`Calculated collective bounds for ${name}:`, { minLon, minLat, maxLon, maxLat });
                geometry = {
                  type: "Polygon",
                  coordinates: [[
                    [minLon, minLat],
                    [maxLon, minLat],
                    [maxLon, maxLat],
                    [minLon, maxLat],
                    [minLon, minLat]
                  ]]
                };
              }
            }
          } catch (wfsError) {
            console.warn("Failed to fetch children bounds:", wfsError);
          }
        }

        // Update hierarchy based on tier type
        if (type === "upper_tier") {
          setViewLevel(VIEW_LEVELS.REGION);
          setCurrentRegion(normalizedName);
          setCurrentMunicipality(null);
          const newHierarchy = [{ name, type, id }];
          console.log("Setting upper_tier hierarchy:", newHierarchy);
          setViewHierarchy(newHierarchy);

          // For upper_tier: Show all_municipalities layer filtered by parent_id = municipality_id
          if (id) {
            console.log(`Showing children with parent_id: ${id}`);
            // Show the all_municipalities layer filtered by this municipality's ID as parent_id
            const childrenFilter = CQL_FILTERS.regionDrillDown(id);
            updateMunicipalityLayerFilter(childrenFilter);
            setMunicipalitiesLayerVisible(true);
          } else {
            console.error('⚠️ Cannot drill down: municipality_id is missing!');
            console.log('Municipality data:', { name, type, id, geometry });
          }

          // Immediately switch layer context to show lower_tier municipalities
          switchLayerContext(type, normalizedName);
          
          // Debug: Log all layer states after context switch
          console.log('Layer states after upper_tier drill-down:');
          layersRef.current.forEach(({ config, cesiumLayer }) => {
            if (cesiumLayer) {
              console.log(`  ${config.name}: show=${cesiumLayer.show}, alpha=${cesiumLayer.alpha}`);
            }
          });

          // Hide wards - upper_tier does NOT show wards, only lower_tier municipalities
          updateWardsLayerFilter(null, false);

          // Hide parcels at region level
          updateParcelsLayerFilter(null);
        } else if (type === "lower_tier") {
          setViewLevel(VIEW_LEVELS.MUNICIPALITY);
          setCurrentMunicipality(normalizedName);

          // Filter parcels to show only this municipality's parcels
          if (id) {
            updateParcelsLayerFilter(id);
          }

          if (currentRegion) {
            // Keep parent region in hierarchy
            setViewHierarchy((prev) => {
              const newHierarchy = [...prev, { name, type, id }];
              console.log("Adding lower_tier to hierarchy:", newHierarchy);
              return newHierarchy;
            });
          } else {
            // Direct navigation without going through region
            const newHierarchy = [{ name, type, id }];
            console.log(
              "Setting lower_tier hierarchy (no parent):",
              newHierarchy
            );
            setViewHierarchy(newHierarchy);
          }
        } else if (type === "single_tier") {
          setViewLevel(VIEW_LEVELS.MUNICIPALITY);
          setCurrentMunicipality(normalizedName);

          // Hide municipalities layer completely
          setMunicipalitiesLayerVisible(false);

          // Show wards for this single_tier municipality (using id as parent_id)
          if (id) {
            updateWardsLayerFilter(id, true);
          }

          // Filter parcels to show only this municipality's parcels
          if (id) {
            updateParcelsLayerFilter(id);
          }

          const newHierarchy = [{ name, type, id }];
          console.log("Setting single_tier hierarchy:", newHierarchy);
          setViewHierarchy(newHierarchy);
        }

        // Fly to location - use geometry bounds if available for better fit
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          let flyToOptions;

          console.log(
            "Fly to municipality - geometry available:",
            !!geometry,
            geometry?.type
          );

          // Try to use geometry for bounding box calculation
          if (
            geometry &&
            geometry.coordinates &&
            geometry.coordinates.length > 0
          ) {
            try {
              let allCoords = [];

              // Extract all coordinates based on geometry type
              if (geometry.type === "Polygon") {
                allCoords = geometry.coordinates[0] || [];
              } else if (geometry.type === "MultiPolygon") {
                geometry.coordinates.forEach((polygon) => {
                  if (polygon && polygon[0]) {
                    allCoords = allCoords.concat(polygon[0]);
                  }
                });
              }

              console.log("Extracted coordinates count:", allCoords.length);

              if (allCoords.length > 0) {
                // Calculate bounding box
                let minLon = Infinity,
                  maxLon = -Infinity;
                let minLat = Infinity,
                  maxLat = -Infinity;

                allCoords.forEach((coord) => {
                  minLon = Math.min(minLon, coord[0]);
                  maxLon = Math.max(maxLon, coord[0]);
                  minLat = Math.min(minLat, coord[1]);
                  maxLat = Math.max(maxLat, coord[1]);
                });

                console.log("Calculated bounds:", {
                  minLon,
                  minLat,
                  maxLon,
                  maxLat,
                });

                // Create a rectangle for the bounds
                const rectangle = Cesium.Rectangle.fromDegrees(
                  minLon,
                  minLat,
                  maxLon,
                  maxLat
                );

                console.log("Flying to rectangle bounds for:", name);

                flyToOptions = {
                  destination: rectangle,
                  orientation: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-90),
                    roll: 0,
                  },
                  duration: 2.5,
                };
              }
            } catch (e) {
              console.warn("Failed to calculate geometry bounds:", e);
            }
          }

          // Fallback to configured coordinates if geometry bounds not available
          if (!flyToOptions) {
            console.log("Using fallback coordinates for:", name);
            flyToOptions = {
              destination: Cesium.Cartesian3.fromDegrees(
                targetConfig.lon,
                targetConfig.lat,
                targetConfig.height
              ),
              orientation: new Cesium.HeadingPitchRoll(
                Cesium.Math.toRadians(0),
                Cesium.Math.toRadians(-90),
                0
              ),
              duration: 2.5,
            };
          }

          // For lower_tier and single_tier, call switchLayerContext after fly completes
          if (type === "lower_tier" || type === "single_tier") {
            const originalComplete = flyToOptions.complete;
            flyToOptions.complete = () => {
              if (originalComplete) originalComplete();
              switchLayerContext(type, normalizedName);
            };
          }

          viewerRef.current.camera.flyTo(flyToOptions);
        }

        if (onMunicipalityClick) {
          onMunicipalityClick(normalizedName, targetConfig);
        }
      },
      [
        currentRegion,
        onMunicipalityClick,
        switchLayerContext,
        updateMunicipalityLayerFilter,
        updateParcelsLayerFilter,
        updateWardsLayerFilter,
        setMunicipalitiesLayerVisible,
      ]
    );

    // Keep functionsRef updated with latest function references
    functionsRef.current = {
      queryMunicipality,
      queryFeatureInfo,
      queryParcelWithRelatedData,
      drillDownToMunicipality,
    };

    // Helper function to clear any existing highlight
    const clearParcelHighlight = useCallback(() => {
      if (viewerRef.current && highlightEntityRef.current) {
        viewerRef.current.entities.remove(highlightEntityRef.current);
        highlightEntityRef.current = null;
      }
    }, []);

    // Helper function to create parcel highlight from GeoJSON geometry
    const highlightParcelGeometry = useCallback(
      (geometry) => {
        if (!viewerRef.current || !geometry) return;

        clearParcelHighlight();

        const viewer = viewerRef.current;

        try {
          let positions = [];

          if (geometry.type === "Polygon") {
            // Get the outer ring
            const coords = geometry.coordinates[0];
            positions = coords.map((coord) =>
              Cesium.Cartesian3.fromDegrees(coord[0], coord[1])
            );
          } else if (geometry.type === "MultiPolygon") {
            // Use the first polygon for simplicity
            const coords = geometry.coordinates[0][0];
            positions = coords.map((coord) =>
              Cesium.Cartesian3.fromDegrees(coord[0], coord[1])
            );
          } else if (geometry.type === "Point") {
            // For points, create a circle marker
            const [lon, lat] = geometry.coordinates;
            highlightEntityRef.current = viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(lon, lat),
              point: {
                pixelSize: 16,
                color: Cesium.Color.fromCssColorString("#ef4444"),
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 3,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              },
            });
            return;
          }

          if (positions.length > 0) {
            const boundaryColor = Cesium.Color.fromCssColorString("#ef4444");
            const outlineColor = Cesium.Color.fromCssColorString("#b91c1c");
            highlightEntityRef.current = viewer.entities.add({
              polygon: {
                hierarchy: new Cesium.PolygonHierarchy(positions),
                material: boundaryColor.withAlpha(0.18),
                outline: true,
                outlineColor,
                outlineWidth: 2.5,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              },
              polyline: {
                positions: positions,
                width: 4,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.25,
                  color: boundaryColor,
                }),
                clampToGround: true,
              },
            });
          }
        } catch (error) {
          console.error("Error highlighting parcel:", error);
        }
      },
      [clearParcelHighlight]
    );

    useImperativeHandle(ref, () => ({
      flyToLocation: (longitude, latitude, altitude = 50000) => {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              altitude
            ),
            orientation: new Cesium.HeadingPitchRoll(
              Cesium.Math.toRadians(0),
              Cesium.Math.toRadians(-90),
              0
            ),
            duration: 2.5,
          });
        }
      },

      toggleLayer: (layerId, visible) => {
        const layerObj = layersRef.current.find(l => l.config.id === layerId || l.config.name === layerId);
        if (layerObj && layerObj.cesiumLayer) {
          layerObj.cesiumLayer.show = visible;
        }
      },

      // Fly to a parcel with beautiful animation and boundary highlighting
      flyToParcel: (parcelData) => {
        if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

        const viewer = viewerRef.current;
        const { bbox, geometry, properties } = parcelData;

        // Calculate target position
        let targetLon, targetLat, targetHeight;

        if (bbox && bbox.length === 4) {
          const [minX, minY, maxX, maxY] = bbox;
          targetLon = (minX + maxX) / 2;
          targetLat = (minY + maxY) / 2;

          // Calculate height based on parcel size
          const latSpan = maxY - minY;
          const lonSpan = maxX - minX;
          const maxSpan = Math.max(latSpan, lonSpan);
          // Adjust height: smaller parcels = lower altitude for better view
          targetHeight = Math.max(200, Math.min(5000, maxSpan * 100000));
        } else if (geometry && geometry.coordinates) {
          // Fallback: calculate from geometry
          if (geometry.type === "Point") {
            [targetLon, targetLat] = geometry.coordinates;
            targetHeight = 500;
          } else {
            // Get centroid from polygon
            const coords =
              geometry.type === "Polygon"
                ? geometry.coordinates[0]
                : geometry.coordinates[0][0];

            let sumLon = 0,
              sumLat = 0;
            coords.forEach((c) => {
              sumLon += c[0];
              sumLat += c[1];
            });
            targetLon = sumLon / coords.length;
            targetLat = sumLat / coords.length;
            targetHeight = 800;
          }
        } else {
          console.warn("No valid bbox or geometry for parcel");
          return;
        }

        // Set view level to parcel
        setViewLevel(VIEW_LEVELS.PARCEL);

        // Beautiful multi-stage fly animation
        // Stage 1: Fly to an overview position first (if far away)
        const currentHeight = viewer.camera.positionCartographic.height;

        if (currentHeight > 50000) {
          // Two-stage animation for long distances
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              targetLon,
              targetLat,
              15000
            ),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-90),
              roll: 0,
            },
            duration: 2.0,
            complete: () => {
              // Stage 2: Zoom in close - top-down view
              viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                  targetLon,
                  targetLat,
                  targetHeight
                ),
                orientation: {
                  heading: Cesium.Math.toRadians(0),
                  pitch: Cesium.Math.toRadians(-90),
                  roll: 0,
                },
                duration: 1.5,
                complete: () => {
                  // Highlight the parcel after animation completes
                  if (geometry) {
                    highlightParcelGeometry(geometry);
                  }
                },
              });
            },
          });
        } else {
          // Single smooth animation for nearby locations - top-down view
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              targetLon,
              targetLat,
              targetHeight
            ),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-90),
              roll: 0,
            },
            duration: 2.0,
            complete: () => {
              if (geometry) {
                highlightParcelGeometry(geometry);
              }
            },
          });
        }

        // Also set the selected feature for the info panel
        if (properties) {
          const featureData = {
            properties: {
              ...properties,
              _layerName: "parcel_search",
              _featureType: geometry?.type || "Polygon",
            },
            geometry,
          };
          setSelectedFeature(featureData);
          if (callbacksRef.current.onWMSFeatureClick) {
            callbacksRef.current.onWMSFeatureClick(featureData);
          }
        }
      },

      clearParcelHighlight,

      drillDownToMunicipality,
      resetToOverview,

      getCurrentMunicipality: () => currentMunicipality,
      getCurrentRegion: () => currentRegion,
      getViewLevel: () => viewLevel,
      getViewHierarchy: () => viewHierarchy,

      toggleLayer: (layerName, visible) => {
        const layerEntry = layersRef.current.find(
          (l) => l.config.name === layerName
        );
        if (layerEntry && layerEntry.cesiumLayer) {
          layerEntry.cesiumLayer.show = visible;
          // Request render after layer visibility change
          if (viewerRef.current && !viewerRef.current.isDestroyed()) {
            viewerRef.current.scene.requestRender();
          }
        }
      },

      setLayerOpacity: (layerName, opacity) => {
        const layerEntry = layersRef.current.find(
          (l) => l.config.name === layerName
        );
        if (layerEntry && layerEntry.cesiumLayer) {
          layerEntry.cesiumLayer.alpha = opacity;
        }
      },

      // Zoom controls
      zoomIn: () => {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          const camera = viewerRef.current.camera;
          const currentHeight = camera.positionCartographic.height;
          const newHeight = currentHeight * 0.5; // Zoom in by 50%

          const currentPosition = camera.positionCartographic;
          camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              Cesium.Math.toDegrees(currentPosition.longitude),
              Cesium.Math.toDegrees(currentPosition.latitude),
              newHeight
            ),
            duration: 0.5,
          });
        }
      },

      zoomOut: () => {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          const camera = viewerRef.current.camera;
          const currentHeight = camera.positionCartographic.height;
          const newHeight = currentHeight * 2.0; // Zoom out by 2x

          const currentPosition = camera.positionCartographic;
          camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              Cesium.Math.toDegrees(currentPosition.longitude),
              Cesium.Math.toDegrees(currentPosition.latitude),
              newHeight
            ),
            duration: 0.5,
          });
        }
      },

      resetView: () => {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          const camera = viewerRef.current.camera;
          const currentPosition = camera.positionCartographic;

          camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              Cesium.Math.toDegrees(currentPosition.longitude),
              Cesium.Math.toDegrees(currentPosition.latitude),
              currentPosition.height
            ),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-90),
              roll: 0,
            },
            duration: 1.0,
          });
        }
      },

      // Measurement functionality
      startMeasurement: (type, measurementId = null, measurementName = null) => {
        if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

        const viewer = viewerRef.current;
        const scene = viewer.scene;
        let screenSpaceEventHandler = null;

        // Store entities in state ref so cleanup can access them
        if (!measurementStateRef.current) {
          measurementStateRef.current = {};
        }
        measurementStateRef.current.points = [];
        measurementStateRef.current.pointEntities = [];
        measurementStateRef.current.measurementEntity = null;
        measurementStateRef.current.labelEntity = null;
        measurementStateRef.current.nameLabel = null;

        // Store reference for cancellation
        const cleanupMeasurement = () => {
          if (!measurementStateRef.current) return;

          // Remove all point entities
          if (measurementStateRef.current.pointEntities) {
            measurementStateRef.current.pointEntities.forEach(e => {
              if (e && !e.isDestroyed) viewer.entities.remove(e);
            });
          }

          // Remove measurement entity
          if (measurementStateRef.current.measurementEntity && !measurementStateRef.current.measurementEntity.isDestroyed) {
            viewer.entities.remove(measurementStateRef.current.measurementEntity);
          }

          // Remove label entities
          if (measurementStateRef.current.labelEntity && !measurementStateRef.current.labelEntity.isDestroyed) {
            viewer.entities.remove(measurementStateRef.current.labelEntity);
          }

          if (measurementStateRef.current.nameLabel && !measurementStateRef.current.nameLabel.isDestroyed) {
            viewer.entities.remove(measurementStateRef.current.nameLabel);
          }

          // Destroy event handler
          if (screenSpaceEventHandler && !screenSpaceEventHandler.isDestroyed()) {
            screenSpaceEventHandler.destroy();
            screenSpaceEventHandler = null;
          }
        };

        measurementStateRef.current.cleanup = cleanupMeasurement;

        // Helper function to calculate distance
        const calculateDistance = (positions) => {
          let totalDistance = 0;
          for (let i = 0; i < positions.length - 1; i++) {
            const cartographic1 = Cesium.Cartographic.fromCartesian(positions[i]);
            const cartographic2 = Cesium.Cartographic.fromCartesian(positions[i + 1]);

            const geodesic = new Cesium.EllipsoidGeodesic(
              cartographic1,
              cartographic2
            );
            totalDistance += geodesic.surfaceDistance;
          }
          return totalDistance;
        };

        // Helper function to calculate area
        const calculateArea = (positions) => {
          if (positions.length < 3) return 0;

          // Convert to cartographic
          const cartographics = positions.map(pos =>
            Cesium.Cartographic.fromCartesian(pos)
          );

          // Simple spherical excess formula for area on ellipsoid
          let area = 0;
          const n = cartographics.length;

          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const lon1 = cartographics[i].longitude;
            const lat1 = cartographics[i].latitude;
            const lon2 = cartographics[j].longitude;
            const lat2 = cartographics[j].latitude;

            area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
          }

          area = Math.abs(area * Cesium.Ellipsoid.WGS84.maximumRadius * Cesium.Ellipsoid.WGS84.maximumRadius / 2.0);

          return area;
        };

        // Helper function to format distance
        const formatDistance = (meters) => {
          if (meters < 1000) {
            return `${meters.toFixed(2)} M`;
          } else {
            return `${(meters / 1000).toFixed(2)} KM`;
          }
        };

        // Helper function to format area
        const formatArea = (squareMeters) => {
          if (squareMeters < 10000) {
            return `${squareMeters.toFixed(2)} M2`;
          } else {
            return `${(squareMeters / 10000).toFixed(2)} HA`;
          }
        };

        // Click handler
        const clickHandler = (click) => {
          const cartesian = viewer.camera.pickEllipsoid(
            click.position,
            scene.globe.ellipsoid
          );

          if (cartesian) {
            measurementStateRef.current.points.push(cartesian);

            // Add point marker
            const pointEntity = viewer.entities.add({
              position: cartesian,
              point: {
                pixelSize: 8,
                color: Cesium.Color.YELLOW,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
              },
            });
            measurementStateRef.current.pointEntities.push(pointEntity);

            // Update measurement line/polygon
            if (type === 'distance') {
              if (measurementStateRef.current.points.length >= 2) {
                // Remove old entity
                if (measurementStateRef.current.measurementEntity) {
                  viewer.entities.remove(measurementStateRef.current.measurementEntity);
                }

                // Create polyline
                measurementStateRef.current.measurementEntity = viewer.entities.add({
                  polyline: {
                    positions: measurementStateRef.current.points,
                    width: 3,
                    material: Cesium.Color.YELLOW,
                    clampToGround: true,
                  },
                });

                // Calculate and display current distance
                const currentDistance = calculateDistance(measurementStateRef.current.points);
                const distanceText = formatDistance(currentDistance);
                const labelText = measurementName ? `${measurementName}\n${distanceText}` : distanceText;

                // Add/update label at the end of the line
                if (measurementStateRef.current.nameLabel) {
                  viewer.entities.remove(measurementStateRef.current.nameLabel);
                }
                measurementStateRef.current.nameLabel = viewer.entities.add({
                  position: measurementStateRef.current.points[measurementStateRef.current.points.length - 1],
                  label: {
                    text: labelText,
                    font: '14px sans-serif',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -10),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  },
                });
              }
            } else if (type === 'area') {
              if (measurementStateRef.current.points.length >= 3) {
                // Remove old entity
                if (measurementStateRef.current.measurementEntity) {
                  viewer.entities.remove(measurementStateRef.current.measurementEntity);
                }

                // Create polygon
                measurementStateRef.current.measurementEntity = viewer.entities.add({
                  polygon: {
                    hierarchy: measurementStateRef.current.points,
                    material: Cesium.Color.YELLOW.withAlpha(0.3),
                    outline: true,
                    outlineColor: Cesium.Color.YELLOW,
                    outlineWidth: 3,
                  },
                });

                // Calculate and display current area
                const currentArea = calculateArea(measurementStateRef.current.points);
                const areaText = formatArea(currentArea);
                const labelText = measurementName ? `${measurementName}\n${areaText}` : areaText;

                // Add/update label at the centroid of the polygon
                if (measurementStateRef.current.nameLabel) {
                  viewer.entities.remove(measurementStateRef.current.nameLabel);
                }
                // Calculate centroid
                const cartographics = measurementStateRef.current.points.map(p => Cesium.Cartographic.fromCartesian(p));
                const avgLon = cartographics.reduce((sum, c) => sum + c.longitude, 0) / cartographics.length;
                const avgLat = cartographics.reduce((sum, c) => sum + c.latitude, 0) / cartographics.length;
                const avgHeight = cartographics.reduce((sum, c) => sum + c.height, 0) / cartographics.length;
                const centroid = Cesium.Cartesian3.fromRadians(avgLon, avgLat, avgHeight);

                measurementStateRef.current.nameLabel = viewer.entities.add({
                  position: centroid,
                  label: {
                    text: labelText,
                    font: '14px sans-serif',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  },
                });
              }
            }

            scene.requestRender();
          }
        };

        // Double-click handler to finish measurement
        const dblClickHandler = () => {
          // Remove handlers
          screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
          screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

          if (measurementStateRef.current.points.length >= 2) {
            let value;
            if (type === 'distance') {
              const distance = calculateDistance(measurementStateRef.current.points);
              value = formatDistance(distance);
            } else {
              const area = calculateArea(measurementStateRef.current.points);
              value = formatArea(area);
            }

            // Return measurement data to parent
            const measurementData = {
              id: measurementId || Date.now().toString(),
              type,
              value,
              points: measurementStateRef.current.points,
              name: measurementName, // Include measurement name
              entities: [
                ...measurementStateRef.current.pointEntities,
                measurementStateRef.current.measurementEntity,
                measurementStateRef.current.labelEntity,
                measurementStateRef.current.nameLabel
              ].filter(Boolean),
            };

            // Trigger callback if provided
            if (callbacksRef.current.onMeasurementComplete) {
              callbacksRef.current.onMeasurementComplete(measurementData);
            }

            // Dispatch event for parent to catch
            window.dispatchEvent(new CustomEvent('measurementComplete', { detail: measurementData }));
          } else {
            // Clean up if not enough points
            cleanupMeasurement();
          }
        };

        // Set up event handlers
        screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        screenSpaceEventHandler.setInputAction(clickHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        screenSpaceEventHandler.setInputAction(dblClickHandler, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        
        // Store handler reference
        measurementStateRef.current.handler = screenSpaceEventHandler;
      },

      cancelMeasurement: () => {
        if (measurementStateRef.current?.cleanup) {
          measurementStateRef.current.cleanup();
          measurementStateRef.current = null;
        }
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.scene.requestRender();
        }
      },

      getViewer: () => viewerRef.current,

      // Start drawing a polygon on the map
      startDrawingPolygon: (onComplete) => {
        if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

        const viewer = viewerRef.current;
        const scene = viewer.scene;
        let screenSpaceEventHandler = null;

        // Initialize drawing state
        if (!polygonDrawingStateRef.current) {
          polygonDrawingStateRef.current = {};
        }
        polygonDrawingStateRef.current.points = [];
        polygonDrawingStateRef.current.pointEntities = [];
        polygonDrawingStateRef.current.lineEntity = null;
        polygonDrawingStateRef.current.polygonEntity = null;

        // Cleanup function
        const cleanupDrawing = () => {
          if (!polygonDrawingStateRef.current) return;

          // Remove all point entities
          if (polygonDrawingStateRef.current.pointEntities) {
            polygonDrawingStateRef.current.pointEntities.forEach(e => {
              if (e && !e.isDestroyed) viewer.entities.remove(e);
            });
          }

          // Remove line entity
          if (polygonDrawingStateRef.current.lineEntity && !polygonDrawingStateRef.current.lineEntity.isDestroyed) {
            viewer.entities.remove(polygonDrawingStateRef.current.lineEntity);
          }

          // Remove polygon entity
          if (polygonDrawingStateRef.current.polygonEntity && !polygonDrawingStateRef.current.polygonEntity.isDestroyed) {
            viewer.entities.remove(polygonDrawingStateRef.current.polygonEntity);
          }

          // Destroy event handler
          if (screenSpaceEventHandler && !screenSpaceEventHandler.isDestroyed()) {
            screenSpaceEventHandler.destroy();
            screenSpaceEventHandler = null;
          }
        };

        polygonDrawingStateRef.current.cleanup = cleanupDrawing;

        // Click handler to add points
        const clickHandler = (click) => {
          const cartesian = viewer.camera.pickEllipsoid(
            click.position,
            scene.globe.ellipsoid
          );

          if (cartesian) {
            polygonDrawingStateRef.current.points.push(cartesian);

            // Add point marker
            const pointEntity = viewer.entities.add({
              position: cartesian,
              point: {
                pixelSize: 10,
                color: Cesium.Color.BLUE,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
              },
            });
            polygonDrawingStateRef.current.pointEntities.push(pointEntity);

            // Update preview line
            if (polygonDrawingStateRef.current.points.length >= 2) {
              // Remove old line
              if (polygonDrawingStateRef.current.lineEntity) {
                viewer.entities.remove(polygonDrawingStateRef.current.lineEntity);
              }

              // Create preview polyline
              polygonDrawingStateRef.current.lineEntity = viewer.entities.add({
                polyline: {
                  positions: polygonDrawingStateRef.current.points,
                  width: 2,
                  material: Cesium.Color.BLUE,
                  clampToGround: true,
                },
              });
            }

            // Update preview polygon if we have 3+ points
            if (polygonDrawingStateRef.current.points.length >= 3) {
              // Remove old polygon
              if (polygonDrawingStateRef.current.polygonEntity) {
                viewer.entities.remove(polygonDrawingStateRef.current.polygonEntity);
              }

              // Create preview polygon
              polygonDrawingStateRef.current.polygonEntity = viewer.entities.add({
                polygon: {
                  hierarchy: polygonDrawingStateRef.current.points,
                  material: Cesium.Color.BLUE.withAlpha(0.3),
                  outline: true,
                  outlineColor: Cesium.Color.BLUE,
                  outlineWidth: 2,
                },
              });
            }

            scene.requestRender();
          }
        };

        // Double-click or Enter key to finish
        const dblClickHandler = () => {
          finishDrawing();
        };

        const finishDrawing = () => {
          // Remove handlers
          if (screenSpaceEventHandler && !screenSpaceEventHandler.isDestroyed()) {
            screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
          }

          if (polygonDrawingStateRef.current.points.length >= 3) {
            // Convert Cartesian3 points to lat/lon coordinates
            const coordinates = polygonDrawingStateRef.current.points.map(point => {
              const cartographic = Cesium.Cartographic.fromCartesian(point);
              return [
                Cesium.Math.toDegrees(cartographic.longitude),
                Cesium.Math.toDegrees(cartographic.latitude)
              ];
            });

            // Close the polygon by adding first point at the end
            coordinates.push(coordinates[0]);

            const polygonGeoJSON = {
              type: 'Polygon',
              coordinates: [coordinates]
            };

            // Call completion callback
            if (onComplete) {
              onComplete(polygonGeoJSON);
            }

            // Clean up drawing entities
            cleanupDrawing();
          } else {
            // Not enough points, just clean up
            cleanupDrawing();
          }
        };

        // Set up event handlers
        screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        screenSpaceEventHandler.setInputAction(clickHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        screenSpaceEventHandler.setInputAction(dblClickHandler, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // Store handler reference
        polygonDrawingStateRef.current.handler = screenSpaceEventHandler;
        polygonDrawingStateRef.current.finishDrawing = finishDrawing;

        // Listen for Enter key to complete drawing
        const keyHandler = (e) => {
          if (e.key === 'Enter' && polygonDrawingStateRef.current) {
            finishDrawing();
            window.removeEventListener('keydown', keyHandler);
          }
        };
        window.addEventListener('keydown', keyHandler);
        polygonDrawingStateRef.current.keyHandler = keyHandler;
      },

      // Cancel polygon drawing
      cancelPolygonDrawing: () => {
        if (polygonDrawingStateRef.current?.cleanup) {
          polygonDrawingStateRef.current.cleanup();

          // Remove key handler
          if (polygonDrawingStateRef.current.keyHandler) {
            window.removeEventListener('keydown', polygonDrawingStateRef.current.keyHandler);
          }

          polygonDrawingStateRef.current = null;
        }
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.scene.requestRender();
        }
      },

      // Complete current polygon drawing
      completePolygonDrawing: () => {
        if (polygonDrawingStateRef.current?.finishDrawing) {
          polygonDrawingStateRef.current.finishDrawing();
        }
      },
    }));

    useLayoutEffect(() => {
      if (!cesiumContainer.current || viewerRef.current) return;

      let isInitialized = false;

      const initCesium = async () => {
        if (isInitialized) return;
        isInitialized = true;

        try {
          console.log("Initializing Cesium...");

          viewerRef.current = new Cesium.Viewer(cesiumContainer.current, {
            animation: false,
            timeline: false,
            homeButton: false,
            sceneModePicker: false,
            baseLayerPicker: false,
            navigationHelpButton: false,
            geocoder: false,
            fullscreenButton: false,
            vrButton: false,
            infoBox: false,
            selectionIndicator: false,
            requestRenderMode: true,
            maximumRenderTimeChange: 0.5,
            contextOptions: {
              webgl: {
                preserveDrawingBuffer: true,
              },
            },
          });

          viewerRef.current.scene.globe.enableLighting = false;
          viewerRef.current.scene.fog.enabled = false;
          viewerRef.current.scene.globe.maximumScreenSpaceError = 2;
          viewerRef.current.scene.globe.tileCacheSize = 1000;
          viewerRef.current.scene.requestRenderMode = true;
          viewerRef.current.scene.maximumRenderTimeChange = 0.5;

          // Configure camera controller to prevent unwanted resets
          const controller =
            viewerRef.current.scene.screenSpaceCameraController;
          controller.enableCollisionDetection = false;
          controller.minimumZoomDistance = 100;
          controller.maximumZoomDistance = 50000000;
          controller.inertiaSpin = 0.9;
          controller.inertiaTranslate = 0.9;
          controller.inertiaZoom = 0.8;

          // Disable double-click zoom behavior
          viewerRef.current.screenSpaceEventHandler.setInputAction(() => {},
          Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

          const layers = await fetchGeoServerLayers();
          layerConfigRef.current = layers;

          const imageryLayers = viewerRef.current.imageryLayers;

          layers.forEach((config) => {
            try {
              const parameters = {
                service: "WMS",
                version: "1.1.1",
                format: "image/png",
                transparent: "true",
                tiled: "true",
                tilesOrigin: "-180,-90",
                styles: "",
              };

              // Apply initial CQL filter to municipalities layer
              // to show only UpperTier and SingleTier municipalities
              if (
                config.name === LAYER_NAMES.ALL_MUNICIPALITIES &&
                CQL_FILTERS.INITIAL
              ) {
                parameters.CQL_FILTER = CQL_FILTERS.INITIAL;
                console.log(
                  `Applying initial CQL filter to ${config.name}: ${CQL_FILTERS.INITIAL}`
                );
              }

              const provider = new Cesium.WebMapServiceImageryProvider({
                url: GEOSERVER_CONFIG.wmsUrl,
                layers: `${GEOSERVER_CONFIG.workspace}:${config.name}`,
                parameters,
                enablePickFeatures: true,
              });

              const cesiumLayer = imageryLayers.addImageryProvider(provider);
              cesiumLayer.alpha = config.opacity;
              cesiumLayer.show = config.visible;

              layersRef.current.push({ config, cesiumLayer, provider });
            } catch (error) {
              console.error(`Failed to add ${config.name}:`, error);
            }
          });

          const handler = new Cesium.ScreenSpaceEventHandler(
            viewerRef.current.scene.canvas
          );

          handler.setInputAction(async (movement) => {
            const ray = viewerRef.current.camera.getPickRay(movement.position);
            const cartesian = viewerRef.current.scene.globe.pick(
              ray,
              viewerRef.current.scene
            );

            if (!cartesian) return;

            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const longitude = Cesium.Math.toDegrees(cartographic.longitude);
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);
            const cameraHeight =
              viewerRef.current.camera.positionCartographic.height;

            console.log(
              `Clicked at: ${latitude.toFixed(5)}, ${longitude.toFixed(
                5
              )}, Height: ${cameraHeight.toFixed(0)}m`
            );

            // Use refs to get current values without causing re-initialization
            const currentViewLevel = viewLevelRef.current;
            const { onWMSFeatureClick: featureClickCb } = callbacksRef.current;
            const {
              queryMunicipality: queryMuni,
              queryParcelWithRelatedData: queryParcel,
              drillDownToMunicipality: drillDown,
            } = functionsRef.current;

            // Determine action based on current view level
            if (currentViewLevel === VIEW_LEVELS.OVERVIEW) {
              // At overview: prefer UpperTier or SingleTier (they are the only visible ones)
              const municipalityData = await queryMuni(
                latitude,
                longitude,
                null
              );
              if (municipalityData) {
                console.log(`Municipality clicked:`, municipalityData);
                drillDown(municipalityData);
              }
            } else if (currentViewLevel === VIEW_LEVELS.REGION) {
              // At region level: prefer lower_tier for drill-down into municipality
              const municipalityData = await queryMuni(
                latitude,
                longitude,
                "lower_tier"
              );
              if (municipalityData) {
                console.log(`Municipality clicked:`, municipalityData);
                drillDown(municipalityData);
              }
            } else if (
              currentViewLevel === VIEW_LEVELS.MUNICIPALITY ||
              currentViewLevel === VIEW_LEVELS.PARCEL
            ) {
              // Zoomed into municipality or already viewing parcel: Query parcels with all related data
              const combinedFeature = await queryParcel(
                latitude,
                longitude,
                null
              );
              if (combinedFeature && combinedFeature.properties) {
                console.log("Parcel clicked (with related data):", combinedFeature);
                setSelectedFeature(combinedFeature);
                setViewLevel(VIEW_LEVELS.PARCEL);
                if (combinedFeature.geometry) {
                  highlightParcelGeometry(combinedFeature.geometry);
                } else {
                  clearParcelHighlight();
                }
                if (featureClickCb) {
                  featureClickCb(combinedFeature);
                }
              } else {
                // No parcel found, might have clicked background
                setSelectedFeature(null);
                clearParcelHighlight();
                if (featureClickCb) {
                  featureClickCb(null);
                }
              }
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

          viewerRef.current.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
              INITIAL_CAMERA.longitude,
              INITIAL_CAMERA.latitude,
              INITIAL_CAMERA.height
            ),
            orientation: {
              heading: Cesium.Math.toRadians(INITIAL_CAMERA.heading),
              pitch: Cesium.Math.toRadians(INITIAL_CAMERA.pitch),
              roll: Cesium.Math.toRadians(INITIAL_CAMERA.roll),
            },
          });

          console.log("Initialization complete");
        } catch (error) {
          console.error("Initialization failed:", error);
        }
      };

      initCesium();

      return () => {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.destroy();
          viewerRef.current = null;
          layersRef.current = [];
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        ref={cesiumContainer}
        className="w-full h-screen relative"
        style={{ background: "#000" }}
        data-onboard="map-canvas"
      />
    );
  }
);

CesiumMap.displayName = "CesiumMap";
export default memo(CesiumMap);
