// OnboardingRenderer Component
// Connects OnboardingGuide with OnboardingContext
// Automatically renders the active onboarding flow

import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import OnboardingGuide from './OnboardingGuide';

const OnboardingRenderer = () => {
  const { activeFlow, isActive, completeOnboarding, cancelOnboarding } = useOnboarding();

  // Don't render if no active flow
  if (!isActive || !activeFlow) {
    return null;
  }

  return (
    <OnboardingGuide
      flow={activeFlow}
      onComplete={completeOnboarding}
      onCancel={cancelOnboarding}
    />
  );
};

export default OnboardingRenderer;
