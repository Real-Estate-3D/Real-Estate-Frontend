// File: src/pages/Legislation/index.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, CheckCircle } from 'lucide-react';
import LegislationTable from '../../components/legislation/LegislationTable';
import LegislationFilters from '../../components/legislation/LegislationFilters';
import LegislationTabs from '../../components/legislation/LegislationTabs';
import CreateLegislationModal from '../../components/legislation/CreateLegislationModal';
import ZoningLawDetailsPanel from '../../components/legislation/ZoningLawDetailsPanel';
import ZoningLawViewModal from '../../components/legislation/ZoningLawViewModal';
import ZoningLawsTable from '../../components/legislation/ZoningLawsTable';
import PoliciesTable from '../../components/legislation/PoliciesTable';
import DeleteZoningLawModal from '../../components/legislation/DeleteZoningLawModal';
import PolicyDetailsPanel from '../../components/legislation/PolicyDetailsPanel';

// Toast notification component
const Toast = ({ message, title, onClose, isVisible }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right fade-in duration-300">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[320px] max-w-[400px]">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500 mt-0.5">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock data - will be replaced with API calls
const mockLegislations = [
  {
    id: 1,
    title: 'Zoning By-Law Amendment',
    process: 'Zoning By-Law Amendment Process',
    jurisdiction: 'Agincourt, Markham, Scugog/n',
    status: 'active',
    effectiveFrom: '2024-01-01',
    effectiveTo: '2026-12-31',
    legislationType: 'Zoning By-law',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    title: 'Site Plan Approval',
    process: 'Site Plan Approval Process',
    jurisdiction: 'Agincourt, Innisfil, Jasonvilln',
    status: 'pending',
    effectiveFrom: '2024-03-01',
    effectiveTo: '2025-12-31',
    legislationType: 'Site-Specific Zoning',
    createdAt: '2024-02-20',
  },
  {
    id: 3,
    title: 'Building Permit Application',
    process: 'Building Permit Process',
    jurisdiction: 'Gelling, Barrie, Federation',
    status: 'active',
    effectiveFrom: '2024-02-15',
    effectiveTo: '2027-02-14',
    legislationType: 'Official Plan',
    createdAt: '2024-02-10',
  },
  {
    id: 4,
    title: 'Development Agreement Registration',
    process: 'Development Agreement Process',
    jurisdiction: 'Commercial, Downtown, Limberg',
    status: 'draft',
    effectiveFrom: '2024-04-01',
    effectiveTo: '2029-04-01',
    legislationType: 'Subdivision Control',
    createdAt: '2024-03-05',
  },
  {
    id: 5,
    title: 'Public Consultation Meeting',
    process: 'Public Consultation Process',
    jurisdiction: 'Rexdale, Downie, Millburne',
    status: 'active',
    effectiveFrom: '2024-01-20',
    effectiveTo: '2024-12-31',
    legislationType: 'Zoning By-law',
    createdAt: '2024-01-10',
  },
  {
    id: 6,
    title: 'Final Development Approval',
    process: 'Final Development Process',
    jurisdiction: 'Sondelark, Creighton, Jasonvilln',
    status: 'completed',
    effectiveFrom: '2023-06-01',
    effectiveTo: '2024-06-01',
    legislationType: 'Site-Specific Zoning',
    createdAt: '2023-05-15',
  },
  {
    id: 7,
    title: 'Heritage Designation Bylaw',
    process: 'Heritage Designation Process',
    jurisdiction: 'Almoodson, Franciscan, Bennington',
    status: 'active',
    effectiveFrom: '2024-02-01',
    effectiveTo: '2029-02-01',
    legislationType: 'Official Plan',
    createdAt: '2024-01-25',
  },
  {
    id: 8,
    title: 'Site Plan Approved Process',
    process: 'Site Plan Approved Process',
    jurisdiction: 'Scarborough, Thornhill, Bering Str',
    status: 'pending',
    effectiveFrom: '2024-05-01',
    effectiveTo: '2026-05-01',
    legislationType: 'Zoning By-law',
    createdAt: '2024-04-20',
  },
];

const tabs = [
  { id: 'processes', label: 'Processes' },
  { id: 'zoning-laws', label: 'Zoning Laws' },
  { id: 'policies', label: 'Policies' },
  { id: 'change-history', label: 'Change History' },
];

// Mock policies data
const mockPolicies = [
  {
    id: 1,
    name: 'Provincial Policy 101',
    category: 'Environmental',
    rules: 'Max Height 33m, Setbacks 10m, Max Height 33m, Setbacks 10m, Max Height 33m, Setbacks 10m',
  },
  {
    id: 2,
    name: 'Urban Development Guidelines',
    category: 'Zoning',
    rules: 'Max Height 50m, Setbacks 15m, Density 200 units/hectare',
  },
  {
    id: 3,
    name: 'Conservation Area Regulations',
    category: 'Wildlife Protection',
    rules: 'Max Height 25m, Setbacks 20m, Specific Flora Preservation',
  },
  {
    id: 4,
    name: 'Building Codes & Standards',
    category: 'Safety',
    rules: 'Fire Safety Measures, Earthquake Resistance, Accessibility Compliance',
  },
  {
    id: 5,
    name: 'Floodplain Management',
    category: 'Water Management',
    rules: 'Max Height 20m, Setbacks 25m, Flood Risk Assessment Required',
  },
  {
    id: 6,
    name: 'Historic Preservation Act',
    category: 'Cultural Heritage',
    rules: 'Height Restrictions, Preservation of Facades, No Demolition Allowed',
  },
  {
    id: 7,
    name: 'Provincial Policy 101',
    category: 'Environmental',
    rules: 'Max Height 33m, Setbacks 10m, Max Height 33m, Setbacks 10m, Max Height 33m, Setbacks 10m',
  },
  {
    id: 8,
    name: 'Renewable Energy Policy',
    category: 'Sustainability',
    rules: 'Solar Panel Requirements, Energy Efficiency Standards, Max Height 35m',
  },
  {
    id: 9,
    name: 'Transportation and Accessibility Plan',
    category: 'Urban Mobility',
    rules: 'Max Height 30m, Setbacks 12m, Public Transport Integration',
  },
  {
    id: 10,
    name: 'Community Engagement Framework',
    category: 'Civic Participation',
    rules: 'Public Consultation Mandates, Feedback Collection, Transparency Guidelines',
  },
];

// Mock zoning laws data
const mockZoningLaws = [
  {
    id: 1,
    title: 'Zoning By-Law Amendment',
    number: '143-B',
    type: 'Residential',
    effectiveFrom: '25.08.2025',
    validityStatus: 'Violat...',
    status: 'active',
    legislationType: 'Zoning By-law',
  },
  {
    id: 2,
    title: 'Site Plan Approval Process',
    number: '144-A',
    type: 'Commercial',
    effectiveFrom: '15.09.2025',
    validityStatus: 'Comp...',
    status: 'active',
    legislationType: 'Site-Specific Zoning',
  },
  {
    id: 3,
    title: 'Building Permit Application',
    number: '145-C',
    type: 'Residential',
    effectiveFrom: '10.10.2025',
    validityStatus: 'Meet...',
    status: 'pending',
    legislationType: 'Official Plan',
  },
  {
    id: 4,
    title: 'Environmental Impact Assessment',
    number: '147-E',
    type: 'Commercial',
    effectiveFrom: '20.12.2025',
    validityStatus: 'Asses...',
    status: 'active',
    legislationType: 'Subdivision Control',
  },
  {
    id: 5,
    title: 'Heritage Designation Process',
    number: '146-D',
    type: 'Residential',
    effectiveFrom: '05.11.2025',
    validityStatus: 'Prese...',
    status: 'active',
    legislationType: 'Zoning By-law',
  },
  {
    id: 6,
    title: 'Public Consultation Meeting',
    number: '148-F',
    type: 'Residential',
    effectiveFrom: '12.01.2026',
    validityStatus: 'Gathe...',
    status: 'pending',
    legislationType: 'Site-Specific Zoning',
  },
  {
    id: 7,
    title: 'Subdivision Approval Process',
    number: '149-G',
    type: 'Residential',
    effectiveFrom: '30.01.2026',
    validityStatus: 'Ensur...',
    status: 'active',
    legislationType: 'Official Plan',
  },
  {
    id: 8,
    title: 'Land Use Compatibility Review',
    number: '150-H',
    type: 'Commercial',
    effectiveFrom: '28.02.2026',
    validityStatus: 'Exami...',
    status: 'active',
    legislationType: 'Zoning By-law',
  },
  {
    id: 9,
    title: 'Zoning By-Law Amendment',
    number: '143-B',
    type: 'Residential',
    effectiveFrom: '25.08.2025',
    validityStatus: 'Violat...',
    status: 'pending',
    legislationType: 'Site-Specific Zoning',
  },
  {
    id: 10,
    title: 'Final Inspection Process',
    number: '151-I',
    type: 'Commercial',
    effectiveFrom: '15.03.2026',
    validityStatus: 'Verify...',
    status: 'active',
    legislationType: 'Official Plan',
  },
];

const Legislation = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('processes');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [legislations, setLegislations] = useState(mockLegislations);
  const [zoningLaws, setZoningLaws] = useState(mockZoningLaws);
  const [selectedZoningLaw, setSelectedZoningLaw] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState('view'); // 'view', 'edit', 'create'
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: mockLegislations.length,
  });
  const [zoningPagination, setZoningPagination] = useState({
    page: 1,
    perPage: 10,
    total: mockZoningLaws.length,
  });
  const [policies, setPolicies] = useState(mockPolicies);
  const [policiesPagination, setPoliciesPagination] = useState({
    page: 1,
    perPage: 10,
    total: mockPolicies.length,
  });
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isPolicyPanelOpen, setIsPolicyPanelOpen] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    title: '',
    message: '',
  });

  const showToast = useCallback((title, message) => {
    setToast({ isVisible: true, title, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Zoning Law handlers
  const handleZoningLawClick = useCallback((zoningLaw) => {
    // Navigate to the zoning law details page
    navigate(`/legislation/${zoningLaw.id}`);
  }, [navigate]);

  // Policy handlers
  const handlePolicyClick = useCallback((policy) => {
    setSelectedPolicy(policy);
    setIsPolicyPanelOpen(true);
    // Close zoning law panel if open
    setIsDetailsPanelOpen(false);
  }, []);

  const handleClosePolicyPanel = useCallback(() => {
    setIsPolicyPanelOpen(false);
    setSelectedPolicy(null);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
  }, []);

  const handleEditFromViewModal = useCallback((zoningLaw) => {
    setIsViewModalOpen(false);
    setSelectedZoningLaw(zoningLaw);
    setPanelMode('edit');
    setIsDetailsPanelOpen(true);
  }, []);

  const handleDeleteFromViewModal = useCallback((zoningLaw) => {
    setSelectedZoningLaw(zoningLaw);
    setIsDeleteModalOpen(true);
  }, []);

  const handleCreateZoningLaw = useCallback(() => {
    setSelectedZoningLaw(null);
    setPanelMode('create');
    setIsDetailsPanelOpen(true);
  }, []);

  const handleCloseDetailsPanel = useCallback(() => {
    setIsDetailsPanelOpen(false);
    setSelectedZoningLaw(null);
    setPanelMode('view');
  }, []);

  const handleZoningLawEdit = useCallback(() => {
    // The panel handles edit mode internally
  }, []);

  const handleZoningLawDelete = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (selectedZoningLaw) {
      setZoningLaws(prev => prev.filter(item => item.id !== selectedZoningLaw.id));
      setIsDeleteModalOpen(false);
      handleCloseDetailsPanel();
      showToast('Zoning Law Deleted', `${selectedZoningLaw.title} has been deleted.`);
    }
  }, [selectedZoningLaw, handleCloseDetailsPanel, showToast]);

  const handleCreateBasedOn = useCallback(() => {
    if (selectedZoningLaw) {
      // Navigate to create page with basedOn data
      navigate(`/legislation/new?mode=create&basedOn=${encodeURIComponent(selectedZoningLaw.title)}`);
    }
  }, [selectedZoningLaw, navigate]);

  const handleZoningLawSave = useCallback((formData) => {
    if (selectedZoningLaw) {
      setZoningLaws(prev => prev.map(item => 
        item.id === selectedZoningLaw.id 
          ? { ...item, title: formData.name, type: formData.type }
          : item
      ));
      showToast('Zoning Law Updated', `${formData.name} has been updated successfully.`);
    }
  }, [selectedZoningLaw, showToast]);

  const handleCreateZoningLawSave = useCallback((formData) => {
    const newZoningLaw = {
      id: Date.now(),
      title: formData.name,
      number: `NEW-${Date.now().toString().slice(-3)}`,
      type: formData.type,
      effectiveFrom: formData.effectiveDate,
      validityStatus: 'New',
      status: 'pending',
      legislationType: formData.type,
    };
    setZoningLaws(prev => [newZoningLaw, ...prev]);
    showToast('Zoning Law Created', `${formData.name} has been created successfully.`);
  }, [showToast]);

  // Filter handlers
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handlePerPageChange = useCallback((newPerPage) => {
    setPagination(prev => ({ ...prev, perPage: newPerPage, page: 1 }));
  }, []);

  // CRUD handlers - these will connect to API later
  const handleCreate = useCallback((data) => {
    // TODO: Replace with API call
    const newLegislation = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLegislations(prev => [newLegislation, ...prev]);
    setIsCreateModalOpen(false);
    
    // Show success toast
    showToast(
      'New Legislation Created',
      `${data.title || 'New legislation'} has been successfully created.`
    );
  }, [showToast]);

  const handleEdit = useCallback((id) => {
    // TODO: Replace with API call
    console.log('Edit legislation:', id);
  }, []);

  const handleDelete = useCallback((id) => {
    // TODO: Replace with API call
    setLegislations(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleSwap = useCallback((id) => {
    // TODO: Replace with API call - swap status or order
    console.log('Swap legislation:', id);
  }, []);

  // Filter legislations based on current filters
  const filteredLegislations = legislations.filter(item => {
    if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status !== 'all' && item.status !== filters.status) {
      return false;
    }
    if (filters.type !== 'all' && item.legislationType !== filters.type) {
      return false;
    }
    return true;
  });

  // Calculate paginated data
  const startIndex = (pagination.page - 1) * pagination.perPage;
  const paginatedLegislations = filteredLegislations.slice(
    startIndex,
    startIndex + pagination.perPage
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">Legislation</h1>
        {activeTab === 'zoning-laws' ? (
          <button
            onClick={handleCreateZoningLaw}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Zoning Law
          </button>
        ) : (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Legislation
          </button>
        )}
      </div>

      {/* Tabs */}
      <LegislationTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Filters */}
      <LegislationFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        {activeTab === 'zoning-laws' ? (
          <ZoningLawsTable
            data={zoningLaws}
            pagination={zoningPagination}
            onPageChange={(page) => setZoningPagination(prev => ({ ...prev, page }))}
            onPerPageChange={(perPage) => setZoningPagination(prev => ({ ...prev, perPage, page: 1 }))}
            onRowClick={handleZoningLawClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : activeTab === 'policies' ? (
          <PoliciesTable
            data={policies}
            pagination={policiesPagination}
            onPageChange={(page) => setPoliciesPagination(prev => ({ ...prev, page }))}
            onPerPageChange={(perPage) => setPoliciesPagination(prev => ({ ...prev, perPage, page: 1 }))}
            onRowClick={handlePolicyClick}
          />
        ) : (
          <LegislationTable
            data={paginatedLegislations}
            pagination={{
              ...pagination,
              total: filteredLegislations.length,
            }}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSwap={handleSwap}
          />
        )}
      </div>

      {/* Create Modal */}
      <CreateLegislationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Zoning Law View Modal */}
      <ZoningLawViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        legislation={selectedZoningLaw}
        onEdit={handleEditFromViewModal}
        onDelete={handleDeleteFromViewModal}
      />

      {/* Zoning Law Details Panel */}
      <ZoningLawDetailsPanel
        isOpen={isDetailsPanelOpen}
        onClose={handleCloseDetailsPanel}
        legislation={selectedZoningLaw}
        mode={panelMode}
        onEdit={handleZoningLawEdit}
        onDelete={handleZoningLawDelete}
        onCreateBasedOn={handleCreateBasedOn}
        onSave={handleZoningLawSave}
        onCreateSave={handleCreateZoningLawSave}
        onPageView={(zoningLaw) => {
          handleCloseDetailsPanel();
          navigate(`/legislation/${zoningLaw.id}`);
        }}
      />

      {/* Policy Details Panel */}
      {isPolicyPanelOpen && (
        <div className="fixed top-0 right-0 h-full z-40">
          <PolicyDetailsPanel
            policy={selectedPolicy}
            onClose={handleClosePolicyPanel}
            isOpen={isPolicyPanelOpen}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteZoningLawModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        zoningLawName={selectedZoningLaw ? `${selectedZoningLaw.title} Residential VHD-123` : ''}
      />

      {/* Success Toast */}
      <Toast
        isVisible={toast.isVisible}
        title={toast.title}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
};

export default Legislation;
