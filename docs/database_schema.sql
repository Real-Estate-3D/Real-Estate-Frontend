-- ============================================================================
-- GIS Database Schema for Multi-Tier Boundary Management
-- Designed for GeoServer CQL Filter Queries
-- ============================================================================

-- Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLEANUP - Drop existing schemas if they exist
-- ============================================================================

-- Drop existing schemas (CASCADE removes all dependent objects)
DROP SCHEMA IF EXISTS boundaries CASCADE;
DROP SCHEMA IF EXISTS infrastructure CASCADE;
DROP SCHEMA IF EXISTS landuse CASCADE;
DROP SCHEMA IF EXISTS reference CASCADE;

-- ============================================================================
-- CORE SCHEMA CREATION
-- ============================================================================

-- Create schemas for organization
CREATE SCHEMA boundaries;      -- Administrative boundaries
CREATE SCHEMA infrastructure;  -- Infrastructure assets
CREATE SCHEMA landuse;         -- Land use and zoning
CREATE SCHEMA reference;       -- Reference/lookup tables

COMMENT ON SCHEMA boundaries IS 'Administrative boundary hierarchies';
COMMENT ON SCHEMA infrastructure IS 'Infrastructure and asset data';
COMMENT ON SCHEMA landuse IS 'Land use, zoning, and planning data';
COMMENT ON SCHEMA reference IS 'Reference and lookup tables';

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================

