import React from 'react';
import PanelCard from './PanelCard';

const PermitDistributionCard = ({ data }) => {
  let cumulative = 0;
  const gradient = data
    .map((item) => {
      const start = cumulative;
      cumulative += item.value;
      return `${item.color} ${start}% ${cumulative}%`;
    })
    .join(', ');

  return (
    <PanelCard
      title="Permit Distribution"
      subtitle="Breakdown by permit type."
      action={(
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
        >
          Customize
        </button>
      )}
    >
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative h-32 w-32">
          <div
            className="h-full w-full rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
          />
          <div className="absolute inset-4 rounded-full bg-slate-900 text-center text-white">
            <div className="flex h-full flex-col items-center justify-center">
              <span className="text-[10px] uppercase text-slate-300">Total</span>
              <span className="text-lg font-semibold">237</span>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-xs text-slate-600">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <span className="font-semibold text-slate-800">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </PanelCard>
  );
};

export default PermitDistributionCard;
