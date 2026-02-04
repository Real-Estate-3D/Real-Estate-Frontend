import React from 'react';
import { ChevronDown } from 'lucide-react';
import PanelCard from './PanelCard';

const AnalyticsPanel = () => {
  return (
    <PanelCard
      title="Analytics"
      subtitle="Housing supply trends for the current cycle."
      action={(
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
          >
            Housing Supply Trends
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
          >
            Customize
          </button>
        </div>
      )}
    >
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          New Housing Units Added
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Projected Supply
        </span>
      </div>
      <div className="mt-3 h-48 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <svg viewBox="0 0 620 200" className="h-full w-full">
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            points="10,140 80,120 150,125 220,110 290,100 360,110 430,105 500,115 590,85"
          />
          <polyline
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            points="10,150 80,155 150,145 220,150 290,130 360,135 430,120 500,110 590,95"
          />
        </svg>
      </div>
    </PanelCard>
  );
};

export default AnalyticsPanel;
