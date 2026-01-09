// File: src/components/legislation/LegislationTabs.jsx

import React from 'react';

const LegislationTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-1 px-6 py-2 bg-white border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default LegislationTabs;
