import React from 'react';
import { ArrowUpRight, Bell } from 'lucide-react';
import PanelCard from './PanelCard';

const toneStyles = {
  amber: 'bg-amber-100 text-amber-700',
  orange: 'bg-orange-100 text-orange-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  slate: 'bg-slate-100 text-slate-700',
};

const NotificationsPanel = ({ items }) => {
  return (
    <PanelCard
      title="Notifications"
      subtitle="Key updates on meetings, submissions, and policy changes."
      icon={Bell}
    >
      <div className="space-y-2">
        {items.map((item, index) => {
          const toneClass = toneStyles[item.tone] || toneStyles.slate;
          return (
            <div
              key={`${item.title}-${index}`}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-slate-700"
            >
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${toneClass}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
};

export default NotificationsPanel;
