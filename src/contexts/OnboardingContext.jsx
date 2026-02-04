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

  // Check URL parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('resetOnboarding') === 'true') {
      console.log('[Onboarding] Detected resetOnboarding=true in URL, resetting all flows');
      resetOnboardingStorage('all');
    }
  }, []);

  /**
   * Start an onboarding flow
   * @param {Object} flow - The flow configuration from onboardingFlows.js
   * @param {boolean} force - Force start even if already completed
   */
  const startOnboarding = useCallback((flow, force = false) => {
    if (!flow) {
      console.warn('[Onboarding] No flow provided to startOnboarding');
      return;
    }

    // Check if already completed (unless forced)
    const isCompleted = isOnboardingCompleted(flow.storageKey);
    if (!force && isCompleted) {
      console.log(`[Onboarding] Flow "${flow.id}" already completed, skipping`);
      return;
    }

    console.log(`[Onboarding] Starting flow: ${flow.id} (storageKey: ${flow.storageKey})`);
    setActiveFlow(flow);
    setIsActive(true);
  }, []);

  /**
   * Complete the current onboarding flow
   */
  const completeOnboarding = useCallback(() => {
    if (activeFlow) {
      console.log(`[Onboarding] Completing flow: ${activeFlow.id} (storageKey: ${activeFlow.storageKey})`);
      markOnboardingCompleted(activeFlow.storageKey);

      // Verify it was saved
      const saved = isOnboardingCompleted(activeFlow.storageKey);
      console.log(`[Onboarding] Verification - saved: ${saved}, localStorage value: ${localStorage.getItem(activeFlow.storageKey)}`);

      if (!saved) {
        console.error(`[Onboarding] ERROR: Failed to save completion status for ${activeFlow.id}`);
      }
    }
    setActiveFlow(null);
    setIsActive(false);
  }, [activeFlow]);

  /**
   * Cancel the current onboarding flow
   * Also marks it as completed so it won't show again
   */
  const cancelOnboarding = useCallback(() => {
    if (activeFlow) {
      console.log(`[Onboarding] Cancelling flow: ${activeFlow.id} (storageKey: ${activeFlow.storageKey})`);
      // Mark as completed so it won't show again
      markOnboardingCompleted(activeFlow.storageKey);

      // Verify it was saved
      const saved = isOnboardingCompleted(activeFlow.storageKey);
      console.log(`[Onboarding] Marked cancelled flow as completed - saved: ${saved}`);

      if (!saved) {
        console.error(`[Onboarding] ERROR: Failed to save completion status for cancelled flow ${activeFlow.id}`);
      }
    }
    setActiveFlow(null);
    setIsActive(false);
  }, [activeFlow]);

  /**
   * Reset onboarding state
   * @param {string} storageKey - The flow to reset, or 'all' for everything
   */
  const resetOnboarding = useCallback((storageKey = 'all') => {
    console.log(`[Onboarding] Resetting: ${storageKey}`);
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

    const isCompleted = isFlowCompleted(flow.storageKey);
    console.log(`[Onboarding] usePageOnboarding - flow: ${flow.id}, completed: ${isCompleted}`);

    // Auto-start if configured and not completed
    if (shouldAutoStart(flow)) {
      console.log(`[Onboarding] Auto-starting page flow: ${flow.id} in 500ms`);
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        startOnboarding(flow);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      console.log(`[Onboarding] Not auto-starting ${flow.id}: shouldAutoStart returned false`);
    }
  }, [flow, startOnboarding, isFlowCompleted]);

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
