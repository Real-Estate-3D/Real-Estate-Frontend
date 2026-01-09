// File: src/hooks/useLegislation.js
// Custom hook for legislation data management
// Provides a clean interface between components and the API service

import { useState, useEffect, useCallback } from 'react';
import legislationService from '../services/legislationService';

/**
 * Custom hook for managing legislation data
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} - Legislation state and handlers
 */
const useLegislation = (initialFilters = {}) => {
  const [legislations, setLegislations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    ...initialFilters,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
  });

  // Fetch legislations
  const fetchLegislations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await legislationService.getAll({
        ...filters,
        page: pagination.page,
        perPage: pagination.perPage,
      });
      setLegislations(response.data);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (err) {
      setError(err.message || 'Failed to fetch legislations');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.perPage]);

  // Fetch on mount and when filters/pagination change
  useEffect(() => {
    fetchLegislations();
  }, [fetchLegislations]);

  // Filter handlers
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handlePerPageChange = useCallback((newPerPage) => {
    setPagination(prev => ({ ...prev, perPage: newPerPage, page: 1 }));
  }, []);

  // CRUD operations
  const createLegislation = useCallback(async (data) => {
    setLoading(true);
    try {
      const newLegislation = await legislationService.create(data);
      setLegislations(prev => [newLegislation, ...prev]);
      return newLegislation;
    } catch (err) {
      setError(err.message || 'Failed to create legislation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLegislation = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const updated = await legislationService.update(id, data);
      setLegislations(prev => 
        prev.map(item => item.id === id ? updated : item)
      );
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update legislation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLegislation = useCallback(async (id) => {
    setLoading(true);
    try {
      await legislationService.delete(id);
      setLegislations(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete legislation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const swapLegislation = useCallback(async (id) => {
    try {
      await legislationService.swap(id);
      // Refresh to get updated data
      await fetchLegislations();
    } catch (err) {
      setError(err.message || 'Failed to swap legislation');
      throw err;
    }
  }, [fetchLegislations]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchLegislations();
  }, [fetchLegislations]);

  return {
    // State
    legislations,
    loading,
    error,
    filters,
    pagination,
    
    // Filter handlers
    handleFilterChange,
    
    // Pagination handlers
    handlePageChange,
    handlePerPageChange,
    
    // CRUD operations
    createLegislation,
    updateLegislation,
    deleteLegislation,
    swapLegislation,
    
    // Utilities
    refresh,
    setError,
  };
};

export default useLegislation;
