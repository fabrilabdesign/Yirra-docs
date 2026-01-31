import getApiUrl from '../utils/api.js';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminOrdersNew = () => {
  const { getToken } = useAuth();
  
  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('ordersViewMode') || 'table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Slideout panel state
  const [slideoutOpen, setSlideoutOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [slideoutTab, setSlideoutTab] = useState('details');
  
  // Modals
  const [refundModal, setRefundModal] = useState({ open: false, order: null });
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [refundLoading, setRefundLoading] = useState(false);
  
  const [trackingModal, setTrackingModal] = useState({ open: false, order: null });
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('auspost');
  const [carrierService, setCarrierService] = useState('standard');

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      
      const params = new URLSearchParams();
      if (statusFilter.length > 0) {
        statusFilter.forEach(status => params.append('status[]', status));
      }
      if (dateRange !== 'all') params.append('dateRange', dateRange);

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    const paidOrders = orders.filter(o => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status));
    const needsAction = orders.filter(o => ['paid', 'processing', 'payment_pending'].includes(o.status));
    const awaitingShipment = orders.filter(o => o.status === 'paid' && !o.shipped_at);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const shipped = orders.filter(o => ['shipped', 'delivered'].includes(o.status));
    const fulfillmentRate = orders.length > 0 ? (shipped.length / orders.length) * 100 : 0;

    return {
      totalOrders: orders.length,
      totalRevenue,
      needsAction: needsAction.length,
      awaitingShipment: awaitingShipment.length,
      avgOrderValue,
      fulfillmentRate
    };
  }, [orders]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: orders.length,
      needsAction: orders.filter(o => ['paid', 'processing', 'payment_pending'].includes(o.status)).length,
      awaiting: orders.filter(o => o.status === 'paid' && !o.shipped_at).length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      completed: orders.filter(o => ['delivered', 'completed'].includes(o.status)).length,
      issues: orders.filter(o => ['failed', 'refunded', 'disputed', 'payment_failed'].includes(o.status)).length
    };
  }, [orders]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Tab filter
    if (activeTab === 'needsAction') {
      filtered = filtered.filter(o => ['paid', 'processing', 'payment_pending'].includes(o.status));
    } else if (activeTab === 'awaiting') {
      filtered = filtered.filter(o => o.status === 'paid' && !o.shipped_at);
    } else if (activeTab === 'shipped') {
      filtered = filtered.filter(o => o.status === 'shipped');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(o => ['delivered', 'completed'].includes(o.status));
    } else if (activeTab === 'issues') {
      filtered = filtered.filter(o => ['failed', 'refunded', 'disputed', 'payment_failed'].includes(o.status));
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.id?.toString().includes(search) ||
        o.order_id?.toLowerCase().includes(search) ||
        o.customer_email?.toLowerCase().includes(search) ||
        o.customer_name?.toLowerCase().includes(search) ||
        (o.items && o.items.some(item => item.product_name?.toLowerCase().includes(search)))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'total_amount') {
        aVal = parseFloat(aVal || 0);
        bVal = parseFloat(bVal || 0);
      } else if (sortConfig.key === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [orders, activeTab, searchTerm, sortConfig]);

  // Handlers
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('ordersViewMode', mode);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const toggleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setSlideoutOpen(true);
    setSlideoutTab('details');
  };

  const closeSlideout = () => {
    setSlideoutOpen(false);
    setSelectedOrder(null);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const openRefundModal = (order) => {
    const amountInDollars = (order.amount_total || order.total_amount * 100) / 100;
    setRefundAmount(amountInDollars.toFixed(2));
    setRefundReason('requested_by_customer');
    setRefundModal({ open: true, order });
  };

  const processRefund = async () => {
    if (!refundModal.order) return;
    
    const amountInCents = Math.round(parseFloat(refundAmount) * 100);
    if (isNaN(amountInCents) || amountInCents <= 0) {
      alert('Please enter a valid refund amount');
      return;
    }

    try {
      setRefundLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`/api/admin/orders/${refundModal.order.id}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: amountInCents, reason: refundReason })
      });

      if (response.ok) {
        setRefundModal({ open: false, order: null });
        fetchOrders();
        if (selectedOrder?.id === refundModal.order.id) {
          closeSlideout();
        }
      }
    } catch (err) {
      console.error('Refund error:', err);
    } finally {
      setRefundLoading(false);
    }
  };

  const openTrackingModal = (order) => {
    setTrackingModal({ open: true, order });
    setTrackingNumber('');
    setCarrier('auspost');
    setCarrierService('standard');
  };

  const addTracking = async () => {
    if (!trackingModal.order || !trackingNumber) return;

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`/api/admin/orders/${trackingModal.order.id}/ship`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trackingNumber,
          carrier,
          service: carrierService
        })
      });

      if (response.ok) {
        setTrackingModal({ open: false, order: null });
        fetchOrders();
        if (selectedOrder?.id === trackingModal.order.id) {
          setSelectedOrder(prev => ({ ...prev, tracking_number: trackingNumber, carrier, status: 'shipped' }));
        }
      }
    } catch (err) {
      console.error('Tracking error:', err);
    }
  };

  const exportToCSV = () => {
    const ordersToExport = selectedOrders.size > 0 
      ? filteredOrders.filter(o => selectedOrders.has(o.id))
      : filteredOrders;

    const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Items', 'Subtotal', 'Shipping', 'Total', 'Status'];
    const rows = ordersToExport.map(o => [
      o.order_id || o.id,
      new Date(o.created_at).toLocaleDateString(),
      o.customer_name || '',
      o.customer_email || '',
      o.items?.map(i => `${i.product_name} x${i.quantity}`).join('; ') || '',
      ((o.amount_subtotal || 0) / 100).toFixed(2),
      ((o.shipping_cost || 0) / 100).toFixed(2),
      (o.total_amount || 0).toFixed(2),
      o.status
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Formatters
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#38a169', paid: '#38a169', delivered: '#2f855a',
      pending: '#ed8936', payment_pending: '#ed8936', processing: '#3182ce',
      failed: '#e53e3e', payment_failed: '#e53e3e', refunded: '#718096',
      shipped: '#3182ce', disputed: '#d69e2e'
    };
    return colors[status] || '#4a5568';
  };

  if (loading && orders.length === 0) {
    return <div className="p-8 text-center text-text-secondary">Loading orders...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <h2 className="text-[18px] leading-6 font-semibold text-text-primary">Order Management</h2>
        
        {/* Stats Grid - 6 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Total Orders */}
          <div 
            className="bg-elev1 rounded-12 p-4 shadow-elev1 border border-line-soft hover:shadow-elev2 transition-all cursor-pointer"
            onClick={() => setActiveTab('all')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-900/50 p-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div className="text-[16px] leading-6 font-semibold text-text-primary">{stats.totalOrders}</div>
            <div className="text-[13px] text-text-tertiary">Total Orders</div>
          </div>

          {/* Revenue */}
          <div className="bg-elev1 rounded-12 p-4 shadow-elev1 border border-line-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-900/50 p-2 rounded-lg">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-[16px] leading-6 font-semibold text-text-primary">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-[13px] text-text-tertiary">Total Revenue</div>
          </div>

          {/* Needs Action */}
          <div 
            className="bg-elev1 rounded-12 p-4 shadow-elev1 border border-line-soft hover:shadow-elev2 transition-all cursor-pointer"
            onClick={() => setActiveTab('needsAction')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-900/50 p-2 rounded-lg">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="text-[16px] leading-6 font-semibold text-text-primary">{stats.needsAction}</div>
            <div className="text-[13px] text-text-tertiary">Needs Action</div>
          </div>

          {/* Awaiting Shipment */}
          <div 
            className="bg-elev1 rounded-12 p-4 shadow-elev1 border border-line-soft hover:shadow-elev2 transition-all cursor-pointer"
            onClick={() => setActiveTab('awaiting')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-900/50 p-2 rounded-lg">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="text-[16px] leading-6 font-semibold text-text-primary">{stats.awaitingShipment}</div>
            <div className="text-[13px] text-text-tertiary">Awaiting Shipment</div>
          </div>

          {/* Average Order Value */}
          <div className="bg-elev1 rounded-12 p-4 shadow-elev1 border border-line-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-indigo-900/50 p-2 rounded-lg">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-[16px] leading-6 font-semibold text-text-primary">{formatCurrency(stats.avgOrderValue)}</div>
            <div className="text-[13px] text-text-tertiary">Avg Order Value</div>
          </div>

          {/* Fulfillment Rate */}
          <div className="bg-elev1 rounded-12 p-4 shadow-elev1 border border-line-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-teal-900/50 p-2 rounded-lg">
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-[16px] leading-6 font-semibold text-text-primary">{stats.fulfillmentRate.toFixed(1)}%</div>
            <div className="text-[13px] text-text-tertiary">Fulfillment Rate</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line-soft pb-2">
        {[
          { id: 'all', label: 'All Orders', count: tabCounts.all },
          { id: 'needsAction', label: 'Needs Action', count: tabCounts.needsAction },
          { id: 'awaiting', label: 'Awaiting Shipment', count: tabCounts.awaiting },
          { id: 'shipped', label: 'Shipped', count: tabCounts.shipped },
          { id: 'completed', label: 'Completed', count: tabCounts.completed },
          { id: 'issues', label: 'Issues', count: tabCounts.issues }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-10 text-[13px] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-brand text-white'
                : 'bg-elev1 text-text-secondary hover:bg-elev2'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-brand/20 text-brand'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
        <div className="flex gap-3 flex-1 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search orders, customers, products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-9 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-brand/50 focus:border-brand"
            />
          </div>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-brand/50"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="flex bg-elev1 rounded-10 p-1">
            <button
              onClick={() => toggleViewMode('table')}
              className={`px-3 py-1 rounded-lg text-[12px] transition-all ${
                viewMode === 'table' ? 'bg-brand text-white' : 'text-text-secondary'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => toggleViewMode('cards')}
              className={`px-3 py-1 rounded-lg text-[12px] transition-all ${
                viewMode === 'cards' ? 'bg-brand text-white' : 'text-text-secondary'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* Export */}
          <button
            onClick={exportToCSV}
            className="px-4 py-2 h-9 rounded-10 bg-elev1 border border-line-soft text-text-primary hover:bg-elev2 transition-all text-[13px] font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Orders List - Table or Cards View */}
      {viewMode === 'table' ? (
        <div className="hidden md:block bg-elev1 rounded-12 border border-line-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-elev2 border-b border-line-soft">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-line-soft"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-[13px] font-medium text-text-secondary cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort('order_id')}
                >
                  Order {sortConfig.key === 'order_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-[13px] font-medium text-text-secondary cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort('created_at')}
                >
                  Date {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-medium text-text-secondary">Customer</th>
                <th className="px-4 py-3 text-left text-[13px] font-medium text-text-secondary">Items</th>
                <th 
                  className="px-4 py-3 text-left text-[13px] font-medium text-text-secondary cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort('total_amount')}
                >
                  Total {sortConfig.key === 'total_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-medium text-text-secondary">Status</th>
                <th className="px-4 py-3 text-left text-[13px] font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr 
                  key={order.id}
                  className="border-b border-line-soft hover:bg-elev2 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={() => toggleSelectOrder(order.id)}
                      className="rounded border-line-soft"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-medium text-text-primary">#{order.id}</div>
                    <div className="text-[11px] text-text-tertiary">{order.order_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] text-text-primary">{getRelativeTime(order.created_at)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] text-text-primary">{order.customer_name || 'Guest'}</div>
                    <div className="text-[11px] text-text-tertiary">{order.customer_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] text-text-primary">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx}>{item.product_name} x{item.quantity}</div>
                      ))}
                      {order.items?.length > 2 && (
                        <div className="text-text-tertiary">+{order.items.length - 2} more</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-medium text-text-primary">{formatCurrency(order.total_amount)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className="px-2 py-1 text-[11px] font-medium rounded-full"
                      style={{ 
                        backgroundColor: getStatusColor(order.status) + '20', 
                        color: getStatusColor(order.status) 
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="px-2 py-1 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {order.status === 'paid' && (
                        <button
                          onClick={() => openTrackingModal(order)}
                          className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                          title="Add Tracking"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Cards view (existing mobile pattern)
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-elev1 rounded-12 p-4 shadow-elev1 border border-line-soft hover:shadow-elev2 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[16px] leading-6 font-semibold text-text-primary">#{order.id}</h3>
                    <span 
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: getStatusColor(order.status) + '20', 
                        color: getStatusColor(order.status) 
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-text-tertiary">{order.order_id}</p>
                </div>
                <div className="text-right">
                  <div className="text-[16px] leading-6 font-semibold text-text-primary">{formatCurrency(order.total_amount)}</div>
                  <div className="text-[13px] text-text-tertiary">{getRelativeTime(order.created_at)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="text-[12px] font-medium text-text-tertiary">Customer</div>
                  <div className="text-[13px] text-text-primary">{order.customer_email || order.user_email}</div>
                  <div className="text-[13px] text-text-tertiary">{order.customer_name || 'Guest'}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-[12px] font-medium text-text-tertiary">Items</div>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="text-[13px] text-text-primary">
                      {item.product_name} x{item.quantity}
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <div className="text-[12px] font-medium text-text-tertiary">Shipping</div>
                  {order.shipping_address ? (
                    (() => {
                      const addr = typeof order.shipping_address === 'string' 
                        ? JSON.parse(order.shipping_address) 
                        : order.shipping_address;
                      return (
                        <div className="text-[13px] text-text-primary">
                          {addr.address?.country || 'N/A'}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-[13px] text-text-tertiary">No shipping info</div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-line-soft">
                <button 
                  onClick={() => openOrderDetails(order)}
                  className="px-3 py-2 rounded-10 bg-brand/10 text-brand hover:bg-brand/20 font-medium text-[12px]"
                >
                  View Details
                </button>
                {order.status === 'paid' && (
                  <button 
                    onClick={() => openTrackingModal(order)}
                    className="px-3 py-2 rounded-10 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 font-medium text-[12px]"
                  >
                    Add Tracking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-text-tertiary text-lg mb-2">📦</div>
          <p className="text-text-secondary">{error || 'No orders found'}</p>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-elev1 border border-line-soft rounded-12 shadow-lg p-4 flex items-center gap-4 z-40">
          <span className="text-[13px] text-text-primary font-medium">
            {selectedOrders.size} selected
          </span>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-10 bg-brand text-white hover:opacity-90 text-[13px] font-medium">
              Mark Shipped
            </button>
            <button 
              onClick={exportToCSV}
              className="px-4 py-2 rounded-10 bg-elev2 text-text-primary hover:bg-elev3 text-[13px] font-medium"
            >
              Export Selected
            </button>
            <button 
              onClick={() => setSelectedOrders(new Set())}
              className="px-4 py-2 rounded-10 bg-elev2 text-text-primary hover:bg-elev3 text-[13px] font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slideout Panel */}
      {slideoutOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={closeSlideout}></div>
          <div className="relative w-full max-w-2xl bg-elev1 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-elev1 border-b border-line-soft p-6 z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[18px] font-semibold text-text-primary">Order #{selectedOrder.id}</h3>
                  <p className="text-[13px] text-text-tertiary mt-1">{selectedOrder.order_id}</p>
                </div>
                <button
                  onClick={closeSlideout}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {[
                  { id: 'details', label: 'Details' },
                  { id: 'timeline', label: 'Timeline' },
                  { id: 'notes', label: 'Notes' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSlideoutTab(tab.id)}
                    className={`px-4 py-2 rounded-10 text-[13px] font-medium transition-all ${
                      slideoutTab === tab.id
                        ? 'bg-brand text-white'
                        : 'bg-elev2 text-text-secondary hover:bg-elev3'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {slideoutTab === 'details' && (
                <>
                  {/* Status */}
                  <div>
                    <p className="text-[12px] font-medium text-text-tertiary mb-2">Status</p>
                    <span 
                      className="inline-block px-3 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: getStatusColor(selectedOrder.status) + '20', 
                        color: getStatusColor(selectedOrder.status) 
                      }}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <p className="text-[12px] font-medium text-text-tertiary mb-2">Customer Information</p>
                    <div className="bg-elev0 rounded-10 p-4 space-y-2">
                      <p className="text-[14px] text-text-primary">
                        <span className="font-medium">Name:</span> {selectedOrder.customer_name || 'N/A'}
                      </p>
                      <p className="text-[14px] text-text-primary">
                        <span className="font-medium">Email:</span> {selectedOrder.customer_email || 'N/A'}
                      </p>
                      {selectedOrder.customer_phone && (
                        <p className="text-[14px] text-text-primary">
                          <span className="font-medium">Phone:</span> {selectedOrder.customer_phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-[12px] font-medium text-text-tertiary mb-2">Order Items</p>
                    <div className="bg-elev0 rounded-10 p-4 space-y-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start pb-3 border-b border-line-soft last:border-0 last:pb-0">
                          <div>
                            <p className="text-[14px] font-medium text-text-primary">{item.product_name}</p>
                            <p className="text-[13px] text-text-tertiary">Quantity: {item.quantity}</p>
                          </div>
                          <p className="text-[14px] font-medium text-text-primary">{formatCurrency(item.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shipping_address && (
                    <div>
                      <p className="text-[12px] font-medium text-text-tertiary mb-2">Shipping Address</p>
                      <div className="bg-elev0 rounded-10 p-4">
                        {(() => {
                          const addr = typeof selectedOrder.shipping_address === 'string' 
                            ? JSON.parse(selectedOrder.shipping_address) 
                            : selectedOrder.shipping_address;
                          return (
                            <div className="text-[14px] text-text-primary space-y-1">
                              {addr.name && <p className="font-medium">{addr.name}</p>}
                              {addr.address?.line1 && <p>{addr.address.line1}</p>}
                              {addr.address?.line2 && <p>{addr.address.line2}</p>}
                              <p>
                                {addr.address?.city}{addr.address?.state ? `, ${addr.address.state}` : ''} {addr.address?.postal_code}
                              </p>
                              <p className="font-medium">{addr.address?.country}</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div>
                    <p className="text-[12px] font-medium text-text-tertiary mb-2">Payment Summary</p>
                    <div className="bg-elev0 rounded-10 p-4 space-y-2">
                      {selectedOrder.amount_subtotal && (
                        <div className="flex justify-between">
                          <span className="text-[14px] text-text-secondary">Subtotal</span>
                          <span className="text-[14px] text-text-primary">{formatCurrency(selectedOrder.amount_subtotal / 100)}</span>
                        </div>
                      )}
                      {selectedOrder.shipping_cost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[14px] text-text-secondary">Shipping</span>
                          <span className="text-[14px] text-text-primary">{formatCurrency(selectedOrder.shipping_cost / 100)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-line-soft">
                        <span className="text-[16px] font-semibold text-text-primary">Total</span>
                        <span className="text-[16px] font-semibold text-text-primary">{formatCurrency(selectedOrder.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fulfillment Section */}
                  {selectedOrder.status === 'paid' && (
                    <div>
                      <p className="text-[12px] font-medium text-text-tertiary mb-2">Fulfillment</p>
                      <div className="bg-elev0 rounded-10 p-4">
                        <button
                          onClick={() => openTrackingModal(selectedOrder)}
                          className="w-full px-4 py-2 rounded-10 bg-brand text-white hover:opacity-90 font-medium text-[13px]"
                        >
                          Add Tracking Number
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-4 border-t border-line-soft">
                    {['paid', 'completed', 'delivered'].includes(selectedOrder.status) && (
                      <button
                        onClick={() => openRefundModal(selectedOrder)}
                        className="flex-1 px-4 py-2 rounded-10 bg-warning/10 text-warning hover:bg-warning/20 font-medium text-[13px]"
                      >
                        Refund
                      </button>
                    )}
                    <button className="flex-1 px-4 py-2 rounded-10 bg-elev2 text-text-primary hover:bg-elev3 font-medium text-[13px]">
                      Print
                    </button>
                  </div>
                </>
              )}

              {slideoutTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-brand rounded-full mt-2"></div>
                    <div>
                      <p className="text-[14px] font-medium text-text-primary">Order Created</p>
                      <p className="text-[13px] text-text-tertiary">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                  </div>
                  {selectedOrder.paid_at && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                      <div>
                        <p className="text-[14px] font-medium text-text-primary">Payment Received</p>
                        <p className="text-[13px] text-text-tertiary">{formatDate(selectedOrder.paid_at)}</p>
                      </div>
                    </div>
                  )}
                  <p className="text-[13px] text-text-tertiary italic">Full timeline coming soon...</p>
                </div>
              )}

              {slideoutTab === 'notes' && (
                <div>
                  <p className="text-[13px] text-text-tertiary">Internal notes feature coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-elev1 rounded-12 p-6 w-full max-w-md mx-4 shadow-elev2 border border-line-soft">
            <h3 className="text-[18px] font-semibold text-text-primary mb-4">Process Refund</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[13px] text-text-tertiary mb-2">
                  Order #{refundModal.order?.id}
                </p>
                <p className="text-[13px] text-text-tertiary">
                  Order Total: {formatCurrency((refundModal.order?.amount_total || refundModal.order?.total_amount * 100) / 100)}
                </p>
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1">
                  Refund Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full h-9 px-3 rounded-10 bg-elev0 border border-line-soft text-text-primary focus:ring-2 focus:ring-brand/50 focus:border-brand"
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1">Reason</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full h-9 px-3 rounded-10 bg-elev0 border border-line-soft text-text-primary focus:ring-2 focus:ring-brand/50"
                >
                  <option value="requested_by_customer">Customer Request</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="fraudulent">Fraudulent</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setRefundModal({ open: false, order: null })}
                disabled={refundLoading}
                className="flex-1 h-9 rounded-10 bg-elev2 text-text-secondary hover:opacity-90 font-medium text-[13px]"
              >
                Cancel
              </button>
              <button
                onClick={processRefund}
                disabled={refundLoading}
                className="flex-1 h-9 rounded-10 bg-warning text-white hover:opacity-90 font-medium text-[13px] disabled:opacity-50"
              >
                {refundLoading ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-12 p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-[18px] font-semibold text-gray-900 dark:text-white mb-4">Add Tracking Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">Carrier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auspost">Australia Post</option>
                  <option value="startrack">StarTrack</option>
                  <option value="dhl">DHL</option>
                  <option value="fedex">FedEx</option>
                  <option value="ups">UPS</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">Service Type</label>
                <select
                  value={carrierService}
                  onChange={(e) => setCarrierService(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full h-10 px-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setTrackingModal({ open: false, order: null })}
                className="flex-1 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-[13px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTracking}
                disabled={!trackingNumber}
                className="flex-1 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-[13px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersNew;
