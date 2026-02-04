// File: src/pages/Dashboard.jsx

import React, { useState } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardTabs from '../components/dashboard/DashboardTabs';
import KpiGrid from '../components/dashboard/KpiGrid';
import NotificationsPanel from '../components/dashboard/NotificationsPanel';
import ComplianceAlertsPanel from '../components/dashboard/ComplianceAlertsPanel';
import ReportsFilters from '../components/dashboard/ReportsFilters';
import AnalyticsPanel from '../components/dashboard/AnalyticsPanel';
import BudgetAllocationCard from '../components/dashboard/BudgetAllocationCard';
import PermitDistributionCard from '../components/dashboard/PermitDistributionCard';
import {
  budgetBars,
  complianceAlerts,
  dashboardTabs,
  kpiCards,
  notifications,
  permitBreakdown,
} from '../components/dashboard/dashboardData';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="h-full overflow-auto rounded-xl bg-[#e7e9ee] px-6 pb-8 pt-5">
      <DashboardHeader
        title="Dashboard"
        subtitle="Welcome to Blueprint GIS Dashboard"
      />

      <DashboardTabs
        tabs={dashboardTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'Overview' && (
        <>
          <KpiGrid cards={kpiCards} />
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr]">
            <NotificationsPanel items={notifications} />
            <ComplianceAlertsPanel items={complianceAlerts} />
          </div>
        </>
      )}

      {activeTab === 'Reports' && (
        <>
          <ReportsFilters />
          <div className="mt-4">
            <AnalyticsPanel />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
            <BudgetAllocationCard bars={budgetBars} />
            <PermitDistributionCard data={permitBreakdown} />
          </div>
        </>
      )}

      {activeTab === 'Map Insights' && (
        <>
          <ReportsFilters />
          <div className="mt-4">
            <AnalyticsPanel />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
