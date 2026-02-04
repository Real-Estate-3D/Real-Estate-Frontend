// File: src/services/gisScheduleService.js
// API service for GIS schedule management

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

/**
 * GIS Schedule API Service
 * All methods return promises and handle API communication
 */
const gisScheduleService = {
  /**
   * Get all GIS schedules with optional filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.scheduleType) queryParams.append('scheduleType', params.scheduleType);
      if (params.legislationId) queryParams.append('legislationId', params.legislationId);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${API_BASE_URL}/gis-schedules?${queryParams}`, {
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
      return {
        data: result.data || [],
        pagination: result.pagination || {
          total: 0,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 0,
        },
      };
    } catch (error) {
      console.error('Error fetching GIS schedules:', error);
      return {
        data: [],
        pagination: {
          total: 0,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 0,
        },
      };
    }
  },

  /**
   * Get a single GIS schedule by ID
   * @param {string|number} id - GIS schedule ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/gis-schedules/${id}`, {
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
      console.error('Error fetching GIS schedule:', error);
      throw error;
    }
  },

  /**
   * Create a new GIS schedule
   * @param {Object} data - GIS schedule data
   * @returns {Promise<Object>}
   */
  async create(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/gis-schedules`, {
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
      console.error('Error creating GIS schedule:', error);
      throw error;
    }
  },

  /**
   * Update an existing GIS schedule
   * @param {string|number} id - GIS schedule ID
   * @param {Object} data - Updated GIS schedule data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/gis-schedules/${id}`, {
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
      console.error('Error updating GIS schedule:', error);
      throw error;
    }
  },

  /**
   * Delete a GIS schedule
   * @param {string|number} id - GIS schedule ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/gis-schedules/${id}`, {
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
      console.error('Error deleting GIS schedule:', error);
      throw error;
    }
  },

  /**
   * Upload GIS file
   * @param {File} file - File to upload
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>}
   */
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(`${API_BASE_URL}/gis-schedules/upload`, {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error uploading GIS file:', error);
      throw error;
    }
  },

  /**
   * Get GIS schedules by legislation
   * @param {string|number} legislationId - Legislation ID
   * @returns {Promise<Array>}
   */
  async getByLegislation(legislationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/gis-schedules/legislation/${legislationId}`, {
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
      console.error('Error fetching GIS schedules by legislation:', error);
      return [];
    }
  },

  /**
   * Get available GIS schedule types
   * @returns {Promise<Array>}
   */
  async getScheduleTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/gis-schedules/types`, {
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
      console.error('Error fetching GIS schedule types:', error);
      // Return default types on error
      return [
        { value: 'map_schedule', label: 'Map Schedule' },
        { value: 'zoning_schedule', label: 'Zoning Schedule' },
        { value: 'land_use', label: 'Land Use Schedule' },
        { value: 'height_density', label: 'Height & Density Schedule' },
        { value: 'parking', label: 'Parking Schedule' },
        { value: 'environmental', label: 'Environmental Schedule' },
        { value: 'heritage', label: 'Heritage Schedule' },
        { value: 'urban_design', label: 'Urban Design Schedule' },
      ];
    }
  },
};

export default gisScheduleService;
