// Example: How to integrate onboarding into the MappingZoning page
// This shows the complete integration with both page and feature onboarding

import React, { useState } from 'react';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { useFeatureOnboardingFlow } from '../hooks/useOnboardingFlow';

function MappingZoning() {
  // ====================
  // PAGE ONBOARDING
  // ====================
  // This automatically shows the 3-step onboarding on first visit:
  // 1. "Mapping & Zoning" intro (center)
  // 2. Search bar (requires input focus)
  // 3. Legend (highlight)
  useOnboardingFlow('pages', 'mapping');

  // ====================
  // FEATURE ONBOARDING
  // ====================
  // This triggers when a parcel is clicked for the first time
  const { trigger: triggerParcelInfo } = useFeatureOnboardingFlow('parcel-info');

  const [selectedParcel, setSelectedParcel] = useState(null);

  // Handler for when a parcel is clicked on the map
  const handleParcelClick = (parcelData) => {
    // Trigger onboarding on first parcel click
    triggerParcelInfo();

    // Your existing logic
    setSelectedParcel(parcelData);
  };

  return (
    <div className="mapping-zoning-page">
      {/* Search Bar - Add data-onboard attribute */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a city, region, or address..."
          data-onboard="global-search"
          className="search-input"
        />
      </div>

      <div className="map-container">
        {/* Map Legend - Add data-onboard attribute */}
        <div className="map-legend" data-onboard="map-legend">
          <h3>Map Layers</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#FF6B6B' }}></span>
              <span>Residential</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#4ECDC4' }}></span>
              <span>Commercial</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#95E1D3' }}></span>
              <span>Industrial</span>
            </div>
          </div>
        </div>

        {/* Cesium Map */}
        <div className="cesium-map">
          {/* Your CesiumMap component */}
          {/* Make sure to pass handleParcelClick to your map */}
        </div>

        {/* Parcel Info Box - Add data-onboard attribute */}
        {selectedParcel && (
          <div
            className="parcel-info-box"
            data-onboard="parcel-info-box"
          >
            <h3>Parcel Details</h3>
            <div className="parcel-details">
              <div className="detail-row">
                <span className="label">Parcel ID:</span>
                <span className="value">{selectedParcel.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Zoning:</span>
                <span className="value">{selectedParcel.zoning}</span>
              </div>
              <div className="detail-row">
                <span className="label">Area:</span>
                <span className="value">{selectedParcel.area} sq ft</span>
              </div>
              <div className="detail-row">
                <span className="label">Ownership:</span>
                <span className="value">{selectedParcel.owner}</span>
              </div>
            </div>

            {/* Color and opacity controls */}
            <div className="layer-controls">
              <div className="control-group">
                <label>Layer Color:</label>
                <input type="color" defaultValue="#4ECDC4" />
              </div>
              <div className="control-group">
                <label>Opacity:</label>
                <input type="range" min="0" max="100" defaultValue="80" />
              </div>
            </div>

            <button
              onClick={() => setSelectedParcel(null)}
              className="close-button"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MappingZoning;

/*
INTEGRATION CHECKLIST:

✅ Step 1: Import the hooks
   import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
   import { useFeatureOnboardingFlow } from '../hooks/useOnboardingFlow';

✅ Step 2: Add page onboarding hook
   useOnboardingFlow('pages', 'mapping');

✅ Step 3: Add feature onboarding hook
   const { trigger: triggerParcelInfo } = useFeatureOnboardingFlow('parcel-info');

✅ Step 4: Trigger feature onboarding when parcel is clicked
   triggerParcelInfo(); // Call this in your parcel click handler

✅ Step 5: Add data-onboard attributes to elements:
   - [data-onboard="global-search"] on search input
   - [data-onboard="map-legend"] on legend container
   - [data-onboard="parcel-info-box"] on parcel info panel

ONBOARDING FLOW:

First Visit to Page:
1. Center modal: "Mapping & Zoning - This module helps you manage..."
2. Highlights search bar: "Type the name of a city... Enter name to continue"
   (Waits for user to focus the input)
3. Highlights legend: "The legend shows all turned on map layers..."

First Parcel Click:
- Shows tooltip on parcel info box: "View parcel details like zoning, area..."

TESTING:

1. Clear localStorage: localStorage.clear()
2. Refresh page - you'll see the 3-step page onboarding
3. Click search input to advance to step 3
4. Complete onboarding
5. Click a parcel - you'll see the parcel info onboarding (only once)
6. Refresh - no onboarding will show (already completed)
*/
