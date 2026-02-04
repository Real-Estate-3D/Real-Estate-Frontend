import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const toneStyles = {
  amber: 'bg-amber-100 text-amber-700',
  orange: 'bg-orange-100 text-orange-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  slate: 'bg-slate-100 text-slate-700',
};

const KpiCard = ({ title, value, icon: Icon, tone }) => {
  const toneClass = toneStyles[tone] || toneStyles.slate;
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:text-slate-700" />
      </div>
      <div className="mt-5 text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
};

export default KpiCard;
