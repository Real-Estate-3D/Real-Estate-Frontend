// File: src/pages/Legislation/index.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, List, LayoutGrid } from 'lucide-react';
import LegislationTable from '../../components/legislation/LegislationTable';
import LegislationFilters from '../../components/legislation/LegislationFilters';
import LegislationTabs from '../../components/legislation/LegislationTabs';
import CreateLegislationModal from '../../components/legislation/CreateLegislationModal';
import ZoningLawDetailsPanel from '../../components/legislation/ZoningLawDetailsPanel';
import ZoningLawViewModal from '../../components/legislation/ZoningLawViewModal';
import ZoningLawsTable from '../../components/legislation/ZoningLawsTable';
import ZoningLawsGrid from '../../components/legislation/ZoningLawsGrid';
import PoliciesTable from '../../components/legislation/PoliciesTable';
import DeleteZoningLawModal from '../../components/legislation/DeleteZoningLawModal';
import PolicyDetailsPanel from '../../components/legislation/PolicyDetailsPanel';
import ChangeHistoryTable from '../../components/legislation/ChangeHistoryTable';
import zoningLawService from '../../services/zoningLawService';
import policyService from '../../services/policyService';
import legislationService from '../../services/legislationService';
import changeHistoryService from '../../services/changeHistoryService';
import { Button } from '../../components/common';

// Onboarding hooks
import { useOnboardingFlow } from '../../hooks/useOnboardingFlow';

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
    <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right fade-in duration-300">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[320px] max-w-[400px]">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
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

// TODO: Remove this dummy record in production
const DUMMY_LEGISLATION_RECORD = {
  id: 'dummy-001',
  title: 'Sample Legislation Process',
  process: 'Draft, Review, Approve',
  status: 'active',
  effectiveFrom: '2025-01-01',
  legislationType: 'Zoning By-law',
  isDummy: true, // Flag to identify dummy record
};

