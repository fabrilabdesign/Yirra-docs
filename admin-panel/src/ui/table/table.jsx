import React from 'react';
import { cn } from '../lib/cn';

export function Table({ className, ...props }) {
  return <table className={cn('min-w-full', className)} {...props} />;
}

export function Thead({ className, ...props }) {
  return <thead className={cn('bg-elev2', className)} {...props} />;
}

export function Tr({ className, ...props }) {
  return <tr className={cn('', className)} {...props} />;
}

export function Th({ className, ...props }) {
  return (
    <th
      className={cn('px-6 py-4 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider', className)}
      {...props}
    />
  );
}

export function Tbody({ className, ...props }) {
  return <tbody className={cn('bg-surface divide-y divide-line-soft', className)} {...props} />;
}

export function Td({ className, ...props }) {
  return <td className={cn('px-6 py-4', className)} {...props} />;
}


