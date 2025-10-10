import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import getApiUrl from '../utils/api.js';

const AdminReports = () => {
  const { getToken } = useAuth();
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [activeReport, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      if (activeReport === 'sales') {
        const url = `/api/admin/reports/sales?groupBy=${encodeURIComponent(dateRange === '90d' ? 'week' : 'day')}`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Map simple backend payload to UI structure
          const mapped = {
            summary: {
              totalRevenue: (data.trends || []).reduce((s, r) => s + Number(r.revenue || 0), 0),
              totalOrders: (data.trends || []).reduce((s, r) => s + Number(r.orders || 0), 0),
              averageOrderValue: 0,
              conversionRate: 0
            },
            trends: (data.trends || []).map(t => ({ date: t.period, revenue: Number(t.revenue || 0), orders: Number(t.orders || 0) })),
            topProducts: []
          };
          setReportData(mapped);
          setError(null);
          return;
        }
      }

      // Fallback to mock if not supported
      setReportData(getMockReportData(activeReport));
      setError(null);
    } catch (err) {
      console.error('Report fetch error:', err);
      setError('Failed to load report data');
      setReportData(getMockReportData(activeReport));
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = (reportType) => {
    switch (reportType) {
      case 'sales':
        return {
          summary: {
            totalRevenue: 12450.00,
            totalOrders: 87,
            averageOrderValue: 143.10,
            conversionRate: 3.2
          },
          trends: [
            { date: '2025-01-24', revenue: 1200, orders: 8 },
            { date: '2025-01-25', revenue: 1800, orders: 12 },
            { date: '2025-01-26', revenue: 950, orders: 6 },
            { date: '2025-01-27', revenue: 2100, orders: 15 },
            { date: '2025-01-28', revenue: 1650, orders: 11 },
            { date: '2025-01-29', revenue: 2200, orders: 16 },
            { date: '2025-01-30', revenue: 2550, orders: 19 }
          ],
          topProducts: [
            { name: 'Drone Frame Kit', revenue: 4200, orders: 28 },
            { name: 'Propeller Set', revenue: 2800, orders: 35 },
            { name: 'Flight Controller', revenue: 2100, orders: 14 },
            { name: 'Camera Mount', revenue: 1650, orders: 22 },
            { name: 'Battery Pack', revenue: 1700, orders: 17 }
          ]
        };
      case 'marketing':
        return {
          summary: {
            totalCampaigns: 12,
            emailsSent: 3420,
            averageOpenRate: 24.5,
            averageClickRate: 3.8
          },
          campaigns: [
            { name: 'Kickstarter Launch', sent: 287, opened: 89, clicked: 12, revenue: 2400 },
            { name: 'Product Update', sent: 342, opened: 76, clicked: 8, revenue: 850 },
            { name: 'Welcome Series', sent: 156, opened: 45, clicked: 6, revenue: 320 }
          ],
          channels: [
            { name: 'Email', conversions: 45, revenue: 3570 },
            { name: 'Social Media', conversions: 23, revenue: 1890 },
            { name: 'Direct', conversions: 67, revenue: 5240 }
          ]
        };
      default:
        return null;
    }
  };

  const exportReport = async (format) => {
    try {
      setExporting(true);
      // In a real implementation, this would call the backend API
      alert(`Exporting ${activeReport} report as ${format.toUpperCase()}...`);
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const renderSalesReport = () => {
    if (!reportData) return null;

    return (
      <div className="report-content">
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Revenue</h3>
            <div className="metric-value">{formatCurrency(reportData.summary.totalRevenue)}</div>
          </div>
          <div className="metric-card">
            <h3>Total Orders</h3>
            <div className="metric-value">{reportData.summary.totalOrders}</div>
          </div>
          <div className="metric-card">
            <h3>Average Order Value</h3>
            <div className="metric-value">{formatCurrency(reportData.summary.averageOrderValue)}</div>
          </div>
          <div className="metric-card">
            <h3>Conversion Rate</h3>
            <div className="metric-value">{formatPercentage(reportData.summary.conversionRate)}</div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-section">
            <h3>Revenue Trends</h3>
            <div className="trend-chart">
              {reportData.trends.map((trend, index) => (
                <div key={index} className="trend-bar">
                  <div className="trend-date">{new Date(trend.date).toLocaleDateString()}</div>
                  <div className="trend-value">{formatCurrency(trend.revenue)}</div>
                  <div className="trend-orders">{trend.orders} orders</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h3>Top Products</h3>
            <div className="products-list">
              {reportData.topProducts.map((product, index) => (
                <div key={index} className="product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-details">
                    <div className="product-name">{product.name}</div>
                    <div className="product-stats">
                      {formatCurrency(product.revenue)} • {product.orders} orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMarketingReport = () => {
    if (!reportData) return null;

    return (
      <div className="report-content">
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Campaigns</h3>
            <div className="metric-value">{reportData.summary.totalCampaigns}</div>
          </div>
          <div className="metric-card">
            <h3>Emails Sent</h3>
            <div className="metric-value">{reportData.summary.emailsSent}</div>
          </div>
          <div className="metric-card">
            <h3>Average Open Rate</h3>
            <div className="metric-value">{formatPercentage(reportData.summary.averageOpenRate)}</div>
          </div>
          <div className="metric-card">
            <h3>Average Click Rate</h3>
            <div className="metric-value">{formatPercentage(reportData.summary.averageClickRate)}</div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-section">
            <h3>Campaign Performance</h3>
            <div className="campaigns-list">
              {reportData.campaigns.map((campaign, index) => (
                <div key={index} className="campaign-item">
                  <div className="campaign-name">{campaign.name}</div>
                  <div className="campaign-stats">
                    <div className="campaign-metric">
                      <span className="metric-label">Sent:</span>
                      <span className="metric-value">{campaign.sent}</span>
                    </div>
                    <div className="campaign-metric">
                      <span className="metric-label">Opened:</span>
                      <span className="metric-value">{campaign.opened} ({formatPercentage((campaign.opened / campaign.sent) * 100)})</span>
                    </div>
                    <div className="campaign-metric">
                      <span className="metric-label">Clicked:</span>
                      <span className="metric-value">{campaign.clicked} ({formatPercentage((campaign.clicked / campaign.sent) * 100)})</span>
                    </div>
                    <div className="campaign-metric">
                      <span className="metric-label">Revenue:</span>
                      <span className="metric-value">{formatCurrency(campaign.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h3>Channel Performance</h3>
            <div className="channels-list">
              {reportData.channels.map((channel, index) => (
                <div key={index} className="channel-item">
                  <div className="channel-name">{channel.name}</div>
                  <div className="channel-stats">
                    <div className="channel-metric">
                      <span className="metric-label">Conversions:</span>
                      <span className="metric-value">{channel.conversions}</span>
                    </div>
                    <div className="channel-metric">
                      <span className="metric-label">Revenue:</span>
                      <span className="metric-value">{formatCurrency(channel.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-reports">
      <div className="page-header">
        <h2>Reports & Analytics</h2>
        <div className="header-controls">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <div className="export-controls">
            <button 
              onClick={() => exportReport('csv')} 
              disabled={exporting}
              className="export-btn"
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button 
              onClick={() => exportReport('pdf')} 
              disabled={exporting}
              className="export-btn"
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="report-tabs">
        <button 
          className={`tab-btn ${activeReport === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveReport('sales')}
        >
          Sales Report
        </button>
        <button 
          className={`tab-btn ${activeReport === 'marketing' ? 'active' : ''}`}
          onClick={() => setActiveReport('marketing')}
        >
          Marketing Report
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading report data...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchReportData} className="retry-btn">Retry</button>
        </div>
      ) : (
        activeReport === 'sales' ? renderSalesReport() : renderMarketingReport()
      )}

      <style jsx>{`
        .admin-reports {
          padding: 0;
          color: #f0f6fc;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #30363d;
        }

        .page-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .header-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .date-range-select {
          background: #21262d;
          border: 1px solid #30363d;
          color: #f0f6fc;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
        }

        .export-controls {
          display: flex;
          gap: 8px;
        }

        .export-btn {
          background: #238636;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .export-btn:hover:not(:disabled) {
          background: #2ea043;
        }

        .export-btn:disabled {
          background: #30363d;
          cursor: not-allowed;
        }

        .report-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          border-bottom: 1px solid #30363d;
        }

        .tab-btn {
          background: none;
          border: none;
          color: #8b949e;
          padding: 12px 16px;
          font-size: 14px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          color: #f0f6fc;
        }

        .tab-btn.active {
          color: #58a6ff;
          border-bottom-color: #58a6ff;
        }

        .loading-state, .error-state {
          text-align: center;
          padding: 60px 20px;
          color: #8b949e;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #30363d;
          border-top: 3px solid #58a6ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .retry-btn {
          background: #58a6ff;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 12px;
        }

        .report-content-placeholder {
          text-align: center;
          padding: 40px;
          color: #8b949e;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
        }

        .report-content {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 24px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .metric-card h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 500;
          color: #8b949e;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 600;
          color: #58a6ff;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .chart-section {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 16px;
        }

        .chart-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 500;
          color: #f0f6fc;
        }

        .trend-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .trend-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #30363d;
        }

        .trend-date {
          font-size: 14px;
          color: #8b949e;
          flex: 1;
        }

        .trend-value {
          font-size: 16px;
          font-weight: 600;
          color: #58a6ff;
          flex: 1;
          text-align: center;
        }

        .trend-orders {
          font-size: 14px;
          color: #8b949e;
          flex: 1;
          text-align: right;
        }

        .products-list, .campaigns-list, .channels-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .product-item, .campaign-item, .channel-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
        }

        .product-rank {
          font-size: 14px;
          color: #8b949e;
          width: 30px;
        }

        .product-details, .campaign-stats, .channel-stats {
          flex: 1;
        }

        .product-name, .campaign-name, .channel-name {
          font-size: 16px;
          font-weight: 500;
          color: #f0f6fc;
          margin-bottom: 4px;
        }

        .product-stats, .campaign-metric, .channel-metric {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #8b949e;
        }

        .metric-label {
          color: #8b949e;
        }
      `}</style>
    </div>
  );
};

export default AdminReports; 