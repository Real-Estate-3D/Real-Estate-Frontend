// Onboarding Context
// Manages onboarding state and provides methods to trigger onboarding flows

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  isOnboardingCompleted,
  markOnboardingCompleted,
  resetOnboarding as resetOnboardingStorage,
  shouldAutoStart,
} from '../config/onboardingFlows';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [activeFlow, setActiveFlow] = useState(null);
  const [isActive, setIsActive] = useState(false);

  /**
   * Start an onboarding flow
   * @param {Object} flow - The flow configuration from onboardingFlows.js
   * @param {boolean} force - Force start even if already completed
   */
  const startOnboarding = useCallback((flow, force = false) => {
    if (!flow) {
      console.warn('No flow provided to startOnboarding');
      return;
    }

    // Check if already completed (unless forced)
    if (!force && isOnboardingCompleted(flow.storageKey)) {
      console.log(`Onboarding "${flow.id}" already completed`);
      return;
    }

    console.log(`Starting onboarding: ${flow.id}`);
    setActiveFlow(flow);
    setIsActive(true);
  }, []);

  /**
   * Complete the current onboarding flow
   */
  const completeOnboarding = useCallback(() => {
    if (activeFlow) {
      console.log(`Completing onboarding: ${activeFlow.id}`);
      markOnboardingCompleted(activeFlow.storageKey);
    }
    setActiveFlow(null);
    setIsActive(false);
  }, [activeFlow]);

  /**
   * Cancel the current onboarding flow
   */
  const cancelOnboarding = useCallback(() => {
    console.log('Cancelling onboarding');
    setActiveFlow(null);
    setIsActive(false);
  }, []);

  /**
   * Reset onboarding state
   * @param {string} storageKey - The flow to reset, or 'all' for everything
   */
  const resetOnboarding = useCallback((storageKey = 'all') => {
    resetOnboardingStorage(storageKey);
    if (storageKey === 'all' || storageKey === activeFlow?.storageKey) {
      setActiveFlow(null);
      setIsActive(false);
    }
  }, [activeFlow]);

  /**
   * Check if a specific flow is completed
   * @param {string} storageKey - The flow's storage key
   * @returns {boolean}
   */
  const isFlowCompleted = useCallback((storageKey) => {
    return isOnboardingCompleted(storageKey);
  }, []);

  /**
   * Trigger a feature onboarding on first use
   * @param {Object} flow - The feature flow configuration
   */
  const triggerFeatureOnboarding = useCallback((flow) => {
    if (!flow) return;

    // Only trigger if not completed and triggerOn is 'first-use'
    if (flow.triggerOn === 'first-use' && !isOnboardingCompleted(flow.storageKey)) {
      startOnboarding(flow);
    }
  }, [startOnboarding]);

  const value = {
    // State
    activeFlow,
    isActive,

    // Methods
    startOnboarding,
    completeOnboarding,
    cancelOnboarding,
    resetOnboarding,
    isFlowCompleted,
    triggerFeatureOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

/**
 * Hook to use onboarding context
 */
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

/**
 * Hook to auto-start page onboarding
 * Use this in page components to automatically start onboarding on first visit
 * @param {Object} flow - The page flow configuration
 */
export function usePageOnboarding(flow) {
  const { startOnboarding, isFlowCompleted } = useOnboarding();

  useEffect(() => {
    if (!flow) return;

    // Auto-start if configured and not completed
    if (shouldAutoStart(flow)) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        startOnboarding(flow);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [flow, startOnboarding]);

  return {
    isCompleted: isFlowCompleted(flow?.storageKey),
  };
}

/**
 * Hook to trigger feature onboarding on first use
 * Use this in feature components (buttons, panels, etc.)
 * @param {Object} flow - The feature flow configuration
 * @returns {Function} Function to call when feature is used
 */
export function useFeatureOnboarding(flow) {
  const { triggerFeatureOnboarding, isFlowCompleted } = useOnboarding();

  const trigger = useCallback(() => {
    if (flow) {
      triggerFeatureOnboarding(flow);
    }
  }, [flow, triggerFeatureOnboarding]);

  return {
    trigger,
    isCompleted: isFlowCompleted(flow?.storageKey),
  };
}

export default OnboardingContext;
