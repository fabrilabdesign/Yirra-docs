import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  User, 
  Package, 
  Download, 
  ShoppingCart, 
  Settings, 
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';
import DigitalPurchases from './DigitalPurchases';
import getApiUrl from '../utils/api.js';

const EnhancedDashboard = () => {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchDashboardData();
    }
  }, [isLoaded, user, getToken]);

  const fetchDashboardData = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(getApiUrl('/api/dashboard'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: TrendingUp,
      description: 'Account summary and recent activity'
    },
    {
      id: 'digital',
      label: 'Digital Products',
      icon: Download,
      description: 'Your STL files and digital purchases'
    },
    {
      id: 'orders',
      label: 'Physical Orders',
      icon: Package,
      description: 'Physical product orders and shipping'
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      description: 'Profile settings and preferences'
    }
  ];

  const TabButton = ({ tab, isActive, onClick }) => {
    const Icon = tab.icon;
    
    return (
      <button
        onClick={() => onClick(tab.id)}
        className={`
          relative flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
        <div className="text-left">
          <div className="font-medium">{tab.label}</div>
          <div className="text-xs opacity-75">{tab.description}</div>
        </div>
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-blue-50 rounded-lg border border-blue-200"
            style={{ zIndex: -1 }}
          />
        )}
      </button>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Digital Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.digitalPurchases || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Physical Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.totalOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.totalDownloads || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome Back!</h3>
        <p className="text-gray-600 mb-4">
          Manage your digital STL files, track physical orders, and access your account settings.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('digital')}
            className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <Download className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium text-blue-900">View STL Files</span>
            </div>
            <div className="text-blue-600">→</div>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center">
              <Package className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium text-green-900">Track Orders</span>
            </div>
            <div className="text-green-600">→</div>
          </button>
        </div>
      </div>
    </div>
  );

  const OrdersTab = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Orders</h3>
      <p className="text-gray-600">
        Physical order tracking will be displayed here. This integrates with your existing order management system.
      </p>
      {/* TODO: Integrate with existing OrdersPage component */}
    </div>
  );

  const AccountTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-sm text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="mt-1 text-sm text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
        <p className="text-gray-600">
          Account preferences and notification settings will be available here.
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'digital':
        return <DigitalPurchases />;
      case 'orders':
        return <OrdersTab />;
      case 'account':
        return <AccountTab />;
      default:
        return <OverviewTab />;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'there'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your digital products, orders, and account settings.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={setActiveTab}
                />
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
