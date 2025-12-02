import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-50 h-full overflow-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome to BluePrint GIS Dashboard</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Projects</h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approvals</h3>
          <p className="text-3xl font-bold text-orange-600">8</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Workflows</h3>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;