// File: src/components/legislation/LegislationLayersPanel.jsx

import React, { useState, useMemo } from 'react';
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
  Clock
} from 'lucide-react';

// Available layer categories with icons
const categoryIcons = {
  'map-scope': Building2,
  'provincial-policy': FileText,
  'greenbelt': Trees,
  'official-plan': FileText,
  'water-wastewater': Route,
  admin: Building2,
  parcels: MapPin,
  planning: FileText,
  infrastructure: Route,
  environment: Trees,
  zoning: Layers,
};

// Organized layers structure matching the image
const layerGroups = [
  {
    id: 'map-scope',
    name: 'Map Scope',
    icon: Building2,
    layers: [
      { id: 'single_tier', name: 'Single-Tier Municipality', description: 'Single-tier municipal boundaries' },
      { id: 'upper_tier', name: 'Upper-Tier Municipality', description: 'Upper-tier regional boundaries' },
    ]
  },
  {
    id: 'provincial-policy',
    name: 'Provincial Policy Statement',
    icon: FileText,
    layers: [
      { id: 'settlement_areas', name: 'Settlement Areas', description: 'Designated settlement areas', indicator: 'A', indicatorColor: '#3b82f6' },
      { id: 'natural_heritage', name: 'Natural Heritage Systems', description: 'Natural heritage features', indicator: 'B', indicatorColor: '#22c55e' },
      { id: 'hazard_lands', name: 'Hazard Lands', description: 'Hazard land designations', indicator: 'B', indicatorColor: '#f97316' },
      { id: 'agricultural_areas', name: 'Agricultural Areas', description: 'Prime agricultural areas', indicator: 'R', indicatorColor: '#ef4444' },
    ]
  },
  {
    id: 'greenbelt',
    name: 'Greenbelt Act',
    icon: Trees,
    layers: [
      { id: 'greenbelt_area', name: 'Greenbelt Area', description: 'Protected Greenbelt lands' },
      { id: 'protected_countryside', name: 'Protected Countryside', description: 'Protected countryside areas' },
    ]
  },
  {
    id: 'official-plan',
    name: 'Official Plan',
    icon: FileText,
    layers: [
      { id: 'land_use', name: 'Land Use Designations', description: 'Official plan land use' },
      { id: 'secondary_plans', name: 'Secondary Plan Areas', description: 'Secondary plan boundaries' },
      { id: 'special_policy', name: 'Special Policy Areas', description: 'Special policy designations' },
    ]
  },
  {
    id: 'water-wastewater',
    name: 'Water & Wastewater Master Plan',
    icon: Route,
    layers: [
      { id: 'water_service', name: 'Water Service Areas', description: 'Municipal water service' },
      { id: 'wastewater_service', name: 'Wastewater Service Areas', description: 'Municipal wastewater service' },
      { id: 'stormwater', name: 'Stormwater Management', description: 'Stormwater management areas' },
    ]
  },
];

// Recently updated layers (mock data)
const recentlyUpdatedLayers = [
  { id: 'settlement_areas', updatedAt: '2024-12-28', groupId: 'provincial-policy' },
  { id: 'land_use', updatedAt: '2024-12-27', groupId: 'official-plan' },
  { id: 'greenbelt_area', updatedAt: '2024-12-25', groupId: 'greenbelt' },
];

const LegislationLayersPanel = ({ 
  isOpen, 
  onClose, 
  enabledLayers = {},
  onLayerToggle,
  jurisdiction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'turned-on', 'recently-updated'
  const [expandedGroups, setExpandedGroups] = useState({
    'map-scope': true,
    'provincial-policy': true,
    'greenbelt': false,
    'official-plan': false,
    'water-wastewater': false,
  });

  // Filter layers based on search
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return layerGroups;
    
    return layerGroups.map(group => ({
      ...group,
      layers: group.layers.filter(layer => 
        layer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        layer.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.layers.length > 0);
  }, [searchTerm]);

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
      const recentIds = recentlyUpdatedLayers.map(l => l.id);
      return filteredGroups.map(group => ({
        ...group,
        layers: group.layers.filter(layer => recentIds.includes(layer.id))
      })).filter(group => group.layers.length > 0);
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
    onLayerToggle(layer.id, !isEnabled, { ...layer, category: groupId });
  };

  // Count enabled layers
  const enabledCount = Object.values(enabledLayers).filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 bottom-0 w-full sm:w-72 bg-white border-l border-gray-200 flex flex-col shadow-lg z-20 max-h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Layers</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search layers"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          All Layers
        </button>
        <button
          onClick={() => setActiveTab('turned-on')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'turned-on'
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Turned On
          {enabledCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
              {enabledCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('recently-updated')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'recently-updated'
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Recently Updated
        </button>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {displayGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Layers className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No layers found</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'turned-on' 
                ? 'Toggle some layers to see them here'
                : activeTab === 'recently-updated'
                  ? 'No recently updated layers'
                  : 'Try a different search term'}
            </p>
          </div>
        ) : (
          displayGroups.map((group) => {
            const GroupIcon = group.icon || Layers;
            const isExpanded = expandedGroups[group.id];
            
            return (
              <div key={group.id} className="border-b border-gray-100 last:border-b-0">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-800">
                      {group.name}
                    </span>
                  </div>
                </button>

                {/* Group Layers */}
                {isExpanded && (
                  <div className="pb-2">
                    {group.layers.map((layer) => {
                      const isEnabled = enabledLayers[layer.id];
                      const recentUpdate = recentlyUpdatedLayers.find(r => r.id === layer.id);
                      
                      return (
                        <div
                          key={layer.id}
                          className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer group"
                          onClick={() => handleToggleLayer(layer, group.id)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* Colored Letter Indicator */}
                            {layer.indicator && (
                              <span 
                                className="w-4 h-4 flex items-center justify-center text-xs font-bold rounded"
                                style={{ color: layer.indicatorColor }}
                              >
                                {layer.indicator}
                              </span>
                            )}
                            <span className={`text-sm ${isEnabled ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                              {layer.name}
                            </span>
                            {recentUpdate && activeTab === 'recently-updated' && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {recentUpdate.updatedAt}
                              </div>
                            )}
                          </div>
                          
                          {/* Toggle Switch */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLayer(layer, group.id);
                            }}
                            className={`relative w-9 h-5 rounded-full transition-colors ${
                              isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                isEnabled ? 'translate-x-4' : 'translate-x-0.5'
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
