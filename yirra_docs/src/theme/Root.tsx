import React from 'react';
import AuthGuard from '@site/src/components/AuthGuard';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}


