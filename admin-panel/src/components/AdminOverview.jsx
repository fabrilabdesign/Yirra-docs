import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import EnhancedAnalyticsDashboard from './EnhancedAnalyticsDashboard';

const AdminOverview = ({ onNavigateToTab }) => {
    const { getToken } = useAuth();
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('today');

  const handleNavigate = (tabName) => {
    if (onNavigateToTab) {
      onNavigateToTab(tabName);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, [timeRange]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        setError('Please log in to view admin dashboard');
        return;
      }

      const response = await fetch(`/api/admin/overview?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOverviewData(data);
        setError(null);
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        throw new Error('Failed to fetch overview data');
      }
    } catch (err) {
      console.error('Overview fetch error:', err);
      setError('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      failed: '#ef4444',
      returned: '#f97316'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Loading overview...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!overviewData) {
    return <div className="no-data">No overview data available</div>;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Mobile Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Platform Overview</h2>
        <div className="flex gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={fetchOverviewData} 
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics - Mobile First Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-900/50 p-3 rounded-xl">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="bg-green-900/30 text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +{overviewData.revenue?.growthPercent || 0}%
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Revenue</h3>
          <div className="text-2xl font-bold text-white mb-1">{formatCurrency(overviewData.revenue?.total || 0)}</div>
          <div className="text-sm text-gray-300">
            {formatCurrency(overviewData.revenue?.thisMonth || 0)} this month
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-900/50 p-3 rounded-xl">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="bg-orange-900/30 text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
              {overviewData.orders?.pending || 0} pending
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Orders</h3>
          <div className="text-2xl font-bold text-white mb-1">{formatNumber(overviewData.orders?.total || 0)}</div>
          <div className="text-sm text-gray-300">
            {formatNumber(overviewData.orders?.todayCount || 0)} today
          </div>
        </div>

        {/* Fulfillment Card */}
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-900/50 p-3 rounded-xl">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div className="bg-red-900/30 text-red-300 px-3 py-1 rounded-full text-sm font-medium">
              {overviewData.fulfillment?.awaitingShipment || 0} to ship
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Orders Shipped</h3>
          <div className="text-2xl font-bold text-white mb-1">{formatNumber(overviewData.fulfillment?.shipped || 0)}</div>
          <div className="text-sm text-gray-300">
            {formatNumber(overviewData.fulfillment?.inTransit || 0)} in transit
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-900/50 p-3 rounded-xl">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="bg-green-900/30 text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +{overviewData.customers?.growthPercent || 0}%
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Customers</h3>
          <div className="text-2xl font-bold text-white mb-1">{formatNumber(overviewData.customers?.total || 0)}</div>
          <div className="text-sm text-gray-300">
            {formatNumber(overviewData.customers?.newThisMonth || 0)} new this month
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="metrics-grid secondary">
        <div className="metric-card-small inventory">
          <div className="metric-icon-small">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div className="metric-small-content">
            <h4>Low Stock Items</h4>
            <div className="metric-small-value">{overviewData.inventory?.lowStock || 0}</div>
          </div>
        </div>

        <div className="metric-card-small returns">
          <div className="metric-icon-small">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
          </div>
          <div className="metric-small-content">
            <h4>Active Returns</h4>
            <div className="metric-small-value">{overviewData.returns?.active || 0}</div>
          </div>
        </div>

        <div className="metric-card-small downloads">
          <div className="metric-icon-small">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="metric-small-content">
            <h4>STL Downloads</h4>
            <div className="metric-small-value">{formatNumber(overviewData.downloads?.total || 0)}</div>
          </div>
        </div>

        <div className="metric-card-small newsletter">
          <div className="metric-icon-small">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="metric-small-content">
            <h4>Newsletter Subs</h4>
            <div className="metric-small-value">{formatNumber(overviewData.newsletter?.subscribers || 0)}</div>
          </div>
        </div>
      </div>

      {/* Status Overview & Charts */}
      <div className="overview-grid">
        {/* Order Status Distribution */}
        <div className="overview-section">
          <h3>Order Status Distribution</h3>
          <div className="status-chart">
            {overviewData.orderStatuses?.map((status, index) => (
              <div key={index} className="status-bar">
                <div className="status-info">
                  <span className="status-label">{status.status}</span>
                  <span className="status-count">{status.count}</span>
                </div>
                <div className="status-progress">
                  <div 
                    className="status-fill"
                    style={{
                      width: `${(status.count / overviewData.orders?.total) * 100}%`,
                      backgroundColor: getStatusColor(status.status)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="overview-section">
          <h3>Recent Activity</h3>
          <div className="activity-feed">
            {overviewData.recentActivity?.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'order' && '🛒'}
                  {activity.type === 'shipment' && '📦'}
                  {activity.type === 'return' && '↩️'}
                  {activity.type === 'user' && '👤'}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-meta">
                    {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Center */}
      <div className="action-center">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button className="action-card" onClick={() => handleNavigate('products')}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span>Add Product</span>
          </button>
          
          <button className="action-card" onClick={() => handleNavigate('orders')}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span>Process Orders</span>
          </button>
          
          <button className="action-card" onClick={() => handleNavigate('stl-files')}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span>Upload STL</span>
          </button>
          
          <button className="action-card" onClick={() => handleNavigate('reports')}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span>View Reports</span>
          </button>
          
          <button className="action-card" onClick={() => handleNavigate('inventory')}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <span>Check Inventory</span>
          </button>
          
          <button className="action-card" onClick={() => handleNavigate('newsletter')}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span>Send Newsletter</span>
          </button>
        </div>
      </div>

      {/* Enhanced Analytics Section */}
      <div className="analytics-section">
        <h3>Enhanced Analytics & IP Protection</h3>
        <div className="analytics-container">
          <EnhancedAnalyticsDashboard />
        </div>
      </div>

      <style jsx>{`
        .admin-overview {
          padding: 0;
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .overview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 36px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.2);
        }

        .overview-header h2 {
          margin: 0;
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .overview-header h2::before {
          content: '';
          width: 4px;
          height: 28px;
          background: linear-gradient(180deg, #00d4ff 0%, #0099cc 100%);
          border-radius: 2px;
          box-shadow: 0 0 12px rgba(0, 212, 255, 0.5);
        }

        .header-controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .time-range-select {
          padding: 10px 16px;
          background: rgba(15, 20, 25, 0.8);
          border: 1px solid rgba(56, 68, 82, 0.5);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          min-width: 140px;
        }

        .time-range-select:hover {
          background: rgba(15, 20, 25, 0.95);
          border-color: rgba(0, 212, 255, 0.3);
          box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.1);
        }

        .time-range-select:focus {
          outline: none;
          border-color: rgba(0, 212, 255, 0.5);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
          color: #0a0e1a;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .refresh-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.3s ease, height 0.3s ease;
        }

        .refresh-btn:hover::before {
          width: 100px;
          height: 100px;
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
        }

        .refresh-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
        }

        .refresh-btn svg {
          width: 16px;
          height: 16px;
          animation: spin 2s linear infinite paused;
        }

        .refresh-btn:hover svg {
          animation-play-state: running;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 36px;
        }

        .metrics-grid.primary {
          margin-bottom: 24px;
        }

        .metrics-grid.secondary {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 36px;
        }

        .metric-card {
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
          padding: 28px;
          border-radius: 12px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.5) 50%, transparent 100%);
          transform: translateX(-100%);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .metric-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 212, 255, 0.3);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3),
                      0 2px 16px rgba(0, 212, 255, 0.2);
        }

        .metric-card.revenue .metric-icon {
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%);
        }

        .metric-card.revenue .metric-icon svg {
          color: #34d399;
        }

        .metric-card.orders .metric-icon {
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
        }

        .metric-card.orders .metric-icon svg {
          color: #60a5fa;
        }

        .metric-card.fulfillment .metric-icon {
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
        }

        .metric-card.fulfillment .metric-icon svg {
          color: #a78bfa;
        }

        .metric-card.customers .metric-icon {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
        }

        .metric-card.customers .metric-icon svg {
          color: #fbbf24;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .metric-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .metric-icon::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 12px;
          padding: 1px;
          background: linear-gradient(135deg, transparent 30%, currentColor 50%, transparent 70%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.5;
          animation: rotate 4s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .metric-icon svg {
          width: 28px;
          height: 28px;
          stroke-width: 1.5;
          filter: drop-shadow(0 0 8px currentColor);
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 16px;
          background: rgba(0, 0, 0, 0.2);
        }

        .metric-trend.positive {
          color: #34d399;
          background: rgba(52, 211, 153, 0.1);
        }

        .metric-trend.negative {
          color: #f87171;
          background: rgba(248, 113, 113, 0.1);
        }

        .metric-trend svg {
          width: 16px;
          height: 16px;
        }

        .metric-badge {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0a0e1a;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
          animation: badgeBounce 3s ease-in-out infinite;
        }

        @keyframes badgeBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        .metric-badge.warning {
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(248, 113, 113, 0.3);
        }

        .metric-content h3 {
          margin: 0 0 10px 0;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-value {
          font-size: 36px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 6px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }

        .metric-subtitle {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .metric-card-small {
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
          padding: 24px;
          border-radius: 10px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          gap: 18px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .metric-card-small:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 212, 255, 0.3);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .metric-icon-small {
          width: 42px;
          height: 42px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .metric-card-small:hover .metric-icon-small {
          background: rgba(0, 212, 255, 0.15);
          border-color: rgba(0, 212, 255, 0.3);
          transform: rotate(5deg) scale(1.05);
        }

        .metric-icon-small svg {
          width: 22px;
          height: 22px;
          color: #00d4ff;
          stroke-width: 1.5;
        }

        .metric-small-content h4 {
          margin: 0 0 4px 0;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-small-value {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 36px;
        }

        .overview-section {
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
          border-radius: 12px;
          padding: 28px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .overview-section:hover {
          border-color: rgba(56, 68, 82, 0.5);
        }

        .overview-section h3 {
          margin: 0 0 24px 0;
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .overview-section h3::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(56, 68, 82, 0.5) 0%, transparent 100%);
        }

        .status-bar {
          margin-bottom: 20px;
          animation: slideIn 0.6s ease-out;
          animation-fill-mode: both;
        }

        .status-bar:nth-child(1) { animation-delay: 0.1s; }
        .status-bar:nth-child(2) { animation-delay: 0.2s; }
        .status-bar:nth-child(3) { animation-delay: 0.3s; }
        .status-bar:nth-child(4) { animation-delay: 0.4s; }
        .status-bar:nth-child(5) { animation-delay: 0.5s; }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .status-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .status-label {
          color: #94a3b8;
          text-transform: capitalize;
          font-weight: 500;
        }

        .status-count {
          color: #ffffff;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .status-progress {
          height: 10px;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 5px;
          overflow: hidden;
          position: relative;
        }

        .status-progress::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
          transform: translateX(-100%);
          animation: progressShimmer 2s ease-in-out infinite;
        }

        @keyframes progressShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .status-fill {
          height: 100%;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 5px;
          position: relative;
          background-image: linear-gradient(90deg, currentColor 0%, currentColor 100%);
          box-shadow: 0 0 10px currentColor;
        }

        .activity-feed {
          max-height: 320px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(56, 68, 82, 0.5) transparent;
        }

        .activity-feed::-webkit-scrollbar {
          width: 6px;
        }

        .activity-feed::-webkit-scrollbar-track {
          background: transparent;
        }

        .activity-feed::-webkit-scrollbar-thumb {
          background: rgba(56, 68, 82, 0.5);
          border-radius: 3px;
        }

        .activity-item {
          display: flex;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(56, 68, 82, 0.2);
          transition: all 0.2s ease;
        }

        .activity-item:hover {
          padding-left: 8px;
          background: rgba(0, 212, 255, 0.03);
          margin: 0 -8px;
          padding-right: 8px;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 36px;
          height: 36px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .activity-icon.order {
          background: rgba(96, 165, 250, 0.1);
          border-color: rgba(96, 165, 250, 0.2);
        }

        .activity-icon.shipment {
          background: rgba(167, 139, 250, 0.1);
          border-color: rgba(167, 139, 250, 0.2);
        }

        .activity-icon.return {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.2);
        }

        .activity-icon.user {
          background: rgba(52, 211, 153, 0.1);
          border-color: rgba(52, 211, 153, 0.2);
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-title {
          font-size: 14px;
          color: #ffffff;
          margin-bottom: 4px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .activity-meta {
          font-size: 12px;
          color: #64748b;
        }

        .action-center {
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
          border-radius: 12px;
          padding: 28px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(10px);
        }

        .action-center h3 {
          margin: 0 0 24px 0;
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px;
          background: rgba(30, 41, 59, 0.3);
          border: 1px solid rgba(56, 68, 82, 0.3);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          position: relative;
          overflow: hidden;
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%);
          transition: width 0.3s ease, height 0.3s ease;
          transform: translate(-50%, -50%);
        }

        .action-card:hover::before {
          width: 120px;
          height: 120px;
        }

        .action-card:hover {
          transform: translateY(-4px) scale(1.02);
          border-color: rgba(0, 212, 255, 0.4);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(0, 212, 255, 0.2);
        }

        .action-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .action-icon svg {
          width: 24px;
          height: 24px;
          color: #00d4ff;
          stroke-width: 1.5;
          transition: transform 0.3s ease;
        }

        .action-card:hover .action-icon svg {
          transform: scale(1.1) rotate(5deg);
          filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.6));
        }

        .loading, .error, .no-data {
          text-align: center;
          padding: 80px 20px;
          color: #94a3b8;
          font-size: 16px;
          font-weight: 500;
        }

        .error {
          color: #f87171;
        }

        @media (max-width: 1024px) {
          .overview-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .overview-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .header-controls {
            width: 100%;
            flex-direction: column;
            gap: 12px;
          }

          .time-range-select,
          .refresh-btn {
            width: 100%;
          }

          .metric-value {
            font-size: 28px;
          }

          .action-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Enhanced Analytics Section */
        .analytics-section {
          margin-top: 48px;
          padding: 32px;
          background: rgba(30, 41, 59, 0.4);
          border-radius: 24px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(20px);
        }

        .analytics-section h3 {
          margin: 0 0 24px 0;
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .analytics-section h3::before {
          content: '';
          width: 4px;
          height: 24px;
          background: linear-gradient(135deg, #00f2fe, #4facfe);
          border-radius: 2px;
          margin-right: 8px;
        }

        .analytics-container {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 16px;
          border: 1px solid rgba(56, 68, 82, 0.2);
          overflow: hidden;
        }

        /* Performance optimizations */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOverview;