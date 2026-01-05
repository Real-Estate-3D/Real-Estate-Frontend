// File: src/components/legislation/EditZoneModal.jsx

import React, { useState, useCallback } from 'react';
import {
  X,
  Search,
  ZoomIn,
  ZoomOut,
  Hand,
  RotateCcw,
  Pencil,
  Flag,
  Square,
  Target,
  Layers,
  ChevronUp,
  ChevronDown,
  Copy,
} from 'lucide-react';

// Layer categories with their items
const layerCategories = [
  {
    id: 'map-scope',
    name: 'Map Scope',
    layers: [
      { id: 'single-tier', name: 'Single-Tier Municipality', color: null },
      { id: 'upper-tier', name: 'Upper-Tier Municipality', color: null },
    ],
  },
  {
    id: 'provincial-policy',
    name: 'Provincial Policy Statement',
    layers: [
      { id: 'settlement-areas', name: 'Settlement Areas', color: '#FCD34D' },
      { id: 'natural-heritage', name: 'Natural Heritage Systems', color: '#4ADE80' },
      { id: 'hazard-lands', name: 'Hazard Lands', color: '#F87171' },
      { id: 'agricultural-areas', name: 'Agricultural Areas', color: '#A78BFA' },
    ],
  },
  {
    id: 'greenbelt',
    name: 'Greenbelt Act',
    layers: [
      { id: 'greenbelt-area', name: 'Greenbelt Protected Area', color: '#22C55E' },
      { id: 'oak-ridges', name: 'Oak Ridges Moraine', color: '#84CC16' },
    ],
  },
  {
    id: 'official-plan',
    name: 'Official Plan',
    layers: [
      { id: 'urban-area', name: 'Urban Area', color: '#F59E0B' },
      { id: 'rural-area', name: 'Rural Area', color: '#10B981' },
      { id: 'employment-lands', name: 'Employment Lands', color: '#6366F1' },
    ],
  },
  {
    id: 'water-wastewater',
    name: 'Water & Wastewater Master Plan',
    layers: [
      { id: 'water-service', name: 'Water Service Area', color: '#3B82F6' },
      { id: 'wastewater-service', name: 'Wastewater Service Area', color: '#8B5CF6' },
    ],
  },
];

// Toolbar buttons configuration
const toolbarButtons = [
  { id: 'zoom-in', icon: ZoomIn, label: 'Zoom In' },
  { id: 'zoom-out', icon: ZoomOut, label: 'Zoom Out' },
  { id: 'pan', icon: Hand, label: 'Pan' },
  { id: 'reset', icon: RotateCcw, label: 'Reset View' },
  { id: 'draw', icon: Pencil, label: 'Draw' },
  { id: 'flag', icon: Flag, label: 'Add Marker' },
  { id: 'select', icon: Square, label: 'Select Area' },
  { id: 'target', icon: Target, label: 'Center on Location' },
  { id: 'layers', icon: Layers, label: 'Toggle Layers' },
];

