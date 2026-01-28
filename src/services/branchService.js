// File: src/services/branchService.js
// API service for legislation branch management

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

/**
 * Helper to convert API response to frontend format
 */
const transformBranch = (branch) => {
  // Calculate month indices for timeline visualization
  const startDate = new Date(branch.createdAt || branch.created_at);
  const endDate = branch.mergedAt || branch.merged_at
    ? new Date(branch.mergedAt || branch.merged_at)
    : (branch.status === 'active' ? null : new Date(branch.updatedAt || branch.updated_at));

  const baseDate = new Date('2024-01-01');
  const startMonth = Math.max(0, Math.floor((startDate - baseDate) / (30 * 24 * 60 * 60 * 1000)));
  const endMonth = endDate
    ? Math.floor((endDate - baseDate) / (30 * 24 * 60 * 60 * 1000))
    : 7; // Default to 7 months for active branches

  return {
    id: branch.id?.toString(),
    name: branch.name,
    description: branch.description,
    isMain: branch.isMain || branch.is_main,
    status: branch.status,
    version: branch.metadata?.version || null,
    parentBranchId: branch.parentBranchId || branch.parent_branch_id,
    baseVersionId: branch.baseVersionId || branch.base_version_id,
    mergedAt: branch.mergedAt || branch.merged_at,
    mergedBy: branch.mergedBy || branch.merged_by,
    mergedIntoBranchId: branch.mergedIntoBranchId || branch.merged_into_branch_id,
    metadata: branch.metadata,
    isApplied: branch.metadata?.isApplied || branch.isMain || branch.is_main,
    createdAt: branch.createdAt || branch.created_at,
    updatedAt: branch.updatedAt || branch.updated_at,
    // Timeline visualization props
    startMonth,
    endMonth,
  };
};

/**
 * Branch API Service
 * All methods return promises and handle API communication
 */
const branchService = {
  /**
   * Get all branches for a legislation
   * @param {string|number} legislationId - Legislation ID
   * @param {Object} params - Query parameters
   * @returns {Promise<{data: Array, total: number}>}
   */
  async getAll(legislationId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(
        `${API_BASE_URL}/legislations/${legislationId}/branches?${queryParams}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        data: (result.data || []).map(transformBranch),
        total: result.pagination?.total || 0,
        page: result.pagination?.page || params.page || 1,
        limit: result.pagination?.limit || params.limit || 20,
      };
    } catch (error) {
      console.error('Error fetching branches:', error);
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 20,
      };
    }
  },

  /**
   * Get timeline data for branches
   * @param {string|number} legislationId - Legislation ID
   * @returns {Promise<Array>}
   */
  async getTimeline(legislationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/legislations/${legislationId}/branches/timeline`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return (result.data || []).map(transformBranch);
    } catch (error) {
      console.error('Error fetching branch timeline:', error);
      return [];
    }
  },

  /**
   * Get a single branch by ID
   * @param {string|number} legislationId - Legislation ID
   * @param {string|number} branchId - Branch ID
   * @returns {Promise<Object>}
   */
  async getById(legislationId, branchId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/legislations/${legislationId}/branches/${branchId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      return transformBranch(result.data);
    } catch (error) {
      console.error('Error fetching branch:', error);
      throw error;
    }
  },

  /**
   * Create a new branch
   * @param {string|number} legislationId - Legislation ID
   * @param {Object} data - Branch data
   * @returns {Promise<Object>}
   */
  async create(legislationId, data) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/legislations/${legislationId}/branches`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            parent_branch_id: data.parentBranchId,
            base_version_id: data.baseVersionId,
            metadata: data.metadata || {},
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return transformBranch(result.data);
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  },

  /**
   * Update an existing branch
   * @param {string|number} legislationId - Legislation ID
   * @param {string|number} branchId - Branch ID
   * @param {Object} data - Updated branch data
   * @returns {Promise<Object>}
   */
  async update(legislationId, branchId, data) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/legislations/${legislationId}/branches/${branchId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return transformBranch(result.data);
    } catch (error) {
      console.error('Error updating branch:', error);
      throw error;
    }
  },

  /**
   * Delete a branch
   * @param {string|number} legislationId - Legislation ID
   * @param {string|number} branchId - Branch ID
   * @returns {Promise<void>}
   */
  async delete(legislationId, branchId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/legislations/${legislationId}/branches/${branchId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  },

  /**
   * Apply or unapply a branch
   * @param {string|number} legislationId - Legislation ID
   * @param {string|number} branchId - Branch ID
   * @param {boolean} apply - Whether to apply or unapply
   * @returns {Promise<Object>}
   */
  async applyBranch(legislationId, branchId, apply = true) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/legislations/${legislationId}/branches/${branchId}/apply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          },
          body: JSON.stringify({ apply }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return transformBranch(result.data);
    } catch (error) {
      console.error('Error applying branch:', error);
      throw error;
    }
  },

  /**
   * Merge a branch into another
   * @param {string|number} legislationId - Legislation ID
   * @param {string|number} sourceBranchId - Source branch ID (branch to merge)
   * @param {string|number} targetBranchId - Target branch ID (branch to merge into)
   * @returns {Promise<Object>}
   */
  async mergeBranch(legislationId, sourceBranchId, targetBranchId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/legislations/${legislationId}/branches/${sourceBranchId}/merge`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          },
          body: JSON.stringify({ target_branch_id: targetBranchId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return transformBranch(result.data);
    } catch (error) {
      console.error('Error merging branch:', error);
      throw error;
    }
  },
};

export default branchService;
