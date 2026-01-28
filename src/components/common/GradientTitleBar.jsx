// File: src/components/common/GradientTitleBar.jsx

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const gradientVariants = {
  blue: 'shadow-sm',
  slate: 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 shadow-sm',
  indigo: 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 shadow-sm',
  gray: 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400 shadow-sm',
};

const gradientStyles = {
  blue: {
    background: 'radial-gradient(104.2% 1049.87% at 1.2% 119.64%, rgba(0, 115, 252, 0.228) 0%, rgba(0, 115, 252, 0.08) 39.42%, rgba(0, 115, 252, 0.228) 58.17%, rgba(0, 115, 252, 0.08) 86.54%), #FFFFFF',
  },
};

const GradientTitleBar = ({
  title,
  icon: Icon,
  variant = 'blue',
  collapsible = false,
  isExpanded = true,
  onToggle,
  actions,
  className = '',
}) => {
  const handleClick = () => {
    if (collapsible && onToggle) {
      onToggle();
    }
  };

  const style = gradientStyles[variant] || {};
  const isLightVariant = variant === 'blue';
  const textColorClass = isLightVariant ? 'text-slate-900' : 'text-white';
  const iconColorClass = isLightVariant ? 'text-slate-900' : 'text-white';
  const chevronColorClass = isLightVariant ? 'text-slate-600' : 'text-white/80';

  return (
    <div
      style={style}
      className={`
        ${gradientVariants[variant]}
        px-4 py-2.5
        flex items-center justify-between
        ${collapsible ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={handleClick}
      role={collapsible ? 'button' : undefined}
      aria-expanded={collapsible ? isExpanded : undefined}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${iconColorClass}`} />}
        <span className={`font-semibold text-sm ${textColorClass}`}>{title}</span>
      </div>

      <div className="flex items-center gap-2">
        {actions}
        {collapsible && (
          <div className={chevronColorClass}>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GradientTitleBar;
