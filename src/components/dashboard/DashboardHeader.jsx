import React from 'react';
import { ChevronDown, Download } from 'lucide-react';

const DashboardHeader = ({ title, subtitle }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DashboardHeader;
