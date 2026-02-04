import React from 'react';
import { ArrowUpRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import PanelCard from './PanelCard';

const ComplianceAlertsPanel = ({ items }) => {
  return (
    <PanelCard
      title="Legislative Compliance Alerts"
      subtitle="Projects flagged for legal or environmental issues."
      icon={ShieldAlert}
    >
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-slate-700"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-400">{item.subtitle}</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </div>
        ))}
      </div>
    </PanelCard>
  );
};

export default ComplianceAlertsPanel;
