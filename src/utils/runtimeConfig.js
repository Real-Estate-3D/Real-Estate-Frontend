// Centralized runtime configuration.
//
// Vite exposes env vars via `import.meta.env`.
// Only variables prefixed with `VITE_` are exposed to the client.

function stripTrailingSlash(value) {
  if (!value) return value;
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function buildUrl(base, ...parts) {
  const cleanBase = stripTrailingSlash(base);
  const cleanParts = parts
    .filter(Boolean)
    .map((p) => String(p).replace(/^\/+/, "").replace(/\/+$/, ""));
  return [cleanBase, ...cleanParts].filter(Boolean).join("/");
}

const DEFAULT_GEOSERVER_BASE_URL = "https://16.52.55.27.nip.io/geoserver";
const DEFAULT_GEOSERVER_WORKSPACE = "municipal_planning";

const geoserverBaseUrl = stripTrailingSlash(
  import.meta.env.VITE_GEOSERVER_BASE_URL || DEFAULT_GEOSERVER_BASE_URL
);

const geoserverWorkspace =
  import.meta.env.VITE_GEOSERVER_WORKSPACE || DEFAULT_GEOSERVER_WORKSPACE;

// Allow explicit overrides, otherwise derive from base + workspace.
const geoserverWmsUrl = stripTrailingSlash(
  import.meta.env.VITE_GEOSERVER_WMS_URL ||
    buildUrl(geoserverBaseUrl, geoserverWorkspace, "wms")
);

// WFS endpoint - workspace-scoped for this GeoServer setup
const geoserverWfsUrl = stripTrailingSlash(
  import.meta.env.VITE_GEOSERVER_WFS_URL || 
    buildUrl(geoserverBaseUrl, geoserverWorkspace, "wfs")
);

export const GEOSERVER_CONFIG = Object.freeze({
  baseUrl: geoserverBaseUrl,
  workspace: geoserverWorkspace,
  wmsUrl: geoserverWmsUrl,
  wfsUrl: geoserverWfsUrl,
  srs: import.meta.env.VITE_GEOSERVER_SRS || "EPSG:4326",
});

export const NOMINATIM_SEARCH_URL =
  import.meta.env.VITE_NOMINATIM_SEARCH_URL ||
  "https://nominatim.openstreetmap.org/search";

export const CESIUM_ION_TOKEN = import.meta.env.VITE_CESIUM_ION_TOKEN || "";
