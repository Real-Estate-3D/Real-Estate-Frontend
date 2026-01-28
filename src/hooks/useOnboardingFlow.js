// Custom hook for easier onboarding integration
// Provides simple API for triggering page and feature onboarding

import { useCallback, useEffect } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { getOnboardingFlow } from '../config/onboardingFlows';

/**
 * Hook for page-level onboarding
 * Auto-starts onboarding on first visit if configured
 *
 * @param {string} pageId - The page identifier from onboardingFlows.js
 * @returns {Object} - { start, isCompleted, reset }
 *
 * @example
 * // In Dashboard.jsx
 * const { isCompleted } = useOnboardingFlow('pages', 'dashboard');
 */
export function useOnboardingFlow(category, flowId) {
  const { startOnboarding, isFlowCompleted, resetOnboarding } = useOnboarding();
  const flow = getOnboardingFlow(category, flowId);

  // Auto-start page onboarding on mount if configured
  useEffect(() => {
    if (!flow || category !== 'pages') return;

    // Check if should auto-start
    if (flow.autoStart && !isFlowCompleted(flow.storageKey)) {
      const timer = setTimeout(() => {
        startOnboarding(flow);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [flow, category, startOnboarding, isFlowCompleted]);

  const start = useCallback((force = false) => {
    if (flow) {
      startOnboarding(flow, force);
    }
  }, [flow, startOnboarding]);

  const reset = useCallback(() => {
    if (flow) {
      resetOnboarding(flow.storageKey);
    }
  }, [flow, resetOnboarding]);

  return {
    start,
    reset,
    isCompleted: flow ? isFlowCompleted(flow.storageKey) : true,
    flow,
  };
}

/**
 * Hook for feature-level onboarding
 * Triggers onboarding on first use
 *
 * @param {string} featureId - The feature identifier from onboardingFlows.js
 * @returns {Object} - { trigger, isCompleted }
 *
 * @example
 * // In MeasurementButton component
 * const { trigger } = useOnboardingFlow('features', 'measurement');
 *
 * const handleClick = () => {
 *   trigger(); // Shows onboarding on first use
 *   // ... rest of button logic
 * };
 */
export function useFeatureOnboardingFlow(featureId) {
  const { startOnboarding, isFlowCompleted } = useOnboarding();
  const flow = getOnboardingFlow('features', featureId);

  const trigger = useCallback(() => {
    if (!flow) return;

    // Only show if not completed and triggerOn is 'first-use'
    if (flow.triggerOn === 'first-use' && !isFlowCompleted(flow.storageKey)) {
      startOnboarding(flow);
    }
  }, [flow, startOnboarding, isFlowCompleted]);

  return {
    trigger,
    isCompleted: flow ? isFlowCompleted(flow.storageKey) : true,
    flow,
  };
}

export default useOnboardingFlow;
