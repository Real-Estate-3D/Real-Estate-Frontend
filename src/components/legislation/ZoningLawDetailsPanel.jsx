// File: src/components/legislation/ZoningLawDetailsPanel.jsx

import React, { useState, useCallback } from 'react';
import {
  X,
  Plus,
  Minus,
  Copy,
  Pencil,
  Trash2,
  Download,
  Eye,
  FileText,
  Clock,
  Map,
  ExternalLink,
  GripVertical,
  ChevronDown,
  AlertTriangle,
  Upload,
  ImageIcon,
  GitBranch,
  PanelRightClose,
} from 'lucide-react';
import EditZoneModal from './EditZoneModal';
import DeleteZoningLawModal from './DeleteZoningLawModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import VersionHistoryModal from './VersionHistoryModal';
import BranchingModal from './BranchingModal';

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

// Mock workflows
const defaultWorkflows = [
  { id: 'submit_application', name: 'Submit Application' },
  { id: 'environmental_impact_review', name: 'Environmental Impact Review' },
  { id: 'review_by_planner', name: 'Review by Planner' },
  { id: 'approve_by_council', name: 'Approve by Council' },
];

const availableWorkflows = [
  { id: 'submit_application', name: 'Submit Application' },
  { id: 'environmental_impact_review', name: 'Environmental Impact Review' },
  { id: 'review_by_planner', name: 'Review by Planner' },
  { id: 'approve_by_council', name: 'Approve by Council' },
  { id: 'public_meeting', name: 'Public Meeting' },
  { id: 'heritage_review', name: 'Heritage Review' },
  { id: 'traffic_study', name: 'Traffic Impact Study' },
];

const operatorOptions = [
  { value: 'equals', label: '=' },
  { value: 'greater', label: '>' },
  { value: 'less', label: '<' },
  { value: 'greater_equal', label: '≥' },
  { value: 'less_equal', label: '≤' },
];

const ruleTypeOptions = [
  { value: 'max_height', label: 'Max Height' },
  { value: 'min_height', label: 'Min Height' },
  { value: 'setback', label: 'Setback' },
  { value: 'min_setback', label: 'Min Setback' },
  { value: 'coverage', label: 'Coverage' },
  { value: 'far', label: 'FAR' },
  { value: 'lot_area', label: 'Lot Area' },
  { value: 'density', label: 'Density' },
];

const landUseOptions = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mixed', label: 'Mixed Use' },
  { value: 'open_space', label: 'Parks & Open Space' },
];

const zoningTypeOptions = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mixed_use', label: 'Mixed Use' },
  { value: 'agricultural', label: 'Agricultural' },
];

