// File: src/components/common/Button.jsx
// Universal button component matching Figma design system

import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm border border-transparent disabled:bg-gray-300 disabled:text-gray-500',
  'primary-gradient': 'text-white border border-transparent disabled:bg-gray-300 disabled:text-gray-500',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400',
  outline: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:bg-transparent disabled:text-gray-400 disabled:border-gray-200',
  ghost: 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400 disabled:bg-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-transparent disabled:bg-gray-300 disabled:text-gray-500',
  success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm border border-transparent disabled:bg-gray-300 disabled:text-gray-500',
  link: 'bg-transparent text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline disabled:text-gray-400 disabled:no-underline',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1.5',
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
  xl: 'px-6 py-3 text-base gap-2',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
};

const Button = ({
  children,
  variant = 'primary-gradient',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'flex inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed select-none';
  
  const widthClass = fullWidth ? 'w-full' : '';
  const iconSizeClass = iconSizes[size];

  // Special styling for primary-gradient variant (Figma spec)
  const gradientStyle = variant === 'primary-gradient' ? {
    background: 'radial-gradient(70.45% 70.45% at 58.33% 7.95%, rgba(0, 115, 252, 0) 0%, #0073FC 100%), radial-gradient(50% 50% at 43.75% 0%, rgba(0, 115, 252, 0.61) 0%, rgba(0, 115, 252, 0) 100%)',
    filter: 'drop-shadow(0px 22px 9px rgba(1, 77, 254, 0.02)) drop-shadow(0px 13px 8px rgba(1, 77, 254, 0.08)) drop-shadow(0px 6px 6px rgba(1, 77, 254, 0.14)) drop-shadow(0px 1px 3px rgba(1, 77, 254, 0.16))',
  } : {};

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={gradientStyle}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className={`${iconSizeClass} animate-spin`} />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={iconSizeClass} />}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && <Icon className={iconSizeClass} />}
        </>
      )}
    </button>
  );
};

export default Button;
