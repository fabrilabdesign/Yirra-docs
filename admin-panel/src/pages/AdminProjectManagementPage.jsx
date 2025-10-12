import React, { lazy, Suspense } from 'react';
import { useAuth } from '@clerk/clerk-react';

// Lazy load AdminProjectManagement to avoid initialization conflicts
const AdminProjectManagement = lazy(() => import('../components/AdminProjectManagement'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const AdminProjectManagementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner />}>
        <AdminProjectManagement />
      </Suspense>
    </div>
  );
};

export default AdminProjectManagementPage;

