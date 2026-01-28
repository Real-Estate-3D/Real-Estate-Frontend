// File: src/components/legislation/form/StepIndicator.jsx

import React from 'react';
import { Check } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="px-4 sm:px-6 py-2 sm:py-2.5 border-b border-gray-200 bg-gray-50 overflow-x-auto">
      <div className="flex items-center justify-between min-w-max sm:min-w-0">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1 shrink-0">
                {/* Step Circle */}
                <div
                  className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    isCompleted
                      ? 'bg-[#0073FC] text-white'
                      : isCurrent
                      ? 'bg-[#0073FC] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-[10px] sm:text-xs font-medium text-center max-w-12 sm:max-w-16 leading-tight ${
                    isCurrent ? 'text-[#0073FC]' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-1 sm:mx-2 min-w-2 ${
                    isCompleted ? 'bg-[#0073FC]' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
