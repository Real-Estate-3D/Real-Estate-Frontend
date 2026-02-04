// File: src/services/workflowService.js
// API service for workflow management

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

/**
 * Workflow API Service
 * All methods return promises and handle API communication
 */
const workflowService = {
  /**
   * Get all workflows with optional filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.type) queryParams.append('type', params.type);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${API_BASE_URL}/workflows?${queryParams}`, {
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
      console.error('Error fetching workflows:', error);
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
   * Get a single workflow by ID
   * @param {string|number} id - Workflow ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
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
      console.error('Error fetching workflow:', error);
      throw error;
    }
  },

  /**
   * Create a new workflow
   * @param {Object} data - Workflow data
   * @returns {Promise<Object>}
   */
  async create(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows`, {
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
      console.error('Error creating workflow:', error);
      throw error;
    }
  },

  /**
   * Update an existing workflow
   * @param {string|number} id - Workflow ID
   * @param {Object} data - Updated workflow data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
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
      console.error('Error updating workflow:', error);
      throw error;
    }
  },

  /**
   * Delete a workflow
   * @param {string|number} id - Workflow ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
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
      console.error('Error deleting workflow:', error);
      throw error;
    }
  },

  /**
   * Start a workflow
   * @param {string|number} id - Workflow ID
   * @returns {Promise<Object>}
   */
  async start(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${id}/start`, {
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
      console.error('Error starting workflow:', error);
      throw error;
    }
  },

  /**
   * Complete a workflow
   * @param {string|number} id - Workflow ID
   * @returns {Promise<Object>}
   */
  async complete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${id}/complete`, {
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
      console.error('Error completing workflow:', error);
      throw error;
    }
  },

  /**
   * Cancel a workflow
   * @param {string|number} id - Workflow ID
   * @returns {Promise<Object>}
   */
  async cancel(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${id}/cancel`, {
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
      console.error('Error cancelling workflow:', error);
      throw error;
    }
  },

  /**
   * Get workflow steps
   * @param {string|number} workflowId - Workflow ID
   * @returns {Promise<Array>}
   */
  async getSteps(workflowId) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps`, {
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
      console.error('Error fetching workflow steps:', error);
      return [];
    }
  },

  /**
   * Create a workflow step
   * @param {string|number} workflowId - Workflow ID
   * @param {Object} stepData - Step data
   * @returns {Promise<Object>}
   */
  async createStep(workflowId, stepData) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(stepData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating workflow step:', error);
      throw error;
    }
  },

  /**
   * Update a workflow step
   * @param {string|number} workflowId - Workflow ID
   * @param {string|number} stepId - Step ID
   * @param {Object} stepData - Step data
   * @returns {Promise<Object>}
   */
  async updateStep(workflowId, stepId, stepData) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps/${stepId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(stepData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating workflow step:', error);
      throw error;
    }
  },

  /**
   * Delete a workflow step
   * @param {string|number} workflowId - Workflow ID
   * @param {string|number} stepId - Step ID
   * @returns {Promise<void>}
   */
  async deleteStep(workflowId, stepId) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps/${stepId}`, {
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
      console.error('Error deleting workflow step:', error);
      throw error;
    }
  },

  /**
   * Complete a workflow step
   * @param {string|number} workflowId - Workflow ID
   * @param {string|number} stepId - Step ID
   * @returns {Promise<Object>}
   */
  async completeStep(workflowId, stepId) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps/${stepId}/complete`, {
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
      console.error('Error completing workflow step:', error);
      throw error;
    }
  },

  /**
   * Approve a workflow step
   * @param {string|number} workflowId - Workflow ID
   * @param {string|number} stepId - Step ID
   * @returns {Promise<Object>}
   */
  async approveStep(workflowId, stepId) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps/${stepId}/approve`, {
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
      console.error('Error approving workflow step:', error);
      throw error;
    }
  },

  /**
   * Reject a workflow step
   * @param {string|number} workflowId - Workflow ID
   * @param {string|number} stepId - Step ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>}
   */
  async rejectStep(workflowId, stepId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps/${stepId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error rejecting workflow step:', error);
      throw error;
    }
  },

  /**
   * Get workflow templates
   * @returns {Promise<Array>}
   */
  async getTemplates() {
    try {
      const response = await fetch(`${API_BASE_URL}/workflows/templates`, {
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
      console.error('Error fetching workflow templates:', error);
      return [];
    }
  },
};

export default workflowService;
