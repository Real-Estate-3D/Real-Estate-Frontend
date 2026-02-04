// Example: How to add feature-level onboarding to buttons/panels
// Copy this pattern to your actual feature components

import React, { useState } from 'react';
import { useFeatureOnboardingFlow } from '../hooks/useOnboardingFlow';

// Example 1: Measurement Button
function MeasurementButtonExample() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { trigger, isCompleted } = useFeatureOnboardingFlow('measurement');

  const handleClick = () => {
    // Trigger onboarding on first use
    trigger();

    // Your actual feature logic
    setIsPanelOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        data-tool="measurement"
        className="toolbar-button"
      >
        📏 Measure
      </button>

      {isPanelOpen && (
        <div data-onboard="measurement-panel" className="panel">
          <h3>Measurements</h3>
          <div data-onboard="measurement-type-selector">
            <button>Distance</button>
            <button>Area</button>
          </div>
        </div>
      )}
    </>
  );
}

// Example 2: Layers Panel Button
function LayersButtonExample() {
  const [isOpen, setIsOpen] = useState(false);
  const { trigger } = useFeatureOnboardingFlow('layers');

  const handleToggle = () => {
    // Trigger onboarding on first open
    if (!isOpen) {
      trigger();
    }
    setIsPanelOpen(!isOpen);
  };

  return (
    <>
      <button onClick={handleToggle} data-tool="layers">
        🗺️ Layers
      </button>

      {isOpen && (
        <div data-onboard="layers-panel" className="panel">
          <h3>Map Layers</h3>
          <div data-onboard="layers-list">
            {/* Layer items */}
          </div>
        </div>
      )}
    </>
  );
}

// Example 3: Search Bar with Auto-trigger
function SearchBarExample() {
  const { trigger } = useFeatureOnboardingFlow('search');

  const handleFocus = () => {
    // Trigger onboarding on first focus
    trigger();
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        onFocus={handleFocus}
        data-onboard="global-search"
        className="search-input"
      />

      <div data-onboard="search-results" className="results">
        {/* Search results */}
      </div>
    </div>
  );
}

// Example 4: 3D Navigation Toolbar
function Navigation3DExample() {
  const { trigger } = useFeatureOnboardingFlow('toolbar-3d');

  const handleFirstInteraction = () => {
    trigger();
  };

  return (
    <div className="toolbar" data-onboard="map-tools">
      <button
        data-tool="zoom-in"
        onClick={handleFirstInteraction}
      >
        🔍+ Zoom In
      </button>
      <button
        data-tool="zoom-out"
        onClick={handleFirstInteraction}
      >
        🔍- Zoom Out
      </button>
      <button
        data-tool="rotate"
        onClick={handleFirstInteraction}
      >
        🔄 Rotate
      </button>
      <button
        data-tool="reset-view"
        onClick={handleFirstInteraction}
      >
        🏠 Reset
      </button>
    </div>
  );
}

export {
  MeasurementButtonExample,
  LayersButtonExample,
  SearchBarExample,
  Navigation3DExample,
};
