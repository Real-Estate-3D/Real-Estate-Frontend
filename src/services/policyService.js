// File: src/services/policyService.js
// API service for policy management

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

/**
 * Policy API Service
 * All methods return promises and handle API communication
 */
const policyService = {
  /**
   * Get all policies with optional filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.jurisdiction) queryParams.append('jurisdiction', params.jurisdiction);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${API_BASE_URL}/policies?${queryParams}`, {
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
      console.error('Error fetching policies:', error);
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
   * Get a single policy by ID
   * @param {string|number} id - Policy ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
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
      console.error('Error fetching policy:', error);
      throw error;
    }
  },

  /**
   * Create a new policy
   * @param {Object} data - Policy data
   * @returns {Promise<Object>}
   */
  async create(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/policies`, {
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
      console.error('Error creating policy:', error);
      throw error;
    }
  },

  /**
   * Update an existing policy
   * @param {string|number} id - Policy ID
   * @param {Object} data - Updated policy data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
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
      console.error('Error updating policy:', error);
      throw error;
    }
  },

  /**
   * Delete a policy
   * @param {string|number} id - Policy ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
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
      console.error('Error deleting policy:', error);
      throw error;
    }
  },

  /**
   * Duplicate a policy
   * @param {string|number} id - Policy ID
   * @returns {Promise<Object>}
   */
  async duplicate(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/policies/${id}/duplicate`, {
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
      console.error('Error duplicating policy:', error);
      throw error;
    }
  },

  /**
   * Get policy categories
   * @returns {Promise<Object>}
   */
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/policies/categories`, {
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
      return result.data || {};
    } catch (error) {
      console.error('Error fetching policy categories:', error);
      return {};
    }
  },

  /**
   * Get policies by category
   * @param {string} category - Category name
   * @returns {Promise<Array>}
   */
  async getByCategory(category) {
    try {
      const response = await fetch(`${API_BASE_URL}/policies/category/${category}`, {
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
      console.error('Error fetching policies by category:', error);
      return [];
    }
  },

  /**
   * Get policies by jurisdiction
   * @param {string} jurisdiction - Jurisdiction name
   * @returns {Promise<Array>}
   */
  async getByJurisdiction(jurisdiction) {
    try {
      const response = await fetch(`${API_BASE_URL}/policies/jurisdiction/${jurisdiction}`, {
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
      console.error('Error fetching policies by jurisdiction:', error);
      return [];
    }
  },
};

export default policyService;
