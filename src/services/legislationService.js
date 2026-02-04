// File: src/services/legislationService.js
// API service for legislation management

import gisScheduleService from './gisScheduleService';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

// Mock GIS layers data - will be replaced with API
const mockGISLayers = [
  { id: 'official_plan_map', name: 'Official Plan Land Use', type: 'WMS', category: 'planning', description: 'Official plan land use designations' },
  { id: 'zoning_bylaw_map', name: 'Zoning By-law Map', type: 'WMS', category: 'zoning', description: 'Current zoning by-law classifications' },
  { id: 'height_map', name: 'Building Height Limits', type: 'WMS', category: 'planning', description: 'Maximum building height restrictions' },
  { id: 'density_map', name: 'Density Provisions', type: 'WMS', category: 'planning', description: 'Floor space index and density limits' },
  { id: 'parking_overlay', name: 'Parking Overlay', type: 'WMS', category: 'zoning', description: 'Parking requirements overlay' },
  { id: 'heritage_properties', name: 'Heritage Properties', type: 'WMS', category: 'heritage', description: 'Designated heritage properties' },
  { id: 'natural_heritage_system', name: 'Natural Heritage System', type: 'WMS', category: 'environment', description: 'Natural heritage features and areas' },
  { id: 'flood_hazard', name: 'Flood Hazard Areas', type: 'WMS', category: 'environment', description: 'Floodplain and hazard lands' },
  { id: 'secondary_plan_areas', name: 'Secondary Plan Areas', type: 'WMS', category: 'planning', description: 'Secondary plan boundaries' },
  { id: 'holding_provisions', name: 'Holding Provisions', type: 'WMS', category: 'zoning', description: 'Properties with holding (H) symbols' },
];

/**
 * Legislation API Service
 * All methods return promises and handle API communication
 */
