// File: src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MappingZoning from './pages/MappingZoning.jsx';
import InviteUser from './pages/InviteUser.jsx';
import Legislation from './pages/Legislation/index.jsx';

// Placeholder pages
const Projects = () => <div className="p-6 bg-gray-50 h-full"><h1 className="text-3xl font-bold text-gray-900">Projects</h1></div>;
const Approvals = () => <div className="p-6 bg-gray-50 h-full"><h1 className="text-3xl font-bold text-gray-900">Approvals</h1></div>;
const Workflows = () => <div className="p-6 bg-gray-50 h-full"><h1 className="text-3xl font-bold text-gray-900">Workflows</h1></div>;
const MunicipalHub = () => <div className="p-6 bg-gray-50 h-full"><h1 className="text-3xl font-bold text-gray-900">Municipal Hub</h1></div>;
const Accounting = () => <div className="p-6 bg-gray-50 h-full"><h1 className="text-3xl font-bold text-gray-900">Accounting</h1></div>;
const Settings = () => <div className="p-6 bg-gray-50 h-full"><h1 className="text-3xl font-bold text-gray-900">Settings</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="mapping" element={<MappingZoning />} />
          <Route path="municipal" element={<MunicipalHub />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="legislation" element={<Legislation />} />
          <Route path="settings" element={<Settings />} />
          <Route path="invite" element={<InviteUser />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;