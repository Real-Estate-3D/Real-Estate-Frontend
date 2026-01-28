// Example: How to integrate the onboarding system into your App.jsx
// This is the main integration point - wrap your app and add the renderer

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import the onboarding provider and renderer
import { OnboardingProvider } from './contexts/OnboardingContext';
import OnboardingRenderer from './components/common/OnboardingRenderer';

// Your existing components
import Dashboard from './pages/Dashboard';
import MappingZoning from './pages/MappingZoning';
import Settings from './pages/Settings';
import Sidebar from './components/layout/Sidebar';

function App() {
  return (
    <Router>
      {/* STEP 1: Wrap your entire app with OnboardingProvider */}
      <OnboardingProvider>
        <div className="app">
          {/* Your existing layout */}
          <Sidebar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/mapping" element={<MappingZoning />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>

          {/* STEP 2: Add OnboardingRenderer at the root level */}
          {/* This component renders the active onboarding flow */}
          <OnboardingRenderer />
        </div>
      </OnboardingProvider>
    </Router>
  );
}

export default App;

/*
THAT'S IT! The setup is complete.

Now you can:
1. Add page onboarding to any page component
2. Add feature onboarding to any button/panel
3. Manage all flows from the centralized config file

See ONBOARDING_USAGE.md for detailed usage instructions.
*/
