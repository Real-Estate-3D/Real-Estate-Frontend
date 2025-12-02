import React, {
  useEffect,
  useRef,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle
} from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { torontoParcelData } from "../../data/torontoParcelData";

// Your Ion token
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMGRiNWEzZS05ZjgwLTRhNmEtYTJlYi04NDI5Y2MzOTRlNjIiLCJpZCI6MTg0NTEzLCJpYXQiOjE3MDI1NzIwNDd9.cy0yRicakbgK8QUlEhcwNwOW4IJymv-CKYLrBni3pPw";

const CesiumMap = forwardRef(({ onParcelClick }, ref) => {
  const cesiumContainer = useRef(null);
  const viewerRef = useRef(null);
  const parcelEntitiesRef = useRef([]);

  // Methods exposed to parent
  useImperativeHandle(ref, () => ({
    flyToLocation: (longitude, latitude, altitude = 2000) => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            longitude,
            latitude,
            altitude
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45),
            roll: 0.0
          },
          duration: 2.5
        });
      }
    },
    getViewer: () => viewerRef.current
  }));

  // Render parcels
  const renderParcels = () => {
    if (!viewerRef.current || viewerRef.current.isDestroyed()) return;

    parcelEntitiesRef.current.forEach((entity) => {
      viewerRef.current.entities.remove(entity);
    });
    parcelEntitiesRef.current = [];

    torontoParcelData.forEach((parcel) => {
      const entity = viewerRef.current.entities.add({
        id: parcel.id,
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(
            parcel.coordinates.flat()
          ),
          material: Cesium.Color.fromCssColorString("#FF6B6B").withAlpha(0.4),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString("#C92A2A"),
          outlineWidth: 2,

          // Keep parcels visible above 3D tiles
          height: 20,
          extrudedHeight: 20
        },
        properties: parcel.properties
      });

      parcelEntitiesRef.current.push(entity);
    });
  };

  useLayoutEffect(() => {
    if (!cesiumContainer.current || viewerRef.current) return;

    const initCesium = async () => {
      try {
        viewerRef.current = new Cesium.Viewer(cesiumContainer.current, {
          timeline: false,
          animation: false,
          sceneModePicker: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          homeButton: false,
          navigationHelpButton: false,
          vrButton: false,
          infoBox: false,
          selectionIndicator: false,
          geocoder: Cesium.IonGeocodeProviderType.GOOGLE,
          globe: false,
          useDefaultRenderLoop: true,
          targetFrameRate: 60,
          contextOptions: { webgl: { alpha: false } }
        });

        // Hide geocoder UI
        if (viewerRef.current.geocoder) {
          viewerRef.current.geocoder.container.style.display = "none";
        }

        // Atmosphere & lighting
        viewerRef.current.scene.skyAtmosphere.show = true;
        viewerRef.current.scene.skyBox.show = false;

        // Load Google 3D Tiles
        const tileset = await Cesium.createGooglePhotorealistic3DTileset({
          onlyUsingWithGoogleGeocoder: true
        });
        viewerRef.current.scene.primitives.add(tileset);

        // Fog & lighting enhancements
        viewerRef.current.scene.light.intensity = 1.5;
        viewerRef.current.scene.fog.enabled = true;
        viewerRef.current.scene.fog.density = 0.0008;

        // Add parcels
        renderParcels();

        // CLICK HANDLER
        const handler = new Cesium.ScreenSpaceEventHandler(
          viewerRef.current.scene.canvas
        );

        handler.setInputAction(
          (movement) => {
            const pickedObject = viewerRef.current.scene.pick(movement.position);

            if (Cesium.defined(pickedObject) && pickedObject.id) {
              const entity = pickedObject.id;

              const parcelData = torontoParcelData.find(
                (p) => p.id === entity.id
              );

              if (parcelData && onParcelClick) {
                // Highlight selected parcel
                parcelEntitiesRef.current.forEach((e) => {
                  if (e.id === entity.id) {
                    e.polygon.material =
                      Cesium.Color.fromCssColorString("#FFD93D").withAlpha(0.6);
                    e.polygon.outlineColor =
                      Cesium.Color.fromCssColorString("#FFA500");
                  } else {
                    e.polygon.material =
                      Cesium.Color.fromCssColorString("#FF6B6B").withAlpha(0.4);
                    e.polygon.outlineColor =
                      Cesium.Color.fromCssColorString("#C92A2A");
                  }
                });

                onParcelClick(parcelData);
              }
            }
          },
          Cesium.ScreenSpaceEventType.LEFT_CLICK
        );

        // ----- AUTO ZOOM TO PARCEL BOUNDING BOX -----
        try {
          const allCoords = torontoParcelData.flatMap((p) =>
            p.coordinates.flat()
          );

          const longitudes = allCoords.filter((_, i) => i % 2 === 0);
          const latitudes = allCoords.filter((_, i) => i % 2 === 1);

          const rectangle = Cesium.Rectangle.fromDegrees(
            Math.min(...longitudes),
            Math.min(...latitudes),
            Math.max(...longitudes),
            Math.max(...latitudes)
          );

          viewerRef.current.camera.flyTo({
            destination: rectangle,
            duration: 2
          });
        } catch (err) {
          console.error("Failed to auto-zoom:", err);
        }
      } catch (error) {
        console.error("Cesium initialization failed:", error);

        viewerRef.current = new Cesium.Viewer(cesiumContainer.current, {
          globe: true,
          baseLayerPicker: false
        });

        renderParcels();
      }
    };

    initCesium();

    // Cleanup
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
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
