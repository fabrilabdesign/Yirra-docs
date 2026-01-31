import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import getApiUrl from '../utils/api.js';

const AdminReports = () => {
  const { getToken } = useAuth();
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [downloadEvents, setDownloadEvents] = useState(null);
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

      if (activeReport === 'downloads') {
        const url = `/api/admin/reports/downloads?groupBy=${encodeURIComponent(dateRange === '90d' ? 'week' : 'day')}`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
          setError(null);
          return;
        }
      }

      if (activeReport === 'download-events') {
        const url = `/api/analytics/docs-downloads/events?timeframe=${encodeURIComponent(dateRange)}&limit=100`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDownloadEvents(data);
          setError(null);
          return;
        }
      }

      // Fallback to mock if not supported
      if (activeReport === 'download-events') {
        setDownloadEvents(null);
      } else {
        setReportData(getMockReportData(activeReport));
      }
      setError(null);
    } catch (err) {
      console.error('Report fetch error:', err);
      setError('Failed to load report data');
      if (activeReport === 'download-events') {
        setDownloadEvents(null);
      } else {
        setReportData(getMockReportData(activeReport));
      }
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
      case 'downloads':
        return {
          summary: {
            totalDownloads: 1247,
            successfulDownloads: 1198,
            uniqueUsers: 342,
            totalBytesServed: 8590000000,
            avgDurationMs: 2340,
            successRate: '96.1'
          },
          categories: [
            { file_category: 'stl', downloads: 487, total_bytes: 3200000000 },
            { file_category: 'step', downloads: 423, total_bytes: 2800000000 },
            { file_category: '3mf', downloads: 337, total_bytes: 2590000000 }
          ],
          trends: [
            { period: '2026-01-17', downloads: 142, unique_users: 45, successful_downloads: 138 },
            { period: '2026-01-18', downloads: 168, unique_users: 52, successful_downloads: 162 },
            { period: '2026-01-19', downloads: 195, unique_users: 61, successful_downloads: 189 },
            { period: '2026-01-20', downloads: 223, unique_users: 68, successful_downloads: 215 },
            { period: '2026-01-21', downloads: 201, unique_users: 58, successful_downloads: 194 },
            { period: '2026-01-22', downloads: 178, unique_users: 49, successful_downloads: 172 },
            { period: '2026-01-23', downloads: 140, unique_users: 42, successful_downloads: 128 }
          ],
          topFiles: [
            { file_name: 'Replicant_gen1_STL.zip', file_category: 'stl', downloads: 234, total_bytes: 1500000000 },
            { file_name: 'Replicant_gen1_STEP.zip', file_category: 'step', downloads: 187, total_bytes: 1200000000 },
            { file_name: 'Chassis_core_left_USB_modi.gcode.3mf', file_category: '3mf', downloads: 142, total_bytes: 450000000 },
            { file_name: 'Chassis_core_right_USB_modi.gcode.3mf', file_category: '3mf', downloads: 138, total_bytes: 445000000 },
            { file_name: 'Motor_mounts.gcode.3mf', file_category: '3mf', downloads: 97, total_bytes: 280000000 }
          ],
          devices: [
            { device_type: 'desktop', downloads: 892 },
            { device_type: 'mobile', downloads: 287 },
            { device_type: 'tablet', downloads: 68 }
          ],
          browsers: [
            { browser_name: 'Chrome', downloads: 687 },
            { browser_name: 'Firefox', downloads: 312 },
            { browser_name: 'Safari', downloads: 178 },
            { browser_name: 'Edge', downloads: 52 },
            { browser_name: 'Other', downloads: 18 }
          ]
        };
      case 'download-events':
        return {
          timeframe: '30d',
          events: [
            {
              id: 1,
              downloaded_at: '2026-01-23T08:28:10.093Z',
              file_name: 'Right_front_arm_boss.stp',
              file_category: 'step',
              file_size_bytes: 2855552,
              download_ip: '192.168.1.100',
              country_code: 'US',
              device_type: 'desktop',
              browser_name: 'Chrome',
              operating_system: 'Windows',
              download_success: true,
              download_duration_ms: 1500,
              referrer_url: 'https://yirrasystems.com/docs',
              user_email: 'user@example.com',
              first_name: 'John',
              last_name: 'Doe'
            },
            {
              id: 2,
              downloaded_at: '2026-01-22T14:15:30.000Z',
              file_name: 'Chassis_core_left_USB_modi.gcode.3mf',
              file_category: '3mf',
              file_size_bytes: 5010953,
              download_ip: '10.0.0.50',
              country_code: 'CA',
              device_type: 'mobile',
              browser_name: 'Safari',
              operating_system: 'iOS',
              download_success: true,
              download_duration_ms: 2200,
              referrer_url: null,
              user_email: null,
              first_name: null,
              last_name: null
            }
          ],
          stats: {
            total_events: 68,
            unique_ips: 45,
            unique_countries: 3,
            successful_downloads: 65,
            avg_download_time: 1800
          },
          countries: [
            { country_code: 'US', download_count: 35, unique_ips: 28 },
            { country_code: 'CA', download_count: 18, unique_ips: 12 },
            { country_code: 'GB', download_count: 15, unique_ips: 5 }
          ],
          hourlyBreakdown: [
            { hour: '2026-01-23T08:00:00.000Z', downloads: 5, unique_ips: 4, unique_countries: 2 },
            { hour: '2026-01-23T07:00:00.000Z', downloads: 3, unique_ips: 3, unique_countries: 1 },
            { hour: '2026-01-22T14:00:00.000Z', downloads: 8, unique_ips: 6, unique_countries: 3 }
          ],
          hasMore: false,
          limit: 100,
          offset: 0
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
    const numValue = Number(value) || 0;
    return `${numValue.toFixed(1)}%`;
  };

  const formatBytes = (bytes) => {
    const numBytes = Number(bytes) || 0;
    if (numBytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return Math.round((numBytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const renderSalesReport = () => {
    if (!reportData || !reportData.trends) return null;

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
              {(reportData.trends || []).map((trend, index) => (
                <div key={index} className="trend-bar">
                  <div className="trend-date">{trend.date ? new Date(trend.date).toLocaleDateString() : 'Unknown'}</div>
                  <div className="trend-value">{formatCurrency(trend.revenue || 0)}</div>
                  <div className="trend-orders">{trend.orders || 0} orders</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h3>Top Products</h3>
            <div className="products-list">
              {(reportData.topProducts || []).map((product, index) => (
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
              {(reportData.campaigns || []).map((campaign, index) => (
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
              {(reportData.channels || []).map((channel, index) => (
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

  const renderDownloadsReport = () => {
    if (!reportData || !reportData.trends) return null;

    return (
      <div className="report-content">
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Downloads</h3>
            <div className="metric-value">{(reportData.summary.totalDownloads || 0).toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <h3>Unique Users</h3>
            <div className="metric-value">{(reportData.summary.uniqueUsers || 0).toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <h3>Success Rate</h3>
            <div className="metric-value">{reportData.summary.successRate}%</div>
          </div>
          <div className="metric-card">
            <h3>Data Served</h3>
            <div className="metric-value">{formatBytes(reportData.summary.totalBytesServed)}</div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-section">
            <h3>Download Trends</h3>
            <div className="trend-chart">
              {(reportData.trends || []).map((trend, index) => (
                <div key={index} className="trend-bar">
                  <div className="trend-date">{trend.period ? new Date(trend.period).toLocaleDateString() : 'Unknown'}</div>
                  <div className="trend-value">{trend.downloads || 0} downloads</div>
                  <div className="trend-orders">{trend.unique_users || 0} unique users</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h3>Top Downloaded Files</h3>
            <div className="products-list">
              {(reportData.topFiles || []).map((file, index) => (
                <div key={index} className="product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-details">
                    <div className="product-name">{file.file_name}</div>
                    <div className="product-stats">
                      {file.downloads || 0} downloads • {(file.file_category || 'unknown').toUpperCase()} • {formatBytes(file.total_bytes || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-section">
            <h3>File Categories</h3>
            <div className="categories-list">
              {(reportData.categories || []).map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-name">{(category.file_category || 'unknown').toUpperCase()}</div>
                  <div className="category-stats">
                    <div className="category-metric">
                      <span className="metric-label">Downloads:</span>
                      <span className="metric-value">{(category.downloads || 0).toLocaleString()}</span>
                    </div>
                    <div className="category-metric">
                      <span className="metric-label">Data:</span>
                      <span className="metric-value">{formatBytes(category.total_bytes || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h3>Device Breakdown</h3>
            <div className="devices-list">
              {(reportData.devices || []).map((device, index) => (
                <div key={index} className="device-item">
                  <div className="device-name">{device.device_type || 'Unknown'}</div>
                  <div className="device-stats">
                    <span className="metric-value">{(device.downloads || 0).toLocaleString()} downloads</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDownloadEvents = () => {
    if (!downloadEvents) return null;

    return (
      <div className="report-content">
        {/* Summary Stats */}
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Events</h3>
            <div className="metric-value">{(downloadEvents.stats?.total_events || 0).toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <h3>Unique IPs</h3>
            <div className="metric-value">{(downloadEvents.stats?.unique_ips || 0).toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <h3>Countries</h3>
            <div className="metric-value">{(downloadEvents.stats?.unique_countries || 0).toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <h3>Success Rate</h3>
            <div className="metric-value">
              {downloadEvents.stats?.total_events > 0
                ? `${((downloadEvents.stats.successful_downloads / downloadEvents.stats.total_events) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="charts-grid">
          <div className="chart-section">
            <h3>Downloads by Country</h3>
            <div className="countries-list">
              {(downloadEvents.countries || []).map((country, index) => (
                <div key={index} className="country-item">
                  <div className="country-name">
                    {country.country_code || 'Unknown'} ({country.download_count} downloads)
                  </div>
                  <div className="country-stats">
                    <span className="metric-value">{country.unique_ips} unique IPs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h3>Hourly Activity</h3>
            <div className="hourly-chart">
              {(downloadEvents.hourlyBreakdown || []).slice(-24).map((hour, index) => (
                <div key={index} className="hourly-bar">
                  <div className="hour-label">
                    {new Date(hour.hour).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="hour-stats">
                    <span>{hour.downloads} downloads</span>
                    <span>{hour.unique_ips} IPs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="events-section">
          <h3>Download Events (Last {downloadEvents.timeframe})</h3>
          <div className="events-table-container">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>File</th>
                  <th>IP Address</th>
                  <th>Country</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>Success</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {(downloadEvents.events || []).map((event, index) => (
                  <tr key={event.id || index}>
                    <td>{new Date(event.downloaded_at).toLocaleString()}</td>
                    <td>
                      {event.user_email ? (
                        `${event.first_name || ''} ${event.last_name || ''}`.trim() || event.user_email
                      ) : 'Anonymous'}
                    </td>
                    <td>{event.file_name}</td>
                    <td>{event.download_ip || 'Unknown'}</td>
                    <td>{event.country_code || 'Unknown'}</td>
                    <td>{event.device_type || 'Unknown'}</td>
                    <td>{event.browser_name || 'Unknown'}</td>
                    <td>
                      <span className={`status ${event.download_success ? 'success' : 'failed'}`}>
                        {event.download_success ? '✓' : '✗'}
                      </span>
                    </td>
                    <td>{event.download_duration_ms ? `${event.download_duration_ms}ms` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {downloadEvents.hasMore && (
            <div className="load-more">
              <button className="load-more-btn">Load More Events</button>
            </div>
          )}
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
        <button
          className={`tab-btn ${activeReport === 'downloads' ? 'active' : ''}`}
          onClick={() => setActiveReport('downloads')}
        >
          Downloads Report
        </button>
        <button
          className={`tab-btn ${activeReport === 'download-events' ? 'active' : ''}`}
          onClick={() => setActiveReport('download-events')}
        >
          Download Events
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
        activeReport === 'sales' ? renderSalesReport() :
        activeReport === 'marketing' ? renderMarketingReport() :
        activeReport === 'downloads' ? renderDownloadsReport() :
        activeReport === 'download-events' ? renderDownloadEvents() : null
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

        /* Download Events Styles */
        .countries-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .country-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
        }

        .country-name {
          font-size: 14px;
          color: #f0f6fc;
          font-weight: 500;
        }

        .country-stats {
          font-size: 12px;
          color: #8b949e;
        }

        .hourly-chart {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 300px;
          overflow-y: auto;
        }

        .hourly-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 8px;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 4px;
        }

        .hour-label {
          font-size: 12px;
          color: #8b949e;
          min-width: 60px;
        }

        .hour-stats {
          font-size: 11px;
          color: #58a6ff;
          display: flex;
          gap: 12px;
        }

        .events-section {
          margin-top: 32px;
        }

        .events-section h3 {
          margin-bottom: 16px;
          color: #f0f6fc;
          font-size: 18px;
        }

        .events-table-container {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          overflow: hidden;
          max-height: 600px;
          overflow-y: auto;
        }

        .events-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .events-table th {
          background: #0d1117;
          color: #f0f6fc;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          border-bottom: 1px solid #30363d;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .events-table td {
          padding: 8px;
          border-bottom: 1px solid #21262d;
          color: #c9d1d9;
        }

        .events-table tr:hover {
          background: #21262d;
        }

        .status {
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
        }

        .status.success {
          background: #238636;
          color: white;
        }

        .status.failed {
          background: #da3633;
          color: white;
        }

        .load-more {
          text-align: center;
          padding: 16px;
          border-top: 1px solid #30363d;
        }

        .load-more-btn {
          background: #238636;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .load-more-btn:hover {
          background: #2ea043;
        }
      `}</style>
    </div>
  );
};

export default AdminReports; 