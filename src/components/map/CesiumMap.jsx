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
  INITIAL: "type IN ('UpperTier', 'SingleTier')",
  // Show all municipalities
  ALL: null,
  // Show ONLY LowerTier children of a specific UpperTier region (by parent_id)
  // This hides the UpperTier itself and shows only its LowerTier children
  regionDrillDown: (parentId) =>
    `type = 'LowerTier' AND parent_id = '${parentId}'`,
};

const MUNICIPALITY_CONFIG = {
  "simcoe county": { lat: 44.4, lon: -79.7, height: 150000, type: "UpperTier" },
  toronto: { lat: 43.7, lon: -79.4, height: 80000, type: "SingleTier" },
  midland: { lat: 44.75, lon: -79.88, height: 25000, type: "LowerTier" },
  "adjala-tosorontio": {
    lat: 44.15,
    lon: -79.95,
    height: 35000,
    type: "LowerTier",
  },
  barrie: { lat: 44.37, lon: -79.69, height: 30000, type: "LowerTier" },
  orillia: { lat: 44.61, lon: -79.42, height: 25000, type: "LowerTier" },
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
  REGION: "region", // UpperTier - see LowerTier municipalities
  MUNICIPALITY: "municipality", // SingleTier or LowerTier - see parcels
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
          layers: `${GEOSERVER_CONFIG.workspace}:view_municipalities`,
          query_layers: `${GEOSERVER_CONFIG.workspace}:view_municipalities`,
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

            // Extract name and type
            const name =
              props.name ||
              props.municipal_name ||
              props.mun_name ||
              props.MUNICIPAL ||
              props.NAME ||
              Object.values(props)[0];
            const type =
              props.type || props.TYPE || props.muni_type || "SingleTier";
            const id = props.id || props.ID;

            // If geometry is not included, fetch it via WFS
            let geometry = feature.geometry;
            if (!geometry && id) {
              try {
                const wfsParams = new URLSearchParams({
                  service: "WFS",
                  version: "1.1.0",
                  request: "GetFeature",
                  typeName: `${GEOSERVER_CONFIG.workspace}:view_municipalities`,
                  outputFormat: "application/json",
                  CQL_FILTER: `id = '${id}'`,
                  srsName: GEOSERVER_CONFIG.srs,
                });
                const wfsUrl = `${
                  GEOSERVER_CONFIG.wfsUrl
                }?${wfsParams.toString()}`;
                const wfsResponse = await fetch(wfsUrl);
                const wfsData = await wfsResponse.json();
                if (wfsData.features && wfsData.features.length > 0) {
                  geometry = wfsData.features[0].geometry;
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

    // Function to update municipality layer with new CQL filter
    const updateMunicipalityLayerFilter = useCallback((cqlFilter) => {
      if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

      const viewer = viewerRef.current;
      const imageryLayers = viewer.imageryLayers;

      // Find the municipalities layer in our ref
      const layerIndex = layersRef.current.findIndex(
        (l) => l.config.name === "view_municipalities"
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
        }, visible: ${cesiumLayer.show}`
      );
    }, []);

    // Function to update parcels layer with CQL filter based on division_id
    const updateParcelsLayerFilter = useCallback((divisionId) => {
      if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

      const viewer = viewerRef.current;
      const imageryLayers = viewer.imageryLayers;

      // Find the parcels layer
      const layerIndex = layersRef.current.findIndex(
        (l) => l.config.name === "view_parcels"
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

      // Create new provider with CQL filter for division_id
      const parameters = {
        service: "WMS",
        version: "1.1.1",
        format: "image/png",
        transparent: "true",
        tiled: "true",
        tilesOrigin: "-180,-90",
        styles: "",
      };

      // Add CQL_FILTER if divisionId is provided
      // UUID needs to be quoted as a string
      if (divisionId) {
        parameters.CQL_FILTER = `division_id = '${divisionId}'`;
        console.log(
          `Applying parcels CQL filter: division_id = '${divisionId}'`
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
      cesiumLayer.show = divisionId ? true : false; // Show only when filtered

      // Update the reference
      layersRef.current[layerIndex] = { config, cesiumLayer, provider };
      selectedDivisionIdRef.current = divisionId;

      console.log(
        `Parcels layer updated with division_id: ${divisionId || "none"}`
      );
    }, []);

    // Function to update wards layer with CQL filter based on parent_id (municipality id)
    const updateWardsLayerFilter = useCallback((parentId, show = true) => {
      if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

      const viewer = viewerRef.current;
      const imageryLayers = viewer.imageryLayers;

      // Find the wards layer
      const layerIndex = layersRef.current.findIndex(
        (l) => l.config.name === "view_wards"
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

      // Add CQL_FILTER using parent_id (the id of the SingleTier municipality)
      // UUID needs to be quoted as a string
      if (parentId && show) {
        parameters.CQL_FILTER = `parent_id = '${parentId}'`;
        console.log(`Applying wards CQL filter: parent_id = '${parentId}'`);
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
      cesiumLayer.show = show && parentId ? true : false;

      // Update the reference
      layersRef.current[layerIndex] = { config, cesiumLayer, provider };

      console.log(
        `Wards layer updated for parent_id: ${parentId || "none"}, visible: ${
          cesiumLayer.show
        }`
      );
    }, []);

    // Function to hide/show municipalities layer
    const setMunicipalitiesLayerVisible = useCallback((visible) => {
      const layerEntry = layersRef.current.find(
        (l) => l.config.name === "view_municipalities"
      );
      if (layerEntry && layerEntry.cesiumLayer) {
        layerEntry.cesiumLayer.show = visible;
        console.log(`Municipalities layer visibility: ${visible}`);
      }
    }, []);

    const switchLayerContext = useCallback((tierType, municipalityKey) => {
      console.log(
        `Switching context - Tier: ${tierType}, Municipality: ${municipalityKey}`
      );

      layersRef.current.forEach(({ config, cesiumLayer }) => {
        if (!cesiumLayer) return;

        if (tierType === "UpperTier") {
          // REGION VIEW: Show only municipalities (LowerTier children), NOT wards
          if (config.category === "admin") {
            if (config.name === "view_municipalities") {
              // Show municipalities layer (filtered to LowerTier children via CQL)
              cesiumLayer.show = true;
              cesiumLayer.alpha = config.opacity;
            } else {
              // Hide wards and other admin layers for UpperTier
              cesiumLayer.show = false;
            }
          } else {
            cesiumLayer.show = false;
          }
        } else if (tierType === "LowerTier" || tierType === "SingleTier") {
          // MUNICIPALITY VIEW: Show parcels and municipality-specific layers
          if (config.category === "admin") {
            // Keep boundaries visible but dimmed
            cesiumLayer.show = true;
            cesiumLayer.alpha =
              config.name === "view_municipalities" ? 0.2 : 0.3;
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
      (municipalityData) => {
        const { name, type, id, geometry } = municipalityData;
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
              type === "UpperTier"
                ? 150000
                : type === "SingleTier"
                ? 80000
                : 35000,
            type: type,
          };
        }

        // Update hierarchy based on tier type
        if (type === "UpperTier") {
          setViewLevel(VIEW_LEVELS.REGION);
          setCurrentRegion(normalizedName);
          setCurrentMunicipality(null);
          const newHierarchy = [{ name, type, id }];
          console.log("Setting UpperTier hierarchy:", newHierarchy);
          setViewHierarchy(newHierarchy);

          // Update CQL filter to show this UpperTier's LowerTier children (using id as parent_id)
          if (id) {
            const newFilter = CQL_FILTERS.regionDrillDown(id);
            updateMunicipalityLayerFilter(newFilter);
          }

          // Make sure municipalities layer is visible (show LowerTier children)
          setMunicipalitiesLayerVisible(true);

          // Hide wards - UpperTier does NOT show wards, only LowerTier municipalities
          updateWardsLayerFilter(null, false);

          // Hide parcels at region level
          updateParcelsLayerFilter(null);
        } else if (type === "LowerTier") {
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
              console.log("Adding LowerTier to hierarchy:", newHierarchy);
              return newHierarchy;
            });
          } else {
            // Direct navigation without going through region
            const newHierarchy = [{ name, type, id }];
            console.log(
              "Setting LowerTier hierarchy (no parent):",
              newHierarchy
            );
            setViewHierarchy(newHierarchy);
          }
        } else if (type === "SingleTier") {
          setViewLevel(VIEW_LEVELS.MUNICIPALITY);
          setCurrentMunicipality(normalizedName);

          // Hide municipalities layer completely
          setMunicipalitiesLayerVisible(false);

          // Show wards for this SingleTier municipality (using id as parent_id)
          if (id) {
            updateWardsLayerFilter(id, true);
          }

          // Filter parcels to show only this municipality's parcels
          if (id) {
            updateParcelsLayerFilter(id);
          }

          const newHierarchy = [{ name, type, id }];
          console.log("Setting SingleTier hierarchy:", newHierarchy);
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
                  complete: () => {
                    switchLayerContext(type, normalizedName);
                  },
                };
              }
            } catch (e) {
              console.warn("Failed to calculate geometry bounds:", e);
            }
          }

          // Fallback to configured coordinates if geometry bounds not available
          if (!flyToOptions) {
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
              complete: () => {
                switchLayerContext(type, normalizedName);
              },
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
                color: Cesium.Color.fromCssColorString("#3b82f6"),
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 3,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              },
            });
            return;
          }

          if (positions.length > 0) {
            highlightEntityRef.current = viewer.entities.add({
              polygon: {
                hierarchy: new Cesium.PolygonHierarchy(positions),
                material:
                  Cesium.Color.fromCssColorString("#3b82f6").withAlpha(0.25),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString("#1d4ed8"),
                outlineWidth: 3,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              },
              polyline: {
                positions: positions,
                width: 4,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.3,
                  color: Cesium.Color.fromCssColorString("#3b82f6"),
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

      getViewer: () => viewerRef.current,
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
                config.name === "view_municipalities" &&
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
              queryFeatureInfo: queryFeature,
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
              // At region level: prefer LowerTier for drill-down into municipality
              const municipalityData = await queryMuni(
                latitude,
                longitude,
                "LowerTier"
              );
              if (municipalityData) {
                console.log(`Municipality clicked:`, municipalityData);
                drillDown(municipalityData);
              }
            } else if (
              currentViewLevel === VIEW_LEVELS.MUNICIPALITY ||
              currentViewLevel === VIEW_LEVELS.PARCEL
            ) {
              // Zoomed into municipality or already viewing parcel: Query parcels
              const feature = await queryFeature(
                latitude,
                longitude,
                "view_parcels"
              );
              if (feature) {
                console.log("Parcel clicked:", feature);
                setSelectedFeature(feature);
                setViewLevel(VIEW_LEVELS.PARCEL);
                if (featureClickCb) {
                  featureClickCb(feature);
                }
              } else {
                // No parcel found, might have clicked background
                setSelectedFeature(null);
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
      />
    );
  }
);

CesiumMap.displayName = "CesiumMap";
export default memo(CesiumMap);
