// File: src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MappingZoning from './pages/MappingZoning.jsx';
import InviteUser from './pages/InviteUser.jsx';
import Legislation from './pages/Legislation/index.jsx';
import ZoningLawDetails from './pages/Legislation/ZoningLawDetails.jsx';
import PolicyDetails from './pages/Legislation/PolicyDetails.jsx';
import Settings from './pages/Settings.jsx';

// Onboarding System
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext.jsx';
import OnboardingRenderer from './components/common/OnboardingRenderer.jsx';

// Placeholder pages
const Projects = () => <div className="p-6 bg-gray-50 h-full"><h1 className="text-3xl font-bold text-gray-900">Projects</h1></div>;
const Approvals = () => <div className="p-6 bg-gray-50 h-full"><h1 className="text-3xl font-bold text-gray-900">Approvals</h1></div>;
const Workflows = () => <div className="p-6 bg-gray-50 h-full"><h1 className="text-3xl font-bold text-gray-900">Workflows</h1></div>;
const MunicipalHub = () => <div className="p-6 bg-gray-50 h-full"><h1 className="text-3xl font-bold text-gray-900">Municipal Hub</h1></div>;
const Accounting = () => <div className="p-6 bg-gray-50 h-full"><h1 className="text-3xl font-bold text-gray-900">Accounting</h1></div>;

// Component to handle ?resetOnboarding=true URL parameter
function OnboardingResetHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetOnboarding } = useOnboarding();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get('resetOnboarding') === 'true') {
      console.log('Resetting onboarding from URL parameter');

      // Reset all onboarding
      resetOnboarding('all');

      // Remove the parameter from URL
      params.delete('resetOnboarding');
      const newSearch = params.toString();
      const newUrl = location.pathname + (newSearch ? `?${newSearch}` : '');

      // Replace URL without the parameter (without page reload)
      navigate(newUrl, { replace: true });

      // Show a brief confirmation in console
      console.log('Onboarding reset complete. Refresh the page to see onboarding again.');
    }
  }, [location, navigate, resetOnboarding]);

  return null;
}

function App() {
  return (
    <OnboardingProvider>
      <BrowserRouter>
        {/* Handle ?resetOnboarding=true URL parameter */}
        <OnboardingResetHandler />

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
            <Route path="legislation/:id" element={<ZoningLawDetails />} />
            <Route path="legislation/policy/:id" element={<PolicyDetails />} />
            <Route path="settings" element={<Settings />} />
            <Route path="invite" element={<InviteUser />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>

      {/* Onboarding Renderer - Shows active onboarding flows */}
      <OnboardingRenderer />
    </OnboardingProvider>
  );
}

export default App;