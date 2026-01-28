// File: src/pages/Dashboard.jsx

import React from 'react';
import { FolderKanban, Clock, Workflow, TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-white',
      border: 'border-blue-100',
      icon: 'bg-blue-100 text-blue-600',
      value: 'text-blue-600',
      trend: trend === 'up' ? 'text-emerald-500' : 'text-red-500'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-white',
      border: 'border-orange-100',
      icon: 'bg-orange-100 text-orange-600',
      value: 'text-orange-600',
      trend: trend === 'up' ? 'text-red-500' : 'text-emerald-500'
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-50 to-white',
      border: 'border-emerald-100',
      icon: 'bg-emerald-100 text-emerald-600',
      value: 'text-emerald-600',
      trend: trend === 'up' ? 'text-emerald-500' : 'text-red-500'
    }
  };

  const styles = colorClasses[color];

  return (
    <div className={`${styles.bg} p-6 rounded-xl shadow-sm border ${styles.border} hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <p className={`text-3xl font-bold ${styles.value} transition-transform duration-300 group-hover:scale-105`}>{value}</p>
          {trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${styles.trend}`}>
              {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trendValue} from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${styles.icon} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-50 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500">Welcome to BluePrint GIS Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Projects"
          value="24"
          icon={FolderKanban}
          color="blue"
          trend="up"
          trendValue="+12%"
        />

        <StatCard
          title="Pending Approvals"
          value="8"
          icon={Clock}
          color="orange"
          trend="down"
          trendValue="-3"
        />

        <StatCard
          title="Active Workflows"
          value="12"
          icon={Workflow}
          color="green"
          trend="up"
          trendValue="+5"
        />
      </div>
    </div>
  );
};

export default Dashboard;