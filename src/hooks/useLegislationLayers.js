// File: src/hooks/useLegislationLayers.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import legislationService from '../services/legislationService';

/**
 * Hook for managing GIS layers in legislation creation
 * Handles layer fetching, filtering, and state management
 * 
 * @param {Object} options - Hook options
 * @param {string} options.jurisdiction - Current jurisdiction for filtering
 * @returns {Object} Layer state and handlers
 */
const useLegislationLayers = (options = {}) => {
  const { jurisdiction = null } = options;

  // State
  const [layers, setLayers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [scheduleTypes, setScheduleTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enabledLayers, setEnabledLayers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch layers
  const fetchLayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {};
      if (jurisdiction) params.jurisdiction = jurisdiction;
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const data = await legislationService.getGISLayers(params);
      setLayers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch layers');
      console.error('Error fetching GIS layers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [jurisdiction, selectedCategory, searchTerm]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await legislationService.getGISLayerCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Fetch schedule types
  const fetchScheduleTypes = useCallback(async () => {
    try {
      const data = await legislationService.getGISScheduleTypes();
      setScheduleTypes(data);
    } catch (err) {
      console.error('Error fetching schedule types:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
    fetchScheduleTypes();
  }, [fetchCategories, fetchScheduleTypes]);

  // Fetch layers when filters change
  useEffect(() => {
    fetchLayers();
  }, [fetchLayers]);

  // Toggle layer visibility
  const toggleLayer = useCallback((layerId, enabled, layerData = null) => {
    setEnabledLayers(prev => {
      const newState = { ...prev, [layerId]: enabled };
      if (!enabled) {
        delete newState[layerId];
      }
      return newState;
    });
  }, []);

  // Enable multiple layers at once
  const enableLayers = useCallback((layerIds) => {
    setEnabledLayers(prev => {
      const newState = { ...prev };
      layerIds.forEach(id => {
        newState[id] = true;
      });
      return newState;
    });
  }, []);

  // Disable all layers
  const disableAllLayers = useCallback(() => {
    setEnabledLayers({});
  }, []);

  // Get enabled layer data
  const enabledLayerData = useMemo(() => {
    return layers.filter(layer => enabledLayers[layer.id]);
  }, [layers, enabledLayers]);

  // Group layers by category
  const groupedLayers = useMemo(() => {
    return layers.reduce((acc, layer) => {
      if (!acc[layer.category]) {
        acc[layer.category] = [];
      }
      acc[layer.category].push(layer);
      return acc;
    }, {});
  }, [layers]);

  // Count of enabled layers
  const enabledCount = useMemo(() => {
    return Object.values(enabledLayers).filter(Boolean).length;
  }, [enabledLayers]);

  // Create GIS schedule
  const createSchedule = useCallback(async (legislationId, scheduleData) => {
    try {
      const result = await legislationService.createGISSchedule(legislationId, scheduleData);
      return result;
    } catch (err) {
      console.error('Error creating GIS schedule:', err);
      throw err;
    }
  }, []);

  // Get layer preview URL
  const getLayerPreviewUrl = useCallback(async (layerId) => {
    try {
      const url = await legislationService.getLayerPreviewUrl(layerId);
      return url;
    } catch (err) {
      console.error('Error getting layer preview URL:', err);
      return null;
    }
  }, []);

  return {
    // State
    layers,
    categories,
    scheduleTypes,
    isLoading,
    error,
    enabledLayers,
    enabledLayerData,
    enabledCount,
    groupedLayers,
    searchTerm,
    selectedCategory,

    // Actions
    setSearchTerm,
    setSelectedCategory,
    toggleLayer,
    enableLayers,
    disableAllLayers,
    refreshLayers: fetchLayers,
    createSchedule,
    getLayerPreviewUrl,
  };
};

export default useLegislationLayers;
