import React from 'react';
import { cn } from '../../utils/cn';

export const Card = React.forwardRef(function Card(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('bg-white rounded-2xl shadow-md border border-slate-100 p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
});