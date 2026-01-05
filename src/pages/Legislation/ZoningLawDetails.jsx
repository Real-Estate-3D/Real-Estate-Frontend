// File: src/pages/Legislation/ZoningLawDetails.jsx

import React, { useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Download,
  Eye,
  FileText,
  Map,
  ArrowRightLeft,
  Minus,
  ExternalLink,
  PanelRight,
  GripVertical,
  AlertCircle,
  AlertTriangle,
  Search,
} from 'lucide-react';
import DeleteZoningLawModal from '../../components/legislation/DeleteZoningLawModal';

// Mock coordinates data
const mockCoordinates = [
  { point: 1, latitude: 43.65107, longitude: -79.347015 },
  { point: 2, latitude: 43.65050, longitude: -79.345020 },
  { point: 3, latitude: 43.64930, longitude: -79.345620 },
  { point: 4, latitude: 43.67510, longitude: -79.345873 },
];

// Mock documents data
const mockDocuments = [
  { id: 1, name: 'Cost plan', type: 'PDF', size: '1.2 MB' },
  { id: 2, name: 'Budget', type: 'XLSX', size: '1.2 MB' },
  { id: 3, name: 'Environment assessment', type: 'PDF', size: '1.2 MB' },
];

// Mock zoning law data
const mockZoningLawData = {
  id: 1,
  title: 'Zoning By-Law Amendment',
  type: 'Residential',
  effectiveDate: '2025-06-21',
  maxHeight: '34m',
  setbacks: '10m',
  lawText: `1. All state contracts and all documents soliciting bids or proposals for state contracts shall contain or make reference to the following provisions:

(a) The contractor will not discriminate against employees or applicants for employment because of race, creed, color, national origin, sex, age, disability or marital status, and will undertake or continue existing programs of affirmative action to ensure that minority group members and women are afforded equal employment opportunities without discrimination. For purposes of this article affirmative action shall mean recruitment, employment, job assignment, promotion, upgradings, demotion, transfer, layoff, or termination and rates of pay or other forms of compensation.

(b) At the request of the contracting agency, the contractor shall request each employment agency, labor union, or authorized representative of workers with which it has a collective bargaining or other agreement or understanding, to furnish a written statement that such employment agency, labor union or representative will not discriminate on the basis of race, creed, color, national origin, sex, age, disability or marital status and that such union or representative will affirmatively cooperate in the implementation of the contractor's obligations herein.`,
  documents: mockDocuments,
  coordinates: mockCoordinates,
};

// Dropdown options
const ruleTypeOptions = [
  { value: 'height', label: 'Height' },
  { value: 'max_height', label: 'Max Height' },
  { value: 'setback', label: 'Setback' },
  { value: 'far', label: 'FAR' },
  { value: 'lot_coverage', label: 'Lot Coverage' },
  { value: 'min_lot_area', label: 'Min Lot Area' },
  { value: 'density', label: 'Density' },
];

const operatorOptions = [
  { value: 'equals', label: '=' },
  { value: 'greater_equal', label: '≥' },
  { value: 'minus', label: '-' },
  { value: 'greater', label: '>' },
  { value: 'less', label: '<' },
  { value: 'most_restrictive', label: 'Most Restrictive' },
  { value: 'less_restrictive', label: 'Less Restrictive' },
];

const landUseOptions = [
  { value: 'residential', label: 'Residential', heightValue: '25m' },
  { value: 'commercial', label: 'Commercial', heightValue: '30m' },
  { value: 'industrial', label: 'Industrial', heightValue: '45m' },
  { value: 'parks_open_space', label: 'Parks & Open Space', heightValue: '15m' },
  { value: 'recreation', label: 'Recreation / Entertainment', heightValue: '12m' },
];

const zoningTypeOptions = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mixed_use', label: 'Mixed Use' },
  { value: 'agricultural', label: 'Agricultural' },
];

