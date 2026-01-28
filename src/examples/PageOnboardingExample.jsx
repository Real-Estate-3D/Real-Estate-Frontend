// Example: How to add page-level onboarding to any page
// Copy this pattern to your actual page components

import React from 'react';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';

function ExamplePage() {
  // This automatically triggers onboarding on first visit
  // The flow is defined in src/config/onboardingFlows.js under pages.mapping
  const { isCompleted } = useOnboardingFlow('pages', 'mapping');

  return (
    <div className="page-container">
      <h1>Example Page with Onboarding</h1>

      {/* Add data-onboard attributes to elements you want to highlight */}

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search..."
        data-onboard="global-search"
        className="search-input"
      />

      {/* Map toolbar */}
      <div data-onboard="map-tools" className="toolbar">
        <button data-tool="zoom-in">Zoom In</button>
        <button data-tool="zoom-out">Zoom Out</button>
        <button data-tool="rotate">Rotate</button>
      </div>

      {/* Layers panel */}
      <div data-onboard="layers-panel" className="layers">
        <h3>Map Layers</h3>
        <div data-onboard="layers-list">
          {/* Layer list items */}
        </div>
      </div>

      {/* Map canvas */}
      <div data-onboard="map-canvas" className="map">
        {/* 3D map content */}
      </div>

      {/* Optional: Show if onboarding is completed */}
      {isCompleted && (
        <div className="tooltip">
          You've completed the tutorial! 🎉
        </div>
      )}
    </div>
  );
}

export default ExamplePage;