// Mock data - will be replaced with API calls
const mockLegislations = [
  {
    id: 1,
    title: 'Zoning By-Law Amendment Process',
    process: 'Submission, Review, Approval',
    status: 'active',
    effectiveFrom: '2025-08-25',
    legislationType: 'Zoning By-law',
  },
  {
    id: 2,
    title: 'Site Plan Approval',
    process: 'Application, Review, Issuance',
    status: 'active',
    effectiveFrom: '2025-10-15',
    legislationType: 'Site-Specific Zoning',
  },
  {
    id: 3,
    title: 'Building Permit Application',
    process: 'Submission, Inspection, Approval',
    status: 'pending',
    effectiveFrom: '2025-11-10',
    legislationType: 'Official Plan',
  },
  {
    id: 4,
    title: 'Development Agreement Negotiation',
    process: 'Drafting, Review, Finalization',
    status: 'rejected',
    effectiveFrom: '2025-09-30',
    legislationType: 'Subdivision Control',
  },
  {
    id: 5,
    title: 'Public Consultation Meeting',
    process: 'Scheduling, Notification, Conducting',
    status: 'active',
    effectiveFrom: '2025-12-05',
    legislationType: 'Zoning By-law',
  },
  {
    id: 6,
    title: 'Final Development Approval',
    process: 'Review, Decision, Notification',
    status: 'pending',
    effectiveFrom: '2026-01-20',
    legislationType: 'Site-Specific Zoning',
  },
  {
    id: 7,
    title: 'Site Plan Approval Process',
    process: 'Submission, Consultation, Issuance',
    status: 'pending',
    effectiveFrom: '2025-12-15',
    legislationType: 'Official Plan',
  },
  {
    id: 8,
    title: 'Building Permit Application',
    process: 'Submission, Review, Issuance',
    status: 'pending',
    effectiveFrom: '2025-11-10',
    legislationType: 'Zoning By-law',
  },
  {
    id: 9,
    title: 'Heritage Designation Process',
    process: 'Nomination, Evaluation, Designation',
    status: 'cancelled',
    effectiveFrom: '2026-01-05',
    legislationType: 'Heritage',
  },
  {
    id: 10,
    title: 'Public Consultation for Development',
    process: 'Announcement, Feedback, Reporting',
    status: 'cancelled',
    effectiveFrom: '2025-09-20',
    legislationType: 'Official Plan',
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
    validationMessage: 'Violates provincial policy statement 2.1.3',
    status: 'active',
    legislationType: 'Zoning By-law',
  },
  {
    id: 2,
    title: 'Site Plan Approval Process',
    number: '144-A',
    type: 'Commercial',
    effectiveFrom: '15.09.2025',
    validationMessage: 'Compliant with all regulations',
    status: 'active',
    legislationType: 'Site-Specific Zoning',
  },
  {
    id: 3,
    title: 'Building Permit Application',
    number: '145-C',
    type: 'Residential',
    effectiveFrom: '10.10.2025',
    validationMessage: 'Meets minimum setback requirements',
    status: 'pending',
    legislationType: 'Official Plan',
  },
  {
    id: 4,
    title: 'Environmental Impact Assessment',
    number: '147-E',
    type: 'Commercial',
    effectiveFrom: '20.12.2025',
    validationMessage: 'Assessment pending review',
    status: 'active',
    legislationType: 'Subdivision Control',
  },
  {
    id: 5,
    title: 'Heritage Designation Process',
    number: '146-D',
    type: 'Residential',
    effectiveFrom: '05.11.2025',
    validationMessage: 'Preservation criteria satisfied',
    status: 'active',
    legislationType: 'Zoning By-law',
  },
  {
    id: 6,
    title: 'Public Consultation Meeting',
    number: '148-F',
    type: 'Residential',
    effectiveFrom: '12.01.2026',
    validationMessage: 'Gathering community feedback',
    status: 'pending',
    legislationType: 'Site-Specific Zoning',
  },
  {
    id: 7,
    title: 'Subdivision Approval Process',
    number: '149-G',
    type: 'Residential',
    effectiveFrom: '30.01.2026',
    validationMessage: 'Ensures infrastructure compliance',
    status: 'active',
    legislationType: 'Official Plan',
  },
  {
    id: 8,
    title: 'Land Use Compatibility Review',
    number: '150-H',
    type: 'Commercial',
    effectiveFrom: '28.02.2026',
    validationMessage: 'Examining adjacent land uses',
    status: 'active',
    legislationType: 'Zoning By-law',
  },
  {
    id: 9,
    title: 'Zoning By-Law Amendment',
    number: '143-B',
    type: 'Residential',
    effectiveFrom: '25.08.2025',
    validationMessage: 'Violates height restriction policy 4.2',
    status: 'pending',
    legislationType: 'Site-Specific Zoning',
  },
  {
    id: 10,
    title: 'Final Inspection Process',
    number: '151-I',
    type: 'Commercial',
    effectiveFrom: '15.03.2026',
    validationMessage: 'Verification of compliance complete',
    status: 'active',
    legislationType: 'Official Plan',
  },
];

// Mock change history data
const mockChangeHistory = [
  {
    id: 1,
    date: '2025-06-21',
    description: 'The Comprehensive Zoning By-Law Amendment Process: Understanding the Steps and Requirements',
    affectedEntities: [{ type: 'legislation', id: 1, title: 'linkaddress.com/asdfsfsdfw', url: '/legislation/1' }],
  },
  {
    id: 2,
    date: '2025-06-22',
    description: 'Navigating the Environmental Assessment Process: Key Considerations for Developers',
    affectedEntities: [{ type: 'legislation', id: 2, title: 'linkaddress.com/assdfghjkl', url: '/legislation/2' }],
  },
  {
    id: 3,
    date: '2025-06-24',
    description: 'Understanding the Role of Planning Consultants in Development Projects',
    affectedEntities: [{ type: 'zoning_law', id: 1, title: 'linkaddress.com/jytrfdjh', url: '/legislation/zoning/1' }],
  },
  {
    id: 4,
    date: '2025-06-26',
    description: 'The Importance of Infrastructure Planning in Urban Development',
    affectedEntities: [{ type: 'policy', id: 1, title: 'linkaddress.com/vcxzgaz', url: '/legislation/policy/1' }],
  },
  {
    id: 5,
    date: '2025-06-27',
    description: 'Legal Framework for Land Use and Zoning: What You Need to Know',
    affectedEntities: [{ type: 'zoning_law', id: 2, title: 'linkaddress.com/asdfghjklqwer', url: '/legislation/zoning/2' }],
  },
  {
    id: 6,
    date: '2025-06-21',
    description: 'The Comprehensive Zoning By-Law Amendment Process: Understanding the Steps and Requirements',
    affectedEntities: [{ type: 'legislation', id: 3, title: 'linkaddress.com/asdfsfsdf w', url: '/legislation/3' }],
  },
  {
    id: 7,
    date: '2025-06-23',
    description: 'Building Permit Applications: A Step-by-Step Guide for Homeowners',
    affectedEntities: [{ type: 'zoning_law', id: 3, title: 'linkaddress.com/ghgfdhfk', url: '/legislation/zoning/3' }],
  },
  {
    id: 8,
    date: '2025-06-25',
    description: 'Community Engagement Strategies for Successful Planning Initiatives',
    affectedEntities: [{ type: 'policy', id: 2, title: 'linkaddress.com/mbnvbgfd', url: '/legislation/policy/2' }],
  },
  {
    id: 9,
    date: '2025-06-28',
    description: 'Decoding the Site Plan Approval Process: Essential Steps and Tips',
    affectedEntities: [{ type: 'legislation', id: 4, title: 'linkaddress.com/qwertyuiop', url: '/legislation/4' }],
  },
  {
    id: 10,
    date: '2025-06-29',
    description: 'Future Trends in Urban Planning: Innovative Approaches and Technologies',
    affectedEntities: [{ type: 'policy', id: 3, title: 'linkaddress.com/policytrevvg', url: '/legislation/policy/3' }],
  },
];

