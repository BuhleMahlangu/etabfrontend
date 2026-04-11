import React from 'react';
import { Link } from 'react-router-dom';

export const Button = ({ 
  children, 
  leftIcon,
  rightIcon,
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  disabled = false,
  className = '',
  as: Component = 'button',
  to,
  href,
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-gray-600 hover:bg-gray-100'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-lg font-medium transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  // Handle React Router Link
  if (to) {
    return (
      <Link
        to={to}
        className={baseClasses}
        {...props}
      >
        {leftIcon && (
          <span className="flex items-center">{leftIcon}</span>
        )}
        {children}
        {rightIcon && (
          <span className="flex items-center">{rightIcon}</span>
        )}
      </Link>
    );
  }

  // Handle external anchor link
  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        {...props}
      >
        {leftIcon && (
          <span className="flex items-center">{leftIcon}</span>
        )}
        {children}
        {rightIcon && (
          <span className="flex items-center">{rightIcon}</span>
        )}
      </a>
    );
  }

  // Handle custom component (like React Router Link passed via 'as' prop)
  if (Component !== 'button') {
    return (
      <Component
        className={baseClasses}
        {...props}
      >
        {leftIcon && (
          <span className="flex items-center">{leftIcon}</span>
        )}
        {children}
        {rightIcon && (
          <span className="flex items-center">{rightIcon}</span>
        )}
      </Component>
    );
  }

  // Default button
  return (
    <button
      className={baseClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      
      {!isLoading && leftIcon && (
        <span className="flex items-center">{leftIcon}</span>
      )}
      
      {children}
      
      {rightIcon && (
        <span className="flex items-center">{rightIcon}</span>
      )}
    </button>
  );
};

// Also keep default export for compatibility
export default Button;
