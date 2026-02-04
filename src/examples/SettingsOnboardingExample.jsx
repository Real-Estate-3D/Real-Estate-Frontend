// Example: Settings page with onboarding management
// Shows how to restart/reset onboarding flows

import React from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { getOnboardingFlow, getAllPageFlows, getAllFeatureFlows } from '../config/onboardingFlows';

function SettingsOnboardingExample() {
  const { startOnboarding, resetOnboarding, isFlowCompleted } = useOnboarding();

  // Get all available flows
  const pageFlows = getAllPageFlows();
  const featureFlows = getAllFeatureFlows();

  const handleRestartFlow = (flow) => {
    // Force start even if completed
    startOnboarding(flow, true);
  };

  const handleResetFlow = (storageKey) => {
    resetOnboarding(storageKey);
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all tutorials? They will show again on your next visit.')) {
      resetOnboarding('all');
    }
  };

  return (
    <div className="settings-page">
      <h1>Tutorial Settings</h1>

      {/* Page Tutorials Section */}
      <section className="settings-section">
        <h2>Page Tutorials</h2>
        <p className="text-sm text-gray-600 mb-4">
          These tutorials show when you visit a page for the first time.
        </p>

        <div className="tutorial-list">
          {Object.values(pageFlows).map((flow) => {
            const completed = isFlowCompleted(flow.storageKey);

            return (
              <div key={flow.id} className="tutorial-item">
                <div>
                  <h3 className="font-semibold">{flow.title}</h3>
                  <p className="text-sm text-gray-600">{flow.description}</p>
                  <span className={`status ${completed ? 'completed' : 'pending'}`}>
                    {completed ? '✓ Completed' : '○ Not completed'}
                  </span>
                </div>

                <div className="actions">
                  <button
                    onClick={() => handleRestartFlow(flow)}
                    className="btn-primary"
                  >
                    {completed ? 'Restart' : 'Start'} Tutorial
                  </button>
                  {completed && (
                    <button
                      onClick={() => handleResetFlow(flow.storageKey)}
                      className="btn-secondary"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Tutorials Section */}
      <section className="settings-section">
        <h2>Feature Tutorials</h2>
        <p className="text-sm text-gray-600 mb-4">
          These tutorials show when you use a feature for the first time.
        </p>

        <div className="tutorial-list">
          {Object.values(featureFlows).map((flow) => {
            const completed = isFlowCompleted(flow.storageKey);

            return (
              <div key={flow.id} className="tutorial-item">
                <div>
                  <h3 className="font-semibold">{flow.title}</h3>
                  <p className="text-sm text-gray-600">{flow.description}</p>
                  <span className={`status ${completed ? 'completed' : 'pending'}`}>
                    {completed ? '✓ Completed' : '○ Not completed'}
                  </span>
                </div>

                <div className="actions">
                  <button
                    onClick={() => handleRestartFlow(flow)}
                    className="btn-primary"
                  >
                    {completed ? 'Restart' : 'Start'} Tutorial
                  </button>
                  {completed && (
                    <button
                      onClick={() => handleResetFlow(flow.storageKey)}
                      className="btn-secondary"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reset All Section */}
      <section className="settings-section">
        <h2>Reset All Tutorials</h2>
        <p className="text-sm text-gray-600 mb-4">
          Reset all tutorials to their initial state. They will show again on your next visit.
        </p>
        <button onClick={handleResetAll} className="btn-danger">
          Reset All Tutorials
        </button>
      </section>
    </div>
  );
}

export default SettingsOnboardingExample;

// CSS for this example (add to your stylesheet)
const styles = `
.settings-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.settings-section {
  margin-bottom: 3rem;
}

.settings-section h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.tutorial-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tutorial-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.tutorial-item .status {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tutorial-item .status.completed {
  background: #d1fae5;
  color: #065f46;
}

.tutorial-item .status.pending {
  background: #fef3c7;
  color: #92400e;
}

.tutorial-item .actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #0073FC;
  color: white;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-danger:hover {
  background: #dc2626;
}
`;
