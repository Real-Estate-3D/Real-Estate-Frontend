// File: src/components/legislation/LegislationFilters.jsx

import React from 'react';
import { Search, SlidersHorizontal, ChevronDown, List, LayoutGrid } from 'lucide-react';

const divisionOptions = [
  { value: 'all', label: 'All Divisions' },
  { value: 'north', label: 'North Division' },
  { value: 'south', label: 'South Division' },
  { value: 'east', label: 'East Division' },
  { value: 'west', label: 'West Division' },
];

const statusOptions = [
  { value: 'current', label: 'Current (35)' },
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Awaiting Approval' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const LegislationFilters = ({ filters, onFilterChange, viewMode = 'table', onViewModeChange }) => {
  return (
    <div className="flex items-center gap-3 px-1 py-2  border-b border-gray-200">
      {/* Search Input */}
      <div className="relative w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      {/* Filters Button */}
      <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Divisions Dropdown */}
      <div className="relative">
        <select
          value={filters.division || 'all'}
          onChange={(e) => onFilterChange('division', e.target.value)}
          className="appearance-none px-4 py-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
        >
          {divisionOptions.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-900">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Status/Current Dropdown */}
      <div className="relative">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="appearance-none px-4 py-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-900">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* View Mode Toggle Buttons */}
      {onViewModeChange && (
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-2 transition-colors ${
              viewMode === 'table'
                ? 'bg-gray-100 text-gray-900'
                : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('card')}
            className={`p-2 transition-colors ${
              viewMode === 'card'
                ? 'bg-gray-100 text-gray-900'
                : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LegislationFilters;