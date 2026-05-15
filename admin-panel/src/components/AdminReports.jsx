import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CHART_COLORS = ['#00d4ff', '#34d399', '#60a5fa', '#f59e0b', '#a78bfa', '#f87171'];

const chartTheme = {
  grid: 'rgba(56, 68, 82, 0.3)',
  axisTick: '#94a3b8',
  tooltip: {
    background: '#1e293b',
    border: '1px solid rgba(56, 68, 82, 0.5)',
    borderRadius: 8,
    color: '#f0f6fc',
  },
};

function DarkTooltip({ active, payload, label, prefix = '' }) {
  if (!active || !payload?.length) return null;
  const d = new Date(label);
  const formatted = isNaN(d) ? label : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <div style={{ ...chartTheme.tooltip, padding: '10px 14px', fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>{formatted}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#fff', fontWeight: 600 }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ ...chartTheme.tooltip, padding: '10px 14px', fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ color: d.payload.fill || '#fff', fontWeight: 600 }}>
        {d.name}: {d.value.toLocaleString()}
      </div>
    </div>
  );
}

const countryFlags = {
  US: '🇺🇸', CA: '🇨🇦', GB: '🇬🇧', AU: '🇦🇺', DE: '🇩🇪', FR: '🇫🇷',
  JP: '🇯🇵', KR: '🇰🇷', IN: '🇮🇳', BR: '🇧🇷', NZ: '🇳🇿', MX: '🇲🇽',
  IT: '🇮🇹', ES: '🇪🇸', NL: '🇳🇱', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰',
  FI: '🇫🇮', PL: '🇵🇱', CH: '🇨🇭', AT: '🇦🇹', BE: '🇧🇪', IE: '🇮🇪',
  SG: '🇸🇬', HK: '🇭🇰', TW: '🇹🇼', PH: '🇵🇭', TH: '🇹🇭', MY: '🇲🇾',
};

const AdminReports = () => {
  const { getToken } = useAuth();
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState('30d');
  const [eventsWindow, setEventsWindow] = useState('7d');
  const [eventsOffset, setEventsOffset] = useState(0); // days offset for historical nav
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [downloadEvents, setDownloadEvents] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [eventsLive, setEventsLive] = useState(false);
  const [sortCol, setSortCol] = useState('downloaded_at');
  const [sortDir, setSortDir] = useState('desc');
  const eventsRef = useRef(null);

  useEffect(() => {
    fetchReportData();
  }, [activeReport, dateRange, eventsWindow, eventsOffset]);

  // Live polling for download events
  useEffect(() => {
    if (!eventsLive || activeReport !== 'download-events') return;
    const id = setInterval(() => fetchReportData(), 15000);
    return () => clearInterval(id);
  }, [eventsLive, activeReport, eventsWindow, eventsOffset]);

  // Reset offset when switching windows
  const handleEventsWindow = (w) => {
    setEventsWindow(w);
    setEventsOffset(0);
  };

  const windowDays = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
  const getEventsWindowLabel = () => {
    const days = windowDays[eventsWindow] || 7;
    if (eventsOffset === 0) return eventsWindow === '24h' ? 'Last 24 hours' : `Last ${days} days`;
    const end = new Date();
    end.setDate(end.getDate() - eventsOffset);
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      if (activeReport === 'sales') {
        const url = `/api/admin/reports/sales?groupBy=${dateRange === '90d' ? 'week' : 'day'}`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
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
          mapped.summary.averageOrderValue = mapped.summary.totalOrders > 0
            ? mapped.summary.totalRevenue / mapped.summary.totalOrders : 0;
          setReportData(mapped);
          setError(null);
          return;
        }
      }

      if (activeReport === 'downloads') {
        const url = `/api/admin/reports/downloads?groupBy=${dateRange === '90d' ? 'week' : 'day'}`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
          setError(null);
          return;
        }
      }

      if (activeReport === 'download-events') {
        const url = `/api/analytics/docs-downloads/events?timeframe=${encodeURIComponent(eventsWindow)}&offsetDays=${eventsOffset}&limit=50`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setDownloadEvents(data);
          setError(null);
          return;
        }
      }

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

  const loadMoreEvents = async () => {
    if (!downloadEvents?.hasMore || eventsLoading) return;
    try {
      setEventsLoading(true);
      const token = await getToken();
      if (!token) return;
      const nextOffset = (downloadEvents.offset || 0) + (downloadEvents.limit || 50);
      const url = `/api/analytics/docs-downloads/events?timeframe=${encodeURIComponent(eventsWindow)}&offsetDays=${eventsOffset}&limit=50&offset=${nextOffset}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setDownloadEvents(prev => ({
          ...data,
          events: [...(prev?.events || []), ...data.events],
        }));
      }
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const getMockReportData = (reportType) => {
    switch (reportType) {
      case 'sales':
        return {
          summary: { totalRevenue: 12450.00, totalOrders: 87, averageOrderValue: 143.10, conversionRate: 3.2 },
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
          summary: { totalCampaigns: 12, emailsSent: 3420, averageOpenRate: 24.5, averageClickRate: 3.8 },
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
          summary: { totalDownloads: 1247, successfulDownloads: 1198, uniqueUsers: 342, totalBytesServed: 8590000000, avgDurationMs: 2340, successRate: '96.1' },
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
            { file_name: 'Chassis_core.gcode.3mf', file_category: '3mf', downloads: 142, total_bytes: 450000000 }
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
      default:
        return null;
    }
  };

  const exportReport = async (format) => {
    try {
      setExporting(true);
      alert(`Exporting ${activeReport} report as ${format.toUpperCase()}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatBytes = (bytes) => {
    const b = Number(bytes) || 0;
    if (b === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getSortedEvents = () => {
    if (!downloadEvents?.events) return [];
    const sorted = [...downloadEvents.events];
    sorted.sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (sortCol === 'downloaded_at') { va = new Date(va); vb = new Date(vb); }
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const handleSort = (col) => {
    if (sortCol === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortCol(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span className="text-gray-600 ml-1">↕</span>;
    return <span className="text-cyan-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── Metric card helper ──
  const MetricCard = ({ title, value, color = 'text-cyan-400' }) => (
    <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 text-center">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{title}</div>
      <div className={`text-2xl font-bold ${color} tabular-nums`}>{value}</div>
    </div>
  );

  const renderSalesReport = () => {
    if (!reportData?.trends) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard title="Total Revenue" value={formatCurrency(reportData.summary.totalRevenue)} />
          <MetricCard title="Total Orders" value={reportData.summary.totalOrders} />
          <MetricCard title="Avg Order Value" value={formatCurrency(reportData.summary.averageOrderValue)} />
          <MetricCard title="Conversion Rate" value={`${(reportData.summary.conversionRate || 0).toFixed(1)}%`} />
        </div>

        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-white mb-4">Revenue & Orders Over Time</h4>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: chartTheme.axisTick, fontSize: 11 }}
                  tickFormatter={v => { const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }}
                  axisLine={{ stroke: chartTheme.grid }} tickLine={false} />
                <YAxis yAxisId="rev" tick={{ fill: chartTheme.axisTick, fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v}`} width={55} />
                <YAxis yAxisId="ord" orientation="right" tick={{ fill: chartTheme.axisTick, fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 8 }} />
                <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                <Area yAxisId="ord" type="monotone" dataKey="orders" stroke="#34d399" strokeWidth={1.5} fill="none" name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {reportData.topProducts?.length > 0 && (
          <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-4">Top Products</h4>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.topProducts} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: chartTheme.axisTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: chartTheme.axisTick, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={50} />
                  <Tooltip content={<DarkTooltip prefix="$" />} />
                  <Bar dataKey="revenue" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMarketingReport = () => {
    if (!reportData) return null;
    const channelData = (reportData.channels || []).map((c, i) => ({ ...c, fill: CHART_COLORS[i % CHART_COLORS.length] }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard title="Campaigns" value={reportData.summary.totalCampaigns} />
          <MetricCard title="Emails Sent" value={reportData.summary.emailsSent.toLocaleString()} />
          <MetricCard title="Open Rate" value={`${reportData.summary.averageOpenRate.toFixed(1)}%`} />
          <MetricCard title="Click Rate" value={`${reportData.summary.averageClickRate.toFixed(1)}%`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-4">Campaign Performance</h4>
            <div className="space-y-3">
              {(reportData.campaigns || []).map((c, i) => (
                <div key={i} className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/30">
                  <div className="font-medium text-white text-sm mb-2">{c.name}</div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div><span className="text-gray-400">Sent</span><br /><span className="text-white font-semibold">{c.sent}</span></div>
                    <div><span className="text-gray-400">Opened</span><br /><span className="text-green-400 font-semibold">{c.opened} ({((c.opened / c.sent) * 100).toFixed(1)}%)</span></div>
                    <div><span className="text-gray-400">Clicked</span><br /><span className="text-cyan-400 font-semibold">{c.clicked}</span></div>
                    <div><span className="text-gray-400">Revenue</span><br /><span className="text-white font-semibold">{formatCurrency(c.revenue)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-4">Channel Mix</h4>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channelData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#64748b' }}
                  >
                    {channelData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDownloadsReport = () => {
    if (!reportData?.trends) return null;
    const catData = (reportData.categories || []).map((c, i) => ({
      name: (c.file_category || 'unknown').toUpperCase(),
      value: c.downloads,
      fill: CHART_COLORS[i % CHART_COLORS.length]
    }));
    const deviceData = (reportData.devices || []).map((d, i) => ({
      name: d.device_type || 'Unknown',
      value: d.downloads,
      fill: CHART_COLORS[i % CHART_COLORS.length]
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard title="Total Downloads" value={(reportData.summary.totalDownloads || 0).toLocaleString()} />
          <MetricCard title="Unique Users" value={(reportData.summary.uniqueUsers || 0).toLocaleString()} />
          <MetricCard title="Success Rate" value={`${reportData.summary.successRate || 0}%`} />
          <MetricCard title="Data Served" value={formatBytes(reportData.summary.totalBytesServed)} />
        </div>

        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-white mb-4">Download Trends</h4>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fill: chartTheme.axisTick, fontSize: 11 }}
                  tickFormatter={v => { const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }}
                  axisLine={{ stroke: chartTheme.grid }} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.axisTick, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 8 }} />
                <Area type="monotone" dataKey="downloads" stroke="#00d4ff" strokeWidth={2} fill="url(#dlGrad)" name="Downloads" />
                <Area type="monotone" dataKey="unique_users" stroke="#34d399" strokeWidth={1.5} fill="none" name="Unique Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-4">File Categories</h4>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#64748b' }}
                  >
                    {catData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-4">Device Breakdown</h4>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: chartTheme.axisTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: chartTheme.axisTick, fontSize: 12 }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Downloads">
                    {deviceData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {reportData.topFiles?.length > 0 && (
          <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3">Top Downloaded Files</h4>
            <div className="space-y-2">
              {reportData.topFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-800/40 rounded-lg">
                  <span className="text-gray-500 text-sm font-semibold w-6 text-right">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{f.file_name}</div>
                    <div className="text-xs text-gray-400">
                      {(f.downloads || 0).toLocaleString()} downloads · {(f.file_category || '').toUpperCase()} · {formatBytes(f.total_bytes)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDownloadEvents = () => {
    if (!downloadEvents) return null;
    const sortedEvents = getSortedEvents();

    const hourlyData = (downloadEvents.hourlyBreakdown || []).slice(-24).map(h => ({
      hour: new Date(h.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      downloads: h.downloads,
      unique_ips: h.unique_ips,
    }));

    const days = windowDays[eventsWindow] || 7;

    return (
      <div className="space-y-6">
        {/* Time window controls + historical nav */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-900/60 border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">Window:</span>
            {['24h', '7d', '30d', '90d'].map(w => (
              <button
                key={w}
                onClick={() => handleEventsWindow(w)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  eventsWindow === w
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEventsOffset(o => o + days)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 text-gray-300 hover:text-white border border-gray-700 transition-colors"
            >
              ← Older
            </button>
            <span className="text-sm text-gray-300 font-medium min-w-[140px] text-center">
              {getEventsWindowLabel()}
            </span>
            <button
              onClick={() => setEventsOffset(o => Math.max(0, o - days))}
              disabled={eventsOffset === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                eventsOffset === 0
                  ? 'bg-gray-800/50 text-gray-600 border-gray-700/50 cursor-not-allowed'
                  : 'bg-gray-800 text-gray-300 hover:text-white border-gray-700'
              }`}
            >
              Newer →
            </button>
            {eventsOffset > 0 && (
              <button
                onClick={() => setEventsOffset(0)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-900/40 text-cyan-300 border border-cyan-700/40 hover:bg-cyan-900/60 transition-colors"
              >
                Now
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard title="Total Events" value={(downloadEvents.stats?.total_events || 0).toLocaleString()} />
          <MetricCard title="Unique IPs" value={(downloadEvents.stats?.unique_ips || 0).toLocaleString()} />
          <MetricCard title="Countries" value={(downloadEvents.stats?.unique_countries || 0).toLocaleString()} />
          <MetricCard title="Success Rate" value={
            downloadEvents.stats?.total_events > 0
              ? `${((downloadEvents.stats.successful_downloads / downloadEvents.stats.total_events) * 100).toFixed(1)}%`
              : '0%'
          } />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-4">Hourly Activity</h4>
            {hourlyData.length > 0 ? (
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tick={{ fill: chartTheme.axisTick, fontSize: 9 }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(hourlyData.length / 8) - 1)} />
                    <YAxis tick={{ fill: chartTheme.axisTick, fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar dataKey="downloads" fill="#00d4ff" radius={[3, 3, 0, 0]} name="Downloads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-gray-500 text-sm text-center py-8">No hourly data available</div>
            )}
          </div>

          <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-4">Downloads by Country</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(downloadEvents.countries || []).map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-800/40 rounded-lg text-sm">
                  <span className="text-white font-medium">
                    {countryFlags[c.country_code] || '🌍'} {c.country_code || 'Unknown'}
                  </span>
                  <div className="text-gray-400 text-xs">
                    {c.download_count} downloads · {c.unique_ips} IPs
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events table with sort + load more */}
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <h4 className="text-sm font-semibold text-white">
              Download Events
              {downloadEvents.totalCount != null && (
                <span className="text-gray-400 font-normal ml-2">({sortedEvents.length} of {downloadEvents.totalCount})</span>
              )}
            </h4>
            <button
              onClick={() => setEventsLive(!eventsLive)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                eventsLive ? 'bg-green-900/40 text-green-300 border border-green-700/40' : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {eventsLive && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
              )}
              {eventsLive ? 'Live' : 'Enable Live'}
            </button>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto" ref={eventsRef}>
            <table className="w-full text-xs">
              <thead className="bg-gray-800/80 sticky top-0 z-10">
                <tr>
                  {[
                    { key: 'downloaded_at', label: 'Time' },
                    { key: 'user_email', label: 'User' },
                    { key: 'file_name', label: 'File' },
                    { key: 'country_code', label: 'Country' },
                    { key: 'device_type', label: 'Device' },
                    { key: 'download_success', label: 'Status' },
                    { key: 'download_duration_ms', label: 'Duration' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="text-left py-2.5 px-3 font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors select-none"
                    >
                      {col.label}<SortIcon col={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedEvents.map((event, index) => (
                  <tr key={event.id || index} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors">
                    <td className="py-2 px-3 text-gray-300 whitespace-nowrap">{new Date(event.downloaded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-2 px-3 text-gray-300 truncate max-w-[120px]">
                      {event.user_email
                        ? (`${event.first_name || ''} ${event.last_name || ''}`.trim() || event.user_email)
                        : <span className="text-gray-500">Anonymous</span>
                      }
                    </td>
                    <td className="py-2 px-3 text-white font-medium truncate max-w-[180px]">{event.file_name}</td>
                    <td className="py-2 px-3 text-gray-300">{countryFlags[event.country_code] || '🌍'} {event.country_code || '?'}</td>
                    <td className="py-2 px-3 text-gray-300 capitalize">{event.device_type || '?'}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${event.download_success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                        {event.download_success ? 'OK' : 'FAIL'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-400 tabular-nums">{event.download_duration_ms ? `${event.download_duration_ms}ms` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {downloadEvents.hasMore && (
            <div className="p-3 border-t border-gray-700/50 text-center">
              <button
                onClick={loadMoreEvents}
                disabled={eventsLoading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {eventsLoading ? 'Loading...' : 'Load More Events'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="text-gray-100">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-gray-700/50">
        <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
        <div className="flex gap-3 items-center">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => exportReport('csv')} disabled={exporting}
              className="bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors">
              {exporting ? '...' : 'CSV'}
            </button>
            <button onClick={() => exportReport('pdf')} disabled={exporting}
              className="bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors">
              {exporting ? '...' : 'PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-800/60 rounded-xl p-1 overflow-x-auto">
        {[
          { key: 'sales', label: 'Sales' },
          { key: 'marketing', label: 'Marketing' },
          { key: 'downloads', label: 'Downloads' },
          { key: 'download-events', label: 'Download Events' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeReport === tab.key
                ? 'bg-gray-700 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveReport(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading report data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-400 mb-3">{error}</p>
          <button onClick={fetchReportData} className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">Retry</button>
        </div>
      ) : (
        activeReport === 'sales' ? renderSalesReport() :
        activeReport === 'marketing' ? renderMarketingReport() :
        activeReport === 'downloads' ? renderDownloadsReport() :
        activeReport === 'download-events' ? renderDownloadEvents() : null
      )}
    </div>
  );
};

export default AdminReports;

export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 
export default AdminReports; 