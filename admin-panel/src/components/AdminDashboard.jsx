import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import AdminUserManagement from './AdminUserManagement';
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminSTLFiles from './AdminSTLFiles';
import AdminSettings from './AdminSettings';
import AdminNewsletter from './AdminNewsletter';
import AdminMarketing from './AdminMarketing';
import AdminBlog from './AdminBlog';
import AdminOrderFulfillment from './AdminOrderFulfillment';
import AdminInventory from './AdminInventory';
import AdminCustomers from './AdminCustomers';
import AdminShipping from './AdminShipping';
import AdminReturns from './AdminReturns';
import AdminReports from './AdminReports';
import AdminBOM from './AdminBOM';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [groupBy, setGroupBy] = useState('day');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const { getToken } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      return saved === 'true';
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('adminSidebarCollapsed', sidebarCollapsed ? 'true' : 'false');
    } catch (_) {}
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
    fetchNotifications();
  }, [timeframe, groupBy, activeTab]);

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(getApiUrl('/api/admin/notifications'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        redirect: 'manual' // Don't follow redirects automatically
      });
      
      // Handle redirects as authentication errors
      if (response.type === 'opaqueredirect' || response.status === 302) {
        console.log('Authentication required - user not logged in or token expired');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to fetch notifications. Please try again later.');
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        setError('Please log in to view admin dashboard');
        return;
      }

      const response = await fetch(`/api/analytics/downloads?timeframe=${timeframe}&groupBy=${groupBy}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        setError(null);
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const formatDuration = (ms) => {
    if (!ms) return '0ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const renderTabContent = () => {
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
      case 'analytics':
        return renderAnalyticsContent();
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
    }
  };

  const renderAnalyticsContent = () => {
    if (loading) {
      return <div className="loading">Loading admin analytics...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    if (!analytics) {
      return <div className="no-data">No analytics data available</div>;
    }

    return (
      <>
        <div className="analytics-controls">
          <div className="control-group">
            <label>Time Period:</label>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="control-group">
            <label>Group By:</label>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>

        <div className="metrics-overview">
          <div className="metric-card">
            <h3>Total Downloads</h3>
            <div className="metric-value">
              {formatNumber(analytics.downloadTrends.reduce((sum, trend) => sum + parseInt(trend.total_downloads), 0))}
            </div>
          </div>
          <div className="metric-card">
            <h3>Unique Users</h3>
            <div className="metric-value">
              {formatNumber(analytics.userEngagement.total_active_users)}
            </div>
          </div>
          <div className="metric-card">
            <h3>Avg Downloads/User</h3>
            <div className="metric-value">
              {parseFloat(analytics.userEngagement.avg_downloads_per_user || 0).toFixed(1)}
            </div>
          </div>
          <div className="metric-card">
            <h3>Success Rate</h3>
            <div className="metric-value">
              {analytics.downloadTrends.length > 0 ? 
                (analytics.downloadTrends.reduce((sum, trend) => sum + parseInt(trend.successful_downloads), 0) / 
                 analytics.downloadTrends.reduce((sum, trend) => sum + parseInt(trend.total_downloads), 0) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Download Trends Chart */}
          <div className="analytics-section">
            <h2>Download Trends</h2>
            <div className="trends-chart">
              {analytics.downloadTrends.length > 0 ? (
                <div className="trend-timeline">
                  {analytics.downloadTrends.map((trend, index) => (
                    <div key={index} className="trend-item">
                      <div className="trend-date">
                        {new Date(trend.period).toLocaleDateString()}
                      </div>
                      <div className="trend-metrics">
                        <div className="trend-metric">
                          <span className="metric-label">Downloads:</span>
                          <span className="metric-value">{formatNumber(trend.total_downloads)}</span>
                        </div>
                        <div className="trend-metric">
                          <span className="metric-label">Users:</span>
                          <span className="metric-value">{formatNumber(trend.unique_users)}</span>
                        </div>
                        <div className="trend-metric">
                          <span className="metric-label">Avg Duration:</span>
                          <span className="metric-value">{formatDuration(trend.avg_duration_ms)}</span>
                        </div>
                        <div className="trend-metric">
                          <span className="metric-label">Success:</span>
                          <span className="metric-value success">{formatNumber(trend.successful_downloads)}</span>
                        </div>
                        <div className="trend-metric">
                          <span className="metric-label">Failed:</span>
                          <span className="metric-value failed">{formatNumber(trend.failed_downloads)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No trend data available</div>
              )}
            </div>
          </div>

          {/* Popular Files */}
          <div className="analytics-section">
            <h2>Most Popular Files</h2>
            <div className="popular-files">
              {analytics.popularFiles.length > 0 ? (
                analytics.popularFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-rank">#{index + 1}</div>
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-category">{file.category}</div>
                    </div>
                    <div className="file-stats">
                      <div className="stat">
                        <span className="stat-value">{formatNumber(file.download_count)}</span>
                        <span className="stat-label">Downloads</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{formatNumber(file.unique_downloaders)}</span>
                        <span className="stat-label">Users</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{formatDuration(file.avg_download_time)}</span>
                        <span className="stat-label">Avg Time</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No file data available</div>
              )}
            </div>
          </div>

          {/* Device Analytics */}
          <div className="analytics-section">
            <h2>Device Analytics</h2>
            <div className="device-stats">
              {analytics.deviceStats.length > 0 ? (
                analytics.deviceStats.map((device, index) => (
                  <div key={index} className="device-item">
                    <div className="device-type">{device.device_type}</div>
                    <div className="device-metrics">
                      <div className="device-metric">
                        <span className="metric-label">Downloads:</span>
                        <span className="metric-value">{formatNumber(device.downloads)}</span>
                      </div>
                      <div className="device-metric">
                        <span className="metric-label">Users:</span>
                        <span className="metric-value">{formatNumber(device.unique_users)}</span>
                      </div>
                      <div className="device-metric">
                        <span className="metric-label">Avg Duration:</span>
                        <span className="metric-value">{formatDuration(device.avg_duration)}</span>
                      </div>
                    </div>
                    <div className="device-bar">
                      <div 
                        className="device-fill"
                        style={{
                          width: `${(device.downloads / Math.max(...analytics.deviceStats.map(d => d.downloads))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No device data available</div>
              )}
            </div>
          </div>

          {/* Browser Analytics */}
          <div className="analytics-section">
            <h2>Browser Analytics</h2>
            <div className="browser-stats">
              {analytics.browserStats.length > 0 ? (
                analytics.browserStats.map((browser, index) => (
                  <div key={index} className="browser-item">
                    <div className="browser-name">{browser.browser_name}</div>
                    <div className="browser-metrics">
                      <span className="downloads">{formatNumber(browser.downloads)} downloads</span>
                      <span className="users">{formatNumber(browser.unique_users)} users</span>
                    </div>
                    <div className="browser-bar">
                      <div 
                        className="browser-fill"
                        style={{
                          width: `${(browser.downloads / Math.max(...analytics.browserStats.map(b => b.downloads))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No browser data available</div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span className="logo-text">Yirra Admin</span>
          </div>
          
          <div className="header-actions">
            {/* Notification Badge */}
            {notifications.length > 0 && (
              <div className="notification-badge">
                {notifications.length}
              </div>
            )}
            
            {/* Minimize/Close Button */}
            <button 
              className="minimize-btn"
              onClick={() => setSidebarCollapsed(prev => !prev)}
              title="Toggle Sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Overview</span>
          </button>
          
          <div className="nav-section">
            <div className="nav-section-title">Commerce</div>
            
            <button 
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Products</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Orders</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'fulfillment' ? 'active' : ''}`}
              onClick={() => setActiveTab('fulfillment')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <span>Fulfillment</span>
              {notifications.filter(n => n.type === 'fulfillment').length > 0 && (
                <span className="nav-badge">{notifications.filter(n => n.type === 'fulfillment').length}</span>
              )}
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>Inventory</span>
              {notifications.filter(n => n.type === 'inventory').length > 0 && (
                <span className="nav-badge warning">{notifications.filter(n => n.type === 'inventory').length}</span>
              )}
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'bom' ? 'active' : ''}`}
              onClick={() => setActiveTab('bom')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>BOM</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Shipping</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'returns' ? 'active' : ''}`}
              onClick={() => setActiveTab('returns')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
              <span>Returns</span>
              {notifications.filter(n => n.type === 'returns').length > 0 && (
                <span className="nav-badge">{notifications.filter(n => n.type === 'returns').length}</span>
              )}
            </button>
          </div>
          
          <div className="nav-section">
            <div className="nav-section-title">Content</div>
            
            <button 
              className={`nav-item ${activeTab === 'stl-files' ? 'active' : ''}`}
              onClick={() => setActiveTab('stl-files')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>STL Files</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'newsletter' ? 'active' : ''}`}
              onClick={() => setActiveTab('newsletter')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Newsletter</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'marketing' ? 'active' : ''}`}
              onClick={() => setActiveTab('marketing')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span>Marketing</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'blog' ? 'active' : ''}`}
              onClick={() => setActiveTab('blog')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Blog</span>
            </button>
          </div>
          
          <div className="nav-section">
            <div className="nav-section-title">Management</div>
            
            <button 
              className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Customers</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Admin Users</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Analytics</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Reports</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </nav>
        
        {/* User Info */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="user-details">
              <div className="user-name">Admin User</div>
              <div className="user-role">Super Admin</div>
            </div>
          </div>
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-wrapper">
          {renderTabContent()}
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          display: flex;
          min-height: 100vh;
          background: #0a0e1a;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', system-ui, sans-serif;
          font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #0f1419 0%, #0a0e1a 100%);
          border-right: 1px solid rgba(56, 68, 82, 0.4);
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
          transition: width 0.2s ease;
        }

        .sidebar.collapsed {
          width: 72px;
        }

        .sidebar-header {
          padding: 28px 24px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.3);
          position: relative;
          background: rgba(15, 20, 25, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .minimize-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 8px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .minimize-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          color: #ffffff;
          transform: scale(1.05);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          color: #00d4ff;
          filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.5));
          animation: logoGlow 3s ease-in-out infinite;
        }

        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.5)); }
          50% { filter: drop-shadow(0 0 30px rgba(0, 212, 255, 0.8)); }
        }

        .logo-text {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 0%, #a8b3c0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-nav {
          padding: 12px 0;
          overflow-y: auto;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: rgba(56, 68, 82, 0.5) transparent;
        }

        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(56, 68, 82, 0.5);
          border-radius: 3px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 68, 82, 0.7);
        }

        .nav-section {
          margin-top: 32px;
        }

        .nav-section:first-child {
          margin-top: 8px;
        }

        .nav-section-title {
          font-size: 11px;
          font-weight: 700;
          color: #6b7685;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 0 24px 12px;
          user-select: none;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 11px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #a8b3c0;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 3px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.1) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .nav-item:hover::before {
          transform: translateX(100%);
        }

        .nav-item:hover {
          background: rgba(0, 212, 255, 0.05);
          color: #ffffff;
          padding-left: 28px;
        }

        .nav-item.active {
          background: linear-gradient(90deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%);
          color: #00d4ff;
          border-left-color: #00d4ff;
          font-weight: 600;
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          background: #00d4ff;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          stroke-width: 1.75;
          transition: transform 0.2s ease;
        }

        .nav-item:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-item.active .nav-icon {
          filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.6));
        }

        .nav-badge {
          margin-left: auto;
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
          color: #0a0e1a;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 12px;
          min-width: 22px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 212, 255, 0.4);
          animation: badgePulse 2s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(0, 212, 255, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 2px 12px rgba(0, 212, 255, 0.6); }
        }

        .nav-badge.warning {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
        }

        .notification-badge {
          position: absolute;
          top: 24px;
          right: 24px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 12px;
          min-width: 24px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(255, 82, 82, 0.6);
          animation: notificationPulse 2s ease-in-out infinite;
        }

        @keyframes notificationPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(2deg); }
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(56, 68, 82, 0.3);
          background: rgba(10, 14, 26, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #1a2332 0%, #2a3442 100%);
          border: 2px solid rgba(0, 212, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .user-avatar::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #00d4ff, #0099cc, #00d4ff);
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
          animation: avatarRotate 3s linear infinite;
        }

        @keyframes avatarRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .user-info:hover .user-avatar::before {
          opacity: 1;
        }

        .user-avatar svg {
          width: 22px;
          height: 22px;
          color: #a8b3c0;
          z-index: 1;
          position: relative;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .user-role {
          font-size: 12px;
          color: #6b7685;
          font-weight: 500;
        }

        .logout-btn {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.2);
          border-radius: 8px;
          cursor: pointer;
          padding: 10px;
          color: #ff6b6b;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .logout-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 107, 107, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.3s ease, height 0.3s ease;
        }

        .logout-btn:hover::before {
          width: 40px;
          height: 40px;
        }

        .logout-btn:hover {
          background: rgba(255, 107, 107, 0.15);
          border-color: rgba(255, 107, 107, 0.4);
          transform: scale(1.05);
        }

        .logout-btn svg {
          width: 18px;
          height: 18px;
          position: relative;
          z-index: 1;
        }

        .main-content {
          margin-left: 280px;
          flex: 1;
          min-height: 100vh;
          background: #0a0e1a;
          position: relative;
          transition: margin-left 0.2s ease;
        }

        /* Adjust main content when sidebar collapsed */
        .sidebar.collapsed + .main-content {
          margin-left: 72px;
        }

        .content-wrapper {
          padding: 36px 48px;
          max-width: 1600px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .sidebar {
            width: 260px;
          }

          .main-content {
            margin-left: 260px;
          }

          .content-wrapper {
            padding: 32px 32px;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
            border-right: none;
            border-bottom: 1px solid rgba(56, 68, 82, 0.4);
          }

          .main-content {
            margin-left: 0;
          }

          .main-content::before {
            left: 0;
          }

          .content-wrapper {
            padding: 24px 20px;
          }

          .nav-section {
            margin-top: 20px;
          }

          .nav-item {
            padding: 10px 20px;
          }
        }

        /* High DPI Support */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .sidebar {
            border-right-width: 0.5px;
          }
          
          .nav-item {
            border-left-width: 2px;
          }
        }

        /* Dark mode color adjustments for better contrast */
        @media (prefers-color-scheme: dark) {
          .admin-dashboard {
            color-scheme: dark;
          }
        }

        /* Smooth transitions for theme changes */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;