const ZoningLawDetailsPanel = ({ 
  isOpen, 
  onClose, 
  legislation, 
  onEdit, 
  onDelete, 
  onCreateBasedOn,
  onSave,
  mode = 'view', // 'view', 'edit', 'create', or 'createBasedOn'
  onCreateSave,
  onPageView,
  basedOnLegislation = null, // The legislation to base the new one on
}) => {
  const isCreateMode = mode === 'create' || mode === 'createBasedOn';
  const isCreateBasedOn = mode === 'createBasedOn';
  const isPureCreate = mode === 'create';
  const [isEditMode, setIsEditMode] = useState(isCreateMode);
  const [showMap, setShowMap] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [isEditZoneModalOpen, setIsEditZoneModalOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isBranchingOpen, setIsBranchingOpen] = useState(false);
  
  // Get initial form data based on mode
  const getInitialFormData = useCallback(() => {
    // Empty conditions for pure create
    const emptyConditions = [
      { id: 1, ruleType: 'max_height', operator: '', landUse: '', value: '' },
      { id: 2, ruleType: 'setback', operator: '', landUse: '', value: '' },
    ];
    
    // Filled conditions for create based on or edit
    const filledConditions = [
      { id: 1, ruleType: 'max_height', operator: 'less_equal', landUse: 'residential', value: '25m' },
      { id: 2, ruleType: 'setback', operator: 'equals', landUse: 'industrial', value: '10m' },
    ];
    
    // Pure create mode - empty form
    if (isPureCreate) {
      return {
        name: '',
        type: '',
        effectiveDate: '',
        maxHeight: '',
        setbacks: '',
        conditions: emptyConditions,
        workflows: [],
        lawText: '',
        documents: [],
        basedOn: null,
      };
    }
    
    // Create based on mode - pre-filled from base legislation
    if (isCreateBasedOn && basedOnLegislation) {
      return {
        name: 'Zoning By-Law Amendment',
        type: 'residential',
        effectiveDate: '2025-06-21',
        maxHeight: '34m',
        setbacks: '10m',
        conditions: filledConditions,
        workflows: [...defaultWorkflows],
        lawText: `1. All state contracts and all documents soliciting bids or proposals for state contracts shall contain or make reference to the following provisions:

(a) The contractor will not discriminate against employees or applicants for employment because of race, creed, color, national origin, sex, age, disability or marital status, and will undertake or continue existing programs of affirmative action to ensure that minority group members and women are afforded equal employment opportunities without discrimination. For purposes of this article affirmative action shall mean recruitment, employment, job assignment, promotion, upgradings, demotion, transfer, layoff, or termination and rates of pay or other forms of compensation.

(b) At the request of the contracting agency, the contractor shall request each employment agency, labor union, or authorized representative of workers with which it has a collective bargaining or other agreement or understanding, to furnish a written statement that such employment agency, labor union or representative will not discriminate on the basis of race, creed, color, national origin, sex, age, disability or marital status and that such union or representative will affirmatively cooperate in the implementation of the contractor's obligations herein.`,
        documents: [...mockDocuments],
        basedOn: basedOnLegislation?.title || 'Residential Zone R1',
      };
    }
    
    // Edit/View mode
    return {
      name: legislation?.title || '',
      type: legislation?.legislationType || 'residential',
      effectiveDate: legislation?.effectiveFrom || '',
      maxHeight: '34m',
      setbacks: '10m',
      conditions: filledConditions,
      workflows: [...defaultWorkflows],
      lawText: `1. All state contracts and all documents soliciting bids or proposals for state contracts shall contain or make reference to the following provisions:

(a) The contractor will not discriminate against employees or applicants for employment because of race, creed, color, national origin, sex, age, disability or marital status, and will undertake or continue existing programs of affirmative action to ensure that minority group members and women are afforded equal employment opportunities without discrimination. For purposes of this article affirmative action shall mean recruitment, employment, job assignment, promotion, upgradings, demotion, transfer, layoff, or termination and rates of pay or other forms of compensation.

(b) At the request of the contracting agency, the contractor shall request each employment agency, labor union, or authorized representative of workers with which it has a collective bargaining or other agreement or understanding, to furnish a written statement that such employment agency, labor union or representative will not discriminate on the basis of race, creed, color, national origin, sex, age, disability or marital status and that such union or representative will affirmatively cooperate in the implementation of the contractor's obligations herein.`,
      documents: [...mockDocuments],
      basedOn: 'Residential Zone R1',
    };
  }, [isPureCreate, isCreateBasedOn, basedOnLegislation, legislation]);

  // Edit form state
  const [formData, setFormData] = useState(getInitialFormData);

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditClick = useCallback(() => {
    const defaultConditions = [
      { id: 1, ruleType: 'max_height', operator: 'less_equal', landUse: 'residential', value: '25m' },
      { id: 2, ruleType: 'setback', operator: 'equals', landUse: 'industrial', value: '10m' },
    ];
    setFormData({
      name: legislation?.title || '',
      type: legislation?.legislationType || 'residential',
      effectiveDate: legislation?.effectiveFrom || '',
      maxHeight: '34m',
      setbacks: '10m',
      conditions: defaultConditions,
      workflows: [...defaultWorkflows],
      lawText: formData.lawText,
      documents: [...mockDocuments],
      basedOn: 'Residential Zone R1',
    });
    setIsEditMode(true);
  }, [legislation, formData.lawText]);

  const handleCancelEdit = useCallback(() => {
    if (isCreateMode) {
      onClose();
    } else {
      setIsEditMode(false);
    }
  }, [isCreateMode, onClose]);

  const handleSave = useCallback(() => {
    if (isCreateMode) {
      onCreateSave?.(formData);
      onClose();
    } else {
      onSave?.(formData);
      setIsEditMode(false);
    }
  }, [formData, onSave, onCreateSave, isCreateMode, onClose]);

  const handleAddCondition = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        { id: Date.now(), ruleType: 'max_height', operator: 'less_equal', landUse: 'residential', value: '' },
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

  const handleAddWorkflow = useCallback((workflow) => {
    if (!formData.workflows.find(w => w.id === workflow.id)) {
      setFormData(prev => ({
        ...prev,
        workflows: [...prev.workflows, workflow],
      }));
    }
  }, [formData.workflows]);

  const handleRemoveWorkflow = useCallback((workflowId) => {
    setFormData(prev => ({
      ...prev,
      workflows: prev.workflows.filter(w => w.id !== workflowId),
    }));
  }, []);

  const handleRemoveDocument = useCallback((docId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== docId),
    }));
  }, []);

  if (!isOpen || (!legislation && !isCreateMode)) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {isCreateMode ? 'Create Zoning Law' : (isEditMode ? 'Edit Zoning Law' : 'Zoning Law Details')}
        </h2>
        <div className="flex items-center gap-2">
          {!isEditMode && !isCreateMode && (
            <button
              onClick={() => onPageView?.(legislation)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PanelRightClose className="w-3 h-3" />
              Page View
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {(isEditMode || isCreateMode) ? (
          <EditModeContent
            formData={formData}
            onChange={handleFieldChange}
            onRemoveDocument={handleRemoveDocument}
            onAddCondition={handleAddCondition}
            onRemoveCondition={handleRemoveCondition}
            onUpdateCondition={handleUpdateCondition}
            onAddWorkflow={handleAddWorkflow}
            onRemoveWorkflow={handleRemoveWorkflow}
            isCreateMode={isCreateMode}
            isPureCreate={isPureCreate}
            isCreateBasedOn={isCreateBasedOn}
            onOpenEditZone={() => setIsEditZoneModalOpen(true)}
          />
        ) : (
          <ViewModeContent
            legislation={legislation}
            showMap={showMap}
            setShowMap={setShowMap}
            showCoordinates={showCoordinates}
            setShowCoordinates={setShowCoordinates}
            onEdit={handleEditClick}
            onDelete={onDelete}
            onCreateBasedOn={onCreateBasedOn}
            onOpenEditZone={() => setIsEditZoneModalOpen(true)}
            onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
            onOpenBranching={() => setIsBranchingOpen(true)}
          />
        )}
      </div>

      {/* Footer - Only in Edit Mode or Create Mode */}
      {(isEditMode || isCreateMode) && (
        <div className="flex flex-col gap-3 px-5 py-4 border-t border-gray-200 bg-white">
          {/* Policy Violation Warning */}
          <div className="flex items-start gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-3 h-3 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Policy Violation</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Max Height violate <span className="text-blue-600 underline cursor-pointer">Provincial Policy XC432</span> (Allowed Max Height: 28m)
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleCancelEdit}
              className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      <EditZoneModal
        isOpen={isEditZoneModalOpen}
        onClose={() => setIsEditZoneModalOpen(false)}
        onSave={(data) => console.log('Zone saved:', data)}
        zoneName={legislation?.title || formData.name || 'Zoning By-Law Amendment'}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        zoningLawName={legislation?.title || formData.name || 'Zoning By-Law Amendment'}
        onViewVersion={(version) => console.log('View version:', version)}
        onRestoreVersion={(version) => console.log('Restore version:', version)}
      />

      {/* Branching Modal */}
      <BranchingModal
        isOpen={isBranchingOpen}
        onClose={() => setIsBranchingOpen(false)}
        zoningLawName={legislation?.title || formData.name || 'Zoning By-Law Amendment'}
      />
    </div>
  );
};

// View Mode Content Component
const ViewModeContent = ({ 
  legislation, 
  showMap, 
  setShowMap, 
  showCoordinates, 
  setShowCoordinates,
  onEdit,
  onDelete,
  onCreateBasedOn,
  onOpenEditZone,
  onOpenVersionHistory,
  onOpenBranching,
}) => {
  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Actions */}
      <section>
        <h3 className="text-xs font-medium text-gray-500 mb-2">Actions</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateBasedOn}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Based On
          </button>
          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </section>

      {/* General Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">General</h3>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-blue-600 mb-1">Zoning Law Name</p>
            <p className="text-sm font-medium text-gray-900">{legislation.title} Residential VHD-123</p>
          </div>
          <div className="flex items-start gap-16">
            <div>
              <p className="text-xs text-blue-600 mb-1">Type</p>
              <p className="text-sm font-medium text-gray-900">Residential</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 mb-1">Effective Date</p>
              <p className="text-sm font-medium text-gray-900">21.06.2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* Geographic Boundaries Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Geographic Boundaries</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              showMap 
                ? 'text-gray-900 bg-gray-200' 
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Map className="w-4 h-4" />
            {showMap ? 'Hide Map' : 'View Map'}
          </button>
          <button
            onClick={() => setShowCoordinates(!showCoordinates)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              showCoordinates 
                ? 'text-gray-900 bg-gray-200' 
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            {showCoordinates ? 'Hide Coordinates' : 'View Coordinates'}
          </button>
        </div>

        {/* Map Preview */}
        {showMap && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-900">Zone Plan</p>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="relative h-56 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              {/* Map placeholder with 3D building visualization */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-blue-100 to-blue-200">
                <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="mapGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#94A3B8" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mapGrid)" />
                </svg>
                
                {/* Stylized buildings */}
                <div className="absolute inset-0 flex items-end justify-center pb-8">
                  <div className="flex items-end gap-2" style={{ transform: 'perspective(600px) rotateX(15deg)' }}>
                    <div className="w-10 h-14 bg-blue-400/70 border border-blue-500/50 rounded-t shadow-sm" />
                    <div className="w-14 h-20 bg-blue-500/70 border border-blue-600/50 rounded-t shadow-sm" />
                    <div className="w-12 h-24 bg-blue-600/80 border border-blue-700/50 rounded-t shadow-md" />
                    <div className="w-16 h-28 bg-blue-700/80 border border-blue-800/50 rounded-t shadow-md" />
                    <div className="w-10 h-16 bg-blue-500/70 border border-blue-600/50 rounded-t shadow-sm" />
                    <div className="w-8 h-12 bg-blue-400/60 border border-blue-500/40 rounded-t shadow-sm" />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onOpenEditZone}
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
              >
                <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-100">
                  <ExternalLink className="w-4 h-4" />
                  Open Map
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Coordinates Table */}
        {showCoordinates && (
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Point</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-600">Latitude</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-blue-600">Longitude</th>
                </tr>
              </thead>
              <tbody>
                {mockCoordinates.map((coord, index) => (
                  <tr key={coord.point} className={index !== mockCoordinates.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="px-4 py-3 text-sm text-gray-600">{coord.point}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{coord.latitude}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{coord.longitude}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Zoning Rules Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Zoning Rules</h3>
        <div className="flex items-start gap-16">
          <div>
            <p className="text-xs text-blue-600 mb-1">Max Height</p>
            <p className="text-sm font-medium text-gray-900">34m</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 mb-1">Setbacks</p>
            <p className="text-sm font-medium text-gray-900">10m</p>
          </div>
        </div>
      </section>

      {/* Version History Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Version History</h3>
        <button 
          onClick={onOpenVersionHistory}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Clock className="w-4 h-4" />
          View Version History
        </button>
      </section>

      {/* Branching Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Branching</h3>
        <button 
          onClick={onOpenBranching}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <GitBranch className="w-4 h-4" />
          View Branches
        </button>
      </section>

      {/* Required Workflows Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Required Workflows</h3>
        <div className="flex flex-col gap-2">
          {defaultWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="px-3 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg"
            >
              {workflow.name}
            </div>
          ))}
        </div>
      </section>

      {/* Law Text Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Law Text</h3>
        <div className="text-xs text-gray-600 leading-relaxed mb-3 max-h-40 overflow-hidden relative">
          <p className="mb-2">
            1. All state contracts and all documents soliciting bids or proposals for state contracts shall contain or make reference to the following provisions:
          </p>
          <p>
            (a) The contractor will not discriminate against employees or applicants for employment because of race, creed, color, national origin, sex, age, disability or marital status, and will undertake or continue existing programs of affirmative action to ensure that minority group members and women are afforded equal employment opportunities without discrimination. For purposes of this article affirmative action shall mean recruitment, employment, job assignment, promotion, upgradings, demotion, transfer, layoff, or termination and rates of pay or other forms of compensation.
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white to-transparent" />
        </div>
        <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
          <Download className="w-4 h-4" />
          View Full Text
        </button>
      </section>

      {/* Documents Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Documents</h3>
        <div className="flex flex-col gap-2">
          {mockDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.type} {doc.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Edit Mode Content Component
const EditModeContent = ({
  formData,
  onChange,
  onRemoveDocument,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition,
  onAddWorkflow,
  onRemoveWorkflow,
  isCreateMode = false,
  isPureCreate = false,
  isCreateBasedOn = false,
  onOpenEditZone,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownSearch, setDropdownSearch] = useState('');
  
  // Delete confirmation states
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: null, // 'condition', 'workflow', 'document'
    itemId: null,
    itemName: '',
  });

  const handleDeleteClick = useCallback((type, itemId, itemName) => {
    setDeleteConfirm({
      isOpen: true,
      type,
      itemId,
      itemName,
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    const { type, itemId } = deleteConfirm;
    if (type === 'condition') {
      onRemoveCondition(itemId);
    } else if (type === 'workflow') {
      onRemoveWorkflow(itemId);
    } else if (type === 'document') {
      onRemoveDocument(itemId);
    }
    setDeleteConfirm({ isOpen: false, type: null, itemId: null, itemName: '' });
  }, [deleteConfirm, onRemoveCondition, onRemoveWorkflow, onRemoveDocument]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({ isOpen: false, type: null, itemId: null, itemName: '' });
  }, []);

  // Rule type options with placeholder
  const ruleTypes = [
    { value: '', label: 'Height' },
    { value: 'max_height', label: 'Max Hei...' },
    { value: 'min_height', label: 'Min Height' },
    { value: 'setback', label: 'Setback' },
    { value: 'coverage', label: 'Coverage' },
    { value: 'far', label: 'FAR' },
  ];

  // Operator options with placeholder
  const operators = [
    { value: '', label: 'Operator' },
    { value: 'less', label: '<' },
    { value: 'less_equal', label: '≤' },
    { value: 'equals', label: '=' },
    { value: 'greater_equal', label: '≥' },
    { value: 'greater', label: '>' },
    { value: 'most_restrictive', label: 'Most Restrictive' },
    { value: 'less_restrictive', label: 'Less Restrictive' },
  ];

  // Land use options with placeholder
  const landUseWithValues = [
    { value: '', label: 'Land Use' },
    { value: 'residential', label: 'Resident...', fullLabel: 'Residential', valueLabel: '25m' },
    { value: 'commercial', label: 'Commercial', valueLabel: '30m' },
    { value: 'industrial', label: 'Industrial', valueLabel: '45m' },
    { value: 'parks_open_space', label: 'Parks & Open Space', valueLabel: '15m' },
    { value: 'recreation', label: 'Recreation / Entertainment', valueLabel: '12m' },
  ];

  // Check for conflicts
  const hasConflict = formData.conditions?.some((c, i) => {
    const otherConditions = formData.conditions.filter((_, idx) => idx !== i);
    return otherConditions.some(other => {
      if (c.ruleType === 'min_height' && other.ruleType === 'max_height') {
        const minVal = parseFloat(c.value) || 0;
        const maxVal = parseFloat(other.value) || Infinity;
        return minVal > maxVal;
      }
      return false;
    });
  });

  return (
    <div className="p-5 flex flex-col gap-6">
      {/* General Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">General</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Zoning Law Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder={isCreateMode ? "Enter Law Name" : "Zoning By-Law Amendment"}
              className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Zoning Type
            </label>
            <div className="relative">
              <select
                value={formData.type}
                onChange={(e) => onChange('type', e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white cursor-pointer"
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
            <input
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => onChange('effectiveDate', e.target.value)}
              className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Geographic Boundaries Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Geographic Boundaries</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Zone Plan</p>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative h-52 bg-gray-100 rounded-lg overflow-hidden">
            {/* Map background with streets */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-blue-100 to-blue-200">
              {/* Street grid simulation */}
              <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="editMapGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#94A3B8" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#editMapGrid)" />
              </svg>
              
              {/* Zone polygon */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <polygon
                  points="80,60 320,70 300,150 70,140"
                  fill="rgba(59, 130, 246, 0.3)"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
              </svg>
              
              {/* Stylized buildings */}
              <div className="absolute inset-0 flex items-end justify-center pb-8">
                <div className="flex items-end gap-2" style={{ transform: 'perspective(600px) rotateX(15deg)' }}>
                  <div className="w-10 h-14 bg-blue-400/70 border border-blue-500/50 rounded-t shadow-sm" />
                  <div className="w-14 h-20 bg-blue-500/70 border border-blue-600/50 rounded-t shadow-sm" />
                  <div className="w-12 h-24 bg-blue-600/80 border border-blue-700/50 rounded-t shadow-md" />
                  <div className="w-16 h-28 bg-blue-700/80 border border-blue-800/50 rounded-t shadow-md" />
                  <div className="w-10 h-16 bg-blue-500/70 border border-blue-600/50 rounded-t shadow-sm" />
                </div>
              </div>
            </div>
            
            {/* Open Map button */}
            <button 
              onClick={onOpenEditZone}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
            >
              <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-100">
                <ExternalLink className="w-4 h-4" />
                Open Map
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Zoning Rules Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Zoning Rules</h3>
        
        {/* For Create Based On mode - show simple inputs */}
        {isCreateBasedOn ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Max Height
              </label>
              <input
                type="text"
                value={formData.maxHeight || ''}
                onChange={(e) => onChange('maxHeight', e.target.value)}
                placeholder="e.g. 34m"
                className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Setbacks
              </label>
              <input
                type="text"
                value={formData.setbacks || ''}
                onChange={(e) => onChange('setbacks', e.target.value)}
                placeholder="e.g. 10m"
                className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
        ) : (
          /* For Pure Create and Edit modes - show condition dropdowns */
          <div className="flex flex-col gap-2">
            {formData.conditions?.map((condition, index) => (
              <div key={condition.id} className="flex items-center gap-2">
                {/* Drag Handle */}
                <button className="p-1 text-gray-400 hover:text-gray-600 cursor-grab">
                  <GripVertical className="w-4 h-4" />
                </button>
                
                {/* Rule Type Dropdown */}
                <div className="relative">
                  <select
                    value={condition.ruleType || ''}
                    onChange={(e) => onUpdateCondition(condition.id, 'ruleType', e.target.value)}
                    className={`appearance-none px-3 py-2 pr-8 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer w-24 ${condition.ruleType ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    {ruleTypes.map(rt => (
                      <option key={rt.value} value={rt.value}>{rt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
                
                {/* Operator Dropdown */}
                <div className="relative">
                  <select
                    value={condition.operator || ''}
                    onChange={(e) => onUpdateCondition(condition.id, 'operator', e.target.value)}
                    className={`appearance-none px-3 py-2 pr-8 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer w-24 ${condition.operator ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
                
                {/* Land Use Dropdown */}
                <div className="relative flex-1">
                  <select
                    value={condition.landUse || ''}
                    onChange={(e) => onUpdateCondition(condition.id, 'landUse', e.target.value)}
                    className={`appearance-none w-full px-3 py-2 pr-8 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer ${condition.landUse ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    {landUseWithValues.map(lu => (
                      <option key={lu.value} value={lu.value}>{lu.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick('condition', condition.id, `Condition ${index + 1}`)}
                  className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {/* Conflict Warning */}
            {hasConflict && (
              <div className="flex items-center gap-2 px-3 py-2 mt-1 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">
                  Conflict: Min Height (30.0 m) exceeds Max Height (25.0 m).
                </p>
              </div>
            )}
            
            {/* Add Condition Button */}
            <button
              onClick={onAddCondition}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-fit mt-1"
            >
              <Plus className="w-4 h-4" />
              Add Condition
            </button>
          </div>
        )}
      </section>

      {/* Required Workflows Section - Only show for non-pure create */}
      {!isPureCreate && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Required Workflows</h3>
          <div className="flex flex-col gap-2">
            {formData.workflows?.map((workflow) => (
              <div
                key={workflow.id}
                className="flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <button className="p-0.5 text-gray-400 hover:text-gray-600 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-900">{workflow.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteClick('workflow', workflow.id, workflow.name)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {/* Add Workflow Button */}
            <button
              onClick={() => {
                // Find an available workflow to add
                const available = availableWorkflows.find(
                  w => !formData.workflows?.find(fw => fw.id === w.id)
                );
                if (available) onAddWorkflow(available);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-fit border border-gray-200"
            >
              <Plus className="w-4 h-4" />
              Add Workflow
            </button>
          </div>
        </section>
      )}

      {/* Law Text Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Law Text</h3>
        <textarea
          value={formData.lawText || ''}
          onChange={(e) => onChange('lawText', e.target.value)}
          rows={isPureCreate ? 6 : 12}
          placeholder="Enter law text"
          className="w-full px-3 py-3 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y leading-relaxed placeholder:text-gray-400"
        />
      </section>

      {/* Based on Section - Only for createBasedOn mode */}
      {isCreateBasedOn && formData.basedOn && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Based on</h3>
          <p className="text-sm text-blue-600 underline cursor-pointer">{formData.basedOn}</p>
        </section>
      )}

      {/* Documents Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Documents</h3>
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Upload
          </button>
        </div>
        {formData.documents?.length > 0 ? (
          <div className="flex flex-col gap-2">
            {formData.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.type} {doc.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick('document', doc.id, doc.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Upload supporting documents.</p>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteConfirm.type === 'condition' ? 'Condition' : deleteConfirm.type === 'workflow' ? 'Workflow' : 'Document'}`}
        itemName={deleteConfirm.itemName}
      />
    </div>
  );
};

export default ZoningLawDetailsPanel;
