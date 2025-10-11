import React from 'react';
import { cn } from './lib/cn';

export function Panel({ className, ...props }) {
  return (
    <div
      className={cn('rounded-14 border border-line-soft bg-surface shadow-elev1', className)}
      {...props}
    />
  );
}