// Searchable Select Component
const SearchableSelect = ({ value, onChange, options, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type to search"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-400">No results found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Land Use Select Component with Values
const LandUseSelect = ({ value, onChange, options, placeholder = 'Land Use' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg right-0">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Placeholder text"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">Type</span>
              <span className="text-xs font-medium text-gray-500">Value</span>
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                    value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-gray-500">{option.heightValue}</span>
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-400">No results found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Detect conflicts in zoning rules
const detectRuleConflicts = (conditions) => {
  const conflicts = [];
  
  // Check for Height vs Max Height conflict
  const heightCondition = conditions.find(c => c.ruleType === 'height' && c.landUse);
  const maxHeightCondition = conditions.find(c => c.ruleType === 'max_height' && c.landUse);
  
  if (heightCondition && maxHeightCondition) {
    const heightValue = landUseOptions.find(o => o.value === heightCondition.landUse)?.heightValue;
    const maxHeightValue = landUseOptions.find(o => o.value === maxHeightCondition.landUse)?.heightValue;
    
    if (heightValue && maxHeightValue) {
      const heightNum = parseFloat(heightValue);
      const maxHeightNum = parseFloat(maxHeightValue);
      if (heightNum > maxHeightNum) {
        conflicts.push(`Conflict: Min Height (${heightNum}.0 m) exceeds Max Height (${maxHeightNum}.0 m).`);
      }
    }
  }
  
  // Check for same land use with conflicting operators
  const landUseGroups = {};
  conditions.forEach(c => {
    if (c.landUse && c.ruleType) {
      const key = c.landUse;
      if (!landUseGroups[key]) landUseGroups[key] = [];
      landUseGroups[key].push(c);
    }
  });
  
  return conflicts;
};

const ZoningLawDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const editParam = searchParams.get('edit');
  const modeParam = searchParams.get('mode');
  const basedOnParam = searchParams.get('basedOn');
  const isCreateMode = modeParam === 'create' || id === 'new';
  
  const [isEditMode, setIsEditMode] = useState(editParam === 'true' || isCreateMode);
  const [showMap, setShowMap] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // In a real app, fetch data based on id
  const zoningLaw = isCreateMode ? null : mockZoningLawData;

  // Form state for edit/create mode
  const getInitialFormData = () => {
    if (isCreateMode) {
      return {
        name: '',
        type: '',
        effectiveDate: '',
        lawText: '',
        documents: [],
        conditions: [
          { id: 1, ruleType: 'height', operator: '', landUse: '' },
          { id: 2, ruleType: 'setback', operator: '', landUse: '' },
        ],
        basedOn: basedOnParam || null,
      };
    }
    return {
      name: zoningLaw?.title || '',
      type: zoningLaw?.type?.toLowerCase() || '',
      effectiveDate: zoningLaw?.effectiveDate || '',
      lawText: zoningLaw?.lawText || '',
      documents: zoningLaw?.documents ? [...zoningLaw.documents] : [],
      conditions: [
        { id: 1, ruleType: 'height', operator: 'less', landUse: 'commercial' },
        { id: 2, ruleType: 'setback', operator: '', landUse: '' },
      ],
      basedOn: null,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);

  // Detect conflicts in current conditions
  const ruleConflicts = detectRuleConflicts(formData.conditions);

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBackClick = useCallback(() => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      navigate('/legislation');
    }
  }, [navigate, isEditMode]);

  const handleCreateBasedOn = useCallback(() => {
    console.log('Create based on:', zoningLaw.id);
  }, [zoningLaw.id]);

  const handleEdit = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleDelete = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    console.log('Delete:', zoningLaw.id);
    setIsDeleteModalOpen(false);
    navigate('/legislation');
  }, [zoningLaw.id, navigate]);

  const handleSidebarView = useCallback(() => {
    console.log('Switch to sidebar view');
  }, []);

  const handleViewFullText = useCallback(() => {
    console.log('View full text');
  }, []);

  const handleOpenMap = useCallback(() => {
    console.log('Open map');
  }, []);

  const handleDownloadDocument = useCallback((doc) => {
    console.log('Download:', doc.name);
  }, []);

  const handleViewDocument = useCallback((doc) => {
    console.log('View:', doc.name);
  }, []);

  const handleDeleteDocument = useCallback((docId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== docId),
    }));
  }, []);

  const handleUploadDocument = useCallback(() => {
    console.log('Upload document');
  }, []);

  // Condition handlers
  const handleAddCondition = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { id: Date.now(), ruleType: '', operator: '', landUse: '' },
      ],
    }));
  }, []);

  const handleRemoveCondition = useCallback((conditionId) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== conditionId),
    }));
  }, []);

  const handleUpdateCondition = useCallback((conditionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map(c =>
        c.id === conditionId ? { ...c, [field]: value } : c
      ),
    }));
  }, []);

  const handleCancel = useCallback(() => {
    if (isCreateMode) {
      navigate('/legislation');
    } else {
      // Reset form data
      setFormData({
        name: zoningLaw?.title || '',
        type: zoningLaw?.type?.toLowerCase() || '',
        effectiveDate: zoningLaw?.effectiveDate || '',
        lawText: zoningLaw?.lawText || '',
        documents: zoningLaw?.documents ? [...zoningLaw.documents] : [],
        conditions: [
          { id: 1, ruleType: 'height', operator: '', landUse: '' },
          { id: 2, ruleType: 'setback', operator: '', landUse: '' },
        ],
        basedOn: null,
      });
      setIsEditMode(false);
    }
  }, [zoningLaw, isCreateMode, navigate]);

  const handleSave = useCallback(() => {
    console.log('Save:', formData);
    if (isCreateMode) {
      navigate('/legislation');
    } else {
      setIsEditMode(false);
    }
  }, [formData, isCreateMode, navigate]);

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
  };

  // Get page title
  const getPageTitle = () => {
    if (isCreateMode) return 'Create Zoning Law';
    if (isEditMode) return 'Edit Zoning Law';
    return zoningLaw?.title || 'Zoning Law Details';
  };

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Back Navigation */}
        <button
          onClick={handleBackClick}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Legislation
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {getPageTitle()}
          </h1>
          <button
            onClick={handleSidebarView}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PanelRight className="w-4 h-4" />
            Sidebar View
          </button>
        </div>

        {isEditMode ? (
          /* Edit Mode Content */
          <>
            {/* General Section - Edit */}
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">General</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Zoning Law Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder={isCreateMode ? 'Enter Law Name' : ''}
                    className={`w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isCreateMode && !formData.name ? 'text-gray-400' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Zoning Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.type}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                      className={`w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                        isCreateMode && !formData.type ? 'text-gray-400' : ''
                      }`}
                    >
                      {isCreateMode && <option value="">Select Zoning Type</option>}
                      {zoningTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Effective Date
                  </label>
                  <div className="relative">
                    <input
                      type={formData.effectiveDate || !isCreateMode ? 'date' : 'text'}
                      value={formData.effectiveDate}
                      onChange={(e) => handleFieldChange('effectiveDate', e.target.value)}
                      onFocus={(e) => { if (isCreateMode) e.target.type = 'date'; }}
                      placeholder={isCreateMode ? 'Select Date' : ''}
                      className={`w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isCreateMode && !formData.effectiveDate ? 'text-gray-400' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Based on Section - Create Mode Only */}
            {isCreateMode && formData.basedOn && (
              <section className="mb-8">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Based on</h2>
                <a 
                  href="#" 
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to the source zoning law
                  }}
                >
                  {formData.basedOn}
                </a>
              </section>
            )}

            {/* Geographic Boundaries Section - Edit */}
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Geographic Boundaries</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Zone Plan</h3>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full border border-gray-200 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full border border-gray-200 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Map background */}
                  <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-blue-100">
                    <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="mapGridEdit" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#mapGridEdit)" />
                    </svg>
                    
                    {/* Zone polygon overlay */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 256" preserveAspectRatio="xMidYMid slice">
                      <polygon
                        points="80,60 320,80 300,200 60,180"
                        fill="rgba(59, 130, 246, 0.3)"
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                    </svg>

                    {/* Stylized 3D buildings */}
                    <div className="absolute inset-0 flex items-end justify-center pb-8">
                      <div className="flex items-end gap-3" style={{ transform: 'perspective(600px) rotateX(15deg) rotateY(-5deg)' }}>
                        <div className="w-10 h-20 bg-blue-300/70 border border-blue-400/50 rounded-t shadow-lg" />
                        <div className="w-14 h-32 bg-blue-400/70 border border-blue-500/50 rounded-t shadow-lg" />
                        <div className="w-12 h-24 bg-blue-300/70 border border-blue-400/50 rounded-t shadow-lg" />
                        <div className="w-16 h-36 bg-blue-500/70 border border-blue-600/50 rounded-t shadow-lg" />
                        <div className="w-10 h-16 bg-blue-300/70 border border-blue-400/50 rounded-t shadow-lg" />
                      </div>
                    </div>

                    {/* Road */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-300/50" />
                  </div>
                  
                  {/* Open Map button */}
                  <button 
                    onClick={handleOpenMap}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200">
                      <ExternalLink className="w-4 h-4" />
                      Open Map
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* Zoning Rules Section - Edit */}
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Zoning Rules</h2>
              <div className="flex flex-col gap-3">
                {formData.conditions.map((condition) => (
                  <div key={condition.id} className="flex items-center gap-2">
                    <button className="p-1 text-gray-400 cursor-grab hover:text-gray-600">
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <SearchableSelect
                        value={condition.ruleType}
                        onChange={(value) => handleUpdateCondition(condition.id, 'ruleType', value)}
                        options={ruleTypeOptions}
                        placeholder="Height"
                      />
                      <SearchableSelect
                        value={condition.operator}
                        onChange={(value) => handleUpdateCondition(condition.id, 'operator', value)}
                        options={operatorOptions}
                        placeholder="Operator"
                      />
                      <LandUseSelect
                        value={condition.landUse}
                        onChange={(value) => handleUpdateCondition(condition.id, 'landUse', value)}
                        options={landUseOptions}
                        placeholder="Land Use"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveCondition(condition.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddCondition}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 mt-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Condition
                </button>
                
                {/* Conflict Warning */}
                {ruleConflicts.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mt-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-700">{ruleConflicts[0]}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Law Text Section - Edit */}
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Law Text</h2>
              <textarea
                value={formData.lawText}
                onChange={(e) => handleFieldChange('lawText', e.target.value)}
                placeholder={isCreateMode ? 'Enter law text' : ''}
                rows={12}
                className={`w-full px-4 py-3 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed ${
                  isCreateMode && !formData.lawText ? 'placeholder:text-gray-400' : ''
                }`}
              />
            </section>

            {/* Documents Section - Edit */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Documents</h2>
                <button
                  onClick={handleUploadDocument}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Upload
                </button>
              </div>
              {formData.documents.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {formData.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type} {doc.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleViewDocument(doc)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400 py-4">
                  Upload supporting documents.
                </div>
              )}
            </section>

            {/* Policy Violation Warning */}
            <section className="mb-8">
              <div className="flex items-start gap-2 p-4 bg-white border border-gray-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Policy Violation</p>
                  <p className="text-sm text-gray-600">
                    Max Height violate{' '}
                    <a href="#" className="text-blue-600 underline hover:text-blue-700">
                      Provincial Policy XC432
                    </a>{' '}
                    (Allowed Max Height: 28m)
                  </p>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* View Mode Content */
          <>
            {/* Actions */}
            <section className="mb-8">
              <h2 className="text-xs font-medium text-blue-600 mb-3">Actions</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateBasedOn}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Based On
                </button>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </section>

            {/* General */}
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">General</h2>
              <div className="flex items-start gap-16">
                <div>
                  <p className="text-xs font-medium text-blue-600 mb-1">Type</p>
                  <p className="text-sm text-gray-900">{zoningLaw.type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-600 mb-1">Effective Date</p>
                  <p className="text-sm text-gray-900">{formatDisplayDate(zoningLaw.effectiveDate)}</p>
                </div>
              </div>
            </section>

            {/* Geographic Boundaries */}
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Geographic Boundaries</h2>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                    showMap
                      ? 'text-gray-900 bg-gray-100 border-gray-200'
                      : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  {showMap ? 'Hide Map' : 'View Map'}
                </button>
                <button
                  onClick={() => setShowCoordinates(!showCoordinates)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                    showCoordinates
                      ? 'text-gray-900 bg-gray-100 border-gray-200'
                      : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  {showCoordinates ? 'Hide Coordinates' : 'View Coordinates'}
                </button>
              </div>

              {/* Map View */}
              {showMap && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Zone Plan</h3>
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full border border-gray-200 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full border border-gray-200 transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-blue-100">
                      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="mapGridPage" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#mapGridPage)" />
                      </svg>
                      
                      <div className="absolute inset-0 flex items-end justify-center pb-8">
                        <div className="flex items-end gap-3" style={{ transform: 'perspective(600px) rotateX(15deg) rotateY(-5deg)' }}>
                          <div className="w-10 h-20 bg-blue-300/70 border border-blue-400/50 rounded-t shadow-lg">
                            <div className="w-full h-2 bg-blue-400/50 mt-2"></div>
                            <div className="w-full h-2 bg-blue-400/50 mt-2"></div>
                            <div className="w-full h-2 bg-blue-400/50 mt-2"></div>
                          </div>
                          <div className="w-14 h-32 bg-blue-400/70 border border-blue-500/50 rounded-t shadow-lg">
                            <div className="grid grid-cols-3 gap-1 p-1 mt-1">
                              {[...Array(12)].map((_, i) => (
                                <div key={i} className="h-1.5 bg-blue-200/60 rounded-sm"></div>
                              ))}
                            </div>
                          </div>
                          <div className="w-12 h-24 bg-blue-300/70 border border-blue-400/50 rounded-t shadow-lg">
                            <div className="w-full h-2 bg-blue-400/50 mt-2"></div>
                            <div className="w-full h-2 bg-blue-400/50 mt-3"></div>
                          </div>
                          <div className="w-16 h-36 bg-blue-500/70 border border-blue-600/50 rounded-t shadow-lg">
                            <div className="grid grid-cols-4 gap-0.5 p-1 mt-1">
                              {[...Array(20)].map((_, i) => (
                                <div key={i} className="h-1 bg-blue-200/50 rounded-sm"></div>
                              ))}
                            </div>
                          </div>
                          <div className="w-10 h-16 bg-blue-300/70 border border-blue-400/50 rounded-t shadow-lg">
                            <div className="w-full h-2 bg-blue-400/50 mt-2"></div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-300/50"></div>
                      <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-white/60 mx-4"></div>
                    </div>
                    
                    <button 
                      onClick={handleOpenMap}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200">
                        <ExternalLink className="w-4 h-4" />
                        Open Map
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Coordinates Table */}
              {showCoordinates && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">
                          Point
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">
                          Latitude
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-blue-600 uppercase tracking-wider">
                          Longitude
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {zoningLaw.coordinates.map((coord) => (
                        <tr key={coord.point}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {coord.point}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {coord.latitude}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {coord.longitude}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Zoning Rules */}
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Zoning Rules</h2>
              <div className="flex items-start gap-16">
                <div>
                  <p className="text-xs font-medium text-blue-600 mb-1">Max Height</p>
                  <p className="text-sm text-gray-900">{zoningLaw.maxHeight}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-600 mb-1">Setbacks</p>
                  <p className="text-sm text-gray-900">{zoningLaw.setbacks}</p>
                </div>
              </div>
            </section>

            {/* Law Text */}
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Law Text</h2>
              <div className="text-sm text-gray-600 leading-relaxed mb-4 max-h-48 overflow-hidden relative">
                <p className="whitespace-pre-line">{zoningLaw.lawText}</p>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-gray-50 to-transparent" />
              </div>
              <button
                onClick={handleViewFullText}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Full Text
              </button>
            </section>

            {/* Documents */}
            <section className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="flex flex-col gap-3">
                {zoningLaw.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type} {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDownloadDocument(doc)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleViewDocument(doc)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Footer - Only in Edit Mode */}
      {isEditMode && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteZoningLawModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        zoningLawName={zoningLaw.title}
      />
    </div>
  );
};

export default ZoningLawDetails;
