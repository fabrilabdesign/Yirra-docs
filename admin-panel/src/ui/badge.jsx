import React from 'react';
import { cn } from './lib/cn';

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn('h-[18px] inline-flex items-center px-2 rounded-full text-[12px] leading-[18px] font-semibold text-text-secondary bg-[rgba(99,102,241,.12)]', className)}
      {...props}
    />
  );
}