-- Boundary Tier Types
CREATE TABLE reference.boundary_tier_types (
    tier_type_id SERIAL PRIMARY KEY,
    tier_name VARCHAR(50) NOT NULL UNIQUE,
    tier_level INTEGER NOT NULL, -- 1=upper/regional, 2=lower/municipal, 3=ward
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE reference.boundary_tier_types IS 'Types of administrative boundary tiers';

INSERT INTO reference.boundary_tier_types (tier_name, tier_level, description) VALUES
    ('Regional Municipality', 1, 'Upper tier regional government'),
    ('County', 1, 'Upper tier county government'),
    ('Municipality', 2, 'Lower tier municipality (city/town)'),
    ('Ward', 3, 'Electoral ward subdivision'),
    ('Single Tier', 1, 'Single tier municipality (no upper tier)');

-- Feature Types
CREATE TABLE reference.feature_types (
    feature_type_id SERIAL PRIMARY KEY,
    feature_category VARCHAR(50) NOT NULL,
    feature_name VARCHAR(100) NOT NULL UNIQUE,
    geometry_type VARCHAR(20) NOT NULL CHECK (geometry_type IN ('POINT', 'LINESTRING', 'POLYGON', 'MULTIPOINT', 'MULTILINESTRING', 'MULTIPOLYGON')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE reference.feature_types IS 'Types of geographic features';

INSERT INTO reference.feature_types (feature_category, feature_name, geometry_type, description) VALUES
    ('infrastructure', 'Building', 'POLYGON', 'Building footprints'),
    ('infrastructure', 'Address Point', 'POINT', 'Civic address locations'),
    ('infrastructure', 'Road', 'LINESTRING', 'Road centerlines'),
    ('infrastructure', 'Trail', 'LINESTRING', 'Pedestrian and cycling trails'),
    ('infrastructure', 'Parking', 'POLYGON', 'Parking lots and facilities'),
    ('landuse', 'Park', 'POLYGON', 'Parks and recreational areas'),
    ('landuse', 'Land Use', 'POLYGON', 'Land use designations'),
    ('landuse', 'Zoning', 'POLYGON', 'Zoning districts'),
    ('landuse', 'Parcel', 'POLYGON', 'Property parcels');

-- ============================================================================
-- BOUNDARY HIERARCHY TABLES
-- ============================================================================

-- Upper Tier Boundaries (Regional/County level)
CREATE TABLE boundaries.upper_tier (
    upper_tier_id SERIAL PRIMARY KEY,
    admin_id VARCHAR(50) UNIQUE,
    admin_name VARCHAR(254) NOT NULL,
    admin_type VARCHAR(254),
    tier_type_id INTEGER REFERENCES reference.boundary_tier_types(tier_type_id),
    province VARCHAR(50) DEFAULT 'Ontario',
    country VARCHAR(50) DEFAULT 'Canada',
    population INTEGER,
    area_sq_km NUMERIC(15,4),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    bbox BOX2D,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
);

COMMENT ON TABLE boundaries.upper_tier IS 'Upper tier boundaries (regional municipalities, counties)';
COMMENT ON COLUMN boundaries.upper_tier.bbox IS 'Cached bounding box for quick spatial queries';
COMMENT ON COLUMN boundaries.upper_tier.metadata IS 'Additional metadata in JSON format';

-- Lower Tier Boundaries (Municipal level)
CREATE TABLE boundaries.lower_tier (
    lower_tier_id SERIAL PRIMARY KEY,
    upper_tier_id INTEGER REFERENCES boundaries.upper_tier(upper_tier_id) ON DELETE CASCADE,
    admin_id VARCHAR(50) UNIQUE,
    admin_name VARCHAR(254) NOT NULL,
    admin_type VARCHAR(254), -- Town, City, Township, etc.
    tier_type_id INTEGER REFERENCES reference.boundary_tier_types(tier_type_id),
    parent_name VARCHAR(254),
    alias TEXT,
    population INTEGER,
    area_sq_km NUMERIC(15,4),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    bbox BOX2D,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
    -- Note: Spatial containment validation (lower tier within upper tier) should be done at application level
    -- CHECK constraints cannot use subqueries in PostgreSQL
);

COMMENT ON TABLE boundaries.lower_tier IS 'Lower tier boundaries (cities, towns, townships)';
COMMENT ON COLUMN boundaries.lower_tier.upper_tier_id IS 'Parent upper tier boundary (NULL for single-tier municipalities)';

-- Single Tier Boundaries (No upper tier)
CREATE TABLE boundaries.single_tier (
    single_tier_id SERIAL PRIMARY KEY,
    admin_id VARCHAR(50) UNIQUE,
    admin_name VARCHAR(254) NOT NULL,
    admin_type VARCHAR(254),
    tier_type_id INTEGER REFERENCES reference.boundary_tier_types(tier_type_id),
    province VARCHAR(50) DEFAULT 'Ontario',
    country VARCHAR(50) DEFAULT 'Canada',
    alias TEXT,
    population INTEGER,
    area_sq_km NUMERIC(15,4),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    bbox BOX2D,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
);

COMMENT ON TABLE boundaries.single_tier IS 'Single tier municipalities (no upper/lower tier structure)';

-- Ward/Electoral Boundaries
CREATE TABLE boundaries.wards (
    ward_id SERIAL PRIMARY KEY,
    lower_tier_id INTEGER REFERENCES boundaries.lower_tier(lower_tier_id) ON DELETE CASCADE,
    single_tier_id INTEGER REFERENCES boundaries.single_tier(single_tier_id) ON DELETE CASCADE,
    admin_id VARCHAR(50),
    ward_number INTEGER,
    ward_name VARCHAR(254) NOT NULL,
    admin_type VARCHAR(254) DEFAULT 'Ward',
    parent_name VARCHAR(254),
    alias VARCHAR(254),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    bbox BOX2D,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326),
    CONSTRAINT ward_has_parent CHECK (lower_tier_id IS NOT NULL OR single_tier_id IS NOT NULL),
    CONSTRAINT unique_ward_per_municipality UNIQUE (lower_tier_id, ward_number)
);

COMMENT ON TABLE boundaries.wards IS 'Ward/electoral district boundaries within municipalities';

-- ============================================================================
-- INFRASTRUCTURE TABLES
-- ============================================================================

-- Buildings
CREATE TABLE infrastructure.buildings (
    building_id SERIAL PRIMARY KEY,
    lower_tier_id INTEGER REFERENCES boundaries.lower_tier(lower_tier_id),
    single_tier_id INTEGER REFERENCES boundaries.single_tier(single_tier_id),
    ward_id INTEGER REFERENCES boundaries.wards(ward_id),
    object_id VARCHAR(50),
    building_type VARCHAR(254),
    facility_id VARCHAR(100),
    property_number VARCHAR(50),
    property_code VARCHAR(50),
    property_type VARCHAR(254),
    building_height NUMERIC(10,2),
    stories INTEGER,
    area_sq_m NUMERIC(15,4),
    perimeter_m NUMERIC(15,4),
    construction_date DATE,
    last_modified TIMESTAMP,
    last_user VARCHAR(100),
    notes TEXT,
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
);

COMMENT ON TABLE infrastructure.buildings IS 'Building footprints';
COMMENT ON COLUMN infrastructure.buildings.centroid IS 'Cached centroid for point-based queries';

-- Address Points
CREATE TABLE infrastructure.address_points (
    address_id SERIAL PRIMARY KEY,
    lower_tier_id INTEGER REFERENCES boundaries.lower_tier(lower_tier_id),
    single_tier_id INTEGER REFERENCES boundaries.single_tier(single_tier_id),
    ward_id INTEGER REFERENCES boundaries.wards(ward_id),
    object_id VARCHAR(50),
    civic_number VARCHAR(20),
    street_name VARCHAR(100),
    street_type VARCHAR(50),
    street_suffix VARCHAR(50),
    street_direction VARCHAR(20),
    full_address VARCHAR(254) NOT NULL,
    municipality VARCHAR(100),
    postal_code VARCHAR(10),
    unit_number VARCHAR(20),
    pin VARCHAR(50), -- Property Identification Number
    arn VARCHAR(50), -- Assessment Roll Number
    facility_id VARCHAR(100),
    x_coord NUMERIC(15,8),
    y_coord NUMERIC(15,8),
    notes TEXT,
    geom GEOMETRY(Point, 4326) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
);

COMMENT ON TABLE infrastructure.address_points IS 'Civic address point locations';

-- Roads
CREATE TABLE infrastructure.roads (
    road_id SERIAL PRIMARY KEY,
    lower_tier_id INTEGER REFERENCES boundaries.lower_tier(lower_tier_id),
    single_tier_id INTEGER REFERENCES boundaries.single_tier(single_tier_id),
    object_id VARCHAR(50),
    road_name VARCHAR(100) NOT NULL,
    street_suffix VARCHAR(50),
    street_direction VARCHAR(50),
    full_name VARCHAR(254),
    road_function VARCHAR(50), -- arterial, collector, local
    jurisdiction VARCHAR(50), -- municipal, regional, provincial
    municipality VARCHAR(100),
    regional_road VARCHAR(50),
    regional_road_number VARCHAR(10),
    from_address_left INTEGER,
    to_address_left INTEGER,
    from_address_right INTEGER,
    to_address_right INTEGER,
    parity_left VARCHAR(10), -- even, odd, both
    parity_right VARCHAR(10),
    from_node VARCHAR(50),
    to_node VARCHAR(50),
    length_m NUMERIC(15,4),
    facility_id VARCHAR(100),
    installation_date DATE,
    last_modified TIMESTAMP,
    notes TEXT,
    geom GEOMETRY(MultiLineString, 4326) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
);

COMMENT ON TABLE infrastructure.roads IS 'Road centerlines';

-- Trails
CREATE TABLE infrastructure.trails (
    trail_id SERIAL PRIMARY KEY,
    lower_tier_id INTEGER REFERENCES boundaries.lower_tier(lower_tier_id),
    single_tier_id INTEGER REFERENCES boundaries.single_tier(single_tier_id),
    object_id VARCHAR(50),
    trail_name VARCHAR(254),
    trail_type VARCHAR(100),
    surface_type VARCHAR(100),
    status VARCHAR(50),
    width_m NUMERIC(8,2),
    length_m NUMERIC(15,4),
    grade VARCHAR(50),
    lighting BOOLEAN,
    amenities TEXT,
    location_description TEXT,
    from_location VARCHAR(254),
    to_location VARCHAR(254),
    park_name VARCHAR(254),
    asset_id VARCHAR(50),
    facility_id VARCHAR(100),
    installation_date DATE,
    year_built INTEGER,
    condition VARCHAR(50),
    last_inspection DATE,
    notes TEXT,
    geom GEOMETRY(MultiLineString, 4326) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
);

COMMENT ON TABLE infrastructure.trails IS 'Pedestrian and cycling trails';

-- Parking Facilities
CREATE TABLE infrastructure.parking (
    parking_id SERIAL PRIMARY KEY,
    lower_tier_id INTEGER REFERENCES boundaries.lower_tier(lower_tier_id),
    single_tier_id INTEGER REFERENCES boundaries.single_tier(single_tier_id),
    object_id VARCHAR(50),
    parking_name VARCHAR(254),
    parking_type VARCHAR(100), -- lot, structure, on-street
    description TEXT,
    facility_id VARCHAR(100),
    asset_id VARCHAR(100),
    capacity INTEGER,
    surface_type VARCHAR(100),
    status VARCHAR(50),
    installation_date DATE,
    maintenance_date DATE,
    inspection_date DATE,
    notes TEXT,
    geom GEOMETRY(Geometry, 4326) NOT NULL, -- Can be Point, Polygon, or MultiPolygon
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
);

COMMENT ON TABLE infrastructure.parking IS 'Parking lots and facilities';

-- ============================================================================
-- LAND USE AND PLANNING TABLES
-- ============================================================================

-- Parks
CREATE TABLE landuse.parks (
    park_id SERIAL PRIMARY KEY,
    lower_tier_id INTEGER REFERENCES boundaries.lower_tier(lower_tier_id),
    single_tier_id INTEGER REFERENCES boundaries.single_tier(single_tier_id),
    object_id VARCHAR(50),
    park_name VARCHAR(254) NOT NULL,
    park_type VARCHAR(100),
    status VARCHAR(50),
    address VARCHAR(254),
    area_ha NUMERIC(15,6),
    facility_id VARCHAR(100),
    asset_id VARCHAR(100),
    amenities TEXT,
    playgrounds INTEGER,
    legacy_id VARCHAR(50),
    installation_date DATE,
    notes TEXT,
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
);

COMMENT ON TABLE landuse.parks IS 'Parks and recreational areas';

-- Land Use Designations
CREATE TABLE landuse.land_use (
    land_use_id SERIAL PRIMARY KEY,
    lower_tier_id INTEGER REFERENCES boundaries.lower_tier(lower_tier_id),
    single_tier_id INTEGER REFERENCES boundaries.single_tier(single_tier_id),
    designation_code VARCHAR(50),
    designation_name VARCHAR(254) NOT NULL,
    amendment_number VARCHAR(100),
    description TEXT,
    area_sq_m NUMERIC(15,4),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
);

COMMENT ON TABLE landuse.land_use IS 'Official plan land use designations';

-- Zoning Districts
CREATE TABLE landuse.zoning (
    zoning_id SERIAL PRIMARY KEY,
    lower_tier_id INTEGER REFERENCES boundaries.lower_tier(lower_tier_id),
    single_tier_id INTEGER REFERENCES boundaries.single_tier(single_tier_id),
    zone_code VARCHAR(50) NOT NULL,
    zone_name VARCHAR(254) NOT NULL,
    bylaw_number VARCHAR(50),
    permitted_uses TEXT,
    zone_standards TEXT,
    ordinance_url TEXT,
    status VARCHAR(50),
    notes TEXT,
    area_sq_m NUMERIC(15,4),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
);

COMMENT ON TABLE landuse.zoning IS 'Zoning districts and bylaws';

-- Property Parcels
CREATE TABLE landuse.parcels (
    parcel_id SERIAL PRIMARY KEY,
    lower_tier_id INTEGER REFERENCES boundaries.lower_tier(lower_tier_id),
    single_tier_id INTEGER REFERENCES boundaries.single_tier(single_tier_id),
    arn VARCHAR(200), -- Assessment Roll Number
    pin VARCHAR(50), -- Property Identification Number
    trunk_roll VARCHAR(50),
    lot_number VARCHAR(100),
    plan_number VARCHAR(100),
    legal_description TEXT,
    mpac_code VARCHAR(50),
    address VARCHAR(254),
    street_name VARCHAR(100),
    street_type VARCHAR(50),
    municipality VARCHAR(100),
    full_address VARCHAR(254),
    area_sq_m NUMERIC(15,4),
    area_ha NUMERIC(15,6),
    area_ac NUMERIC(15,6),
    x_coord NUMERIC(15,8),
    y_coord NUMERIC(15,8),
    notes TEXT,
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enforce_geom_srid CHECK (ST_SRID(geom) = 4326)
);

COMMENT ON TABLE landuse.parcels IS 'Property parcel boundaries';

-- ============================================================================
-- SPATIAL INDEXES
-- ============================================================================

-- Boundary Indexes
CREATE INDEX idx_upper_tier_geom ON boundaries.upper_tier USING GIST(geom);
-- Note: bbox GIST indexes removed - box2d type doesn't support GIST indexing
-- Geometry indexes provide sufficient performance for spatial queries
CREATE INDEX idx_lower_tier_geom ON boundaries.lower_tier USING GIST(geom);
CREATE INDEX idx_lower_tier_upper ON boundaries.lower_tier(upper_tier_id);
CREATE INDEX idx_single_tier_geom ON boundaries.single_tier USING GIST(geom);
CREATE INDEX idx_wards_geom ON boundaries.wards USING GIST(geom);
CREATE INDEX idx_wards_lower ON boundaries.wards(lower_tier_id);
CREATE INDEX idx_wards_single ON boundaries.wards(single_tier_id);

-- Infrastructure Indexes
CREATE INDEX idx_buildings_geom ON infrastructure.buildings USING GIST(geom);
CREATE INDEX idx_buildings_centroid ON infrastructure.buildings USING GIST(centroid);
CREATE INDEX idx_buildings_lower ON infrastructure.buildings(lower_tier_id);
CREATE INDEX idx_buildings_ward ON infrastructure.buildings(ward_id);

CREATE INDEX idx_address_geom ON infrastructure.address_points USING GIST(geom);
CREATE INDEX idx_address_lower ON infrastructure.address_points(lower_tier_id);
CREATE INDEX idx_address_ward ON infrastructure.address_points(ward_id);
CREATE INDEX idx_address_full ON infrastructure.address_points(full_address);

CREATE INDEX idx_roads_geom ON infrastructure.roads USING GIST(geom);
CREATE INDEX idx_roads_lower ON infrastructure.roads(lower_tier_id);
CREATE INDEX idx_roads_name ON infrastructure.roads(road_name);

CREATE INDEX idx_trails_geom ON infrastructure.trails USING GIST(geom);
CREATE INDEX idx_trails_lower ON infrastructure.trails(lower_tier_id);

CREATE INDEX idx_parking_geom ON infrastructure.parking USING GIST(geom);
CREATE INDEX idx_parking_lower ON infrastructure.parking(lower_tier_id);

-- Land Use Indexes
CREATE INDEX idx_parks_geom ON landuse.parks USING GIST(geom);
CREATE INDEX idx_parks_centroid ON landuse.parks USING GIST(centroid);
CREATE INDEX idx_parks_lower ON landuse.parks(lower_tier_id);

CREATE INDEX idx_landuse_geom ON landuse.land_use USING GIST(geom);
CREATE INDEX idx_landuse_lower ON landuse.land_use(lower_tier_id);

CREATE INDEX idx_zoning_geom ON landuse.zoning USING GIST(geom);
CREATE INDEX idx_zoning_lower ON landuse.zoning(lower_tier_id);
CREATE INDEX idx_zoning_code ON landuse.zoning(zone_code);

CREATE INDEX idx_parcels_geom ON landuse.parcels USING GIST(geom);
CREATE INDEX idx_parcels_centroid ON landuse.parcels USING GIST(centroid);
CREATE INDEX idx_parcels_lower ON landuse.parcels(lower_tier_id);
CREATE INDEX idx_parcels_arn ON landuse.parcels(arn);
CREATE INDEX idx_parcels_pin ON landuse.parcels(pin);

-- ============================================================================
-- ATTRIBUTE INDEXES FOR CQL FILTERING
-- ============================================================================

-- Boundary attribute indexes
CREATE INDEX idx_upper_tier_name ON boundaries.upper_tier(admin_name);
CREATE INDEX idx_lower_tier_name ON boundaries.lower_tier(admin_name);
CREATE INDEX idx_single_tier_name ON boundaries.single_tier(admin_name);
CREATE INDEX idx_wards_number ON boundaries.wards(ward_number);
CREATE INDEX idx_wards_name ON boundaries.wards(ward_name);

-- Infrastructure attribute indexes
CREATE INDEX idx_buildings_type ON infrastructure.buildings(building_type);
CREATE INDEX idx_roads_function ON infrastructure.roads(road_function);
CREATE INDEX idx_trails_type ON infrastructure.trails(trail_type);
CREATE INDEX idx_trails_surface ON infrastructure.trails(surface_type);

-- Land use attribute indexes
CREATE INDEX idx_parks_type ON landuse.parks(park_type);
CREATE INDEX idx_parks_name ON landuse.parks(park_name);
CREATE INDEX idx_landuse_code ON landuse.land_use(designation_code);

-- JSONB indexes for flexible metadata queries
CREATE INDEX idx_upper_tier_metadata ON boundaries.upper_tier USING GIN(metadata);
CREATE INDEX idx_lower_tier_metadata ON boundaries.lower_tier USING GIN(metadata);
CREATE INDEX idx_buildings_metadata ON infrastructure.buildings USING GIN(metadata);
CREATE INDEX idx_parcels_metadata ON landuse.parcels USING GIN(metadata);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update centroid
CREATE OR REPLACE FUNCTION update_centroid()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME IN ('buildings', 'parks', 'parcels') THEN
        NEW.centroid = ST_Centroid(NEW.geom);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update bbox
CREATE OR REPLACE FUNCTION update_bbox()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bbox = Box2D(NEW.geom);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers to all tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_schema || '.' || table_name 
        FROM information_schema.tables 
        WHERE table_schema IN ('boundaries', 'infrastructure', 'landuse')
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_timestamp
            BEFORE UPDATE ON %s
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', replace(tbl, '.', '_'), tbl);
    END LOOP;
END $$;

-- Apply centroid triggers
CREATE TRIGGER update_buildings_centroid
    BEFORE INSERT OR UPDATE OF geom ON infrastructure.buildings
    FOR EACH ROW EXECUTE FUNCTION update_centroid();

CREATE TRIGGER update_parks_centroid
    BEFORE INSERT OR UPDATE OF geom ON landuse.parks
    FOR EACH ROW EXECUTE FUNCTION update_centroid();

CREATE TRIGGER update_parcels_centroid
    BEFORE INSERT OR UPDATE OF geom ON landuse.parcels
    FOR EACH ROW EXECUTE FUNCTION update_centroid();

-- Apply bbox triggers
CREATE TRIGGER update_upper_tier_bbox
    BEFORE INSERT OR UPDATE OF geom ON boundaries.upper_tier
    FOR EACH ROW EXECUTE FUNCTION update_bbox();

CREATE TRIGGER update_lower_tier_bbox
    BEFORE INSERT OR UPDATE OF geom ON boundaries.lower_tier
    FOR EACH ROW EXECUTE FUNCTION update_bbox();

CREATE TRIGGER update_single_tier_bbox
    BEFORE INSERT OR UPDATE OF geom ON boundaries.single_tier
    FOR EACH ROW EXECUTE FUNCTION update_bbox();

CREATE TRIGGER update_wards_bbox
    BEFORE INSERT OR UPDATE OF geom ON boundaries.wards
    FOR EACH ROW EXECUTE FUNCTION update_bbox();

-- ============================================================================
-- MATERIALIZED VIEWS FOR GEOSERVER (Performance Optimized)
-- ============================================================================

-- Materialized view combining all municipality boundaries
DROP MATERIALIZED VIEW IF EXISTS boundaries.all_municipalities CASCADE;
CREATE MATERIALIZED VIEW boundaries.all_municipalities AS
SELECT 
    'upper_tier' as tier_type,
    upper_tier_id as municipality_id,
    admin_id,
    admin_name,
    admin_type,
    NULL::INTEGER as parent_id,
    NULL::VARCHAR as parent_name,
    province,
    geom
FROM boundaries.upper_tier
UNION ALL
SELECT 
    'lower_tier' as tier_type,
    lower_tier_id as municipality_id,
    admin_id,
    admin_name,
    admin_type,
    upper_tier_id as parent_id,
    parent_name,
    'Ontario'::VARCHAR as province,
    geom
FROM boundaries.lower_tier
UNION ALL
SELECT 
    'single_tier' as tier_type,
    single_tier_id as municipality_id,
    admin_id,
    admin_name,
    admin_type,
    NULL::INTEGER as parent_id,
    NULL::VARCHAR as parent_name,
    province,
    geom
FROM boundaries.single_tier;

-- Create indexes on materialized view
CREATE INDEX idx_all_municipalities_geom ON boundaries.all_municipalities USING GIST(geom);
CREATE INDEX idx_all_municipalities_tier ON boundaries.all_municipalities(tier_type);
CREATE INDEX idx_all_municipalities_name ON boundaries.all_municipalities(admin_name);

COMMENT ON MATERIALIZED VIEW boundaries.all_municipalities IS 'Unified materialized view of all municipality boundaries for GeoServer - refresh after data changes';

-- Materialized view for hierarchical boundary queries
DROP MATERIALIZED VIEW IF EXISTS boundaries.hierarchy_view CASCADE;
CREATE MATERIALIZED VIEW boundaries.hierarchy_view AS
SELECT 
    ut.upper_tier_id,
    ut.admin_name as upper_tier_name,
    lt.lower_tier_id,
    lt.admin_name as lower_tier_name,
    w.ward_id,
    w.ward_name,
    w.ward_number,
    COALESCE(w.geom, lt.geom, ut.geom) as geom
FROM boundaries.upper_tier ut
LEFT JOIN boundaries.lower_tier lt ON lt.upper_tier_id = ut.upper_tier_id
LEFT JOIN boundaries.wards w ON w.lower_tier_id = lt.lower_tier_id;

-- Create indexes on hierarchical view
CREATE INDEX idx_hierarchy_view_geom ON boundaries.hierarchy_view USING GIST(geom);
CREATE INDEX idx_hierarchy_view_upper ON boundaries.hierarchy_view(upper_tier_id);
CREATE INDEX idx_hierarchy_view_lower ON boundaries.hierarchy_view(lower_tier_id);
CREATE INDEX idx_hierarchy_view_ward ON boundaries.hierarchy_view(ward_id);

COMMENT ON MATERIALIZED VIEW boundaries.hierarchy_view IS 'Hierarchical boundary structure for cascading queries - refresh after data changes';

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION boundaries.refresh_all_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY boundaries.all_municipalities;
    REFRESH MATERIALIZED VIEW CONCURRENTLY boundaries.hierarchy_view;
    RAISE NOTICE 'All materialized views refreshed successfully';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION boundaries.refresh_all_views IS 'Refresh all materialized views after data updates';

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to find municipality containing a point
CREATE OR REPLACE FUNCTION boundaries.find_municipality(
    p_lon NUMERIC,
    p_lat NUMERIC
)
RETURNS TABLE (
    tier_type VARCHAR,
    municipality_id INTEGER,
    municipality_name VARCHAR,
    parent_name VARCHAR
) AS $$
BEGIN
    -- Try lower tier first
    RETURN QUERY
    SELECT 
        'lower_tier'::VARCHAR,
        lt.lower_tier_id,
        lt.admin_name,
        lt.parent_name
    FROM boundaries.lower_tier lt
    WHERE ST_Contains(lt.geom, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326))
    LIMIT 1;
    
    IF NOT FOUND THEN
        -- Try single tier
        RETURN QUERY
        SELECT 
            'single_tier'::VARCHAR,
            st.single_tier_id,
            st.admin_name,
            NULL::VARCHAR
        FROM boundaries.single_tier st
        WHERE ST_Contains(st.geom, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326))
        LIMIT 1;
    END IF;
    
    IF NOT FOUND THEN
        -- Try upper tier
        RETURN QUERY
        SELECT 
            'upper_tier'::VARCHAR,
            ut.upper_tier_id,
            ut.admin_name,
            NULL::VARCHAR
        FROM boundaries.upper_tier ut
        WHERE ST_Contains(ut.geom, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326))
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION boundaries.find_municipality IS 'Find which municipality contains a given point';

