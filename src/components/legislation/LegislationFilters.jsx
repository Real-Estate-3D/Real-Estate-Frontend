// File: src/components/legislation/LegislationFilters.jsx

import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'Zoning By-law', label: 'Zoning By-law' },
  { value: 'Official Plan', label: 'Official Plan' },
  { value: 'Site-Specific Zoning', label: 'Site-Specific Zoning' },
  { value: 'Subdivision Control', label: 'Subdivision Control' },
];

const LegislationFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters Button */}
      <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        <Filter className="w-4 h-4" />
        Filters
      </button>

      {/* Status Dropdown */}
      <div className="relative">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="appearance-none px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Type Dropdown */}
      <div className="relative">
        <select
          value={filters.type}
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="appearance-none px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default LegislationFilters;