const Legislation = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('processes');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ======================================
  // ONBOARDING HOOKS
  // ======================================

  // Page onboarding - shows on first visit to Legislation page
  useOnboardingFlow('pages', 'legislation');
  // TODO: Remove DUMMY_LEGISLATION_RECORD in production
  const [legislations, setLegislations] = useState([DUMMY_LEGISLATION_RECORD, ...mockLegislations]);
  const [zoningLaws, setZoningLaws] = useState([]);
  const [selectedZoningLaw, setSelectedZoningLaw] = useState(null);
  const [basedOnLegislation, setBasedOnLegislation] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState('view'); // 'view', 'edit', 'create', 'createBasedOn'
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 136, // Mock total for demo
  });
  const [zoningPagination, setZoningPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
  });
  const [policies, setPolicies] = useState([]);
  const [policiesPagination, setPoliciesPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
  });
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isPolicyPanelOpen, setIsPolicyPanelOpen] = useState(false);
  const [changeHistory, setChangeHistory] = useState([]);
  const [changeHistoryPagination, setChangeHistoryPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
  });
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

  // Fetch zoning laws from API
  const fetchZoningLaws = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: zoningPagination.page,
        limit: zoningPagination.perPage,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
      };

      const result = await zoningLawService.getAll(params);
      setZoningLaws(result.data);
      setZoningPagination(prev => ({
        ...prev,
        total: result.pagination?.total || 0,
      }));
    } catch (error) {
      console.error('Error fetching zoning laws:', error);
      showToast('Error', 'Failed to load zoning laws. Please try again.');
      // Fallback to mock data on error
      setZoningLaws(mockZoningLaws);
      setZoningPagination(prev => ({
        ...prev,
        total: mockZoningLaws.length,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [zoningPagination.page, zoningPagination.perPage, filters.search, filters.status, filters.type, showToast]);

  // Fetch policies from API
  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: policiesPagination.page,
        limit: policiesPagination.perPage,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        category: filters.type !== 'all' ? filters.type : undefined,
      };

      const result = await policyService.getAll(params);
      setPolicies(result.data);
      setPoliciesPagination(prev => ({
        ...prev,
        total: result.pagination?.total || 0,
      }));
    } catch (error) {
      console.error('Error fetching policies:', error);
      showToast('Error', 'Failed to load policies. Please try again.');
      // Fallback to mock data on error
      setPolicies(mockPolicies);
      setPoliciesPagination(prev => ({
        ...prev,
        total: mockPolicies.length,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [policiesPagination.page, policiesPagination.perPage, filters.search, filters.status, filters.type, showToast]);

  // Fetch legislations from API
  const fetchLegislations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        perPage: pagination.perPage,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
      };

      const result = await legislationService.getAll(params);
      // TODO: Remove DUMMY_LEGISLATION_RECORD in production
      setLegislations([DUMMY_LEGISLATION_RECORD, ...result.data]);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0,
      }));
    } catch (error) {
      console.error('Error fetching legislations:', error);
      showToast('Error', 'Failed to load legislations. Please try again.');
      // Fallback to mock data on error
      // TODO: Remove DUMMY_LEGISLATION_RECORD in production
      setLegislations([DUMMY_LEGISLATION_RECORD, ...mockLegislations]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.perPage, filters.search, filters.status, filters.type, showToast]);

  // Fetch change history from API
  const fetchChangeHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: changeHistoryPagination.page,
        limit: changeHistoryPagination.perPage,
        search: filters.search || undefined,
      };

      const result = await changeHistoryService.getAll(params);
      setChangeHistory(result.data);
      setChangeHistoryPagination(prev => ({
        ...prev,
        total: result.pagination?.total || 0,
      }));
    } catch (error) {
      console.error('Error fetching change history:', error);
      showToast('Error', 'Failed to load change history. Please try again.');
      // Fallback to mock data on error
      setChangeHistory(mockChangeHistory);
      setChangeHistoryPagination(prev => ({
        ...prev,
        total: mockChangeHistory.length,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [changeHistoryPagination.page, changeHistoryPagination.perPage, filters.search, showToast]);

  // Fetch data when tab changes or filters/pagination change
  useEffect(() => {
    if (activeTab === 'zoning-laws') {
      fetchZoningLaws();
    } else if (activeTab === 'policies') {
      fetchPolicies();
    } else if (activeTab === 'processes') {
      fetchLegislations();
    } else if (activeTab === 'change-history') {
      fetchChangeHistory();
    }
  }, [activeTab, fetchZoningLaws, fetchPolicies, fetchLegislations, fetchChangeHistory]);

  // Zoning Law handlers
  const handleZoningLawClick = useCallback((zoningLaw) => {
    // Open the details panel drawer instead of navigating
    setSelectedZoningLaw(zoningLaw);
    setPanelMode('view');
    setIsDetailsPanelOpen(true);
    // Close policy panel if open
    setIsPolicyPanelOpen(false);
  }, []);

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
    setBasedOnLegislation(null);
    setPanelMode('create');
    setIsDetailsPanelOpen(true);
  }, []);

  const handleCloseDetailsPanel = useCallback(() => {
    setIsDetailsPanelOpen(false);
    setSelectedZoningLaw(null);
    setBasedOnLegislation(null);
    setPanelMode('view');
  }, []);

  const handleZoningLawEdit = useCallback(() => {
    // The panel handles edit mode internally
  }, []);

  const handleZoningLawDelete = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedZoningLaw) {
      try {
        await zoningLawService.delete(selectedZoningLaw.id);
        setIsDeleteModalOpen(false);
        handleCloseDetailsPanel();
        showToast('Zoning Law Deleted', `${selectedZoningLaw.title} has been deleted successfully.`);
        // Refetch the zoning laws to update the list
        fetchZoningLaws();
      } catch (error) {
        console.error('Error deleting zoning law:', error);
        showToast('Error', 'Failed to delete zoning law. Please try again.');
      }
    }
  }, [selectedZoningLaw, handleCloseDetailsPanel, showToast, fetchZoningLaws]);

  const handleCreateBasedOn = useCallback(() => {
    if (selectedZoningLaw) {
      // Open create panel with the current zoning law as base
      setBasedOnLegislation(selectedZoningLaw);
      setPanelMode('createBasedOn');
      // Keep panel open, it will switch to create mode
    }
  }, [selectedZoningLaw]);

  const handleZoningLawSave = useCallback(async (formData) => {
    if (selectedZoningLaw) {
      try {
        await zoningLawService.update(selectedZoningLaw.id, {
          title: formData.name,
          type: formData.type,
          zone_code: formData.zoneCode,
          zone_name: formData.zoneName,
          description: formData.description,
          effective_from: formData.effectiveDate,
        });
        showToast('Zoning Law Updated', `${formData.name} has been updated successfully.`);
        // Refetch the zoning laws to update the list
        fetchZoningLaws();
      } catch (error) {
        console.error('Error updating zoning law:', error);
        showToast('Error', 'Failed to update zoning law. Please try again.');
      }
    }
  }, [selectedZoningLaw, showToast, fetchZoningLaws]);

  const handleCreateZoningLawSave = useCallback(async (formData) => {
    try {
      await zoningLawService.create({
        title: formData.name,
        type: formData.type,
        zone_code: formData.zoneCode,
        zone_name: formData.zoneName,
        description: formData.description,
        effective_from: formData.effectiveDate,
        status: 'draft',
      });
      showToast('Zoning Law Created', `${formData.name} has been created successfully.`);
      // Refetch the zoning laws to update the list
      fetchZoningLaws();
    } catch (error) {
      console.error('Error creating zoning law:', error);
      showToast('Error', 'Failed to create zoning law. Please try again.');
    }
  }, [showToast, fetchZoningLaws]);

  // Duplicate zoning law handler
  const handleDuplicateZoningLaw = useCallback(async (zoningLaw) => {
    try {
      await zoningLawService.duplicate(zoningLaw.id);
      showToast('Zoning Law Duplicated', `${zoningLaw.title} has been duplicated successfully.`);
      // Refetch the zoning laws to update the list
      fetchZoningLaws();
    } catch (error) {
      console.error('Error duplicating zoning law:', error);
      showToast('Error', 'Failed to duplicate zoning law. Please try again.');
    }
  }, [showToast, fetchZoningLaws]);

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
    <div className="flex flex-col h-full ">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-2 ">
        <h1 className="text-3xl font-semibold text-gray-900">Legislation</h1>
        <div className="flex items-center gap-3">
          {/* View Toggle - Only show for zoning-laws tab */}
          {activeTab === 'zoning-laws' && (
            <div className="flex items-center  overflow-hidden bg-gray-100 p-1 w-64">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 p-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'bg-transparent text-gray-500 hover:text-gray-700'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`flex-1 p-2 rounded-md transition-colors ${
                  viewMode === 'card'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'bg-transparent text-gray-500 hover:text-gray-700'
                }`}
                title="Card view"
              >
                <LayoutGrid className="w-4 h-4 mx-auto" />
              </button>
            </div>
          )}
          {activeTab === 'zoning-laws' ? (
            <Button
              onClick={handleCreateZoningLaw}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
               icon={Plus}
              iconPosition='left'
            >
              
              New Zoning Law
            </Button>
          ) : (
            <div data-onboard="create-legislation">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                icon={Plus}
                iconPosition='left'
              >
                New Legislation
              </Button>
            </div>
          )}
        </div>
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Table */}
      <div className="flex-1 px-1 py-2 overflow-hidden">
        {activeTab === 'zoning-laws' ? (
          <div data-onboard="zoning-laws-table">
            {viewMode === 'table' ? (
              <ZoningLawsTable
                data={zoningLaws}
                pagination={zoningPagination}
                onPageChange={(page) => setZoningPagination(prev => ({ ...prev, page }))}
                onPerPageChange={(perPage) => setZoningPagination(prev => ({ ...prev, perPage, page: 1 }))}
                onRowClick={handleZoningLawClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicateZoningLaw}
                isLoading={isLoading}
              />
            ) : (
              <ZoningLawsGrid
                data={zoningLaws}
                pagination={zoningPagination}
                onPageChange={(page) => setZoningPagination(prev => ({ ...prev, page }))}
                onPerPageChange={(perPage) => setZoningPagination(prev => ({ ...prev, perPage, page: 1 }))}
                onRowClick={handleZoningLawClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicateZoningLaw}
                isLoading={isLoading}
              />
            )}
          </div>
        ) : activeTab === 'policies' ? (
          <div data-onboard="policies-table">
            <PoliciesTable
              data={policies}
              pagination={policiesPagination}
              onPageChange={(page) => setPoliciesPagination(prev => ({ ...prev, page }))}
              onPerPageChange={(perPage) => setPoliciesPagination(prev => ({ ...prev, perPage, page: 1 }))}
              onRowClick={handlePolicyClick}
            />
          </div>
        ) : activeTab === 'change-history' ? (
          <ChangeHistoryTable
            data={changeHistory}
            pagination={changeHistoryPagination}
            onPageChange={(page) => setChangeHistoryPagination(prev => ({ ...prev, page }))}
            onPerPageChange={(perPage) => setChangeHistoryPagination(prev => ({ ...prev, perPage, page: 1 }))}
            onEntityClick={(entity) => {
              if (entity.url) {
                navigate(entity.url);
              }
            }}
            isLoading={isLoading}
          />
        ) : (
          <div data-onboard="legislation-table">
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
          </div>
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
      <div data-onboard="zoning-law-details-panel">
        <ZoningLawDetailsPanel
          isOpen={isDetailsPanelOpen}
          onClose={handleCloseDetailsPanel}
          legislation={selectedZoningLaw}
          mode={panelMode}
          basedOnLegislation={basedOnLegislation}
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
      </div>

      {/* Policy Details Panel */}
      {isPolicyPanelOpen && (
        <div className="fixed top-0 right-0 h-full z-40" data-onboard="policy-details-panel">
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