-- Function to get all features within a boundary
CREATE OR REPLACE FUNCTION get_features_in_boundary(
    p_boundary_table VARCHAR,
    p_boundary_id INTEGER,
    p_feature_table VARCHAR
)
RETURNS SETOF RECORD AS $$
DECLARE
    boundary_geom GEOMETRY;
    query TEXT;
BEGIN
    -- Get boundary geometry
    EXECUTE format('SELECT geom FROM %I WHERE %I = $1', p_boundary_table, p_boundary_table || '_id')
    INTO boundary_geom
    USING p_boundary_id;
    
    -- Query features within boundary
    query := format('SELECT * FROM %I WHERE ST_Within(geom, $1)', p_feature_table);
    RETURN QUERY EXECUTE query USING boundary_geom;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS AND PERMISSIONS
-- ============================================================================

-- Drop existing roles if they exist
DROP ROLE IF EXISTS geoserver_role;
DROP ROLE IF EXISTS readonly_role;
DROP ROLE IF EXISTS dataloader_role;

-- Create roles for different access levels
CREATE ROLE geoserver_role;
CREATE ROLE readonly_role;
CREATE ROLE dataloader_role;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA boundaries, infrastructure, landuse, reference TO geoserver_role, readonly_role;
GRANT SELECT ON ALL TABLES IN SCHEMA boundaries, infrastructure, landuse, reference TO geoserver_role, readonly_role;

