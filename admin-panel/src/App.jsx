import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import AdminGate from './components/admin/AdminGate';
import AdminDashboard from './components/AdminDashboard';
import AdminMobileDashboard from './components/AdminMobileDashboard';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminInventory from './components/AdminInventory';
import AdminCustomers from './components/AdminCustomers';
import AdminEngineering from './components/AdminEngineering';
import AdminBOM from './components/AdminBOM';
import AdminShipping from './components/AdminShipping';
import AdminReturns from './components/AdminReturns';
import AdminReports from './components/AdminReports';
import AdminMarketing from './components/AdminMarketing';
import AdminChat from './components/AdminChat';
import AdminSettings from './components/AdminSettings';
import AdminBlog from './components/AdminBlog';
import AdminNewsletter from './components/AdminNewsletter';
import AdminOrderFulfillment from './components/AdminOrderFulfillment';
import AdminSTLFiles from './components/AdminSTLFiles';
import AdminUserManagement from './components/AdminUserManagement';
import AdminOverview from './components/AdminOverview';
import AdminProjectManagement from './components/AdminProjectManagement';
import AdminProjectManagementPage from './pages/AdminProjectManagementPage';
import EnhancedAnalyticsDashboard from './components/EnhancedAnalyticsDashboard';
import './index.css';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Detect if mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

function App() {
  const isMobile = useIsMobile();
  const DashboardComponent = isMobile ? AdminMobileDashboard : AdminDashboard;

  return (
    <Router>
      <Routes>
        {/* Login/Auth Gate */}
        <Route path="/" element={<AdminGate />} />
        
        {/* Protected Admin Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardComponent />
          </ProtectedRoute>
        } />
        
        <Route path="/overview" element={
          <ProtectedRoute>
            <AdminOverview />
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute>
            <AdminProducts />
          </ProtectedRoute>
        } />
        
        <Route path="/orders" element={
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        } />
        
        <Route path="/inventory" element={
          <ProtectedRoute>
            <AdminInventory />
          </ProtectedRoute>
        } />
        
        <Route path="/customers" element={
          <ProtectedRoute>
            <AdminCustomers />
          </ProtectedRoute>
        } />
        
        <Route path="/engineering" element={
          <ProtectedRoute>
            <AdminEngineering />
          </ProtectedRoute>
        } />
        
        <Route path="/bom" element={
          <ProtectedRoute>
            <AdminBOM />
          </ProtectedRoute>
        } />
        
        <Route path="/shipping" element={
          <ProtectedRoute>
            <AdminShipping />
          </ProtectedRoute>
        } />
        
        <Route path="/returns" element={
          <ProtectedRoute>
            <AdminReturns />
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <AdminReports />
          </ProtectedRoute>
        } />
        
        <Route path="/marketing" element={
          <ProtectedRoute>
            <AdminMarketing />
          </ProtectedRoute>
        } />
        
        <Route path="/newsletter" element={
          <ProtectedRoute>
            <AdminNewsletter />
          </ProtectedRoute>
        } />
        
        <Route path="/blog" element={
          <ProtectedRoute>
            <AdminBlog />
          </ProtectedRoute>
        } />
        
        <Route path="/chat" element={
          <ProtectedRoute>
            <AdminChat />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <AdminSettings />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <AdminUserManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/stl-files" element={
          <ProtectedRoute>
            <AdminSTLFiles />
          </ProtectedRoute>
        } />
        
        <Route path="/fulfillment" element={
          <ProtectedRoute>
            <AdminOrderFulfillment />
          </ProtectedRoute>
        } />
        
        <Route path="/projects" element={
          <ProtectedRoute>
            <AdminProjectManagementPage />
          </ProtectedRoute>
        } />
        
        <Route path="/project-management" element={
          <ProtectedRoute>
            <AdminProjectManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute>
            <EnhancedAnalyticsDashboard />
          </ProtectedRoute>
        } />
        
        {/* Fallback - redirect to dashboard if logged in, login if not */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


