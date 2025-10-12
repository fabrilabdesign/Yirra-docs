import React from 'react';
import { cn } from './lib/cn';

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand outline-none',
        className
      )}
      {...props}
    />
  );
});




