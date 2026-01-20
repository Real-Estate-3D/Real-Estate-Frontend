// File: src/pages/Legislation/index.jsx

import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import LegislationTable from '../../components/legislation/LegislationTable';
import LegislationFilters from '../../components/legislation/LegislationFilters';
import LegislationTabs from '../../components/legislation/LegislationTabs';
import CreateLegislationModal from '../../components/legislation/CreateLegislationModal';

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
  { id: 'history', label: 'History' },
  { id: 'change-history', label: 'Change History' },
];

const Legislation = () => {
  const [activeTab, setActiveTab] = useState('processes');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [legislations, setLegislations] = useState(mockLegislations);
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
  }, []);

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
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Legislation
        </button>
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

      {/* Create Modal */}
      <CreateLegislationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default Legislation;
