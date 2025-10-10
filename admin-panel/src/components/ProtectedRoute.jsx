import React from 'react';
import { useAuth, useUser, RedirectToSignIn } from '@clerk/clerk-react';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    // Show a loading indicator while Clerk is initializing
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    // Redirect unauthenticated users to the sign-in page
    return <RedirectToSignIn />;
  }

  // Check for admin role if required by the route
  const isAdmin = user?.publicMetadata?.isAdmin === true;
  if (requireAdmin && !isAdmin) {
    // User is authenticated but not an admin.
    // Show a permission denied message for consistency with AdminGate.
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Permission Denied</h1>
          <p className="text-lg text-gray-700 mb-6">You do not have the required permissions to access this page.</p>
          <a href="/dashboard" className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            Go to Your Dashboard
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated (and authorized if admin was required)
  return children;
};

export default ProtectedRoute;
