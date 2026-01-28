// File: src/services/zoningLawService.js
// API service for zoning law management

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

/**
 * Zoning Law API Service
 * All methods return promises and handle API communication
 */
const zoningLawService = {
  /**
   * Get all zoning laws with optional filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.type) queryParams.append('type', params.type);
      if (params.status) queryParams.append('status', params.status);
      if (params.municipality) queryParams.append('municipality', params.municipality);
      if (params.jurisdiction) queryParams.append('jurisdiction', params.jurisdiction);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${API_BASE_URL}/zoning-laws?${queryParams}`, {
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
      console.error('Error fetching zoning laws:', error);
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
   * Get a single zoning law by ID
   * @param {string|number} id - Zoning law ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/zoning-laws/${id}`, {
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
      console.error('Error fetching zoning law:', error);
      throw error;
    }
  },

  /**
   * Create a new zoning law
   * @param {Object} data - Zoning law data
   * @returns {Promise<Object>}
   */
  async create(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/zoning-laws`, {
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
      console.error('Error creating zoning law:', error);
      throw error;
    }
  },

  /**
   * Update an existing zoning law
   * @param {string|number} id - Zoning law ID
   * @param {Object} data - Updated zoning law data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/zoning-laws/${id}`, {
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
      console.error('Error updating zoning law:', error);
      throw error;
    }
  },

  /**
   * Delete a zoning law
   * @param {string|number} id - Zoning law ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/zoning-laws/${id}`, {
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
      console.error('Error deleting zoning law:', error);
      throw error;
    }
  },

  /**
   * Duplicate a zoning law
   * @param {string|number} id - Zoning law ID
   * @returns {Promise<Object>}
   */
  async duplicate(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/zoning-laws/${id}/duplicate`, {
        method: 'POST',
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

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error duplicating zoning law:', error);
      throw error;
    }
  },

  /**
   * Get zoning laws by zone code
   * @param {string} zoneCode - Zone code
   * @returns {Promise<Array>}
   */
  async getByZoneCode(zoneCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/zoning-laws/zone-code/${zoneCode}`, {
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
      console.error('Error fetching zoning laws by zone code:', error);
      return [];
    }
  },

  /**
   * Get zoning laws by municipality
   * @param {string} municipality - Municipality name
   * @returns {Promise<Array>}
   */
  async getByMunicipality(municipality) {
    try {
      const response = await fetch(`${API_BASE_URL}/zoning-laws/municipality/${municipality}`, {
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
      console.error('Error fetching zoning laws by municipality:', error);
      return [];
    }
  },

  /**
   * Find zoning laws by location (spatial query)
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<Object>}
   */
  async findByLocation(latitude, longitude) {
    try {
      const response = await fetch(`${API_BASE_URL}/zoning-laws/find-by-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        data: result.data || [],
        location: result.location,
      };
    } catch (error) {
      console.error('Error finding zoning laws by location:', error);
      throw error;
    }
  },

  /**
   * Find zoning laws by parcel (spatial query)
   * @param {string|number} parcelId - Parcel ID
   * @returns {Promise<Object>}
   */
  async findByParcel(parcelId) {
    try {
      const response = await fetch(`${API_BASE_URL}/zoning-laws/find-by-parcel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({ parcelId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        data: result.data || [],
        parcelId: result.parcelId,
      };
    } catch (error) {
      console.error('Error finding zoning laws by parcel:', error);
      throw error;
    }
  },
};

export default zoningLawService;
