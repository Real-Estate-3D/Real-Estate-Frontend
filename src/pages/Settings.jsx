// File: src/pages/Settings.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleResetOnboarding = () => {
    setShowConfirm(true);
  };

  const handleConfirmReset = () => {
    try {
      localStorage.removeItem('onboarding_completed');
      setShowConfirm(false);
      // Redirect to home with reset parameter
      navigate('/?resetOnboarding=true');
      // Reload to trigger onboarding
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Onboarding Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Onboarding</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your onboarding experience
            </p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  Reset Onboarding Tour
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Restart the interactive onboarding tour to learn about the platform features again
                </p>
              </div>
              <button
                onClick={handleResetOnboarding}
                className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Reset Tour
              </button>
            </div>
          </div>
        </div>

        {/* Placeholder for other settings sections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Account</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your account settings
            </p>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500 italic">Account settings coming soon...</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
            <p className="text-sm text-gray-600 mt-1">
              Customize your experience
            </p>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500 italic">Preferences coming soon...</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center" style={{ zIndex: 50000 }}>
          <div
            className="bg-white rounded-lg p-6 w-96 shadow-lg"
            style={{
              boxShadow: '0px 12px 12px -6px rgba(0, 0, 0, 0.16), 0px 0px 1px rgba(0, 0, 0, 0.4)',
            }}
          >
            <h3 className="font-bold text-lg text-black mb-2">Reset Onboarding Tour?</h3>
            <p className="text-sm text-gray-700 mb-6">
              This will restart the onboarding tour from the beginning. You'll be redirected to the dashboard.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                style={{
                  background: 'radial-gradient(70.45% 70.45% at 58.33% 7.95%, rgba(0, 115, 252, 0) 0%, #0073FC 100%), radial-gradient(50% 50% at 43.75% 0%, rgba(0, 115, 252, 0.61) 0%, rgba(0, 115, 252, 0) 100%)',
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Reset Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
