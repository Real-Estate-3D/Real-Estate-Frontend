// File: src/components/legislation/OnboardingHelper.jsx

import React, { useState } from 'react';
import { X } from 'lucide-react';

const OnboardingHelper = ({ currentStep, totalSteps = 23, onSkip, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleSkip = () => {
    setIsVisible(false);
    if (onSkip) onSkip();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  const getStepMessage = (step) => {
    switch (step) {
      case 1:
        return "To create a new Legislation, start by filling out the basic information.";
      case 2:
        return "Add GIS schedules to define geographical zones for your legislation.";
      case 3:
        return "Configure subdivision rules and parameters.";
      case 4:
        return "Set up detailed parameters for your legislation.";
      case 5:
        return "Define required workflows for this legislation.";
      case 6:
        return "Configure massing simulation settings.";
      case 7:
        return "Review all details and publish your legislation.";
      default:
        return "Follow the steps to create your legislation.";
    }
  };

  return (
    <div className="absolute top-4 left-4 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Legislation</h3>
        <button
          onClick={handleDismiss}
          className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        {getStepMessage(currentStep)}
      </p>
      
      <p className="text-sm text-gray-600 mb-4">
        Fill the form, then press <span className="font-medium text-gray-900">Next</span> to continue.
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          {currentStep} of {totalSteps}
        </span>
        <button
          onClick={handleSkip}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default OnboardingHelper;