import React from 'react';
import { cn } from './lib/cn';

export const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3 py-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand outline-none resize-none',
        className
      )}
      {...props}
    />
  );
});




