// File: src/components/legislation/ZoningLawViewModal.jsx

import React, { useState, useCallback } from 'react';
import { X, Map, Pencil, Trash2, ChevronDown, ChevronUp, Eye } from 'lucide-react';

// Mock zones data for Parameter View
const mockZones = [
  {
    id: 'zone_1',
    name: 'Downtown Mixed Use Zone',
    code: 'Zone abc',
    parameters: [
      { label: 'Minimum Lot Front Setback', value: '10.0 m' },
      { label: 'Maximum Height', value: '30.0 m' },
    ],
    description: `The contractor will not discriminate against employees or applicants for employment because of race, creed, color, national origin, sex, age, disability or marital status, and will undertake or continue existing programs of affirmative action to ensure that minority group members and women are afforded equal employment opportunities without discrimination. For purposes of this article affirmative action shall mean recruitment, employment, job assignment, promotion, upgradings, demotion, transfer, layoff, or termination and rates of pay or other forms of compensation.`,
  },
  {
    id: 'zone_2',
    name: 'Arbordale Heights District',
    code: 'Zone dfg',
    parameters: [
      { label: 'Minimum Lot Front Setback', value: '10.0 m' },
      { label: 'Maximum Height', value: '30.0 m' },
    ],
    description: `The contractor will not discriminate against employees or applicants for employment because of race, creed, color, national origin, sex, age, disability or marital status, and will undertake or continue existing programs of affirmative action to ensure that minority group members and women are afforded equal employment opportunities without discrimination. For purposes of this article affirmative action shall mean recruitment, employment, job assignment, promotion, upgradings, demotion, transfer, layoff, or termination and rates of pay or other forms of compensation.

At the request of the contracting agency, the contractor shall request each employment agency, labor union, or authorized representative of workers with which it has a collective bargaining or other agreement or understanding, to furnish a written statement that such employment agency, labor union or representative will not discriminate on the basis of race, creed, color, national origin, sex, age, disability or marital status and that such union or representative will affirmatively cooperate in the implementation of the contractor's obligations herein.`,
  },
];

// Mock law text
const mockLawText = `1. All state contracts and all documents soliciting bids or proposals for state contracts shall contain or make reference to the following provisions:

(a) The contractor will not discriminate against employees or applicants for employment because of race, creed, color, national origin, sex, age, disability or marital status, and will undertake or continue existing programs of affirmative action to ensure that minority group members and women are afforded equal employment opportunities without discrimination. For purposes of this article affirmative action shall mean recruitment, employment, job assignment, promotion, upgradings, demotion, transfer, layoff, or termination and rates of pay or other forms of compensation.

(b) At the request of the contracting agency, the contractor shall request each employment agency, labor union, or authorized representative of workers with which it has a collective bargaining or other agreement or understanding, to furnish a written statement that such employment agency, labor union or representative will not discriminate on the basis of race, creed, color, national origin, sex, age, disability or marital status and that such union or representative will affirmatively cooperate in the implementation of the contractor's obligations herein.

(c) The contractor shall state, in all solicitations or advertisements for employees, that, in the performance of the state contract, all qualified applicants will be afforded equal employment opportunities without discrimination because of race, creed, color, national origin, sex, age, disability or marital status.

2. The contractor will include the provisions of subdivision one of this section in every subcontract, except as provided in subdivision six of this section, in such a manner that the provisions will be binding upon each subcontractor as to work in connection with the state contract.

3. The provisions of this section shall not be binding upon contractors or subcontractors in the performance of work or the provision of services or any other activity that are unrelated, separate or distinct from the state contract as expressed by its terms.`;

const ZoningLawViewModal = ({
  isOpen,
  onClose,
  legislation,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'parameter'
  const [expandedZones, setExpandedZones] = useState({ zone_1: true, zone_2: true });

  const handlePreviewOnMap = useCallback((zone) => {
    console.log('Preview zone on map:', zone);
    // This would open the map with the zone highlighted
  }, []);

  const toggleZoneExpand = useCallback((zoneId) => {
    setExpandedZones(prev => ({ ...prev, [zoneId]: !prev[zoneId] }));
  }, []);

  if (!isOpen || !legislation) return null;

  const title = legislation?.title || 'Zoning By-Law Amendment';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 shrink-0">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'text'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Text View
            {activeTab === 'text' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('parameter')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'parameter'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Parameter View
            {activeTab === 'parameter' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'text' ? (
            <TextViewContent lawText={mockLawText} />
          ) : (
            <ParameterViewContent
              zones={mockZones}
              expandedZones={expandedZones}
              onToggleExpand={toggleZoneExpand}
              onPreviewOnMap={handlePreviewOnMap}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={() => onEdit?.(legislation)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete?.(legislation)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Text View Content Component
const TextViewContent = ({ lawText }) => {
  return (
    <div className="p-4 sm:p-6">
      <div className="prose prose-sm max-w-none">
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {lawText}
        </div>
      </div>
    </div>
  );
};

// Parameter View Content Component
const ParameterViewContent = ({ zones, expandedZones, onToggleExpand, onPreviewOnMap }) => {
  return (
    <div className="divide-y divide-gray-200">
      {zones.map((zone) => (
        <ZoneSection
          key={zone.id}
          zone={zone}
          isExpanded={expandedZones[zone.id] ?? true}
          onToggle={() => onToggleExpand(zone.id)}
          onPreviewOnMap={onPreviewOnMap}
        />
      ))}
    </div>
  );
};

// Zone Section Component
const ZoneSection = ({ zone, isExpanded, onToggle, onPreviewOnMap }) => {
  return (
    <div className="bg-white">
      {/* Zone Header */}
      <div 
        className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button className="text-gray-400 hover:text-gray-600 shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <h4 className="text-sm font-semibold text-gray-900 truncate">{zone.name}</h4>
          <span className="text-xs text-gray-500 shrink-0">{zone.code}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreviewOnMap(zone);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shrink-0 ml-2"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview on Map</span>
        </button>
      </div>

      {/* Zone Content - Collapsible */}
      {isExpanded && (
        <div className="px-4 sm:px-6 py-4">
          {/* Parameters */}
          <div className="flex flex-col gap-3 mb-4">
            {zone.parameters.map((param, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                <span className="text-sm font-medium text-gray-900">{param.label}</span>
                <span className="text-sm text-gray-600">{param.value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="text-xs text-gray-600 leading-relaxed">
            {zone.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoningLawViewModal;