GRANT USAGE ON SCHEMA boundaries, infrastructure, landuse, reference TO dataloader_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA boundaries, infrastructure, landuse, reference TO dataloader_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA boundaries, infrastructure, landuse, reference TO dataloader_role;

-- ============================================================================
-- STATISTICS AND PERFORMANCE
-- ============================================================================

-- Update statistics for query planning
ANALYZE boundaries.upper_tier;
ANALYZE boundaries.lower_tier;
ANALYZE boundaries.single_tier;
ANALYZE boundaries.wards;
ANALYZE infrastructure.buildings;
ANALYZE infrastructure.address_points;
ANALYZE infrastructure.roads;
ANALYZE infrastructure.trails;
ANALYZE infrastructure.parking;
ANALYZE landuse.parks;
ANALYZE landuse.land_use;
ANALYZE landuse.zoning;
ANALYZE landuse.parcels;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

-- Note: Database comment should be set manually if needed:
-- COMMENT ON DATABASE postgres IS 'GIS database for multi-tier municipal boundaries and infrastructure';

-- Create a metadata table
CREATE TABLE reference.schema_metadata (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

INSERT INTO reference.schema_metadata (version, description, notes) VALUES
    ('1.0.0', 'Initial schema with multi-tier boundary support', 
     'Designed for GeoServer CQL filtering with hierarchical boundary relationships');

-- ============================================================================
-- SAMPLE CQL FILTER QUERIES (for GeoServer)
-- ============================================================================
/*
Example CQL filters for GeoServer:

1. Filter buildings within a specific municipality:
   lower_tier_id = 1 AND building_type = 'Residential Single'

2. Filter roads by municipality and type:
   lower_tier_id = 1 AND road_function = 'b arterial'

3. Filter addresses within a ward:
   ward_id = 5

4. Filter parks by municipality:
   lower_tier_id = 1 AND park_type = 'Park'

5. Spatial filter - features within boundary:
   WITHIN(geom, (SELECT geom FROM boundaries.lower_tier WHERE lower_tier_id = 1))

6. Combined filters:
   lower_tier_id = 1 AND building_type LIKE '%Residential%' AND stories > 2

7. Filter by parent hierarchy:
   lower_tier_id IN (SELECT lower_tier_id FROM boundaries.lower_tier WHERE upper_tier_id = 1)
*/

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
