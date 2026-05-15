import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#00d4ff', '#34d399', '#60a5fa', '#f59e0b', '#a78bfa', '#f87171', '#fb923c', '#22d3ee'];
const API_BASE = '/api';

const chartTheme = {
  grid: 'rgba(56, 68, 82, 0.3)',
  axisTick: '#94a3b8',
};

const countryFlags = {
  US: '🇺🇸', CA: '🇨🇦', GB: '🇬🇧', AU: '🇦🇺', DE: '🇩🇪', FR: '🇫🇷',
  JP: '🇯🇵', IN: '🇮🇳', BR: '🇧🇷', NZ: '🇳🇿', NL: '🇳🇱', SE: '🇸🇪',
  KR: '🇰🇷', SG: '🇸🇬', IT: '🇮🇹', ES: '🇪🇸', MX: '🇲🇽', PL: '🇵🇱',
  CH: '🇨🇭', NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮', AT: '🇦🇹', BE: '🇧🇪',
  IE: '🇮🇪', PT: '🇵🇹', CZ: '🇨🇿', RO: '🇷🇴', ZA: '🇿🇦', PH: '🇵🇭',
};

const FEED_ICONS = {
  order: { emoji: '🛒', label: 'Order', color: 'text-green-400', bg: 'bg-green-900/40 border-green-700/40' },
  download: { emoji: '⬇️', label: 'Download', color: 'text-cyan-400', bg: 'bg-cyan-900/40 border-cyan-700/40' },
  signup: { emoji: '✉️', label: 'Signup', color: 'text-purple-400', bg: 'bg-purple-900/40 border-purple-700/40' },
  lead: { emoji: '👤', label: 'Lead', color: 'text-orange-400', bg: 'bg-orange-900/40 border-orange-700/40' },
  chat: { emoji: '💬', label: 'Chat', color: 'text-cyan-400', bg: 'bg-cyan-900/40 border-cyan-700/40' },
};

// ── Shared Components ──

function DarkTooltip({ active, payload, label, prefix = '' }) {
  if (!active || !payload?.length) return null;
  const d = new Date(label);
  const formatted = isNaN(d) ? label : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <div className="bg-gray-800 border border-gray-600/50 rounded-lg px-3.5 py-2.5 text-[13px] shadow-xl">
      <div className="text-gray-400 mb-1">{formatted}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#fff' }} className="font-semibold">
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
    <div className="bg-gray-800 border border-gray-600/50 rounded-lg px-3.5 py-2.5 text-[13px] shadow-xl">
      <div style={{ color: d.payload.fill || '#fff' }} className="font-semibold">
        {d.name}: {d.value.toLocaleString()}
      </div>
    </div>
  );
}

function EmptyState({ message = 'No data for this period', suggestion = 'Try expanding the time range' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <svg className="w-12 h-12 mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs mt-1">{suggestion}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-red-400">
      <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition-colors text-gray-300">
          Retry
        </button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-700/30 rounded-2xl h-28 border border-gray-700/50" />
        ))}
      </div>
      <div className="bg-gray-700/30 rounded-2xl h-72 border border-gray-700/50" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-700/30 rounded-2xl h-64 border border-gray-700/50" />
        <div className="bg-gray-700/30 rounded-2xl h-64 border border-gray-700/50" />
      </div>
    </div>
  );
}

