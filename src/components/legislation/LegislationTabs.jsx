// File: src/components/legislation/LegislationTabs.jsx

import React from 'react';

const LegislationTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="p-1 mt-2 bg-gray-50 rounded-md">
      <div className="flex items-center w-full bg-gray-100 border border-gray-200 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-6 py-2 text-sm font-medium transition-all rounded-md ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LegislationTabs;