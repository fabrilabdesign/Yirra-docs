import React from 'react';
import { useAuth, useUser, RedirectToSignIn } from '@clerk/clerk-react';
import AdminMobileDashboard from '../AdminMobileDashboard';

const AdminGate = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    // Redirect unauthenticated users to the sign-in page
    return <RedirectToSignIn redirectUrl="/admin" />;
  }

  // Super users bypass publicMetadata role check
  const SUPER_USERS = ['user_2z8aful1h56CouNKYIBn7ah1xMm', 'user_2zuAr3tW57mEhgZRcnaoIaAW8jM'];

  // Check for admin role or super user
  const isAdmin = (user?.publicMetadata?.role === 'admin') || SUPER_USERS.includes(user?.id);

  if (isAdmin) {
    // User is an authenticated admin, show the mobile-first dashboard
    return <AdminMobileDashboard />;
  } else {
    // User is authenticated but not an admin
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Permission Denied</h1>
          <p className="text-lg text-gray-700 mb-6">You do not have the required permissions to access the admin dashboard.</p>
          <a href="/dashboard" className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            Go to Your Dashboard
          </a>
        </div>
      </div>
    );
  }
};

export default AdminGate;
