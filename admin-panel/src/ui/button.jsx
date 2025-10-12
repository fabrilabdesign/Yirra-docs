import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition outline-none focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-text-inverse hover:bg-brand-600 active:bg-brand-700',
        secondary:
          'bg-elev1 text-text-primary border border-line-strong hover:bg-hover',
        ghost: 'bg-transparent text-text-secondary hover:bg-hover',
      },
      size: {
        default: 'h-9 px-4 rounded-10',
        compact: 'h-7 px-3 rounded-10',
        icon: 'h-9 w-9 rounded-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
);

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}




