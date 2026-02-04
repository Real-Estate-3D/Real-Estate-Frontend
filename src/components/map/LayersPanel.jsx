// File: src/components/map/LayersPanel.jsx

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  ChevronDown,
  Loader2,
  Download
} from 'lucide-react';
import { fetchGeoServerLayers, groupLayersByCategory, filterLayersByMunicipality } from '../../utils/geoServerLayerManager';
import ExportFormatPopup from './ExportFormatPopup';
import { GEOSERVER_CONFIG } from '../../utils/runtimeConfig';
import { GradientTitleBar } from '../common';

// Memoized Toggle component
const Toggle = memo(({ checked, onChange, isLoading }) => (
    <button 
        onClick={() => onChange(!checked)}
        disabled={isLoading}
        className={`w-10 h-[22px] rounded-full transition-all duration-200 relative flex items-center ${
            isLoading ? 'bg-gray-300 cursor-wait' : checked ? 'bg-blue-500' : 'bg-gray-200'
        }`}
    >
        {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-3.5 h-3.5 text-gray-600 animate-spin" />
            </div>
        ) : (
            <div 
                className={`absolute left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-md transition-all duration-200 ${
                    checked ? 'translate-x-[18px]' : 'translate-x-0'
                }`}
            />
        )}
    </button>
));

Toggle.displayName = 'Toggle';

// Memoized Layer Item
const LayerItem = memo(({ layer, isEnabled, isLoading, onToggle, onExport }) => (
  <div className="flex items-center justify-between py-1.5 pl-0.5 pr-0.5 hover:bg-gray-50 rounded-lg text-xs transition-all duration-150">
    <span className={`text-gray-700 ${isLoading ? 'opacity-50' : ''}`}>{layer.title}</span>
    <div className="flex items-center gap-2">
      <button 
        onClick={() => onExport(layer)}
        className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-all duration-200"
        title="Export Layer"
      >
          <Download className="w-3 h-3" />
      </button>
      <Toggle 
          checked={isEnabled}
          isLoading={isLoading}
          onChange={(c) => onToggle(layer.name, c, { type: 'wms', layerName: layer.name, opacity: layer.opacity })}
      />
    </div>
  </div>
));

LayerItem.displayName = 'LayerItem';

// Memoized Category Section
const CategorySection = memo(({ category, expanded, onToggle, enabledLayers, loadingLayers, onLayerToggle, onExport, searchQuery }) => {
  // Filter layers by search query
  const filteredLayers = useMemo(() => {
    if (!searchQuery) return category.layers;
    return category.layers.filter(layer => 
      layer.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [category.layers, searchQuery]);

  if (filteredLayers.length === 0 && searchQuery) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => onToggle(category.id)}
        className="flex items-center justify-between w-full py-1.5 group"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-gray-800 group-hover:text-blue-600 transition-all duration-200">
            {category.title}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold">
            {filteredLayers.length}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`} />
      </button>
      
      {expanded && (
        <div className="pl-0.5 space-y-0">
          {filteredLayers.map(layer => (
            <LayerItem
              key={layer.name}
              layer={layer}
              isEnabled={enabledLayers[layer.name] || false}
              isLoading={loadingLayers[layer.name] || false}
              onToggle={onLayerToggle}
              onExport={onExport}
            />
          ))}
          {filteredLayers.length === 0 && (
            <p className="text-xs text-gray-400 py-1.5 italic">No layers available</p>
          )}
        </div>
      )}
      <div className="mt-2 h-px bg-gray-100 last:hidden"></div>
    </div>
  );
});

CategorySection.displayName = 'CategorySection';

const LayersPanel = memo(({ onClose, onLayerToggle, onMapScopeToggle, enabledLayers = {}, loadingLayers = {}, currentMunicipality }) => {
  const [activeTab, setActiveTab] = useState('All Layers');
  const [allLayers, setAllLayers] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportPopup, setExportPopup] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    async function loadLayers() {
      setLoading(true);
      try {
        const layers = await fetchGeoServerLayers();
        
        if (!mounted) return;
        
        setAllLayers(layers);
        
        // Filter by municipality if selected
        const layersToGroup = currentMunicipality 
          ? filterLayersByMunicipality(layers, currentMunicipality)
          : layers;
          
        const categories = groupLayersByCategory(layersToGroup);
        setFilteredCategories(categories);
        
        // Default expand all
        const initialExpanded = {};
        categories.forEach(cat => {
          initialExpanded[cat.id] = true;
        });
        setExpandedSections(initialExpanded);
      } catch (error) {
        console.error("Error loading layers", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    
    loadLayers();
    
    return () => {
      mounted = false;
    };
  }, [currentMunicipality]);

  const toggleSection = useCallback((categoryId) => {
    setExpandedSections(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  const handleExport = useCallback((layer, format) => {
    const event = new CustomEvent('exportLayer', {
      detail: {
        // GeoServer WFS typically expects workspace-qualified typeName.
        // We keep the layer object name unqualified elsewhere; only qualify for export.
        layerName: `${GEOSERVER_CONFIG.workspace}:${layer.name}`,
        format: format,
        url: GEOSERVER_CONFIG.wfsUrl,
      }
    });
    window.dispatchEvent(event);
  }, []);

  const handleExportClick = useCallback((layer) => {
    setExportPopup(layer);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Memoize tab buttons to prevent recreation
  const tabs = useMemo(() => ['All Layers', 'Turned On', 'Recently Updated'], []);

  return (
    <>
      {exportPopup && (
        <ExportFormatPopup
          layer={exportPopup}
          onClose={() => setExportPopup(null)}
          onExport={handleExport}
        />
      )}

      {/* Main Container */}
      <div className="w-full flex py-2 pr-2 flex-col flex-1 min-h-0 overflow-hidden">
        
        {/* Main Layers Card */}
        <div className="bg-white shadow-lg border rounded-xl border-gray-100 overflow-hidden flex-1 flex flex-col min-h-0">
          {/* Header with Gradient */}
          <GradientTitleBar
            title={currentMunicipality ? `${currentMunicipality} Layers` : 'Layers'}
            icon={Layers}
            variant="blue"
            className="rounded-t-xl"
            actions={
              <button className="p-1 hover:bg-white/20 rounded-lg transition-all duration-200">
                <Plus className="w-4 h-4 text-white/80" />
              </button>
            }
          />

          {/* Search & Tabs */}
          <div className="p-3 border-b border-gray-50 space-y-2.5 bg-white">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input 
                      type="text" 
                      placeholder="Search layers..." 
                      value={searchQuery}
                      onChange={handleSearchChange}
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200 placeholder-gray-400"
                  />
              </div>
              <div className="flex items-center gap-4 text-xs">
                  {tabs.map(tab => (
                      <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`font-medium pb-0.5 transition-all duration-200 ${
                              activeTab === tab 
                              ? 'text-blue-600 border-b-2 border-blue-600' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>
          </div>

          {/* Dynamic Content Sections */}
          {loading ? (
             <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
             </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5 bg-white">
                {filteredCategories.map(category => (
                    <CategorySection
                      key={category.id}
                      category={category}
                      expanded={expandedSections[category.id] || false}
                      onToggle={toggleSection}
                      enabledLayers={enabledLayers}
                      loadingLayers={loadingLayers}
                      onLayerToggle={onLayerToggle}
                      onExport={handleExportClick}
                      searchQuery={searchQuery}
                    />
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

LayersPanel.displayName = 'LayersPanel';

export default LayersPanel;