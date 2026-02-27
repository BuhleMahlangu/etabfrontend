import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(function Input(
  { className, label, error, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5',
          'text-sm text-slate-900 placeholder:text-slate-400',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          'transition-all outline-none',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});