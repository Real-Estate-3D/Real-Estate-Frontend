import React from 'react';

const DashboardTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-200/80 p-1 shadow-inner">
      <div className="grid grid-cols-3 gap-1 text-sm font-medium text-slate-600">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`rounded-xl px-4 py-2 text-center transition ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'hover:bg-white/70'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardTabs;
