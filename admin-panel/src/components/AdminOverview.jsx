import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const POLL_INTERVAL = 30000;

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

const tabConfig = {
  downloads: { label: 'Downloads', color: '#00d4ff', key: 'count', dataKey: 'downloads' },
  users:     { label: 'Users',     color: '#34d399', key: 'count', dataKey: 'users' },
  orders:    { label: 'Orders',    color: '#60a5fa', key: 'count', dataKey: 'orders' },
  revenue:   { label: 'Revenue',   color: '#10b981', key: 'amount', dataKey: 'revenue' },
};

const PERIOD_LABELS = {
  today: 'today',
  week: 'this week',
  month: 'this month',
  year: 'this year',
};

const FEED_ICONS = {
  order:    { emoji: '🛒', bg: 'bg-green-900/40 border-green-700/40' },
  download: { emoji: '⬇️', bg: 'bg-cyan-900/40 border-cyan-700/40' },
  signup:   { emoji: '✉️', bg: 'bg-purple-900/40 border-purple-700/40' },
  lead:     { emoji: '👤', bg: 'bg-orange-900/40 border-orange-700/40' },
  chat:     { emoji: '💬', bg: 'bg-cyan-900/40 border-cyan-700/40' },
};

function useAnimatedValue(target, duration = 800) {
  const [display, setDisplay] = useState(target);
  const raf = useRef(null);
  const prev = useRef(target);

  useEffect(() => {
    const from = prev.current;
    const to = target;
    if (from === to) return;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * ease);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    prev.current = to;
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return display;
}

function AnimatedNumber({ value, format = 'number', className }) {
  const animated = useAnimatedValue(Number(value) || 0);
  let text;
  if (format === 'currency') {
    text = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(animated);
  } else if (format === 'percent') {
    text = `${Math.round(animated)}%`;
  } else {
    text = new Intl.NumberFormat().format(Math.round(animated));
  }
  return <span className={className}>{text}</span>;
}

function Sparkline({ data, color, dataKey = 'count' }) {
  if (!data || data.length < 2) return null;
  return (
    <div style={{ width: 80, height: 32, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color.replace('#', '')})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function GrowthBadge({ percent }) {
  const p = Number(percent) || 0;
  const isPositive = p >= 0;
  const bgClass = isPositive ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300';
  return (
    <div className={`${bgClass} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isPositive ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
        )}
      </svg>
      {isPositive ? '+' : ''}{p}%
    </div>
  );
}

function DarkTooltip({ active, payload, label, valuePrefix = '' }) {
  if (!active || !payload?.length) return null;
  const d = new Date(label);
  const formatted = isNaN(d) ? label : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <div style={{ ...chartTheme.tooltip, padding: '10px 14px', fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>{formatted}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {valuePrefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
}

function ChartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <svg className="w-12 h-12 mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-sm font-medium">No data for this period</p>
      <p className="text-xs mt-1">Try expanding the time range</p>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};
const chartVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.2 } },
};

const AdminOverview = ({ onNavigateToTab }) => {
    const { getToken } = useAuth();
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [activeChart, setActiveChart] = useState('downloads');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [changedKeys, setChangedKeys] = useState(new Set());
  const prevDataRef = useRef(null);

  const periodLabel = PERIOD_LABELS[timeRange] || 'this period';

  const handleNavigate = (tabName, analyticsTab) => {
    if (onNavigateToTab) {
      if (analyticsTab) {
        sessionStorage.setItem('analytics_default_tab', analyticsTab);
      }
      onNavigateToTab(tabName);
    }
  };

  const fetchOverviewData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const token = await getToken();
      if (!token) { setError('Please log in to view admin dashboard'); return; }

      const response = await fetch(`/api/admin/overview?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();

        if (prevDataRef.current) {
          const keys = new Set();
          if (prevDataRef.current.revenue?.total !== data.revenue?.total) keys.add('revenue');
          if (prevDataRef.current.orders?.total !== data.orders?.total) keys.add('orders');
          if (prevDataRef.current.fulfillment?.shipped !== data.fulfillment?.shipped) keys.add('fulfillment');
          if (prevDataRef.current.customers?.total !== data.customers?.total) keys.add('customers');
          setChangedKeys(keys);
          if (keys.size > 0) setTimeout(() => setChangedKeys(new Set()), 1500);
        }
        prevDataRef.current = data;

        setOverviewData(data);
        setLastUpdated(new Date());
        setSecondsAgo(0);
        setError(null);
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        throw new Error('Failed to fetch overview data');
      }
    } catch (err) {
      console.error('Overview fetch error:', err);
      if (!isBackground) setError('Failed to load overview data');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [timeRange, getToken]);

  useEffect(() => { fetchOverviewData(); }, [timeRange]);

  useEffect(() => {
    const id = setInterval(() => fetchOverviewData(true), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchOverviewData]);

  useEffect(() => {
    const id = setInterval(() => setSecondsAgo(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  const getStatusColor = (status) => ({
    pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6',
    delivered: '#10b981', failed: '#ef4444', returned: '#f97316'
  }[status] || '#6b7280');

  const getChartData = (key) => {
    const raw = overviewData?.timeSeries?.[key] || [];
    return raw.map(d => ({
      ...d,
      date: d.date,
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  };

  const getSparkData = (key) => (overviewData?.timeSeries?.[key] || []).slice(-7);

  const relativeTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading && !overviewData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-gray-600 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading overview...</p>
        </div>
      </div>
    );
  }

  if (error && !overviewData) {
    return <div className="text-center py-20 text-red-400">{error}</div>;
  }

  if (!overviewData) {
    return <div className="text-center py-20 text-gray-400">No overview data available</div>;
  }

  const currentTab = tabConfig[activeChart];
  const chartData = getChartData(activeChart);

  const primaryCards = [
    {
      key: 'revenue', label: 'Total Revenue', format: 'currency',
      value: overviewData.revenue?.total || 0,
      growth: overviewData.revenue?.growthPercent,
      sub: `${formatCurrency(overviewData.revenue?.thisMonth || 0)} ${periodLabel}`,
      sparkData: getSparkData('revenue'), sparkColor: '#34d399', sparkKey: 'amount',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      iconBg: 'bg-green-900/50', iconColor: 'text-green-400',
      navTab: 'reports', analyticsTab: 'revenue',
    },
    {
      key: 'orders', label: 'Total Orders',
      value: overviewData.orders?.total || 0,
      growth: overviewData.orders?.growthPercent,
      sub: <><span className="text-orange-300">{overviewData.orders?.pending || 0} pending</span></>,
      sparkData: getSparkData('orders'), sparkColor: '#60a5fa', sparkKey: 'count',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
      iconBg: 'bg-blue-900/50', iconColor: 'text-blue-400',
      navTab: 'reports', analyticsTab: 'revenue',
    },
    {
      key: 'fulfillment', label: 'Orders Shipped',
      value: overviewData.fulfillment?.shipped || 0,
      badge: `${overviewData.fulfillment?.awaitingShipment || 0} to ship`,
      sub: `${overviewData.fulfillment?.inTransit || 0} in transit`,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />,
      iconBg: 'bg-purple-900/50', iconColor: 'text-purple-400',
      navTab: 'fulfillment',
    },
    {
      key: 'customers', label: 'Total Customers',
      value: overviewData.customers?.total || 0,
      growth: overviewData.customers?.growthPercent,
      sub: `${overviewData.customers?.newThisMonth || 0} new ${periodLabel}`,
      sparkData: getSparkData('users'), sparkColor: '#818cf8', sparkKey: 'count',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
      iconBg: 'bg-indigo-900/50', iconColor: 'text-indigo-400',
      navTab: 'reports', analyticsTab: 'audience',
    },
  ];

  const secondaryCards = [
    {
      label: 'Downloads', value: overviewData.downloads?.total || 0,
      growth: overviewData.downloads?.growthPercent,
      sparkData: getSparkData('downloads'), sparkColor: '#00d4ff', sparkKey: 'count',
      icon: '⬇️', navTab: 'reports', analyticsTab: 'downloads',
    },
    {
      label: 'Newsletter', value: overviewData.newsletter?.subscribers || 0,
      growth: overviewData.newsletter?.growthPercent,
      sparkData: getSparkData('newsletter'), sparkColor: '#a78bfa', sparkKey: 'count',
      icon: '✉️', navTab: 'reports', analyticsTab: 'audience',
    },
    {
      label: 'Chat Sessions', value: overviewData.chat?.conversations || 0,
      growth: overviewData.chat?.growthPercent,
      sparkData: getSparkData('chat'), sparkColor: '#22d3ee', sparkKey: 'count',
      icon: '💬', navTab: 'reports', analyticsTab: 'audience',
    },
    {
      label: 'CRM Leads', value: overviewData.leads?.total || 0,
      growth: overviewData.leads?.growthPercent,
      sparkData: getSparkData('leads'), sparkColor: '#fb923c', sparkKey: 'count',
      icon: '👤', navTab: 'reports', analyticsTab: 'audience',
      badge: overviewData.leads?.byStatus?.new ? `${overviewData.leads.byStatus.new} new` : null,
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">Platform Overview</h2>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="hidden sm:inline">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-500 hidden sm:inline">
              Updated {secondsAgo < 5 ? 'just now' : `${secondsAgo}s ago`}
            </span>
          )}
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-700 text-white text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={() => fetchOverviewData()}
            className="bg-cyan-600 text-white px-4 py-2 rounded-xl hover:bg-cyan-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {primaryCards.map((card) => (
          <motion.div
            key={card.key}
            variants={cardVariants}
            onClick={() => card.navTab && handleNavigate(card.navTab, card.analyticsTab)}
            className={`bg-gray-800/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg border transition-all duration-500 cursor-pointer hover:border-gray-500 hover:shadow-xl group ${
              changedKeys.has(card.key) ? 'border-green-500/60 shadow-green-500/10' : 'border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.iconBg} p-2.5 rounded-xl`}>
                <svg className={`w-5 h-5 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {card.icon}
              </svg>
            </div>
              {card.growth !== undefined && <GrowthBadge percent={card.growth} />}
              {card.badge && !card.growth && (
                <div className="bg-red-900/30 text-red-300 px-3 py-1 rounded-full text-xs font-medium">{card.badge}</div>
              )}
            </div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{card.label}</h3>
            <div className="flex items-end justify-between">
              <AnimatedNumber value={card.value} format={card.format} className="text-2xl font-bold text-white tabular-nums" />
              {card.sparkData && <Sparkline data={card.sparkData} color={card.sparkColor} dataKey={card.sparkKey} />}
          </div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Growth Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h3 className="text-lg font-semibold text-white">Growth Trends</h3>
          <div className="flex gap-1 bg-gray-900/60 rounded-xl p-1">
            {Object.entries(tabConfig).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveChart(key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeChart === key
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 300 }}>
          {chartData.length === 0 ? (
            <ChartEmptyState />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeChart}
                variants={chartVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ height: '100%' }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`gradient-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={currentTab.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={currentTab.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: chartTheme.axisTick, fontSize: 11 }}
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        return isNaN(d) ? v : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }}
                      axisLine={{ stroke: chartTheme.grid }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: chartTheme.axisTick, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={45}
                      tickFormatter={(v) => activeChart === 'revenue' ? `$${v}` : v}
                    />
                    <Tooltip content={<DarkTooltip valuePrefix={activeChart === 'revenue' ? '$' : ''} />} />
                    <Area
                      type="monotone"
                      dataKey={currentTab.key}
                      stroke={currentTab.color}
                      strokeWidth={2}
                      fill={`url(#gradient-${activeChart})`}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          )}
            </div>
      </motion.div>

      {/* Secondary KPI Cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {secondaryCards.map((m, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            onClick={() => m.navTab && handleNavigate(m.navTab, m.analyticsTab)}
            className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 cursor-pointer hover:border-gray-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{m.icon}</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 truncate">{m.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <AnimatedNumber value={m.value} className="text-lg font-bold text-white tabular-nums" />
                {m.growth !== undefined && <GrowthBadge percent={m.growth} />}
                {m.badge && <span className="ml-2 text-xs text-orange-300">{m.badge}</span>}
            </div>
              <Sparkline data={m.sparkData} color={m.sparkColor} dataKey={m.sparkKey} />
          </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Unified Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700"
        >
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            Order Status Distribution
            <span className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent" />
          </h3>
          <div className="space-y-4">
            {overviewData.orderStatuses?.map((status, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1.5 text-sm">
                  <span className="text-gray-400 capitalize">{status.status}</span>
                  <span className="text-white font-semibold tabular-nums">{status.count}</span>
                </div>
                <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(status.count / (overviewData.orders?.total || 1)) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * index, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: getStatusColor(status.status) }}
                  />
                </div>
              </div>
            ))}
            {(!overviewData.orderStatuses || overviewData.orderStatuses.length === 0) && (
              <p className="text-center text-gray-500 py-4 text-sm">No order data yet</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              Recent Activity
              <span className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent" />
            </h3>
            <button
              onClick={() => handleNavigate('reports', 'livefeed')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              View all →
            </button>
                </div>
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700">
            {(overviewData.activityFeed || []).map((event, index) => {
              const iconCfg = FEED_ICONS[event.type] || FEED_ICONS.order;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.04 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-700/30 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${iconCfg.bg} border`}>
                    {iconCfg.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white font-medium truncate">{event.title}</div>
                    <div className="text-xs text-gray-500">
                      {event.metadata && <span className="text-gray-400">{event.metadata} · </span>}
                      {relativeTime(event.timestamp)}
                </div>
              </div>
                </motion.div>
              );
            })}
            {(!overviewData.activityFeed || overviewData.activityFeed.length === 0) && (
              <p className="text-center text-gray-500 py-6 text-sm">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700"
      >
        <h3 className="text-base font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Add Product', tab: 'products', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /> },
            { label: 'Orders', tab: 'orders', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
            { label: 'Upload STL', tab: 'stl-files', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /> },
            { label: 'Analytics', tab: 'reports', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
            { label: 'Inventory', tab: 'inventory', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /> },
            { label: 'Newsletter', tab: 'newsletter', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
          ].map((action) => (
            <button
              key={action.tab}
              onClick={() => handleNavigate(action.tab)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-700/30 border border-gray-600/30 hover:border-cyan-500/40 hover:bg-gray-700/50 transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform">
                {action.icon}
              </svg>
              <span className="text-[11px] font-semibold text-gray-300">{action.label}</span>
          </button>
          ))}
            </div>
      </motion.div>

      {/* Email Delivery Summary (only if campaigns exist) */}
      {overviewData.emailDelivery?.totalSent > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700"
        >
          <h3 className="text-base font-semibold text-white mb-4">Email Delivery</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Sent', value: overviewData.emailDelivery.totalSent, color: 'text-blue-400' },
              { label: 'Delivered', value: overviewData.emailDelivery.delivered, color: 'text-green-400' },
              { label: 'Opened', value: overviewData.emailDelivery.opened, color: 'text-cyan-400' },
              { label: 'Bounced', value: overviewData.emailDelivery.bounced, color: 'text-red-400' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
            ))}
            </div>
          {overviewData.emailDelivery.deliveryRate !== null && (
            <div className="mt-4 pt-4 border-t border-gray-700/50 text-center">
              <span className="text-sm text-gray-400">Delivery Rate: </span>
              <span className="text-sm font-bold text-green-400">{overviewData.emailDelivery.deliveryRate}%</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AdminOverview;
