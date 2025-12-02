import React from 'react';
import { X, Download, Eye, Building2, MapPin, Calendar, DollarSign, Layers as LayersIcon } from 'lucide-react';
import { layerCategories } from '../../data/torontoParcelData';

const InfoPanel = ({ parcel, onClose, layers, onLayerToggle }) => {
  if (!parcel && !layers) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {parcel ? (
            <>
              <Building2 className="w-5 h-5" />
              Single-Tier Municipality
            </>
          ) : (
            <>
              <LayersIcon className="w-5 h-5" />
              Layers
            </>
          )}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {parcel ? (
          <ParcelInfo parcel={parcel} />
        ) : (
          <LayersPanel layers={layers} onLayerToggle={onLayerToggle} />
        )}
      </div>
    </div>
  );
};

// Parcel Information Component
const ParcelInfo = ({ parcel }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Legislative Documents */}
      <Section title="Legislative Documents">
        <DocumentItem title="Provincial Policy Statement" />
        <DocumentItem title="Greenbelt Act" />
      </Section>

      {/* Strategic Planning */}
      <Section title="Strategic Planning">
        <DocumentItem title="Official Plan" />
        <DocumentItem title="Water & Wastewater Master Plan" />
      </Section>

      {/* Parcel Details */}
      <Section title="Parcel Information">
        <InfoRow icon={MapPin} label="Address" value={parcel.properties.address} />
        <InfoRow icon={Building2} label="Owner" value={parcel.properties.owner} />
        <InfoRow icon={LayersIcon} label="Zoning" value={parcel.properties.zoning} />
        <InfoRow label="Area" value={parcel.properties.area} />
        <InfoRow label="Land Use" value={parcel.properties.landUse} />
        <InfoRow label="Building Type" value={parcel.properties.buildingType} />
        <InfoRow icon={Calendar} label="Year Built" value={parcel.properties.yearBuilt} />
        <InfoRow icon={DollarSign} label="Assessed Value" value={parcel.properties.assessedValue} />
        <InfoRow label="Municipality" value={parcel.properties.municipality} />
        <InfoRow label="Ward" value={parcel.properties.ward} />
      </Section>
    </div>
  );
};

// Layers Panel Component
const LayersPanel = ({ layers, onLayerToggle }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search layers"
          className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <LayersIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Tab active>All Layers</Tab>
        <Tab>Turned On</Tab>
        <Tab>Recently Updated</Tab>
      </div>

      {/* Map Scope */}
      <LayerSection title="Map Scope">
        {layerCategories.mapScope.map(layer => (
          <LayerToggle
            key={layer.id}
            label={layer.label}
            enabled={layers?.[layer.id] ?? layer.enabled}
            onChange={() => onLayerToggle(layer.id)}
          />
        ))}
      </LayerSection>

      {/* Provincial Policy Statement */}
      <LayerSection title="Provincial Policy Statement" collapsible>
        {layerCategories.provincialPolicy.map(layer => (
          <LayerToggle
            key={layer.id}
            label={layer.label}
            icon={layer.icon}
            enabled={layers?.[layer.id] ?? layer.enabled}
            onChange={() => onLayerToggle(layer.id)}
          />
        ))}
      </LayerSection>

      {/* Official Plan */}
      <LayerSection title="Official Plan" collapsible>
        {layerCategories.officialPlan.map(layer => (
          <LayerToggle
            key={layer.id}
            label={layer.label}
            enabled={layers?.[layer.id] ?? layer.enabled}
            onChange={() => onLayerToggle(layer.id)}
          />
        ))}
      </LayerSection>

      {/* Water & Wastewater Master Plan */}
      <LayerSection title="Water & Wastewater Master Plan" collapsible>
        {layerCategories.waterWastewater.map(layer => (
          <LayerToggle
            key={layer.id}
            label={layer.label}
            enabled={layers?.[layer.id] ?? layer.enabled}
            onChange={() => onLayerToggle(layer.id)}
          />
        ))}
      </LayerSection>

      {/* Zoning */}
      <LayerSection title="Zoning" collapsible>
        {layerCategories.zoning.map(layer => (
          <LayerToggle
            key={layer.id}
            label={layer.label}
            enabled={layers?.[layer.id] ?? layer.enabled}
            onChange={() => onLayerToggle(layer.id)}
          />
        ))}
      </LayerSection>

      {/* Routes */}
      <LayerSection title="Routes" collapsible>
        {layerCategories.routes.map(layer => (
          <LayerToggle
            key={layer.id}
            label={layer.label}
            enabled={layers?.[layer.id] ?? layer.enabled}
            onChange={() => onLayerToggle(layer.id)}
          />
        ))}
      </LayerSection>

      {/* Expandable sections */}
      <LayerSection title="Traffic patterns" collapsible collapsed />
      <LayerSection title="Environmental risks" collapsible collapsed />
      <LayerSection title="Infrastructure" collapsible collapsed />
    </div>
  );
};

// Helper Components
const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const DocumentItem = ({ title }) => (
  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
    <span className="text-sm text-gray-700">{title}</span>
    <div className="flex gap-2">
      <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
        <Download className="w-4 h-4 text-gray-600" />
      </button>
      <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
        <Eye className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
    <div className="flex-1 min-w-0">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm text-gray-900 font-medium">{value}</div>
    </div>
  </div>
);

const Tab = ({ children, active }) => (
  <button
    className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
      active
        ? 'bg-gray-900 text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
);

const LayerSection = ({ title, children, collapsible, collapsed }) => {
  const [isOpen, setIsOpen] = React.useState(!collapsed);

  return (
    <div className="space-y-2">
      <button
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-sm font-semibold text-gray-900 ${
          collapsible ? 'cursor-pointer hover:text-gray-700' : 'cursor-default'
        }`}
      >
        <span>{title}</span>
        {collapsible && (
          <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
        )}
      </button>
      {isOpen && <div className="space-y-1.5 pl-1">{children}</div>}
    </div>
  );
};

const LayerToggle = ({ label, icon, enabled, onChange }) => (
  <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg group">
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {icon && <span className="text-sm">{icon}</span>}
      <span className="text-sm text-gray-700 truncate">{label}</span>
    </div>
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        enabled ? 'bg-gray-900' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export default InfoPanel;