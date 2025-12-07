import React, { useRef, useLayoutEffect, forwardRef, useImperativeHandle, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// GeoServer configuration
const GEOSERVER_CONFIG = {
  baseUrl: 'https://acwaportal.pk/geoserver',
  workspace: 'realestate',
  srs: 'EPSG:4326'
};

const getWMSUrl = () => {
  return `${GEOSERVER_CONFIG.baseUrl}/${GEOSERVER_CONFIG.workspace}/wms`;
};

const getWFSUrl = () => {
  return `${GEOSERVER_CONFIG.baseUrl}/${GEOSERVER_CONFIG.workspace}/wfs`;
};

const getWMSLayerParams = () => {
  const defaultLayers = 'realestate:zoning,realestate:regions';
  
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
const buildGetFeatureInfoUrl = (layers, bbox, width, height, x, y) => {
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

// Fetch feature info from WMS (this should return features)
const fetchFeatureInfo = async (layers, bbox, width, height, x, y) => {
  try {
    const url = buildGetFeatureInfoUrl(layers, bbox, width, height, x, y);
    console.log('🖱️ GetFeatureInfo URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📍 GetFeatureInfo response:', data);

    if (data.features && data.features.length > 0) {
      return data.features[0]; // Return first feature
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching feature info:', error);
    return null;
  }
};

// Your Ion token
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMGRiNWEzZS05ZjgwLTRhNmEtYTJlYi04NDI5Y2MzOTRlNjIiLCJpZCI6MTg0NTEzLCJpYXQiOjE3MDI1NzIwNDd9.cy0yRicakbgK8QUlEhcwNwOW4IJymv-CKYLrBni3pPw";

const CesiumMap = forwardRef(({ onWMSFeatureClick }, ref) => {
  const cesiumContainer = useRef(null);
  const viewerRef = useRef(null);
  const wmsLayerRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useImperativeHandle(ref, () => ({
    flyToLocation: (longitude, latitude, altitude = 2000) => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45),
            roll: 0.0,
          },
          duration: 2.5,
        });
      }
    },
    addWMSLayer: () => {
      if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

      // Remove existing WMS layer if present
      if (wmsLayerRef.current) {
        viewerRef.current.imageryLayers.remove(wmsLayerRef.current);
        wmsLayerRef.current = null;
      }

      try {
        const wmsParams = getWMSLayerParams();
        
        const wmsProvider = new Cesium.WebMapServiceImageryProvider({
          url: wmsParams.url,
          layers: wmsParams.layers,
          parameters: wmsParams.parameters,
          enablePickFeatures: false
        });

        wmsLayerRef.current = viewerRef.current.imageryLayers.addImageryProvider(wmsProvider);
        wmsLayerRef.current.alpha = 0.7;
        
        console.log('✅ WMS layer added:', wmsParams.layers);
      } catch (error) {
        console.error('❌ Failed to add WMS layer:', error);
      }
    },
    removeWMSLayer: () => {
      if (wmsLayerRef.current && viewerRef.current) {
        viewerRef.current.imageryLayers.remove(wmsLayerRef.current);
        wmsLayerRef.current = null;
        console.log('🗑️ WMS layer removed');
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
        console.log("🚀 Initializing Cesium...");

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
          requestRenderMode: false,
        });

        console.log("✅ Viewer created");

        // Monitor tile loading
        viewerRef.current.scene.globe.tileLoadProgressEvent.addEventListener((queuedTileCount) => {
          if (queuedTileCount === 0) {
            console.log("✅ All tiles loaded!");
          } else {
            console.log(`⏳ Loading tiles: ${queuedTileCount} remaining`);
          }
        });

        // Click handler for WMS features
        const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
        handler.setInputAction(async (movement) => {
          // Only process if WMS layer is loaded
          if (!wmsLayerRef.current) {
            console.log('⚠️ No WMS layer loaded - click ignored');
            return;
          }

          const ray = viewerRef.current.camera.getPickRay(movement.position);
          const cartesian = viewerRef.current.scene.globe.pick(ray, viewerRef.current.scene);
          
          if (!cartesian) {
            console.log('❌ No terrain intersection');
            return;
          }

          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);

          console.log('🖱️ Map clicked at:', { longitude, latitude });

          // Get viewport dimensions
          const canvas = viewerRef.current.scene.canvas;
          const width = canvas.width;
          const height = canvas.height;

          // Get camera bounds
          const rectangle = viewerRef.current.camera.computeViewRectangle();
          if (!rectangle) {
            console.log('❌ Could not compute view rectangle');
            return;
          }

          const bbox = [
            Cesium.Math.toDegrees(rectangle.west),
            Cesium.Math.toDegrees(rectangle.south),
            Cesium.Math.toDegrees(rectangle.east),
            Cesium.Math.toDegrees(rectangle.north)
          ];

          console.log('📦 BBOX:', bbox);
          console.log('📐 Canvas dimensions:', { width, height });
          console.log('🎯 Click position:', { x: movement.position.x, y: movement.position.y });

          // Convert click position to pixel coordinates
          const x = movement.position.x;
          const y = movement.position.y;

          // Query both layers
          const layers = ['realestate:zoning', 'realestate:regions'];

          try {
            console.log('🔍 Fetching feature info...');
            const featureData = await fetchFeatureInfo(layers, bbox, width, height, x, y);

            if (featureData) {
              console.log('✅ Feature found:', featureData);
              setSelectedFeature(featureData);
              
              // Call the parent callback if provided
              if (onWMSFeatureClick) {
                onWMSFeatureClick(featureData);
              }
            } else {
              console.log('❌ No feature found at click location');
              setSelectedFeature(null);
              if (onWMSFeatureClick) {
                onWMSFeatureClick(null);
              }
            }
          } catch (error) {
            console.error('❌ Error in click handler:', error);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Fly to Toronto - start position
        viewerRef.current.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(-79.3832, 43.6532, 50000),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-60),
            roll: 0.0,
          },
          duration: 2,
        });

        console.log("✅ Initialization complete!");

      } catch (error) {
        console.error("❌ Cesium failed:", error);
      }
    };

    initCesium();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        console.log("🧹 Cleaning up Cesium viewer");
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={cesiumContainer}
      className="w-full h-screen relative"
      style={{ background: "#000" }}
    />
  );
});

CesiumMap.displayName = "CesiumMap";
export default CesiumMap;