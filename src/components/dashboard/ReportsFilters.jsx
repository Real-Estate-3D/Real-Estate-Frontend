import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const ReportsFilters = () => {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-600 shadow-sm">
      <span className="font-semibold text-slate-700">Date From</span>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
        <Calendar className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-700">January 2025</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </div>
      <span className="font-semibold text-slate-700">Date To</span>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
        <Calendar className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-700">December 2025</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </div>
    </div>
  );
};

export default ReportsFilters;
