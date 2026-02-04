// File: src/components/common/OnboardingTooltip.jsx
// Comprehensive onboarding tooltip with center intro, targeted, and required-action support
// Specs: 30% opacity overlay, 4px padding + 12px radius highlight, non-blocking interaction

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, X } from 'lucide-react';

const OnboardingTooltip = ({
  // Core
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  onClose,

  // Positioning
  position = { x: 0, y: 0 },
  anchor = 'bottom-left',
  targetRect = null, // For highlight cutout: { top, left, width, height }
  targetPosition = null, // Optional custom position for line target: { x, y }

  // Behavior
  isIntroStep = false, // First step of part: center position, no target highlight
  isLastStep = false, // Show "Finish" instead of "Next", remove Skip
  showBackButton = true,
  showTargetLine = true, // Show line connecting tooltip to target

  // Content
  icon: Icon,
  children,
  className = '',
  tooltipPosition = null, // Optional: 'top', 'bottom', 'left', 'right' to force tooltip position
}) => {
  const maskIdRef = useRef(`highlight-mask-${Math.random().toString(36).slice(2)}`);
  const tooltipRef = useRef(null);

  // Smart tooltip positioning based on target location
  const getTooltipStyles = () => {
    if (isIntroStep) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
      };
    }

    const styles = {
      position: 'fixed',
      zIndex: 10000,
    };

    // If no target, use default positioning
    if (!targetRect) {
      styles.top = `${position.y}px`;
      styles.left = `${position.x}px`;
      return styles;
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const gap = 20; // Gap between target and tooltip
    const tooltipWidth = 334; // Fixed tooltip width from className

    // Handle center positioning with line
    if (tooltipPosition === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
      };
    }

    // Handle forced tooltip position
    if (tooltipPosition === 'top') {
      // Position tooltip centered above the target
      const targetCenterX = targetRect.left + targetRect.width / 2;
      let leftPos = targetCenterX - tooltipWidth / 2;

      // Ensure tooltip stays within screen bounds
      if (leftPos < gap) leftPos = gap;
      if (leftPos + tooltipWidth > screenWidth - gap) {
        leftPos = screenWidth - tooltipWidth - gap;
      }

      styles.left = `${leftPos}px`;
      styles.bottom = `${screenHeight - targetRect.top + gap}px`;
      return styles;
    }

    // Smart positioning based on target location (default behavior)
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    // Determine horizontal position (left or right of target)
    const isTargetOnLeftHalf = targetCenterX < screenWidth / 2;

    // Determine vertical position (above or below target)
    const isTargetInBottomThird = targetCenterY > (screenHeight * 2 / 3);

    if (isTargetOnLeftHalf) {
      // Target on left → Tooltip on right
      styles.left = `${targetRect.left + targetRect.width + gap}px`;
    } else {
      // Target on right → Tooltip on left
      styles.right = `${screenWidth - targetRect.left + gap}px`;
    }

    if (isTargetInBottomThird) {
      // Target in bottom third → Tooltip above
      styles.bottom = `${screenHeight - targetRect.top + gap}px`;
    } else {
      // Target in top/middle → Tooltip aligned with target
      styles.top = `${targetRect.top}px`;
    }

    return styles;
  };

  const buttonText = isLastStep ? 'Finish' : 'Next';

  // Calculate line coordinates from tooltip side to target side
  const [lineCoords, setLineCoords] = React.useState(null);

  useEffect(() => {
    if (!showTargetLine || !tooltipRef.current) {
      setLineCoords(null);
      return;
    }

    // Skip line for intro steps (unless center positioned with custom target)
    if (isIntroStep && tooltipPosition !== 'center') {
      setLineCoords(null);
      return;
    }

    // Require either targetRect or targetPosition
    if (!targetRect && !targetPosition) {
      setLineCoords(null);
      return;
    }

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const tooltipAbsTop = tooltipRect.top + scrollY;
    const tooltipAbsLeft = tooltipRect.left + scrollX;
    const tooltipAbsBottom = tooltipAbsTop + tooltipRect.height;
    const tooltipAbsRight = tooltipAbsLeft + tooltipRect.width;

    // Calculate target side connection point
    let targetX, targetY;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    if (targetPosition) {
      targetX = targetPosition.x;
      targetY = targetPosition.y;
    } else {
      const screenWidth = window.innerWidth;
      const isTargetOnLeftHalf = targetCenterX < screenWidth / 2;

      if (isTargetOnLeftHalf) {
        // Target on left → Connect to right edge of target
        targetX = targetRect.left + targetRect.width;
        targetY = targetCenterY;
      } else {
        // Target on right → Connect to left edge of target
        targetX = targetRect.left;
        targetY = targetCenterY;
      }
    }

    // Calculate tooltip side connection point
    let tooltipX, tooltipY;
    const tooltipCenterX = tooltipAbsLeft + tooltipRect.width / 2;

    // For center-positioned tooltips, connect from bottom center and use custom target position
    if (tooltipPosition === 'center') {
      tooltipX = tooltipCenterX;
      tooltipY = tooltipAbsBottom;

      // Use custom target position relative to screen center
      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;
      targetX = screenCenterX + (targetPosition?.x || 0);
      targetY = screenCenterY + (targetPosition?.y || 100); // Default 100px below center
    }
    // For top-positioned tooltips, connect center-to-center vertically
    else if (tooltipPosition === 'top') {
      // Tooltip is above target - connect from bottom center of tooltip to top center of target
      tooltipX = tooltipCenterX;
      tooltipY = tooltipAbsBottom;
      targetX = targetCenterX;
      targetY = targetRect.top;
    } else if (targetX < tooltipAbsLeft) {
      // Target is to the left - connect from left edge of tooltip
      tooltipX = tooltipAbsLeft;
      tooltipY = Math.max(tooltipAbsTop, Math.min(tooltipAbsBottom, targetY));
    } else if (targetX > tooltipAbsRight) {
      // Target is to the right - connect from right edge of tooltip
      tooltipX = tooltipAbsRight;
      tooltipY = Math.max(tooltipAbsTop, Math.min(tooltipAbsBottom, targetY));
    } else if (targetY < tooltipAbsTop) {
      // Target is above - connect from top edge
      tooltipY = tooltipAbsTop;
      tooltipX = Math.max(tooltipAbsLeft, Math.min(tooltipAbsRight, targetX));
    } else {
      // Target is below - connect from bottom edge
      tooltipY = tooltipAbsBottom;
      tooltipX = Math.max(tooltipAbsLeft, Math.min(tooltipAbsRight, targetX));
    }

    setLineCoords({
      x1: tooltipX,
      y1: tooltipY,
      x2: targetX,
      y2: targetY,
    });
  }, [showTargetLine, targetRect, targetPosition, isIntroStep, tooltipPosition, position, anchor]);

  const tooltipCard = (
    <div
      ref={tooltipRef}
      style={{
        ...getTooltipStyles(),
        background: 'linear-gradient(137.34deg, #fafcffdf -7.05%, #e6ecf2d2 46.47%, #fafcffd4 100%)',
        boxShadow: '0px 12px 12px -6px rgba(0, 0, 0, 0.16), 0px 0px 1px rgba(0, 0, 0, 0.4)',
      }}
      className={`rounded-lg w-[334px] backdrop-blur-md backdrop-brightness-110 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 h-14">
        <div className="flex items-center gap-2">
          {showBackButton && currentStep > 1 && !isIntroStep && (
            <button
              onClick={onBack}
              className="p-0.5 hover:opacity-70 transition-opacity"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
          )}
          <h3 className="font-bold text-base leading-6 text-black capitalize">
            {title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Content */}
      <div className="px-3 pb-3 flex flex-col gap-2">
        {description && (
          <p className="text-sm leading-5 text-black font-normal">{description}</p>
        )}
        {children}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 pb-3 h-11">
        <span className="text-xs leading-4 font-semibold text-black">
          {currentStep} of {totalSteps}
        </span>

        <div className="flex items-center gap-2">
          {/* Next/Finish Button (always visible) */}
          <button
            onClick={onNext}
            style={{
              background: 'radial-gradient(70.45% 70.45% at 58.33% 7.95%, rgba(0, 115, 252, 0) 0%, #0073FC 100%), radial-gradient(50% 50% at 43.75% 0%, rgba(0, 115, 252, 0.61) 0%, rgba(0, 115, 252, 0) 100%)',
              filter: 'drop-shadow(0px 22px 9px rgba(1, 77, 254, 0.02)) drop-shadow(0px 13px 8px rgba(1, 77, 254, 0.08)) drop-shadow(0px 6px 6px rgba(1, 77, 254, 0.14)) drop-shadow(0px 1px 3px rgba(1, 77, 254, 0.16))',
            }}
            className="px-3 py-1.5 h-8 rounded-md text-white text-xs leading-4 font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {buttonText}
          </button>

          {/* Skip Button (always visible except last step) */}
          {!isLastStep && onSkip && (
            <button
              onClick={onSkip}
              className="px-3 py-1.5 h-8 rounded-md text-xs leading-4 font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // SVG Mask for highlight cutout (4px padding, 12px border-radius)
  // Skip mask for intro steps and center-positioned tooltips
  const highlightMask = targetRect && !isIntroStep && tooltipPosition !== 'center' && (
    <svg
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <defs>
        <mask id={maskIdRef.current}>
          {/* White background (visible area) */}
          <rect width="100%" height="100%" fill="white" />

          {/* Black hole (hidden area) - 4px padding, 12px radius */}
          <rect
            x={targetRect.left - 4}
            y={targetRect.top - 4}
            width={targetRect.width + 8}
            height={targetRect.height + 8}
            rx={12}
            ry={12}
            fill="black"
          />
        </mask>
      </defs>

      {/* Semi-transparent overlay with hole cutout: #000 at 30% opacity */}
      <rect
        width="100%"
        height="100%"
        fill="rgba(0, 0, 0, 0.3)"
        mask={`url(#${maskIdRef.current})`}
      />

      {/* Optional connecting line from tooltip to target */}
      {lineCoords && showTargetLine && (
        <line
          x1={lineCoords.x1}
          y1={lineCoords.y1}
          x2={lineCoords.x2}
          y2={lineCoords.y2}
          stroke="#000000"
          strokeWidth="2"
          opacity="1"
        />
      )}
    </svg>
  );

  // Full-screen overlay (30% opacity) for intro, center-positioned, and targeted steps
  const overlay = isIntroStep || tooltipPosition === 'center' || targetRect ? (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: !targetRect || tooltipPosition === 'center' ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  ) : null;

  const content = (
    <>
      {overlay}
      {highlightMask}
      {tooltipCard}
    </>
  );

  return createPortal(content, document.body);
};

export default OnboardingTooltip;
