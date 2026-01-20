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
  EyeOff
} from 'lucide-react';

// Available layer categories with icons
const categoryIcons = {
  admin: Building2,
  parcels: MapPin,
  planning: FileText,
  infrastructure: Route,
  environment: Trees,
  zoning: Layers,
};

// Mock layers - will be replaced with API data
const availableLayers = [
  // Zoning layers
  { id: 'zoning_residential', name: 'Residential Zoning', category: 'zoning', description: 'Residential zone boundaries' },
  { id: 'zoning_commercial', name: 'Commercial Zoning', category: 'zoning', description: 'Commercial zone boundaries' },
  { id: 'zoning_industrial', name: 'Industrial Zoning', category: 'zoning', description: 'Industrial zone boundaries' },
  { id: 'zoning_mixed_use', name: 'Mixed-Use Zoning', category: 'zoning', description: 'Mixed-use zone boundaries' },
  
  // Planning layers
  { id: 'official_plan', name: 'Official Plan', category: 'planning', description: 'Official plan designations' },
  { id: 'secondary_plans', name: 'Secondary Plans', category: 'planning', description: 'Secondary plan areas' },
  { id: 'heritage_districts', name: 'Heritage Districts', category: 'planning', description: 'Heritage conservation districts' },
  
  // Parcel layers
  { id: 'property_boundaries', name: 'Property Boundaries', category: 'parcels', description: 'Legal property boundaries' },
  { id: 'assessment_parcels', name: 'Assessment Parcels', category: 'parcels', description: 'MPAC assessment parcels' },
  
  // Infrastructure layers
  { id: 'roads', name: 'Roads Network', category: 'infrastructure', description: 'Road classifications and rights-of-way' },
  { id: 'transit_routes', name: 'Transit Routes', category: 'infrastructure', description: 'Public transit routes' },
  { id: 'utilities', name: 'Utilities', category: 'infrastructure', description: 'Utility infrastructure' },
  
  // Environment layers
  { id: 'natural_heritage', name: 'Natural Heritage', category: 'environment', description: 'Natural heritage features' },
  { id: 'watercourses', name: 'Watercourses', category: 'environment', description: 'Rivers and streams' },
  { id: 'floodplain', name: 'Floodplain', category: 'environment', description: 'Flood hazard areas' },
  
  // Admin layers
  { id: 'ward_boundaries', name: 'Ward Boundaries', category: 'admin', description: 'Electoral ward boundaries' },
  { id: 'municipal_boundary', name: 'Municipal Boundary', category: 'admin', description: 'Municipal limits' },
];

const LegislationLayersPanel = ({ 
  isOpen, 
  onClose, 
  enabledLayers = {},
  onLayerToggle,
  jurisdiction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    zoning: true,
    planning: true,
    parcels: false,
    infrastructure: false,
    environment: false,
    admin: false,
  });

  // Filter layers based on search and jurisdiction
  const filteredLayers = useMemo(() => {
    return availableLayers.filter(layer => {
      const matchesSearch = !searchTerm || 
        layer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        layer.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // In the future, filter by jurisdiction here
      // const matchesJurisdiction = !jurisdiction || layer.jurisdiction === jurisdiction;
      
      return matchesSearch;
    });
  }, [searchTerm, jurisdiction]);

  // Group filtered layers by category
  const groupedLayers = useMemo(() => {
    return filteredLayers.reduce((acc, layer) => {
      if (!acc[layer.category]) {
        acc[layer.category] = [];
      }
      acc[layer.category].push(layer);
      return acc;
    }, {});
  }, [filteredLayers]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleToggleLayer = (layer) => {
    const isEnabled = enabledLayers[layer.id];
    onLayerToggle(layer.id, !isEnabled, layer);
  };

  // Count enabled layers
  const enabledCount = Object.values(enabledLayers).filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 bottom-0 w-72 bg-white border-l border-gray-200 flex flex-col shadow-lg z-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Layers</h3>
          {enabledCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded">
              {enabledCount}
            </span>
          )}
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
            placeholder="Search layers..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedLayers).map(([category, layers]) => {
          const CategoryIcon = categoryIcons[category] || Layers;
          const isExpanded = expandedCategories[category];
          
          return (
            <div key={category} className="border-b border-gray-100 last:border-b-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category}
                  </span>
                  <span className="text-xs text-gray-400">({layers.length})</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Category Layers */}
              {isExpanded && (
                <div className="pb-2">
                  {layers.map((layer) => {
                    const isEnabled = enabledLayers[layer.id];
                    
                    return (
                      <div
                        key={layer.id}
                        className="flex items-start gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleToggleLayer(layer)}
                      >
                        <button
                          className={`mt-0.5 p-1 rounded transition-colors ${
                            isEnabled 
                              ? 'text-blue-600 bg-blue-50' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {isEnabled ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${
                            isEnabled ? 'text-gray-900 font-medium' : 'text-gray-700'
                          }`}>
                            {layer.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {layer.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(groupedLayers).length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Layers className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No layers found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try a different search term
            </p>
          </div>
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
