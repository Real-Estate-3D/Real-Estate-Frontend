// File: src/components/legislation/ZoningLawDetailsPanel.jsx

import React, { useState, useCallback } from 'react';
import {
  X,
  Plus,
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
  mode = 'view', // 'view', 'edit', or 'create'
  onCreateSave,
  onPageView,
}) => {
  const isCreateMode = mode === 'create';
  const [isEditMode, setIsEditMode] = useState(isCreateMode);
  const [showMap, setShowMap] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [isEditZoneModalOpen, setIsEditZoneModalOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isBranchingOpen, setIsBranchingOpen] = useState(false);
  
  // Get initial form data based on mode
  const getInitialFormData = useCallback(() => {
    if (isCreateMode) {
      return {
        name: 'Zoning By-Law Amendment',
        type: 'residential',
        effectiveDate: '2025-06-21',
        maxHeight: '34m',
        setbacks: '10m',
        workflows: [],
        lawText: `1. All state contracts and all documents soliciting bids or proposals for state contracts shall contain or make reference to the following provisions:

(a) The contractor will not discriminate against employees or applicants for employment because of race, creed, color, national origin, sex, age, disability or marital status, and will undertake or continue existing programs of affirmative action to ensure that minority group members and women are afforded equal employment opportunities without discrimination. For purposes of this article affirmative action shall mean recruitment, employment, job assignment, promotion, upgradings, demotion, transfer, layoff, or termination and rates of pay or other forms of compensation.

(b) At the request of the contracting agency, the contractor shall request each employment agency, labor union, or authorized representative of workers with which it has a collective bargaining or other agreement or understanding, to furnish a written statement that such employment agency, labor union or representative will not discriminate on the basis of race, creed, color, national origin, sex, age, disability or marital status and that such union or representative will affirmatively cooperate in the implementation of the contractor's obligations herein.`,
        documents: [...mockDocuments],
        basedOn: 'Residential Zone R1',
      };
    }
    return {
      name: legislation?.title || '',
      type: legislation?.legislationType || 'residential',
      effectiveDate: legislation?.effectiveFrom || '',
      maxHeight: '34m',
      setbacks: '10m',
      workflows: [...defaultWorkflows],
      lawText: `1. All state contracts and all documents soliciting bids or proposals for state contracts shall contain or make reference to the following provisions:

(a) The contractor will not discriminate against employees or applicants for employment because of race, creed, color, national origin, sex, age, disability or marital status, and will undertake or continue existing programs of affirmative action to ensure that minority group members and women are afforded equal employment opportunities without discrimination. For purposes of this article affirmative action shall mean recruitment, employment, job assignment, promotion, upgradings, demotion, transfer, layoff, or termination and rates of pay or other forms of compensation.

(b) At the request of the contracting agency, the contractor shall request each employment agency, labor union, or authorized representative of workers with which it has a collective bargaining or other agreement or understanding, to furnish a written statement that such employment agency, labor union or representative will not discriminate on the basis of race, creed, color, national origin, sex, age, disability or marital status and that such union or representative will affirmatively cooperate in the implementation of the contractor's obligations herein.`,
      documents: [...mockDocuments],
      basedOn: 'Residential Zone R1',
    };
  }, [isCreateMode, legislation]);

  // Edit form state
  const [formData, setFormData] = useState(getInitialFormData);

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditClick = useCallback(() => {
    setFormData({
      name: legislation?.title || '',
      type: legislation?.legislationType || 'residential',
      effectiveDate: legislation?.effectiveFrom || '',
      maxHeight: '34m',
      setbacks: '10m',
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
        ...prev.conditions,
        { id: Date.now(), type: 'height', operator: '', landUse: '' },
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
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
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
            isCreateMode={isCreateMode}
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
        <div className="flex flex-col gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
          {/* Policy Violation Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Max Height violate <span className="text-blue-600 underline cursor-pointer">Provincial Policy XC432</span> (Allowed Max Height: 28m)
            </p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleCancelEdit}
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

      {/* Cover Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Cover</h3>
        <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      </section>

      {/* General Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">General</h3>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Zoning Law Name</p>
            <p className="text-sm text-gray-900">{legislation.title} Residential VHD-123</p>
          </div>
          <div className="flex items-start gap-8">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Type</p>
              <p className="text-sm text-gray-900">Residential</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Effective Date</p>
              <p className="text-sm text-gray-900">21.06.2025</p>
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
            View Map
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
            View Coordinates
          </button>
        </div>

        {/* Map Preview */}
        {showMap && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">Zone Plan</p>
              <div className="flex items-center gap-1">
                <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
              {/* Map placeholder with 3D building visualization */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-100 to-blue-200">
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3B82F6" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mapGrid)" />
                </svg>
                
                {/* Stylized buildings */}
                <div className="absolute inset-0 flex items-end justify-center pb-4">
                  <div className="flex items-end gap-2" style={{ transform: 'perspective(500px) rotateX(10deg)' }}>
                    <div className="w-8 h-16 bg-blue-400/60 border border-blue-500/40 rounded-t" />
                    <div className="w-12 h-24 bg-blue-500/60 border border-blue-600/40 rounded-t" />
                    <div className="w-10 h-20 bg-blue-400/60 border border-blue-500/40 rounded-t" />
                    <div className="w-14 h-28 bg-blue-600/60 border border-blue-700/40 rounded-t" />
                    <div className="w-8 h-14 bg-blue-400/60 border border-blue-500/40 rounded-t" />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onOpenEditZone}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  Open Map
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Coordinates Table */}
        {showCoordinates && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Point</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Latitude</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Longitude</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockCoordinates.map((coord) => (
                  <tr key={coord.point}>
                    <td className="px-3 py-2 text-sm text-gray-600">{coord.point}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{coord.latitude}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">{coord.longitude}</td>
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
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Max Height</p>
            <p className="text-sm text-gray-900">34m <span className="text-gray-400 text-xs">ⓘ</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Setbacks</p>
            <p className="text-sm text-gray-900">10m</p>
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
  isCreateMode = false,
  onOpenEditZone,
}) => {
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
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
              placeholder={isCreateMode ? "Select Date" : ""}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Geographic Boundaries Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Geographic Boundaries</h3>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900">Zone Plan</p>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full border border-gray-300 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full border border-gray-300 transition-colors">
                <span className="text-sm font-medium">−</span>
              </button>
            </div>
          </div>
          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
            {/* Map background with streets */}
            <div className="absolute inset-0 bg-gray-200">
              {/* Street grid simulation */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="createMapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D1D5DB" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#E5E7EB" />
                <rect width="100%" height="100%" fill="url(#createMapGrid)" />
                
                {/* Zone polygon */}
                <polygon
                  points="60,40 340,60 320,160 50,140"
                  fill="rgba(147, 197, 253, 0.5)"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                {/* Corner handles */}
                <circle cx="60" cy="40" r="5" fill="#3B82F6" />
                <circle cx="340" cy="60" r="5" fill="#3B82F6" />
                <circle cx="320" cy="160" r="5" fill="#3B82F6" />
                <circle cx="50" cy="140" r="5" fill="#3B82F6" />
              </svg>
            </div>
            
            {/* Open Map button */}
            <button 
              onClick={onOpenEditZone}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-gray-200">
                <Pencil className="w-4 h-4" />
                Open Map
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Zoning Rules Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Zoning Rules</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Max Height
            </label>
            <input
              type="text"
              value={formData.maxHeight}
              onChange={(e) => onChange('maxHeight', e.target.value)}
              placeholder="e.g. 34m"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Setbacks
            </label>
            <input
              type="text"
              value={formData.setbacks}
              onChange={(e) => onChange('setbacks', e.target.value)}
              placeholder="e.g. 10m"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Law Text Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Law Text</h3>
        <textarea
          value={formData.lawText}
          onChange={(e) => onChange('lawText', e.target.value)}
          rows={10}
          placeholder="Enter law text"
          className="w-full px-3 py-2 text-xs text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed placeholder:text-gray-400"
        />
      </section>

      {/* Based on Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Based on</h3>
        <p className="text-sm text-gray-700">Residential Zone R1</p>
      </section>

      {/* Documents Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Documents</h3>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            Upload
          </button>
        </div>
        {formData.documents.length > 0 ? (
          <div className="flex flex-col gap-2">
            {formData.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-500" />
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
                    onClick={() => onRemoveDocument(doc.id)}
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
    </div>
  );
};

export default ZoningLawDetailsPanel;
