/**
 * MunicipalGIS Viewer Logic
 * ------------------------------------------------
 * Handles Cesium initialization, WMS layer loading from GeoServer,
 * and attribute querying (GetFeatureInfo) logic with drill-down capability.
 * 
 * Features:
 * - Initial high-altitude view with only administrative boundaries visible
 * - Click-to-drill-down into municipalities
 * - Context-aware layer switching based on selected municipality
 * 
 * Usage:
 * const gis = new MunicipalGIS('cesiumContainer');
 * gis.initialize();
 */

import { GEOSERVER_CONFIG } from "../utils/runtimeConfig";

class MunicipalGIS {
    constructor(containerId) {
        this.containerId = containerId;
        this.viewer = null;
        this.currentMunicipality = null; // Track currently selected municipality
        
        // CONFIGURATION
        this.geoserverUrl = GEOSERVER_CONFIG.wmsUrl;
        this.workspace = GEOSERVER_CONFIG.workspace;
        
        // MUNICIPALITY LOCATIONS & EXTENTS
        // Used for fly-to animations and context detection
        this.municipalityConfig = {
            'toronto': { 
                lat: 43.7, 
                lon: -79.4, 
                height: 50000,
                pattern: '___toronto'  // Pattern to match layer names
            },
            'midland': { 
                lat: 44.75, 
                lon: -79.88, 
                height: 10000,
                pattern: '___midland'
            },
            'adjala': { 
                lat: 44.15, 
                lon: -79.95, 
                height: 15000,
                pattern: '___adjala'
            },
            'adjala-tosorontio': { 
                lat: 44.15, 
                lon: -79.95, 
                height: 15000,
                pattern: '___adjala'  // Maps to adjala layers
            }
        };
        
        // LAYER REGISTRY
        // Updated layer names to match new GeoServer PostGIS schema
        // Initial State: Only administrative boundaries visible
        this.layers = [
            // --- PLANNING & ZONING (Hidden by default) ---
            { layer: "landuse_land_use",         title: "Land Use",             visible: false, opacity: 0.6, category: 'planning' },
            { layer: "landuse_zoning",           title: "Zoning",               visible: false, opacity: 0.5, category: 'planning' },
            
            // --- INFRASTRUCTURE & AMENITIES (Hidden by default) ---
            { layer: "infrastructure_buildings",     title: "Buildings",          visible: false, opacity: 0.8, category: 'infrastructure' },
            { layer: "landuse_parks",                title: "Parks",              visible: false, opacity: 0.7, category: 'infrastructure' },
            { layer: "infrastructure_parking",       title: "Parking",            visible: false, opacity: 0.7, category: 'infrastructure' },
            { layer: "infrastructure_roads",         title: "Roads",              visible: false, opacity: 0.7, category: 'infrastructure' },
            { layer: "infrastructure_trails",        title: "Trails",             visible: false, opacity: 0.6, category: 'infrastructure' },
            { layer: "infrastructure_address_points", title: "Address Points",    visible: false, opacity: 0.8, category: 'infrastructure' },

            // --- PARCELS (Hidden by default, shown on drill-down) ---
            { layer: "landuse_parcels",              title: "Property Parcels",   visible: false, opacity: 1.0, category: 'parcels' },

            // --- ADMIN BOUNDARIES (Visible by default - entry point) ---
            { layer: "boundaries_wards",             title: "Electoral Wards",    visible: false, opacity: 0.7, category: 'admin' },
            { layer: "boundaries_all_municipalities", title: "All Municipalities", visible: true,  opacity: 1.0, category: 'admin' },
            { layer: "boundaries_upper_tier",        title: "Upper Tier (Regions)", visible: false, opacity: 0.8, category: 'admin' },
            { layer: "boundaries_lower_tier",        title: "Lower Tier (Cities)", visible: false, opacity: 0.8, category: 'admin' },
            { layer: "boundaries_single_tier",       title: "Single Tier",        visible: false, opacity: 0.8, category: 'admin' }
        ];
    }

