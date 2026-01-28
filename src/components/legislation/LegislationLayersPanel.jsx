// File: src/components/legislation/LegislationLayersPanel.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Layers, 
  Search, 
  ChevronDown, 
  ChevronRight,
  MapPin,
  Building2,
  Trees,
  Route,
  FileText,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Clock,
  Loader2
} from 'lucide-react';
import { GradientTitleBar } from '../common';
import { fetchGeoServerLayers, groupLayersByCategory } from '../../utils/geoServerLayerManager';

// Available layer categories with icons
const categoryIcons = {
  admin: Building2,
  parcels: MapPin,
  planning: FileText,
  infrastructure: Route,
  environment: Trees,
  zoning: Layers,
};

const LegislationLayersPanel = ({ 
  isOpen, 
  onClose, 
  enabledLayers = {},
  onLayerToggle,
  jurisdiction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'turned-on', 'recently-updated'
  const [layerGroups, setLayerGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({
    admin: true,
    planning: true,
    parcels: false,
    infrastructure: false,
  });

  // Load layers from GeoServer layer manager on mount
  useEffect(() => {
    let mounted = true;
    
    const loadLayers = async () => {
      setLoading(true);
      try {
        const layers = await fetchGeoServerLayers();
        if (mounted) {
          // Transform layers to include id and name fields expected by the UI
          const transformedLayers = layers.map(layer => ({
            id: layer.name,
            name: layer.title,
            description: layer.description || '',
            category: layer.category,
            visible: layer.visible,
            opacity: layer.opacity,
          }));
          
          const grouped = groupLayersByCategory(transformedLayers);
          setLayerGroups(grouped);
          
          // Auto-expand first two categories
          const expandedState = {};
          grouped.forEach((group, index) => {
            expandedState[group.id] = index < 2;
          });
          setExpandedGroups(expandedState);
        }
      } catch (error) {
        console.error('Failed to load layers:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadLayers();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Filter layers based on search
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return layerGroups;
    
    return layerGroups.map(group => ({
      ...group,
      layers: group.layers.filter(layer => 
        layer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (layer.description && layer.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })).filter(group => group.layers.length > 0);
  }, [searchTerm, layerGroups]);

  // Get layers based on active tab
  const displayGroups = useMemo(() => {
    if (activeTab === 'all') {
      return filteredGroups;
    }
    
    if (activeTab === 'turned-on') {
      return filteredGroups.map(group => ({
        ...group,
        layers: group.layers.filter(layer => enabledLayers[layer.id])
      })).filter(group => group.layers.length > 0);
    }
    
    if (activeTab === 'recently-updated') {
      // For now, just show all layers - in production this would check update timestamps
      return filteredGroups;
    }
    
    return filteredGroups;
  }, [activeTab, filteredGroups, enabledLayers]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleToggleLayer = (layer, groupId) => {
    const isEnabled = enabledLayers[layer.id];
    onLayerToggle(layer.id, !isEnabled, { ...layer, category: groupId, type: 'wms', layerName: layer.id });
  };

  // Count enabled layers
  const enabledCount = Object.values(enabledLayers).filter(Boolean).length;

  return (
    <div className="w-full h-full bg-white rounded-xl border border-gray-200 flex flex-col shadow-lg overflow-hidden">
      {/* Header */}
     
      
          <GradientTitleBar title={'Layers'} icon={Layers} collapsible />

       
    

      {/* Search */}
      <div className="px-1 py-1.5 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="w-full pl-7 pr-2 py-1 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
            activeTab === 'all'
              ? 'border-blue-600 border-b-2 text-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          All Layers
        </button>
        <button
          onClick={() => setActiveTab('turned-on')}
          className={`px-2 py-1 text-xs whitespace-nowrap font-medium rounded transition-colors ${
            activeTab === 'turned-on'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Turned On
          {enabledCount > 0 && (
            <span className="ml-1 px-1 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
              {enabledCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('recently-updated')}
          className={`px-2 py-1 text-xs whitespace-nowrap font-medium rounded transition-colors ${
            activeTab === 'recently-updated'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Recently Updated
        </button>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-3">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" />
            <p className="text-xs text-gray-500">Loading layers...</p>
          </div>
        ) : displayGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-3">
            <Layers className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs text-gray-500">No layers found</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {activeTab === 'turned-on' 
                ? 'Toggle some layers to see them here'
                : activeTab === 'recently-updated'
                  ? 'No recently updated layers'
                  : 'Try a different search term'}
            </p>
          </div>
        ) : (
          displayGroups.map((group) => {
            const GroupIcon = categoryIcons[group.id] || Layers;
            const isExpanded = expandedGroups[group.id];
            
            return (
              <div key={group.id} className="border-b border-gray-100 last:border-b-0">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className="text-xs font-medium text-gray-800">
                      {group.title}
                    </span>
                  </div>
                </button>

                {/* Group Layers */}
                {isExpanded && (
                  <div className="pb-1">
                    {group.layers.map((layer) => {
                      const isEnabled = enabledLayers[layer.id];
                      
                      return (
                        <div
                          key={layer.id}
                          className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 cursor-pointer group"
                          onClick={() => handleToggleLayer(layer, group.id)}
                        >
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {/* Colored Letter Indicator */}
                            {layer.indicator && (
                              <span 
                                className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold rounded"
                                style={{ color: layer.indicatorColor }}
                              >
                                {layer.indicator}
                              </span>
                            )}
                            <span className={`text-xs ${isEnabled ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                              {layer.name}
                            </span>
                          </div>
                          
                          {/* Toggle Switch */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLayer(layer, group.id);
                            }}
                            className={`relative w-7 h-4 rounded-full transition-colors ${
                              isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                                isEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer - Selected layers summary */}
      {enabledCount > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600">
            <span className="font-medium">{enabledCount}</span> layer{enabledCount !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};

export default LegislationLayersPanel;