const legislationService = {
  /**
   * Get all legislations with optional filters and pagination
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {string} params.status - Filter by status
   * @param {string} params.type - Filter by legislation type
   * @param {number} params.page - Page number
   * @param {number} params.perPage - Items per page
   * @returns {Promise<{data: Array, total: number}>}
   */
  async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);
      if (params.page) queryParams.append('page', params.page);
      if (params.perPage) queryParams.append('limit', params.perPage);

      const response = await fetch(`${API_BASE_URL}/legislations?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if available
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        data: result.data || [],
        total: result.pagination?.total || 0,
        page: result.pagination?.page || params.page || 1,
        perPage: result.pagination?.limit || params.perPage || 10,
      };
    } catch (error) {
      console.error('Error fetching legislations:', error);
      // Return empty data on error to prevent UI crash
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        perPage: params.perPage || 10,
      };
    }
  },

  /**
   * Get a single legislation by ID
   * @param {string|number} id - Legislation ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/legislations/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching legislation:', error);
      throw error;
    }
  },

  /**
   * Create a new legislation
   * @param {Object} data - Legislation data
   * @returns {Promise<Object>}
   */
  async create(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/legislations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating legislation:', error);
      throw error;
    }
  },

  /**
   * Update an existing legislation
   * @param {string|number} id - Legislation ID
   * @param {Object} data - Updated legislation data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/legislations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating legislation:', error);
      throw error;
    }
  },

  /**
   * Delete a legislation
   * @param {string|number} id - Legislation ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/legislations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting legislation:', error);
      throw error;
    }
  },

  /**
   * Swap/toggle legislation status
   * @param {string|number} id - Legislation ID
   * @returns {Promise<Object>}
   */
  async swap(id) {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/legislations/${id}/swap`, {
    //   method: 'POST',
    // });
    // return response.json();
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, swapped: true });
      }, 300);
    });
  },

  /**
   * Get available jurisdictions
   * @returns {Promise<Array>}
   */
  async getJurisdictions() {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/jurisdictions`);
    // return response.json();
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { value: 'toronto', label: 'City of Toronto' },
          { value: 'mississauga', label: 'City of Mississauga' },
          { value: 'brampton', label: 'City of Brampton' },
          { value: 'markham', label: 'City of Markham' },
          { value: 'vaughan', label: 'City of Vaughan' },
        ]);
      }, 200);
    });
  },

  /**
   * Get available workflows
   * @returns {Promise<Array>}
   */
  async getWorkflows() {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows`, {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  },

  /**
   * Get available base templates
   * @returns {Promise<Array>}
   */
  async getBaseTemplates() {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/templates`);
    // return response.json();
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 200);
    });
  },

  /**
   * Upload GIS schedule file
   * @param {File} file - File to upload
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>}
   */
  async uploadGISSchedule(file, metadata = {}) {
    return gisScheduleService.uploadFile(file, metadata);
  },

  /**
   * Publish a legislation
   * @param {string|number} id - Legislation ID
   * @param {Object} options - Publish options
   * @returns {Promise<Object>}
   */
  async publish(id, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/legislations/${id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error publishing legislation:', error);
      throw error;
    }
  },

  // ==========================================
  // GIS Layers API Methods
  // ==========================================

  /**
   * Get available GIS layers
   * @param {Object} params - Query parameters
   * @param {string} params.jurisdiction - Filter by jurisdiction
   * @param {string} params.category - Filter by category
   * @param {string} params.search - Search term
   * @returns {Promise<Array>}
   */
  async getGISLayers(params = {}) {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/gis-layers?${new URLSearchParams(params)}`);
    // return response.json();

    return new Promise((resolve) => {
      setTimeout(() => {
        let layers = [...mockGISLayers];
        
        // Filter by category if provided
        if (params.category) {
          layers = layers.filter(l => l.category === params.category);
        }
        
        // Filter by search term if provided
        if (params.search) {
          const term = params.search.toLowerCase();
          layers = layers.filter(l => 
            l.name.toLowerCase().includes(term) ||
            l.description.toLowerCase().includes(term)
          );
        }
        
        resolve(layers);
      }, 300);
    });
  },

  /**
   * Get GIS layer categories
   * @returns {Promise<Array>}
   */
  async getGISLayerCategories() {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/gis-layers/categories`);
    // return response.json();

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { value: 'zoning', label: 'Zoning', icon: 'layers' },
          { value: 'planning', label: 'Planning', icon: 'file-text' },
          { value: 'parcels', label: 'Parcels', icon: 'map-pin' },
          { value: 'infrastructure', label: 'Infrastructure', icon: 'route' },
          { value: 'environment', label: 'Environment', icon: 'trees' },
          { value: 'heritage', label: 'Heritage', icon: 'building-2' },
          { value: 'admin', label: 'Administrative', icon: 'building-2' },
        ]);
      }, 200);
    });
  },

  /**
   * Get GIS schedule types
   * @returns {Promise<Array>}
   */
  async getGISScheduleTypes() {
    return gisScheduleService.getScheduleTypes();
  },

  /**
   * Create a GIS schedule for a legislation
   * @param {string|number} legislationId - Legislation ID
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise<Object>}
   */
  async createGISSchedule(legislationId, scheduleData) {
    return gisScheduleService.create({
      ...scheduleData,
      legislation_id: legislationId,
    });
  },

  /**
   * Get GIS schedules for a legislation
   * @param {string|number} legislationId - Legislation ID
   * @returns {Promise<Array>}
   */
  async getGISSchedules(legislationId) {
    return gisScheduleService.getByLegislation(legislationId);
  },

  /**
   * Delete a GIS schedule
   * @param {string|number} legislationId - Legislation ID (not used but kept for API consistency)
   * @param {string|number} scheduleId - Schedule ID
   * @returns {Promise<void>}
   */
  async deleteGISSchedule(legislationId, scheduleId) {
    return gisScheduleService.delete(scheduleId);
  },

  /**
   * Get layer preview URL for map display
   * @param {string} layerId - Layer ID
   * @param {Object} params - WMS parameters
   * @returns {Promise<string>}
   */
  async getLayerPreviewUrl(layerId, params = {}) {
    // TODO: Replace with actual API call to get WMS URL
    // This would typically return a GeoServer WMS URL
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock WMS URL - replace with actual GeoServer URL
        const baseUrl = 'http://16.52.55.27:8080/geoserver/municipal_planning/wms';
        const layer = mockGISLayers.find(l => l.id === layerId);
        if (layer) {
          resolve(`${baseUrl}?layers=${layer.id}&service=WMS&version=1.1.0&request=GetMap`);
        } else {
          resolve(null);
        }
      }, 100);
    });
  },
};

export default legislationService;
