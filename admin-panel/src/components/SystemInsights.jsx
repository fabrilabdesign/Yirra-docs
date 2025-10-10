import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const SystemInsights = ({ stats, realTimeData }) => {
  const { getToken } = useAuth();
  const [insights, setInsights] = useState({
    performance: {},
    business: {},
    user: {},
    technical: {}
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemInsights();
  }, [timeRange]);

  const fetchSystemInsights = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/admin/insights?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Failed to fetch system insights:', error);
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

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const getHealthScore = () => {
    const scores = [
      insights.performance?.responseTime <= 200 ? 25 : insights.performance?.responseTime <= 500 ? 15 : 5,
      insights.performance?.uptime >= 99.9 ? 25 : insights.performance?.uptime >= 99 ? 15 : 5,
      insights.technical?.errorRate <= 0.1 ? 25 : insights.technical?.errorRate <= 1 ? 15 : 5,
      realTimeData?.systemHealth === 'optimal' ? 25 : realTimeData?.systemHealth === 'warning' ? 15 : 5
    ];
    return scores.reduce((sum, score) => sum + score, 0);
  };

  const getHealthColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    if (score >= 50) return '#ef4444';
    return '#dc2626';
  };

  if (loading && !stats) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading system insights...</div>
      </div>
    );
  }

  const healthScore = getHealthScore();

  return (
    <div className="system-insights">
      {/* Header Controls */}
      <div className="insights-header">
        <div className="header-left">
          <h2>System Insights Dashboard</h2>
          <p>Comprehensive analytics and performance monitoring</p>
        </div>
        <div className="header-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="health-overview">
        <div className="health-score-card">
          <div className="health-circle">
            <svg className="health-chart" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={getHealthColor(healthScore)}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${healthScore * 2.83} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="health-content">
              <div className="health-score" style={{ color: getHealthColor(healthScore) }}>
                {healthScore}
              </div>
              <div className="health-label">Health Score</div>
            </div>
          </div>
          <div className="health-details">
            <div className="health-item">
              <span className="health-metric">Uptime</span>
              <span className="health-value">{formatPercentage(insights.performance?.uptime || 99.9)}</span>
            </div>
            <div className="health-item">
              <span className="health-metric">Response Time</span>
              <span className="health-value">{insights.performance?.responseTime || 0}ms</span>
            </div>
            <div className="health-item">
              <span className="health-metric">Error Rate</span>
              <span className="health-value">{formatPercentage(insights.technical?.errorRate || 0)}</span>
            </div>
            <div className="health-item">
              <span className="health-metric">Active Users</span>
              <span className="health-value">{realTimeData?.activeUsers || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <div className="kpi-value">{formatCurrency(insights.business?.revenue)}</div>
            <div className="kpi-label">Revenue ({timeRange})</div>
            <div className="kpi-trend positive">
              +{formatPercentage(insights.business?.revenueGrowth || 0)} vs previous period
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <div className="kpi-value">{insights.user?.totalUsers || 0}</div>
            <div className="kpi-label">Total Users</div>
            <div className="kpi-trend positive">
              +{insights.user?.newUsers || 0} new users
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">📦</div>
          <div className="kpi-content">
            <div className="kpi-value">{insights.business?.orders || 0}</div>
            <div className="kpi-label">Orders ({timeRange})</div>
            <div className="kpi-trend positive">
              {formatCurrency(insights.business?.avgOrderValue || 0)} avg value
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <div className="kpi-value">{formatPercentage(insights.user?.engagement || 0)}</div>
            <div className="kpi-label">User Engagement</div>
            <div className="kpi-trend">
              {insights.user?.avgSessionTime || 0}min avg session
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Grid */}
      <div className="analytics-grid">
        {/* Performance Metrics */}
        <div className="analytics-card">
          <h3>Performance Metrics</h3>
          <div className="metrics-list">
            <div className="metric-row">
              <span className="metric-name">Server Response Time</span>
              <span className="metric-value">{insights.performance?.responseTime || 0}ms</span>
              <div className="metric-bar">
                <div 
                  className="metric-fill good"
                  style={{ width: `${Math.min((insights.performance?.responseTime || 0) / 1000 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="metric-row">
              <span className="metric-name">Database Query Time</span>
              <span className="metric-value">{insights.performance?.dbQueryTime || 0}ms</span>
              <div className="metric-bar">
                <div 
                  className="metric-fill warning"
                  style={{ width: `${Math.min((insights.performance?.dbQueryTime || 0) / 100 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="metric-row">
              <span className="metric-name">Memory Usage</span>
              <span className="metric-value">{formatPercentage(insights.technical?.memoryUsage || 0)}</span>
              <div className="metric-bar">
                <div 
                  className="metric-fill critical"
                  style={{ width: `${insights.technical?.memoryUsage || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="metric-row">
              <span className="metric-name">CPU Usage</span>
              <span className="metric-value">{formatPercentage(insights.technical?.cpuUsage || 0)}</span>
              <div className="metric-bar">
                <div 
                  className="metric-fill good"
                  style={{ width: `${insights.technical?.cpuUsage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* User Behavior */}
        <div className="analytics-card">
          <h3>User Behavior</h3>
          <div className="behavior-stats">
            <div className="behavior-item">
              <div className="behavior-icon">🔄</div>
              <div className="behavior-content">
                <div className="behavior-value">{formatPercentage(insights.user?.returnRate || 0)}</div>
                <div className="behavior-label">Return Rate</div>
              </div>
            </div>
            
            <div className="behavior-item">
              <div className="behavior-icon">⏱️</div>
              <div className="behavior-content">
                <div className="behavior-value">{insights.user?.avgSessionTime || 0}min</div>
                <div className="behavior-label">Avg Session</div>
              </div>
            </div>
            
            <div className="behavior-item">
              <div className="behavior-icon">📱</div>
              <div className="behavior-content">
                <div className="behavior-value">{formatPercentage(insights.user?.mobileUsers || 0)}</div>
                <div className="behavior-label">Mobile Users</div>
              </div>
            </div>
            
            <div className="behavior-item">
              <div className="behavior-icon">🛒</div>
              <div className="behavior-content">
                <div className="behavior-value">{formatPercentage(insights.business?.conversionRate || 0)}</div>
                <div className="behavior-label">Conversion Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="analytics-card">
          <h3>Top Performing Products</h3>
          <div className="products-list">
            {insights.business?.topProducts?.map((product, index) => (
              <div key={index} className="product-item">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-stats">
                    {product.sales} sales • {formatCurrency(product.revenue)}
                  </div>
                </div>
                <div className="product-trend">
                  +{formatPercentage(product.growth || 0)}
                </div>
              </div>
            )) || (
              <div className="no-data">No product data available</div>
            )}
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="analytics-card">
          <h3>Activity Summary</h3>
          <div className="activity-summary">
            <div className="summary-item">
              <div className="summary-icon">🔑</div>
              <div className="summary-content">
                <div className="summary-value">{insights.user?.logins || 0}</div>
                <div className="summary-label">User Logins</div>
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-icon">📥</div>
              <div className="summary-content">
                <div className="summary-value">{insights.business?.downloads || 0}</div>
                <div className="summary-label">Downloads</div>
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-icon">💳</div>
              <div className="summary-content">
                <div className="summary-value">{insights.business?.transactions || 0}</div>
                <div className="summary-label">Transactions</div>
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-icon">🔧</div>
              <div className="summary-content">
                <div className="summary-value">{insights.technical?.apiCalls || 0}</div>
                <div className="summary-label">API Calls</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .system-insights {
          padding: 0;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top: 3px solid #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .insights-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-left h2 {
          margin: 0;
          color: #ffffff;
          font-size: 1.5rem;
        }

        .header-left p {
          margin: 0.5rem 0 0 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
        }

        .time-range-select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #ffffff;
          font-size: 0.875rem;
        }

        .health-overview {
          margin-bottom: 2rem;
        }

        .health-score-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .health-circle {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .health-chart {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .health-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .health-score {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .health-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .health-details {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .health-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .health-metric {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }

        .health-value {
          color: #ffffff;
          font-weight: 600;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .kpi-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .kpi-icon {
          font-size: 2.5rem;
          opacity: 0.8;
        }

        .kpi-content {
          flex: 1;
        }

        .kpi-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .kpi-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.5rem;
        }

        .kpi-trend {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
          display: inline-block;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .analytics-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .analytics-card h3 {
          margin: 0 0 1rem 0;
          color: #ffffff;
          font-size: 1.125rem;
        }

        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .metric-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .metric-name {
          flex: 1;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }

        .metric-value {
          color: #ffffff;
          font-weight: 600;
          min-width: 60px;
          text-align: right;
        }

        .metric-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .metric-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .metric-fill.good { background: #10b981; }
        .metric-fill.warning { background: #f59e0b; }
        .metric-fill.critical { background: #ef4444; }

        .behavior-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .behavior-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .behavior-icon {
          font-size: 1.5rem;
          opacity: 0.8;
        }

        .behavior-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .behavior-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .product-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .product-rank {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          color: #ffffff;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .product-stats {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .product-trend {
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 600;
        }

        .activity-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .summary-icon {
          font-size: 1.5rem;
          opacity: 0.8;
        }

        .summary-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .summary-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .no-data {
          text-align: center;
          padding: 2rem;
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
        }

        @media (max-width: 1024px) {
          .insights-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .health-score-card {
            flex-direction: column;
            text-align: center;
          }

          .health-details {
            grid-template-columns: 1fr;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .behavior-stats, .activity-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SystemInsights;