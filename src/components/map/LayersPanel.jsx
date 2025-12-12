import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, X, Layers, Download } from 'lucide-react';
import catalogData from '../../data/catalog.json';
import ExportFormatPopup from './ExportFormatPopup';

const LayersPanel = ({ onClose, onLayerToggle, onMapScopeToggle, enabledLayers = {} }) => {
  const [catalog, setCatalog] = useState(catalogData);
  const [activeTab, setActiveTab] = useState('All Layers');
  const [expandedSections, setExpandedSections] = useState({});
  const [mapScopeState, setMapScopeState] = useState({});
  const [exportPopup, setExportPopup] = useState(null);

  useEffect(() => {
    const initialExpanded = {};
    const initialMapScope = {};
    catalog.categories.forEach(category => {
      initialExpanded[category.id] = category.expanded || false;
    });
    catalog.mapScope.forEach(scope => {
      initialMapScope[scope.id] = scope.enabled || false;
    });
    setExpandedSections(initialExpanded);
    setMapScopeState(initialMapScope);
  }, []);

  const toggleSection = (categoryId) => {
    setExpandedSections(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleLayerToggle = (layerId, currentState, layerData) => {
    if (onLayerToggle) {
      onLayerToggle(layerId, !currentState, layerData);
    }
  };

  const handleMapScopeToggle = (scopeId, currentState) => {
    const newState = !currentState;
    setMapScopeState(prev => ({
      ...prev,
      [scopeId]: newState
    }));
    if (onMapScopeToggle) {
      onMapScopeToggle(scopeId, newState);
    }
  };
  const handleDownload = (item) => {
    if (item.url) {
      window.open(item.url, '_blank');
    } else if (item.layerName) {
      setExportPopup(item);
    } else {
      console.log(`Download ${item.name}`);
    }
  };

  const handleExport = (layer, format) => {
    const event = new CustomEvent('exportLayer', {
      detail: {
        layerName: layer.layerName,
        format: format,
        url: 'http://16.52.55.27:8080/geoserver/realestate3d/wfs'
      }
    });
    window.dispatchEvent(event);
  };

  const getColorClass = (color) => {
    const colorMap = {
      orange: 'bg-orange-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      darkgreen: 'bg-green-700',
      lime: 'bg-lime-500',
      cyan: 'bg-cyan-500',
      yellow: 'bg-yellow-400',
      purple: 'bg-purple-500',
      lightblue: 'bg-blue-300',
      lightyellow: 'bg-yellow-200',
      gold: 'bg-yellow-600',
      darkred: 'bg-red-700',
      crimson: 'bg-red-600',
      darkpurple: 'bg-purple-700',
      violet: 'bg-violet-500',
      gray: 'bg-gray-500',
      darkgray: 'bg-gray-700',
    };
    return colorMap[color] || 'bg-gray-400';
  };

 

  const renderLayerItem = (layer) => {
    const isEnabled = enabledLayers[layer.id] || false;
    
    return (
      <div
        key={layer.id}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 group"
      >
        <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">
          {layer.name}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={() => handleLayerToggle(layer.id, isEnabled, layer)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
        {layer.downloadable && layer.layerName && (
          <button 
            onClick={() => handleDownload(layer)}
            className=" p-1 hover:bg-gray-200 rounded cursor-pointer transition-all"
            title="Export layer"
          >
            <Download color='grey' className="w-4 h-4 text-gray-600 " />
          </button>
        )}
      </div>
    );
  };


  const renderCategory = (category) => {
    const isExpanded = expandedSections[category.id];

    return (
      <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(category.id)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900">{category.title}</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="bg-white">
            {category.type === 'documents' ? (
              <div className="divide-y divide-gray-100">
                {category.items?.map(renderDocumentItem)}
              </div>
            ) : category.type === 'layers' ? (
              <div className="divide-y divide-gray-100">
                {category.layers && category.layers.length > 0 ? (
                  category.layers.map(renderLayerItem)
                ) : (
                  <div className="px-3 py-4 text-sm text-gray-400 text-center">
                    No layers available
                  </div>
                )}
              </div>
            ) : (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                Unknown category type
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = () => {
    if (activeTab === 'Turned On') {
      return catalog.categories.map(category => {
        if (category.type === 'layers' && category.layers) {
          const activeLayers = category.layers.filter(layer => enabledLayers[layer.id]);
          if (activeLayers.length > 0) {
            return { ...category, layers: activeLayers };
          }
          return null;
        }
        return category;
      }).filter(Boolean);
    }
    return catalog.categories;
  };


  return (
    <>
      {exportPopup && (
        <ExportFormatPopup
          layer={exportPopup}
          onClose={() => setExportPopup(null)}
          onExport={handleExport}
        />
      )}
      
      <div className="absolute top-0 right-0 h-full w-96 z-50 flex flex-col">
        <div className='bg-white shadow-xl m-2 rounded-lg flex-1 flex flex-col border border-gray-200 overflow-hidden'>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-900">Layers</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

        <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
          <div className="space-y-2 p-4">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Map Scope</h3>
            <div className="space-y-2">
              {catalog.mapScope.map((scope) => (
                <label key={scope.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={mapScopeState[scope.id] || false}
                    onChange={() => handleMapScopeToggle(scope.id, mapScopeState[scope.id])}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{scope.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredCategories().map(renderCategory)}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default LayersPanel;