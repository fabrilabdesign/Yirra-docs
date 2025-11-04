import React from 'react';
import { cn } from './lib/cn';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-12 border border-line-soft bg-elev1 shadow-elev1', className)}
      {...props}
    />
  );
}





