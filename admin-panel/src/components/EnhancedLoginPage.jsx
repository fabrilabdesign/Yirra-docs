import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export function EnhancedLoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <SignIn path="/login" routing="path" signUpUrl="/register" />
    </div>
  );
}
