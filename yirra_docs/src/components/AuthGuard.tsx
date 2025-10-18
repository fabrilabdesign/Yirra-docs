import React, { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';

      // If not authenticated and not on login page, redirect to login
      if (!loggedIn && !window.location.pathname.includes('/login.html')) {
        window.location.href = '/login.html';
      }
    };

    checkAuth();

    // Listen for storage changes (in case user logs in from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isLoggedIn') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Always render children - client-side auth check happens in useEffect
  // This prevents hydration issues and allows the page to render initially
  return <>{children}</>;
}