function KPICard({ label, value, format, sub }) {
  let displayVal = value;
  if (format === 'currency') displayVal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  else if (format === 'percent') displayVal = `${value || 0}%`;
  else displayVal = new Intl.NumberFormat().format(value || 0);
  return (
    <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</div>
      <div className="text-xl font-bold text-white tabular-nums">{displayVal}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function SortIcon({ active, direction }) {
  return (
    <svg className={`w-3.5 h-3.5 ml-1 inline ${active ? 'text-cyan-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {direction === 'asc'
        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />}
    </svg>
  );
}

// ── Main Component ──

const AdminAnalytics = () => {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const stored = sessionStorage.getItem('analytics_default_tab');
    if (stored) { sessionStorage.removeItem('analytics_default_tab'); return stored; }
    return 'revenue';
  });
  const [dateRange, setDateRange] = useState('30d');
  const [lastUpdated, setLastUpdated] = useState(null);

  const tabs = [
    { id: 'revenue', label: 'Revenue & Orders' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'audience', label: 'Audience' },
    { id: 'livefeed', label: 'Live Feed' },
  ];

  const getDateBounds = () => {
    const end = new Date();
    const start = new Date();
    const map = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    start.setDate(start.getDate() - (map[dateRange] || 30));
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const fetchWithAuth = useCallback(async (url) => {
    const token = await getToken();
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }, [getToken]);

  const exportCSV = useCallback(async (type) => {
    const token = await getToken();
    const { start, end } = getDateBounds();
    const url = `${API_BASE}/analytics/export?type=${type}&start=${start}&end=${end}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${type}_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [getToken, dateRange]);

  const relativeTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-500">Updated {relativeTime(lastUpdated)}</span>
          )}
          {activeTab !== 'livefeed' && (
            <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5 border border-gray-700/50">
              {['7d', '30d', '90d', '1y'].map(r => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    dateRange === r ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-800/80 rounded-xl p-1 border border-gray-700/50 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-gray-700 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'revenue' && (
        <RevenueTab fetchWithAuth={fetchWithAuth} getDateBounds={getDateBounds} exportCSV={exportCSV}
                    dateRange={dateRange} setLastUpdated={setLastUpdated} />
      )}
      {activeTab === 'downloads' && (
        <DownloadsTab fetchWithAuth={fetchWithAuth} getDateBounds={getDateBounds} exportCSV={exportCSV}
                      dateRange={dateRange} setLastUpdated={setLastUpdated} />
      )}
      {activeTab === 'audience' && (
        <AudienceTab fetchWithAuth={fetchWithAuth} dateRange={dateRange} setLastUpdated={setLastUpdated} />
      )}
      {activeTab === 'livefeed' && (
        <LiveFeedTab fetchWithAuth={fetchWithAuth} relativeTime={relativeTime} />
      )}
    </div>
  );
};

// ── Tab 1: Revenue & Orders ──

function RevenueTab({ fetchWithAuth, getDateBounds, exportCSV, dateRange, setLastUpdated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { start, end } = getDateBounds();
      const groupBy = dateRange === '7d' ? 'day' : dateRange === '1y' ? 'month' : 'day';
      const [salesData, statusData] = await Promise.all([
        fetchWithAuth(`${API_BASE}/admin/reports/sales?start=${start}&end=${end}&groupBy=${groupBy}`),
        fetchWithAuth(`${API_BASE}/admin/overview?timeRange=month`),
      ]);
      setData({ sales: salesData, overview: statusData });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <EmptyState />;

  const trends = (data.sales?.trends || []).map(t => ({
    ...t,
    period: t.period,
    revenue: Number(t.revenue || 0),
    orders: Number(t.orders || 0),
  }));

  const totalRevenue = trends.reduce((s, t) => s + t.revenue, 0);
  const totalOrders = trends.reduce((s, t) => s + t.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const orderStatuses = data.overview?.orderStatuses || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <KPICard label="Total Revenue" value={totalRevenue} format="currency" />
        <KPICard label="Total Orders" value={totalOrders} />
        <KPICard label="Avg Order Value" value={avgOrderValue} format="currency" />
      </div>

      {trends.length === 0 ? <EmptyState message="No revenue data for this period" /> : (
        <div className="bg-gray-800/95 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Revenue & Order Trends</h3>
            <button onClick={() => exportCSV('orders')} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fill: chartTheme.axisTick, fontSize: 11 }}
                  tickFormatter={v => { const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }}
                  axisLine={{ stroke: chartTheme.grid }} tickLine={false} />
                <YAxis yAxisId="rev" tick={{ fill: chartTheme.axisTick, fontSize: 11 }} axisLine={false} tickLine={false} width={50}
                  tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <YAxis yAxisId="ord" orientation="right" tick={{ fill: chartTheme.axisTick, fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip content={<DarkTooltip prefix="$" />} />
                <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                <Line yAxisId="ord" type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} dot={false} name="Orders" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {orderStatuses.length > 0 && (
        <div className="bg-gray-800/95 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-base font-semibold text-white mb-4">Order Status Breakdown</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderStatuses.map(s => ({ name: s.status, value: s.count }))} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {orderStatuses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Downloads ──

function DownloadsTab({ fetchWithAuth, getDateBounds, exportCSV, dateRange, setLastUpdated }) {
  const [reportData, setReportData] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsOffset, setEventsOffset] = useState(0);
  const [eventsWindow, setEventsWindow] = useState('7d');
  const [eventsOffsetDays, setEventsOffsetDays] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState('downloaded_at');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchTimer = useRef(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const { start, end } = getDateBounds();
      const groupBy = dateRange === '7d' ? 'day' : dateRange === '1y' ? 'month' : 'day';
      const data = await fetchWithAuth(`${API_BASE}/admin/reports/downloads?start=${start}&end=${end}&groupBy=${groupBy}`);
      setReportData(data);
      setLastUpdated(new Date());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [dateRange]);

  const fetchEvents = useCallback(async (offset = 0, append = false) => {
    try {
      setEventsLoading(true);
      const data = await fetchWithAuth(
        `${API_BASE}/analytics/docs-downloads/events?timeframe=${eventsWindow}&offsetDays=${eventsOffsetDays}&limit=25&offset=${offset}` +
        (searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '') +
        `&sortBy=${sortCol}&sortDir=${sortDir}`
      );
      if (append) setEvents(prev => [...prev, ...(data.events || [])]);
      else setEvents(data.events || []);
      setEventsTotal(data.totalCount || 0);
      setEventsOffset(offset + (data.events?.length || 0));
    } catch (_) {}
    finally { setEventsLoading(false); }
  }, [eventsWindow, eventsOffsetDays, searchQuery, sortCol, sortDir]);

  useEffect(() => { fetchReport(); }, [fetchReport]);
  useEffect(() => { setEventsOffset(0); fetchEvents(0); }, [eventsWindow, eventsOffsetDays, sortCol, sortDir]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setEventsOffset(0); fetchEvents(0); }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchReport} />;
  if (!reportData) return <EmptyState />;

  const trends = reportData.trends || [];
  const summary = reportData.summary || {};
  const categories = reportData.categories || [];
  const topFiles = reportData.topFiles || [];
  const devices = reportData.devices || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Downloads" value={summary.totalDownloads} />
        <KPICard label="Unique IPs" value={summary.uniqueIPs} />
        <KPICard label="Success Rate" value={summary.successRate} format="percent" />
        <KPICard label="Avg Duration" value={`${Math.round(summary.avgDurationMs || 0)}ms`} />
      </div>

      {trends.length > 0 && (
        <div className="bg-gray-800/95 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Download Trends</h3>
            <button onClick={() => exportCSV('downloads')} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.map(t => ({ ...t, downloads: Number(t.downloads || 0) }))}>
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
                <Area type="monotone" dataKey="downloads" stroke="#00d4ff" strokeWidth={2} fill="url(#dlGrad)" name="Downloads" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {topFiles.length > 0 && (
          <div className="bg-gray-800/95 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-base font-semibold text-white mb-4">Top Files</h3>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFiles.slice(0, 8).map(f => ({ name: f.file_name?.split('/').pop() || f.file_name, downloads: Number(f.downloads) }))} layout="vertical">
                  <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: chartTheme.axisTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: chartTheme.axisTick, fontSize: 10 }} width={120} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="downloads" fill="#00d4ff" radius={[0, 4, 4, 0]} name="Downloads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div className="bg-gray-800/95 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-base font-semibold text-white mb-4">By Category</h3>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories.map(c => ({ name: c.file_category || 'Unknown', value: Number(c.downloads) }))}
                    dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}
                    label={({ name, value }) => `${name}: ${value}`}>
                    {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {devices.length > 0 && (
        <div className="bg-gray-800/95 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-base font-semibold text-white mb-4">Device Distribution</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {devices.map((d, i) => (
              <div key={i} className="text-center p-3 bg-gray-700/30 rounded-xl">
                <div className="text-lg font-bold text-white">{Number(d.downloads).toLocaleString()}</div>
                <div className="text-xs text-gray-400 capitalize mt-1">{d.device_type || 'Unknown'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Events Table */}
      <div className="bg-gray-800/95 rounded-2xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-white">Download Events</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 bg-gray-900/60 rounded-lg p-0.5">
              {['24h', '7d', '30d', '90d'].map(w => (
                <button key={w} onClick={() => { setEventsWindow(w); setEventsOffsetDays(0); }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${eventsWindow === w ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                  {w}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setEventsOffsetDays(d => d + (eventsWindow === '24h' ? 1 : eventsWindow === '7d' ? 7 : eventsWindow === '30d' ? 30 : 90))}
                className="px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-700/40 rounded-md">← Older</button>
              {eventsOffsetDays > 0 && (
                <>
                  <button onClick={() => setEventsOffsetDays(d => Math.max(0, d - (eventsWindow === '24h' ? 1 : eventsWindow === '7d' ? 7 : eventsWindow === '30d' ? 30 : 90)))}
                    className="px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-700/40 rounded-md">Newer →</button>
                  <button onClick={() => setEventsOffsetDays(0)}
                    className="px-2 py-1 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-900/20 rounded-md font-medium">Now</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <input type="text" placeholder="Search by filename..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700/50">
                {[
                  { key: 'file_name', label: 'File' },
                  { key: 'file_category', label: 'Category' },
                  { key: 'download_ip', label: 'IP' },
                  { key: 'country_code', label: 'Country' },
                  { key: 'device_type', label: 'Device' },
                  { key: 'downloaded_at', label: 'Date' },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)}
                    className="text-left py-2 pr-3 font-semibold cursor-pointer hover:text-gray-200 select-none">
                    {col.label}<SortIcon active={sortCol === col.key} direction={sortDir} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => (
                <tr key={i} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                  <td className="py-2 pr-3 text-white font-medium truncate max-w-[200px]">{ev.file_name}</td>
                  <td className="py-2 pr-3 text-gray-400">{ev.file_category || '-'}</td>
                  <td className="py-2 pr-3 text-gray-400 font-mono text-xs">{ev.download_ip || '-'}</td>
                  <td className="py-2 pr-3 text-gray-400">
                    {countryFlags[ev.country_code] || '🌍'} {ev.country_code || '-'}
                  </td>
                  <td className="py-2 pr-3 text-gray-400 capitalize">{ev.device_type || '-'}</td>
                  <td className="py-2 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(ev.downloaded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {events.length === 0 && !eventsLoading && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No download events found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500">
            Showing {events.length} of {eventsTotal} events
          </span>
          {events.length < eventsTotal && (
            <button onClick={() => fetchEvents(eventsOffset, true)} disabled={eventsLoading}
              className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50">
              {eventsLoading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Audience & Engagement ──

function AudienceTab({ fetchWithAuth, dateRange, setLastUpdated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const result = await fetchWithAuth(`${API_BASE}/analytics/audience?timeRange=${dateRange}`);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <EmptyState />;

  const nl = data.newsletter || {};
  const ec = data.emailCampaigns || {};
  const ch = data.chat || {};
  const ld = data.leads || {};

  const funnelStages = [
    { label: 'New', value: ld.new || 0, color: '#60a5fa' },
    { label: 'Contacted', value: ld.contacted || 0, color: '#a78bfa' },
    { label: 'Qualified', value: ld.qualified || 0, color: '#f59e0b' },
    { label: 'Won', value: ld.won || 0, color: '#10b981' },
    { label: 'Lost', value: ld.lost || 0, color: '#ef4444' },
  ];
  const funnelMax = Math.max(...funnelStages.map(s => s.value), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Newsletter Subscribers" value={nl.total} sub={`${nl.newThisPeriod || 0} new this period`} />
        <KPICard label="Chat Conversations" value={ch.totalConversations} />
        <KPICard label="CRM Leads" value={ld.total} sub={`${ld.new || 0} new`} />
        <KPICard label="Email Open Rate" value={ec.summary?.openRate} format="percent" />
      </div>

      {/* Newsletter Signups Over Time */}
      {(nl.timeSeries || []).length > 0 && (
        <div className="bg-gray-800/95 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-base font-semibold text-white mb-4">Newsletter Signups</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={nl.timeSeries}>
                <defs>
                  <linearGradient id="nlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: chartTheme.axisTick, fontSize: 11 }}
                  tickFormatter={v => { const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }}
                  axisLine={{ stroke: chartTheme.grid }} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.axisTick, fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip content={<DarkTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#a78bfa" strokeWidth={2} fill="url(#nlGrad)" name="Signups" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Email Campaigns */}
        <div className="bg-gray-800/95 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-base font-semibold text-white mb-4">Email Campaigns</h3>
          {ec.summary?.totalSent > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Sent', value: ec.summary.totalSent, color: 'text-blue-400' },
                  { label: 'Delivered', value: ec.summary.delivered, color: 'text-green-400' },
                  { label: 'Opened', value: ec.summary.opened, color: 'text-cyan-400' },
                  { label: 'Bounced', value: ec.summary.bounced, color: 'text-red-400' },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 bg-gray-700/30 rounded-lg">
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{s.label}</div>
                  </div>
                ))}
              </div>
              {(ec.campaigns || []).length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ec.campaigns.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg">
                      <div className="min-w-0">
                        <div className="text-sm text-white font-medium truncate">{c.name || c.subject}</div>
                        <div className="text-xs text-gray-500">{c.sentCount} sent · {c.opened} opened</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'sent' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState message="No email campaigns yet" suggestion="Send your first campaign from the email section" />
          )}
        </div>

        {/* Chat Analytics */}
        <div className="bg-gray-800/95 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-base font-semibold text-white mb-4">Chat Engagement</h3>
          {ch.totalConversations > 0 ? (
            <div className="space-y-3">
              {[
                { label: 'User Messages', value: ch.userMessages, icon: '💬' },
                { label: 'AI Responses', value: ch.aiMessages, icon: '🤖' },
                { label: 'Emails Captured', value: ch.emailsCaptured, icon: '📧' },
                { label: 'Product Clicks', value: ch.productClicks, icon: '🛍️' },
                { label: 'Products Shown', value: ch.productsShown, icon: '📋' },
                { label: 'Transcripts Requested', value: ch.transcripts, icon: '📄' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{stat.icon}</span>
                    <span className="text-sm text-gray-300">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white tabular-nums">{(stat.value || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No chat data yet" suggestion="Chat analytics will appear as visitors use the chatbot" />
          )}
        </div>
      </div>

      {/* CRM Lead Funnel */}
      <div className="bg-gray-800/95 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-base font-semibold text-white mb-4">CRM Lead Pipeline</h3>
        {ld.total > 0 ? (
          <>
            <div className="space-y-3 mb-6">
              {funnelStages.map(stage => (
                <div key={stage.label}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-gray-400">{stage.label}</span>
                    <span className="text-white font-semibold tabular-nums">{stage.value}</span>
                  </div>
                  <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(stage.value / funnelMax) * 100}%`, backgroundColor: stage.color }} />
                  </div>
                </div>
              ))}
            </div>

            {(ld.recent || []).length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Recent Leads</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700/50">
                        <th className="text-left py-2 pr-3 font-semibold">Contact</th>
                        <th className="text-left py-2 pr-3 font-semibold">Status</th>
                        <th className="text-left py-2 pr-3 font-semibold">Source</th>
                        <th className="text-left py-2 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ld.recent.slice(0, 10).map((lead, i) => (
                        <tr key={i} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                          <td className="py-2 pr-3 text-white truncate max-w-[180px]">{lead.user_email || lead.user_name || 'Unknown'}</td>
                          <td className="py-2 pr-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              lead.status === 'won' ? 'bg-green-900/30 text-green-400' :
                              lead.status === 'lost' ? 'bg-red-900/30 text-red-400' :
                              lead.status === 'qualified' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-gray-700 text-gray-400'
                            }`}>{lead.status}</span>
                          </td>
                          <td className="py-2 pr-3 text-gray-400">{lead.source || '-'}</td>
                          <td className="py-2 text-gray-500 text-xs whitespace-nowrap">
                            {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        ) : (
          <EmptyState message="No CRM leads yet" suggestion="Leads will appear as the chatbot captures visitor information" />
        )}
      </div>
    </div>
  );
}

// ── Tab 4: Live Feed ──

function LiveFeedTab({ fetchWithAuth, relativeTime }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(new Set(['order', 'download', 'signup', 'lead', 'chat']));
  const [autoScroll, setAutoScroll] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [sessionStart] = useState(Date.now());
  const [sessionCount, setSessionCount] = useState(0);
  const scrollRef = useRef(null);
  const latestTimestamp = useRef(null);

  const fetchInitial = useCallback(async () => {
    try {
      setLoading(true);
      const types = [...filters].join(',');
      const data = await fetchWithAuth(`${API_BASE}/analytics/activity-feed?limit=50&types=${types}`);
      setEvents(data.events || []);
      if (data.events?.length) latestTimestamp.current = data.events[0].timestamp;
    } catch (_) {}
    finally { setLoading(false); }
  }, [filters]);

  const pollNew = useCallback(async () => {
    if (!latestTimestamp.current) return;
    try {
      const types = [...filters].join(',');
      const data = await fetchWithAuth(
        `${API_BASE}/analytics/activity-feed?limit=20&types=${types}`
      );
      const newEvents = (data.events || []).filter(e =>
        new Date(e.timestamp) > new Date(latestTimestamp.current)
      );
      if (newEvents.length > 0) {
        latestTimestamp.current = newEvents[0].timestamp;
        if (autoScroll) {
          setEvents(prev => [...newEvents, ...prev].slice(0, 200));
        } else {
          setNewCount(c => c + newEvents.length);
          setEvents(prev => [...newEvents, ...prev].slice(0, 200));
        }
        setSessionCount(c => c + newEvents.length);
      }
    } catch (_) {}
  }, [filters, autoScroll]);

  useEffect(() => { fetchInitial(); }, [fetchInitial]);

  useEffect(() => {
    const id = setInterval(pollNew, 15000);
    return () => clearInterval(id);
  }, [pollNew]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const toggleFilter = (type) => {
    setFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const showNewEvents = () => {
    setNewCount(0);
    setAutoScroll(true);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const allTypes = ['order', 'download', 'signup', 'lead', 'chat'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            Live · polling every 15s
          </div>
          {sessionCount > 0 && (
            <span className="text-xs text-gray-500">{sessionCount} events since you opened this tab</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(a => !a)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              autoScroll ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {allTypes.map(type => {
          const cfg = FEED_ICONS[type];
          const active = filters.has(type);
          return (
            <button key={type} onClick={() => toggleFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                active ? 'bg-gray-700 text-white' : 'bg-gray-800/50 text-gray-500 hover:text-gray-300'
              }`}>
              <span className="text-sm">{cfg.emoji}</span>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {!autoScroll && newCount > 0 && (
        <button onClick={showNewEvents}
          className="w-full py-2 bg-cyan-900/30 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-900/40 transition-colors">
          {newCount} new event{newCount > 1 ? 's' : ''} — click to view
        </button>
      )}

      <div ref={scrollRef} className="bg-gray-800/95 rounded-2xl border border-gray-700 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)', minHeight: 400 }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState message="No activity to show" suggestion="Events will appear here as they happen" />
        ) : (
          <div className="divide-y divide-gray-700/30">
            {events.map((event, i) => {
              const cfg = FEED_ICONS[event.type] || FEED_ICONS.order;
              return (
                <div key={`${event.timestamp}-${i}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-700/20 transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 border ${cfg.bg}`}>
                    {cfg.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                      {event.metadata && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400">{event.metadata}</span>
                      )}
                    </div>
                    <div className="text-sm text-white font-medium truncate mt-0.5">{event.title}</div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                    {relativeTime(event.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnalytics;
