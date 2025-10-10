import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

// Load the publishable key from window config or env
// In production, this will be injected at runtime via Docker entrypoint
const PUBLISHABLE_KEY = 
  (typeof window !== 'undefined' && (window as any).CLERK_PUBLISHABLE_KEY) ||
  process.env.REACT_APP_CLERK_PUBLISHABLE_KEY ||
  'pk_live_Y2xlcmsuZmFicmlsYWIuY29tLmF1JA'; // Fallback for development

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key. Add it to your environment or window config.');
}

// Brand theme for Clerk components matching Yirra design
const clerkTheme = {
  variables: {
    colorPrimary: '#06b6d4',   // Yirra cyan
    colorText: '#1f2937',      // Gray-800
    borderRadius: '0.75rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  },
  elements: {
    card: 'shadow-xl rounded-3xl',
    headerTitle: 'text-3xl font-bold',
    formFieldInput: 'bg-slate-50 border-slate-300 focus:border-cyan-600',
    socialButtonsBlockButton: 'bg-white border-slate-300 hover:bg-slate-100',
    footerActionLink: 'text-cyan-600 hover:text-cyan-700',
    footerPoweredBy: 'hidden', // Hide "Powered by Clerk"
  },
};

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={clerkTheme}
    >
      {children}
    </ClerkProvider>
  );
}


