import React from 'react';
import PanelCard from './PanelCard';

const BudgetAllocationCard = ({ bars }) => {
  const maxValue = Math.max(...bars.map((item) => item.value));

  return (
    <PanelCard
      title="Budget Allocation By Sector"
      subtitle="Allocated budget across current sectors."
      action={(
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
        >
          Customize
        </button>
      )}
    >
      <div className="h-44 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex h-full items-end justify-between gap-3">
          {bars.map((item) => {
            const height = `${(item.value / maxValue) * 100}%`;
            return (
              <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="relative flex w-full items-end justify-center">
                  <span className="absolute -top-6 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-blue-700 shadow-sm">
                    {item.value.toFixed(1)}M
                  </span>
                  <div
                    className={`w-12 rounded-2xl bg-gradient-to-b ${item.color} shadow-inner`}
                    style={{ height }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </PanelCard>
  );
};

export default BudgetAllocationCard;
