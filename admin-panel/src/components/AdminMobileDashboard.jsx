import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminOrderFulfillment from './AdminOrderFulfillment';
import AdminInventory from './AdminInventory';
import AdminBOM from './AdminBOM';
import AdminCustomers from './AdminCustomers';
import AdminSTLFiles from './AdminSTLFiles';
import AdminNewsletter from './AdminNewsletter';
import AdminMarketing from './AdminMarketing';
import AdminBlog from './AdminBlog';
import AdminUserManagement from './AdminUserManagement';
import AdminShipping from './AdminShipping';
import AdminReturns from './AdminReturns';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';
import AdminEngineering from './AdminEngineering';
import AdminChat from './AdminChat';

const AdminMobileDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getToken } = useAuth();

  // Mobile navigation items - prioritizing BOM and product management
  const mobileNavItems = [
    { id: 'overview', label: 'Overview', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z' },
    { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'bom', label: 'BOM', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'engineering', label: 'Engineering', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'more', label: 'More', icon: 'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z' }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
      default:
        return <AdminOverview onNavigateToTab={setActiveTab} />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'fulfillment':
        return <AdminOrderFulfillment />;
      case 'inventory':
        return <AdminInventory />;
      case 'bom':
        return <AdminBOM />;
      case 'customers':
        return <AdminCustomers />;
      case 'stl-files':
        return <AdminSTLFiles />;
      case 'newsletter':
        return <AdminNewsletter />;
      case 'marketing':
        return <AdminMarketing />;
      case 'blog':
        return <AdminBlog />;
      case 'users':
        return <AdminUserManagement />;
      case 'shipping':
        return <AdminShipping />;
      case 'returns':
        return <AdminReturns />;
      case 'reports':
        return <AdminReports />;
      case 'settings':
        return <AdminSettings />;
      case 'engineering':
        return <AdminEngineering />;
      case 'chat':
        return <AdminChat />;
    }
  };

  return (
    <div className="admin-mobile-dashboard">
      <style>{`
        .admin-mobile-dashboard {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: linear-gradient(135deg, 
            rgba(15, 23, 42, 0.98) 0%, 
            rgba(30, 41, 59, 0.95) 50%, 
            rgba(51, 65, 85, 0.92) 100%
          );
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
          overflow-x: hidden;
        }

        /* Mobile Header */
        .mobile-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 60px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .menu-button {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          padding: 8px;
          color: #6366f1;
          cursor: pointer;
          transition: all 0.2s ease;
          touch-action: manipulation;
        }

        .menu-button:active {
          transform: scale(0.95);
          background: rgba(99, 102, 241, 0.2);
        }

        .header-title {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.025em;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notification-dot {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          position: absolute;
          top: 6px;
          right: 6px;
          border: 2px solid rgba(15, 23, 42, 0.95);
        }

        /* Main Content */
        .main-content {
          flex: 1;
          padding: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          position: relative;
        }

        /* Content wrapper with proper spacing */
        .content-wrapper {
          padding: 16px;
          padding-bottom: 90px; /* Space for bottom nav */
          min-height: calc(100vh - 60px);
        }

        /* Bottom Navigation */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          padding: 8px 0 max(8px, env(safe-area-inset-bottom));
          z-index: 50;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }

        .nav-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 4px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          position: relative;
          touch-action: manipulation;
          min-height: 60px;
          justify-content: center;
        }

        .nav-item.active {
          color: #6366f1;
        }

        .nav-item:active {
          transform: scale(0.95);
        }

        .nav-icon {
          width: 24px;
          height: 24px;
          stroke-width: 2;
          margin-bottom: 4px;
          transition: transform 0.2s ease;
        }

        .nav-item.active .nav-icon {
          transform: scale(1.1);
          color: #6366f1;
        }

        .nav-label {
          font-size: 11px;
          font-weight: 500;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 60px;
        }

        /* Active indicator */
        .nav-item.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 2px;
        }

        /* Drawer Overlay */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 100;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }

        .drawer-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        /* Slide-out Drawer */
        .drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100%;
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(20px);
          z-index: 101;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          padding: 20px;
          overflow-y: auto;
          border-right: 1px solid rgba(148, 163, 184, 0.1);
        }

        .drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .drawer-title {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
        }

        .close-button {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 8px;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-button:active {
          transform: scale(0.95);
        }

        /* All sections in drawer */
        .drawer-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .drawer-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 8px;
          border-radius: 8px;
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
        }

        .drawer-nav-item:hover {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
        }

        .drawer-nav-item.active {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .drawer-nav-icon {
          width: 20px;
          height: 20px;
          stroke-width: 2;
        }

        /* Responsive breakpoints */
        @media (min-width: 768px) {
          .admin-mobile-dashboard {
            flex-direction: row;
          }
          
          .mobile-header {
            display: none;
          }
          
          .bottom-nav {
            display: none;
          }
          
          .main-content {
            margin-left: 280px;
          }
          
          .content-wrapper {
            padding: 24px;
            padding-bottom: 24px;
          }
          
          .drawer {
            position: static;
            transform: translateX(0);
            height: 100vh;
            position: fixed;
          }
          
          .drawer-overlay {
            display: none;
          }
        }

        /* Touch improvements */
        * {
          -webkit-tap-highlight-color: transparent;
        }

        .nav-item, .menu-button, .close-button, .drawer-nav-item {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }

        /* iOS specific safe areas */
        @supports (padding: max(0px)) {
          .mobile-header {
            padding-top: max(12px, env(safe-area-inset-top));
          }
        }
      `}</style>

      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="header-left">
          <button 
            className="menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="header-title">
            {mobileNavItems.find(item => item.id === activeTab)?.label || 'Admin'}
          </h1>
        </div>
        <div className="header-right">
          <div style={{ position: 'relative' }}>
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#64748b' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a5.99 5.99 0 00-4.5-5.8 6 6 0 00-7 5.8v3L8 17h7z" />
            </svg>
            <div className="notification-dot"></div>
          </div>
        </div>
      </header>

      {/* Drawer Overlay */}
      <div 
        className={`drawer-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Slide-out Drawer */}
      <div className={`drawer ${sidebarOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">Yirra Admin</div>
          <button 
            className="close-button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="drawer-section">
          <div className="section-title">Dashboard</div>
          <button 
            className={`drawer-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Overview
          </button>
        </div>

        <div className="drawer-section">
          <div className="section-title">Product Management</div>
          <button 
            className={`drawer-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Products
          </button>
          <button 
            className={`drawer-nav-item ${activeTab === 'bom' ? 'active' : ''}`}
            onClick={() => { setActiveTab('bom'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            BOM Management
          </button>
          <button 
            className={`drawer-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => { setActiveTab('inventory'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Inventory
          </button>
          <button 
            className={`drawer-nav-item ${activeTab === 'stl-files' ? 'active' : ''}`}
            onClick={() => { setActiveTab('stl-files'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            STL Files
          </button>
        </div>

        <div className="drawer-section">
          <div className="section-title">Commerce</div>
          <button 
            className={`drawer-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Orders
          </button>
          <button 
            className={`drawer-nav-item ${activeTab === 'fulfillment' ? 'active' : ''}`}
            onClick={() => { setActiveTab('fulfillment'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            Fulfillment
          </button>
          <button 
            className={`drawer-nav-item ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => { setActiveTab('shipping'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Shipping
          </button>
          <button 
            className={`drawer-nav-item ${activeTab === 'returns' ? 'active' : ''}`}
            onClick={() => { setActiveTab('returns'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Returns
          </button>
          <button 
            className={`drawer-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('customers'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.5a2.25 2.25 0 00-2.25-2.25" />
            </svg>
            Customers
          </button>
        </div>

        <div className="drawer-section">
          <div className="section-title">Marketing</div>
          <button 
            className={`drawer-nav-item ${activeTab === 'newsletter' ? 'active' : ''}`}
            onClick={() => { setActiveTab('newsletter'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Newsletter
          </button>
          <button 
            className={`drawer-nav-item ${activeTab === 'marketing' ? 'active' : ''}`}
            onClick={() => { setActiveTab('marketing'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
            Marketing
          </button>
          <button 
            className={`drawer-nav-item ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => { setActiveTab('blog'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Blog
          </button>
        </div>

        <div className="drawer-section">
          <div className="section-title">Analytics</div>
          <button 
            className={`drawer-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reports'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Reports
          </button>
        </div>

        <div className="drawer-section">
          <div className="section-title">Support</div>
          <button 
            className={`drawer-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => { setActiveTab('chat'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat History
          </button>
        </div>

        <div className="drawer-section">
          <div className="section-title">Administration</div>
          <button 
            className={`drawer-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.5a2.25 2.25 0 00-2.25-2.25" />
            </svg>
            User Management
          </button>
        </div>

        <div className="drawer-section">
          <div className="section-title">Settings</div>
          <button 
            className={`drawer-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
          >
            <svg className="drawer-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
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
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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