import React from 'react';

const PanelCard = ({ title, subtitle, icon: Icon, children, action }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
};

export default PanelCard;