const EditZoneModal = ({ isOpen, onClose, onSave, zoneName = 'Zoning By-Law Amendment' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [layerSearchQuery, setLayerSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeTool, setActiveTool] = useState('pan');
  const [expandedCategories, setExpandedCategories] = useState({
    'map-scope': true,
    'provincial-policy': true,
    'greenbelt': false,
    'official-plan': false,
    'water-wastewater': false,
  });
  const [enabledLayers, setEnabledLayers] = useState({
    'single-tier': true,
    'upper-tier': false,
    'settlement-areas': true,
    'natural-heritage': false,
    'hazard-lands': false,
    'agricultural-areas': false,
  });

  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  const toggleLayer = useCallback((layerId) => {
    setEnabledLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  const handleToolClick = useCallback((toolId) => {
    setActiveTool(toolId);
  }, []);

  const handleSave = useCallback(() => {
    onSave?.({ enabledLayers });
    onClose();
  }, [enabledLayers, onSave, onClose]);

  // Filter layers based on search and active tab
  const getFilteredCategories = useCallback(() => {
    return layerCategories.map(category => {
      let filteredLayers = category.layers;
      
      // Filter by search query
      if (layerSearchQuery) {
        filteredLayers = filteredLayers.filter(layer =>
          layer.name.toLowerCase().includes(layerSearchQuery.toLowerCase())
        );
      }
      
      // Filter by tab
      if (activeTab === 'turned-on') {
        filteredLayers = filteredLayers.filter(layer => enabledLayers[layer.id]);
      }
      
      return { ...category, layers: filteredLayers };
    }).filter(category => category.layers.length > 0);
  }, [layerSearchQuery, activeTab, enabledLayers]);

  if (!isOpen) return null;

  const filteredCategories = getFilteredCategories();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full h-full sm:w-[98vw] sm:h-[95vh] lg:w-[95vw] lg:h-[90vh] max-w-[1400px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Zone</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Map Area */}
          <div className="flex-1 relative bg-gray-100 min-h-[300px] lg:min-h-0">
            {/* Search Bar */}
            <div className="absolute top-4 left-4 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-48 sm:w-64 pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            {/* Map Toolbar */}
            <div className="absolute top-14 left-4 sm:top-14 z-10">
              <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-sm flex-wrap max-w-[200px] sm:max-w-none">
                {toolbarButtons.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      title={tool.label}
                      className={`p-2 rounded-lg transition-colors ${
                        activeTool === tool.id
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Map Placeholder with Zone Polygon */}
            <div className="absolute inset-0">
              {/* Background map tiles simulation */}
              <div className="w-full h-full bg-linear-to-br from-gray-200 via-gray-100 to-gray-200 relative overflow-hidden">
                {/* Street grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="streetGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#9CA3AF" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#streetGrid)" />
                </svg>

                {/* Zone Polygon Overlay */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
                  {/* Zone polygon - blue semi-transparent area */}
                  <polygon
                    points="380,120 900,300 800,580 230,450 230,230"
                    fill="rgba(147, 197, 253, 0.5)"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                  {/* Corner points */}
                  <circle cx="380" cy="120" r="8" fill="#3B82F6" />
                  <circle cx="900" cy="300" r="8" fill="#3B82F6" />
                  <circle cx="800" cy="580" r="8" fill="#3B82F6" />
                  <circle cx="230" cy="450" r="8" fill="#3B82F6" />
                  <circle cx="230" cy="230" r="8" fill="#3B82F6" />
                  {/* Center point with plus */}
                  <circle cx="500" cy="350" r="12" fill="white" stroke="#9CA3AF" strokeWidth="1" />
                  <line x1="494" y1="350" x2="506" y2="350" stroke="#9CA3AF" strokeWidth="2" />
                  <line x1="500" y1="344" x2="500" y2="356" stroke="#9CA3AF" strokeWidth="2" />
                </svg>

                {/* Simulated street names */}
                <div className="absolute top-[15%] left-[20%] text-xs text-gray-500 font-medium transform -rotate-12">
                  Rue de France
                </div>
                <div className="absolute top-[70%] left-[60%] text-xs text-gray-500 font-medium transform rotate-6">
                  Blvd St. Laurent
                </div>
              </div>
            </div>

            {/* Layer Legend */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">Layer Legend</h4>
                  <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-300/60 border border-blue-400 rounded-sm" />
                  <span className="text-sm text-gray-600">{zoneName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Layers Panel */}
          <div className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col bg-white max-h-[40vh] lg:max-h-full overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-gray-600" />
                <h3 className="text-base font-semibold text-gray-900">Layers</h3>
              </div>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Search Layers */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={layerSearchQuery}
                  onChange={(e) => setLayerSearchQuery(e.target.value)}
                  placeholder="Search layers"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tab Filters */}
            <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 overflow-x-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'turned-on', label: 'On' },
                { id: 'recently-updated', label: 'Recent' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Layer Categories */}
            <div className="flex-1 overflow-y-auto">
              {filteredCategories.map((category) => (
                <div key={category.id} className="border-b border-gray-200">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    {expandedCategories[category.id] ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Category Layers */}
                  {expandedCategories[category.id] && (
                    <div className="pb-2">
                      {category.layers.map((layer) => (
                        <div
                          key={layer.id}
                          className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            {layer.color && (
                              <div
                                className="w-4 h-4 rounded-sm border border-gray-300"
                                style={{ backgroundColor: layer.color }}
                              />
                            )}
                            <span className="text-sm text-gray-700">{layer.name}</span>
                          </div>
                          {/* Toggle Switch */}
                          <button
                            onClick={() => toggleLayer(layer.id)}
                            className={`relative w-10 h-6 rounded-full transition-colors ${
                              enabledLayers[layer.id] ? 'bg-gray-900' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                enabledLayers[layer.id] ? 'left-5' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditZoneModal;
