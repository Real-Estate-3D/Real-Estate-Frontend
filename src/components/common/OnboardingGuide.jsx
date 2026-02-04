// File: src/components/common/OnboardingGuide.jsx
// Flexible onboarding orchestration that works with centralized configuration
// Features: Dynamic flow loading, action detection, exit confirmation

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import OnboardingTooltip from './OnboardingTooltip';

const OnboardingGuide = ({ flow, onComplete, onCancel }) => {
  // Validate flow
  if (!flow || !flow.steps || flow.steps.length === 0) {
    console.warn('OnboardingGuide: Invalid or empty flow provided');
    return null;
  }

  // ALL State declarations (must be before any conditional returns)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [targetRect, setTargetRect] = useState(null);
  const [targetPosition, setTargetPosition] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const actionDetectedRef = useRef(false);

  const steps = flow.steps;
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Locate target element and compute highlight rect
  useEffect(() => {
    if (!currentStep?.selector || currentStep?.isIntroStep || !isOpen) {
      setTargetRect(null);
      setTargetPosition(null);
      return;
    }

    const el = document.querySelector(currentStep.selector);
    if (!el) {
      setTargetRect(null);
      setTargetPosition(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    setTargetRect({
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      height: rect.height,
    });

    // Compute targetPosition if custom offset is provided
    // For center-positioned tooltips, use the offset directly without adding to rect
    if (currentStep.targetPosition) {
      if (currentStep.tooltipPosition === 'center') {
        // Use relative offset from center
        setTargetPosition({
          x: currentStep.targetPosition.x || 0,
          y: currentStep.targetPosition.y || 100,
        });
      } else {
        // Use absolute position relative to target element
        setTargetPosition({
          x: rect.left + scrollX + (currentStep.targetPosition.x || 0),
          y: rect.top + scrollY + (currentStep.targetPosition.y || 0),
        });
      }
    } else {
      setTargetPosition(null);
    }
  }, [currentStep, isOpen]);

  // Action detection with auto-advance
  useEffect(() => {
    if (
      !currentStep?.requiresAction ||
      !currentStep?.actionType ||
      !isOpen ||
      actionDetectedRef.current
    ) {
      return;
    }

    const detectAction = () => {
      if (actionDetectedRef.current) return;

      let actionCompleted = false;

      switch (currentStep.actionType) {
        case 'input-focus': {
          const input = document.querySelector(currentStep.selector);
          if (input && (document.activeElement === input || input.value)) {
            actionCompleted = true;
          }
          break;
        }
        case 'input-filled': {
          const input = document.querySelector(currentStep.selector);
          if (input && input.value) {
            actionCompleted = true;
          }
          break;
        }
        case 'button-click': {
          const target = currentStep.actionTarget
            ? document.querySelector(currentStep.actionTarget)
            : document.querySelector(currentStep.selector);
          if (target) {
            target.addEventListener('click', handleActionDetected);
          }
          break;
        }
        case 'panel-open': {
          const panel = document.querySelector(currentStep.selector);
          if (panel && panel.offsetParent !== null) {
            actionCompleted = true;
          }
          break;
        }
        case 'parcel-click': {
          // Listen for parcel selection events
          // This will be triggered by the WMS feature click handler
          break;
        }
        case 'row-click': {
          // Listen for row click events on tables - handled in listener section
          break;
        }
        default:
          break;
      }

      if (actionCompleted) {
        handleActionDetected();
      }
    };

    const handleActionDetected = () => {
      if (actionDetectedRef.current) return;
      actionDetectedRef.current = true;

      // Auto-advance after 500ms delay for feedback
      const timer = setTimeout(() => {
        handleNext();
      }, 500);

      return () => clearTimeout(timer);
    };

    // Set up listeners for focus/input events
    if (currentStep.actionType === 'input-focus' || currentStep.actionType === 'input-filled') {
      const input = document.querySelector(currentStep.selector);
      if (input) {
        input.addEventListener('focus', handleActionDetected);
        input.addEventListener('input', handleActionDetected);
        return () => {
          input.removeEventListener('focus', handleActionDetected);
          input.removeEventListener('input', handleActionDetected);
        };
      }
    } else if (currentStep.actionType === 'panel-open') {
      const checkPanel = setInterval(detectAction, 100);
      return () => clearInterval(checkPanel);
    } else if (currentStep.actionType === 'parcel-click') {
      // Listen for parcel click events from the map
      const handleParcelClick = () => {
        handleActionDetected();
      };
      window.addEventListener('parcelClicked', handleParcelClick);
      return () => window.removeEventListener('parcelClicked', handleParcelClick);
    } else if (currentStep.actionType === 'row-click') {
      // Listen for click events on table rows
      const container = document.querySelector(currentStep.selector);
      if (container) {
        const handleRowClick = (e) => {
          // Check if clicked on a table row or inside one
          const row = e.target.closest('tr, [role="row"]');
          if (row) {
            handleActionDetected();
          }
        };
        container.addEventListener('click', handleRowClick);
        return () => {
          container.removeEventListener('click', handleRowClick);
        };
      }
    }

    detectAction();
  }, [currentStep, isOpen]);

  const handleNext = useCallback(() => {
    actionDetectedRef.current = false;

    if (currentStepIndex < totalSteps - 1) {
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // All steps complete
      setIsOpen(false);
      onComplete?.();
    }
  }, [currentStepIndex, totalSteps, onComplete]);

  const handleBack = useCallback(() => {
    actionDetectedRef.current = false;

    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    actionDetectedRef.current = false;

    // Skip button moves to the next step (same as Next)
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // On last step, skip completes the tour
      setIsOpen(false);
      onComplete?.();
    }
  }, [currentStepIndex, totalSteps, onComplete]);

  const handleClose = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const handleConfirmExit = useCallback(() => {
    // Clean up modal state first
    setShowExitConfirm(false);
    setIsOpen(false);

    // Call cancel callback if provided, otherwise call onComplete
    if (onCancel) {
      onCancel();
    } else {
      onComplete?.();
    }
  }, [onComplete, onCancel]);

  // Render: Exit Confirmation Modal
  if (showExitConfirm) {
    return createPortal(
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center" style={{ zIndex: 50000 }}>
        <div
          className="bg-white rounded-lg p-6 w-96 shadow-lg"
          style={{
            boxShadow: '0px 12px 12px -6px rgba(0, 0, 0, 0.16), 0px 0px 1px rgba(0, 0, 0, 0.4)',
          }}
        >
          <h3 className="font-bold text-lg text-black mb-2">Exit Onboarding?</h3>
          <p className="text-sm text-gray-700 mb-6">
            You can always restart the onboarding from your account settings.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowExitConfirm(false)}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Continue
            </button>
            <button
              onClick={handleConfirmExit}
              style={{
                background: 'radial-gradient(70.45% 70.45% at 58.33% 7.95%, rgba(0, 115, 252, 0) 0%, #0073FC 100%), radial-gradient(50% 50% at 43.75% 0%, rgba(0, 115, 252, 0.61) 0%, rgba(0, 115, 252, 0) 100%)',
              }}
              className="px-4 py-2 rounded-md text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Exit
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Render: Onboarding Tooltip (hide when showing modals)
  if (!isOpen || !currentStep || showExitConfirm) return null;

  return (
    <OnboardingTooltip
      title={currentStep.title}
      description={currentStep.description}
      currentStep={currentStepIndex + 1}
      totalSteps={totalSteps}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
      onClose={handleClose}
      position={{ x: 0, y: 0 }}
      anchor="top-left"
      targetRect={targetRect}
      targetPosition={targetPosition}
      isIntroStep={currentStep.isIntroStep}
      isLastStep={isLastStep}
      showBackButton={true}
      showTargetLine={currentStep.showTargetLine !== false}
      tooltipPosition={currentStep.tooltipPosition}
    />
  );
};

export default OnboardingGuide;
