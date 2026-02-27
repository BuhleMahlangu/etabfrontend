// E-tab Loading Spinner
import React from 'react';
import { cn } from '../../utils/cn';

export const LoadingSpinner = ({ 
  size = 'md', 
  className,
  fullScreen = false 
}) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className={cn('relative', sizes[size], className)}>
      <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

// Skeleton Loading
export const Skeleton = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className={cn(
            'animate-pulse bg-slate-200 rounded-lg',
            className
          )}
        />
      ))}
    </>
  );
};