import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '@clerk/clerk-react';

// Lazy load all admin components to prevent initialization conflicts
const AdminOverview = lazy(() => import('./AdminOverview'));
const AdminProducts = lazy(() => import('./AdminProducts'));
const AdminOrders = lazy(() => import('./AdminOrders'));
const AdminOrderFulfillment = lazy(() => import('./AdminOrderFulfillment'));
const AdminInventory = lazy(() => import('./AdminInventory'));
const AdminBOM = lazy(() => import('./AdminBOM'));
const AdminCustomers = lazy(() => import('./AdminCustomers'));
const AdminSTLFiles = lazy(() => import('./AdminSTLFiles'));
const AdminNewsletter = lazy(() => import('./AdminNewsletter'));
const AdminMarketing = lazy(() => import('./AdminMarketing'));
const AdminBlog = lazy(() => import('./AdminBlog'));
const AdminUserManagement = lazy(() => import('./AdminUserManagement'));
const AdminShipping = lazy(() => import('./AdminShipping'));
const AdminReturns = lazy(() => import('./AdminReturns'));
const AdminReports = lazy(() => import('./AdminReports'));
const AdminSettings = lazy(() => import('./AdminSettings'));
const AdminEngineering = lazy(() => import('./AdminEngineering'));
const AdminChat = lazy(() => import('./AdminChat'));
const AdminProjectManagement = lazy(() => import('./AdminProjectManagement'));

const AdminMobileDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getToken } = useAuth();

  // Mobile navigation items - prioritizing BOM and product management
  const mobileNavItems = [
    { id: 'overview', label: 'Overview', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z' },
    { id: 'projects', label: 'Projects', icon: 'M12 8v8m4-4H8m12 0a8 8 0 11-16 0 8 8 0 0116 0z' },
    { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'bom', label: 'BOM', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'engineering', label: 'Engineering', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065z' },
    { id: 'more', label: 'More', icon: 'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z' }
  ];

// Loading component for lazy loaded components
const ComponentLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const renderActiveComponent = () => {
  switch (activeTab) {
    case 'overview':
    default:
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminOverview onNavigateToTab={setActiveTab} />
        </Suspense>
      );
    case 'products':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminProducts />
        </Suspense>
      );
    case 'projects':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminProjectManagement />
        </Suspense>
      );
    case 'orders':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminOrders />
        </Suspense>
      );
    case 'fulfillment':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminOrderFulfillment />
        </Suspense>
      );
    case 'inventory':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminInventory />
        </Suspense>
      );
    case 'bom':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminBOM />
        </Suspense>
      );
    case 'customers':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminCustomers />
        </Suspense>
      );
    case 'stl-files':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminSTLFiles />
        </Suspense>
      );
    case 'newsletter':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminNewsletter />
        </Suspense>
      );
    case 'marketing':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminMarketing />
        </Suspense>
      );
    case 'blog':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminBlog />
        </Suspense>
      );
    case 'users':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminUserManagement />
        </Suspense>
      );
    case 'shipping':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminShipping />
        </Suspense>
      );
    case 'returns':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminReturns />
        </Suspense>
      );
    case 'reports':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminReports />
        </Suspense>
      );
    case 'settings':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminSettings />
        </Suspense>
      );
    case 'engineering':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminEngineering />
        </Suspense>
      );
    case 'chat':
      return (
        <Suspense fallback={<ComponentLoadingSpinner />}>
          <AdminChat />
        </Suspense>
      );
  }
};

  return (
    <div className="flex flex-col min-h-screen bg-app text-text-primary overflow-x-hidden">

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-line-soft px-4 py-2 flex items-center justify-between h-14 min-h-14">
        <div className="flex items-center gap-2">
          <button
            className="bg-brand/10 border border-brand/20 rounded-10 p-1.5 text-brand hover:bg-brand/20 active:scale-95 transition-all"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[13px] leading-[18px] font-semibold text-text-primary">Yirra</span>
            <span className="text-[13px] leading-[18px] font-semibold text-brand">Systems</span>
            <span className="hidden sm:inline text-text-tertiary">•</span>
            <span className="hidden sm:inline text-[12px] leading-4 text-text-tertiary">
              {mobileNavItems.find(item => item.id === activeTab)?.label || 'Admin'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a5.99 5.99 0 00-4.5-5.8 6 6 0 00-7 5.8v3L8 17h7z" />
            </svg>
            <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-danger rounded-full border-2 border-surface"></div>
          </div>
        </div>
      </header>

      {/* Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-scrim backdrop-blur-sm z-40 transition-all duration-300 ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Slide-out Drawer */}
      <div className={`fixed top-0 left-0 w-[280px] h-full bg-surface z-50 border-r border-line-soft transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-4 p-3 pb-3 border-b border-line-soft">
          <div className="text-[18px] leading-6 font-semibold text-text-primary">Yirra Admin</div>
          <button
            className="bg-danger/10 border border-danger/20 rounded-10 p-2 text-danger hover:bg-danger/20 active:scale-95 transition-all"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-[calc(100%-56px)] overflow-y-auto p-3 pt-0 space-y-6">
          <div>
            <div className="h-9 rounded-10 bg-elev1 border border-line-soft flex items-center px-3 gap-2">
              <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-tertiary text-[13px]" placeholder="Search…" />
            </div>
          </div>

          <div>
            <div className="text-[12px] leading-[18px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">Dashboard</div>
          <button
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'overview' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Overview
          </button>
          <button
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'projects' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('projects'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
            Projects
          </button>
          </div>

        <div>
          <div className="text-[12px] leading-[18px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">Product Management</div>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'products' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Products
          </button>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'bom' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('bom'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            BOM Management
          </button>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'inventory' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('inventory'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Inventory
          </button>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'stl-files' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('stl-files'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            STL Files
          </button>
        </div>

        <div>
          <div className="text-[12px] leading-[18px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">Commerce</div>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'orders' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Orders
          </button>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'fulfillment' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('fulfillment'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            Fulfillment
          </button>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'shipping' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('shipping'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Shipping
          </button>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'returns' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('returns'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Returns
          </button>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'customers' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('customers'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.5a2.25 2.25 0 00-2.25-2.25" />
            </svg>
            Customers
          </button>
        </div>

        <div>
          <div className="text-[12px] leading-[18px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">Marketing</div>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'newsletter' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('newsletter'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Newsletter
          </button>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'marketing' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('marketing'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
            Marketing
          </button>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'blog' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('blog'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Blog
          </button>
        </div>

        <div>
          <div className="text-[12px] leading-[18px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">Analytics</div>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'reports' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('reports'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Reports
          </button>
        </div>

        <div>
          <div className="text-[12px] leading-[18px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">Support</div>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'chat' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('chat'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat History
          </button>
        </div>

        <div>
          <div className="text-[12px] leading-[18px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">Administration</div>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'users' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.5a2.25 2.25 0 00-2.25-2.25" />
            </svg>
            User Management
          </button>
        </div>

        <div>
          <div className="text-[12px] leading-[18px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">Settings</div>
          <button 
            className={`flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ${activeTab === 'settings' ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded' : 'text-text-secondary hover:bg-hover hover:text-text-primary'}`}
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {renderActiveComponent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-grid">
          {mobileNavItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AdminMobileDashboard;