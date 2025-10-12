import * as DialogPrimitive from '@radix-ui/react-dialog';
import React from 'react';
import { cn } from './lib/cn';

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({ className, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-scrim" />
      <DialogPrimitive.Content
        className={cn('fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-elev1 border border-line-soft rounded-16 shadow-elev2 p-6 w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto', className)}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
}

export const DialogTitle = (props) => (
  <DialogPrimitive.Title className="text-[16px] leading-6 font-semibold text-text-primary" {...props} />
);

export const DialogClose = DialogPrimitive.Close;