    /**
     * Initialize the Viewer and load layers
     */
    initialize() {
        if (!window.Cesium) {
            console.error("CesiumJS is not loaded!");
            return;
        }

        // 1. Create Viewer
        this.viewer = new Cesium.Viewer(this.containerId, {
            terrainProvider: Cesium.createWorldTerrain(),
            baseLayerPicker: true,
            timeline: false,
            animation: false,
            homeButton: false,
            geocoder: false,
            sceneModePicker: true,
            selectionIndicator: true
        });

        // 2. Set Default Camera View - HIGH ALTITUDE OVERVIEW
        // Start zoomed out to see all municipalities
        this.viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(-79.6, 44.0, 300000), // Higher altitude for overview
            orientation: {
                heading: 0.0,
                pitch: Cesium.Math.toRadians(-90.0),
                roll: 0.0
            }
        });

        // 3. Add Layers
        this.addGeoServerLayers();

        // 4. Setup Click Interaction for drill-down
        this.setupClickHandler();
        
        console.log("MunicipalGIS Initialized - Click on a municipality to drill down.");
    }

    /**
     * Loops through config and adds WMS layers
     */
    addGeoServerLayers() {
        const imageryLayers = this.viewer.imageryLayers;

        this.layers.forEach(cfg => {
            const provider = new Cesium.WebMapServiceImageryProvider({
                url: this.geoserverUrl,
                layers: `${this.workspace}:${cfg.layer}`,
                parameters: {
                    service: 'WMS',
                    format: 'image/png',
                    transparent: 'true'
                }
            });

            const layer = imageryLayers.addImageryProvider(provider);
            layer.alpha = cfg.opacity;
            layer.show = cfg.visible;
            
            // Store reference for UI toggling later
            cfg._cesiumLayer = layer;
        });
    }

    /**
     * Setup click handler with drill-down logic
     * Queries municipalities layer first, then performs context switch
     */
    setupClickHandler() {
        const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        handler.setInputAction(async (movement) => {
            const cartesian = this.viewer.camera.pickEllipsoid(movement.position);
            
            if (cartesian) {
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                const longitude = Cesium.Math.toDegrees(cartographic.longitude);
                const latitude = Cesium.Math.toDegrees(cartographic.latitude);

                console.log(`Clicked at: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                
                // Check if we're at high altitude (overview mode)
                const cameraHeight = this.viewer.camera.positionCartographic.height;
                
                if (cameraHeight > 100000) {
                    // HIGH ALTITUDE: Query municipalities for drill-down
                    await this.handleMunicipalityClick(latitude, longitude);
                } else {
                    // ZOOMED IN: Query parcels/detailed features
                    await this.queryFeatureInfo(latitude, longitude, "landuse_parcels");
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    /**
     * Handle click on municipality layer for drill-down
     */
    async handleMunicipalityClick(lat, lon) {
        const municipalityName = await this.queryMunicipality(lat, lon);
        
        if (municipalityName) {
            console.log(`Municipality clicked: ${municipalityName}`);
            this.drillDownToMunicipality(municipalityName);
        } else {
            console.log("No municipality found at this location.");
        }
    }

    /**
     * Query the municipalities layer to get the clicked municipality name
     */
    async queryMunicipality(lat, lon) {
        const buffer = 0.001; 
        const bbox = `${lon - buffer},${lat - buffer},${lon + buffer},${lat + buffer}`;
        
        const params = new URLSearchParams({
            service: 'WMS',
            version: '1.1.1',
            request: 'GetFeatureInfo',
            layers: `${this.workspace}:boundaries_all_municipalities`,
            query_layers: `${this.workspace}:boundaries_all_municipalities`,
            info_format: 'application/json',
            bbox: bbox,
            width: 101,
            height: 101,
            srs: 'EPSG:4326',
            x: 50,
            y: 50
        });

        const url = `${this.geoserverUrl}?${params.toString()}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const props = data.features[0].properties;
                // Try common property names for municipality name
                return props.name || props.municipal_name || props.mun_name || 
                       props.MUNICIPAL || props.NAME || Object.values(props)[0];
            }
            return null;
        } catch (error) {
            console.error("Error querying municipality:", error);
            return null;
        }
    }

    /**
     * Drill down into a specific municipality
     * - Flies to the municipality extent
     * - Enables relevant layers based on pattern matching
     * - Always enables parcels layer
     */
    drillDownToMunicipality(municipalityName) {
        const normalizedName = municipalityName.toLowerCase().trim();
        
        // Find matching municipality config
        let targetConfig = null;
        let matchedKey = null;
        
        for (const [key, config] of Object.entries(this.municipalityConfig)) {
            if (normalizedName.includes(key) || key.includes(normalizedName)) {
                targetConfig = config;
                matchedKey = key;
                break;
            }
        }
        
        if (!targetConfig) {
            console.warn(`No configuration found for municipality: ${municipalityName}`);
            return;
        }
        
        console.log(`Drilling down to: ${matchedKey}`);
        this.currentMunicipality = matchedKey;
        
        // 1. Fly to the municipality
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                targetConfig.lon, 
                targetConfig.lat, 
                targetConfig.height
            ),
            orientation: {
                heading: 0.0,
                pitch: Cesium.Math.toRadians(-90.0), // Angled view for better 3D perception
                roll: 0.0
            },
            duration: 2.0
        });
        
        // 2. Switch layer visibility context
        this.switchLayerContext(targetConfig.pattern);
    }

    /**
     * Switch layer visibility based on municipality pattern
     * - Hide all detail layers
     * - Show only layers matching the pattern
     * - Always show parcels when zoomed in
     */
    switchLayerContext(pattern) {
        console.log(`Switching context to pattern: ${pattern}`);
        
        this.layers.forEach(cfg => {
            if (!cfg._cesiumLayer) return;
            
            if (cfg.category === 'admin') {
                // Keep municipalities visible but reduce opacity when zoomed in
                cfg._cesiumLayer.show = true;
                cfg._cesiumLayer.alpha = cfg.layer === 'boundaries_all_municipalities' ? 0.3 : cfg.opacity;
            } else if (cfg.category === 'parcels') {
                // Always show parcels when drilled down
                cfg._cesiumLayer.show = true;
            } else if (cfg.category === 'detail') {
                // Show only layers matching the municipality pattern
                const shouldShow = cfg.layer.includes(pattern);
                cfg._cesiumLayer.show = shouldShow;
                console.log(`Layer ${cfg.layer}: ${shouldShow ? 'VISIBLE' : 'hidden'}`);
            }
        });
    }

    /**
     * Reset to initial overview state
     * - Fly back to high altitude
     * - Hide all detail layers
     * - Show only municipalities
     */
    resetToOverview() {
        console.log("Resetting to overview state...");
        this.currentMunicipality = null;
        
        // Fly back to overview
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(-79.6, 44.0, 300000),
            orientation: {
                heading: 0.0,
                pitch: Cesium.Math.toRadians(-90.0),
                roll: 0.0
            },
            duration: 2.0
        });
        
        // Reset layer visibility
        this.layers.forEach(cfg => {
            if (!cfg._cesiumLayer) return;
            
            if (cfg.layer === 'boundaries_all_municipalities') {
                cfg._cesiumLayer.show = true;
                cfg._cesiumLayer.alpha = cfg.opacity;
            } else {
                cfg._cesiumLayer.show = false;
            }
        });
    }

    /**
     * Sends WMS GetFeatureInfo request to GeoServer for detailed features
     */
    async queryFeatureInfo(lat, lon, layerName) {
        const buffer = 0.0001; 
        const bbox = `${lon - buffer},${lat - buffer},${lon + buffer},${lat + buffer}`;
        
        const params = new URLSearchParams({
            service: 'WMS',
            version: '1.1.1',
            request: 'GetFeatureInfo',
            layers: `${this.workspace}:${layerName}`,
            query_layers: `${this.workspace}:${layerName}`,
            info_format: 'application/json',
            bbox: bbox,
            width: 101,
            height: 101,
            srs: 'EPSG:4326',
            x: 50,
            y: 50
        });

        const url = `${this.geoserverUrl}?${params.toString()}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const props = data.features[0].properties;
                console.log("FEATURE FOUND:", props);
                this.displayFeatureInfo(props);
                return props;
            } else {
                console.log("No feature found at this location.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching feature info:", error);
            return null;
        }
    }

    /**
     * Display feature information (can be overridden for custom UI)
     */
    displayFeatureInfo(props) {
        // Default implementation - can be customized
        const rollNumber = props.roll_number || props.ROLL_NUMBER || 'N/A';
        const address = props.address_full || props.ADDRESS || props.address || 'N/A';
        alert(`Selected Property:\nRoll #: ${rollNumber}\nAddress: ${address}`);
    }

    /**
     * Helper to fly to a specific municipality by name
     */
    flyToLocation(name) {
        const normalizedName = name.toLowerCase().trim();
        const target = this.municipalityConfig[normalizedName];
        
        if (target) {
            this.drillDownToMunicipality(name);
        } else {
            console.warn(`Unknown location: ${name}`);
        }
    }

    /**
     * Toggle a specific layer's visibility
     */
    toggleLayer(layerName, visible) {
        const cfg = this.layers.find(l => l.layer === layerName);
        if (cfg && cfg._cesiumLayer) {
            cfg._cesiumLayer.show = visible;
            console.log(`Layer ${layerName} set to ${visible ? 'visible' : 'hidden'}`);
        }
    }

    /**
     * Get all layers configuration (for UI layer panel)
     */
    getLayersConfig() {
        return this.layers.map(cfg => ({
            layer: cfg.layer,
            title: cfg.title,
            visible: cfg._cesiumLayer ? cfg._cesiumLayer.show : cfg.visible,
            opacity: cfg.opacity,
            category: cfg.category
        }));
    }

    /**
     * Set layer opacity
     */
    setLayerOpacity(layerName, opacity) {
        const cfg = this.layers.find(l => l.layer === layerName);
        if (cfg && cfg._cesiumLayer) {
            cfg._cesiumLayer.alpha = opacity;
            cfg.opacity = opacity;
        }
    }

    /**
     * Get current municipality (if drilled down)
     */
    getCurrentMunicipality() {
        return this.currentMunicipality;
    }
}

// Attach to window for easy access
window.MunicipalGIS = MunicipalGIS;

// Also export as ES module for React integration
export default MunicipalGIS;