// File: src/services/changeHistoryService.js
// API service for change history management

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

/**
 * Change History API Service
 * All methods return promises and handle API communication
 */
const changeHistoryService = {
  /**
   * Get all change history with optional filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.change_type) queryParams.append('change_type', params.change_type);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await fetch(`${API_BASE_URL}/change-history?${queryParams}`, {
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
      console.error('Error fetching change history:', error);
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
   * Get change history by ID
   * @param {string|number} id - Change history ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/change-history/${id}`, {
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
      console.error('Error fetching change history:', error);
      throw error;
    }
  },

  /**
   * Get change history for a legislation
   * @param {string|number} legislationId - Legislation ID
   * @param {Object} params - Query parameters
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async getByLegislation(legislationId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await fetch(`${API_BASE_URL}/change-history/legislation/${legislationId}?${queryParams}`, {
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
      console.error('Error fetching change history for legislation:', error);
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
   * Get change history for a zoning law
   * @param {string|number} zoningLawId - Zoning law ID
   * @param {Object} params - Query parameters
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async getByZoningLaw(zoningLawId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await fetch(`${API_BASE_URL}/change-history/zoning-law/${zoningLawId}?${queryParams}`, {
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
      console.error('Error fetching change history for zoning law:', error);
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
  }
};

export default changeHistoryService;
