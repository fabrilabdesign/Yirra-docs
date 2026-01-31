import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminOrders = () => {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refund modal state
  const [refundModal, setRefundModal] = useState({ open: false, order: null });
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [refundLoading, setRefundLoading] = useState(false);
  
  // Details modal state
  const [detailsModal, setDetailsModal] = useState({ open: false, order: null });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
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
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update order status');
    }
  };

  const openRefundModal = (order) => {
    // Default to full refund amount (convert from cents to dollars for display)
    const amountInDollars = (order.amount_total || order.total_amount * 100) / 100;
    setRefundAmount(amountInDollars.toFixed(2));
    setRefundReason('requested_by_customer');
    setRefundModal({ open: true, order });
  };

  const closeRefundModal = () => {
    setRefundModal({ open: false, order: null });
    setRefundAmount('');
    setRefundReason('requested_by_customer');
  };
  
  const openDetailsModal = (order) => {
    setDetailsModal({ open: true, order });
  };
  
  const closeDetailsModal = () => {
    setDetailsModal({ open: false, order: null });
  };

  const processRefund = async () => {
    if (!refundModal.order) return;
    
    const amountInCents = Math.round(parseFloat(refundAmount) * 100);
    if (isNaN(amountInCents) || amountInCents <= 0) {
      alert('Please enter a valid refund amount');
      return;
    }

    const orderTotal = refundModal.order.amount_total || (refundModal.order.total_amount * 100);
    if (amountInCents > orderTotal) {
      alert('Refund amount cannot exceed order total');
      return;
    }

    if (!confirm(`Are you sure you want to refund $${refundAmount} for order #${refundModal.order.id}?`)) {
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
        body: JSON.stringify({
          amount: amountInCents,
          reason: refundReason
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Refund successful! ${data.message}`);
        closeRefundModal();
        fetchOrders();
      } else {
        throw new Error(data.error || 'Failed to process refund');
      }
    } catch (err) {
      console.error('Refund error:', err);
      alert(`Refund failed: ${err.message}`);
    } finally {
      setRefundLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#38a169';
      case 'paid': return '#38a169';
      case 'pending': return '#ed8936';
      case 'payment_pending': return '#ed8936';
      case 'failed': return '#e53e3e';
      case 'payment_failed': return '#e53e3e';
      case 'refunded': return '#718096';
      case 'shipped': return '#3182ce';
      case 'delivered': return '#2f855a';
      default: return '#4a5568';
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Mobile Header */}
      <div className="flex flex-col space-y-4">
        <h2 className="text-[18px] leading-6 font-semibold text-text-primary">Order Management</h2>
        
        {/* Mobile Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-elev1 rounded-12 p-4 shadow-elev1 border border-line-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-900/50 p-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div className="text-[16px] leading-6 font-semibold text-text-primary">{orders.length}</div>
            <div className="text-[13px] text-text-tertiary">Total Orders</div>
          </div>
          
          <div className="bg-elev1 rounded-12 p-4 shadow-elev1 border border-line-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-900/50 p-2 rounded-lg">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-[16px] leading-6 font-semibold text-text-primary">
              {formatCurrency(orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0))}
            </div>
            <div className="text-[13px] text-text-tertiary">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search orders, customers, products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 h-9 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
          />
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex-1 h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Mobile Order Cards */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-elev1 rounded-12 p-4 shadow-elev1 border border-line-soft hover:shadow-elev2 transition-all duration-300">
              {/* Header Row */}
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
                  {order.stripe_payment_intent_id && (
                    <p className="text-sm text-gray-500">
                      Stripe: {order.stripe_payment_intent_id.substring(0, 20)}...
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[16px] leading-6 font-semibold text-text-primary">{formatCurrency(order.total_amount)}</div>
                  <div className="text-[13px] text-text-tertiary">{formatCurrency(order.unit_price)} each</div>
                </div>
              </div>

              {/* Customer & Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="text-[12px] font-medium text-text-tertiary">Customer</div>
                  <div className="text-[13px] text-text-primary">{order.customer_email || order.user_email}</div>
                  <div className="text-[13px] text-text-tertiary">
                    {order.customer_name || `${order.user_first_name || ''} ${order.user_last_name || ''}`.trim() || 'Guest'}
                  </div>
                  {order.customer_phone && (
                    <div className="text-[13px] text-text-tertiary">{order.customer_phone}</div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="text-[12px] font-medium text-text-tertiary">Items</div>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={idx} className="text-[13px] text-text-primary">
                        {item.product_name} x{item.quantity}
                        {item.unlocks_stls && (
                          <span className="ml-2 bg-[rgba(99,102,241,.12)] text-brand px-2 py-0.5 rounded text-[11px]">STL</span>
                        )}
                      </div>
                    ))
                  ) : order.line_items ? (
                    JSON.parse(typeof order.line_items === 'string' ? order.line_items : JSON.stringify(order.line_items)).map((item, idx) => (
                      <div key={idx} className="text-[13px] text-text-primary">
                        Product: {item.productId} x{item.quantity}
                      </div>
                    ))
                  ) : (
                    <div className="text-[13px] text-text-tertiary">No items</div>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="space-y-1">
                  <div className="text-[12px] font-medium text-text-tertiary">Shipping Address</div>
                  {order.shipping_address ? (
                    (() => {
                      const addr = typeof order.shipping_address === 'string' 
                        ? JSON.parse(order.shipping_address) 
                        : order.shipping_address;
                      return (
                        <div className="text-[13px] text-text-primary">
                          {addr.name && <div className="font-medium">{addr.name}</div>}
                          {addr.address?.line1 && <div>{addr.address.line1}</div>}
                          {addr.address?.line2 && <div>{addr.address.line2}</div>}
                          <div>
                            {addr.address?.city}{addr.address?.state ? `, ${addr.address.state}` : ''} {addr.address?.postal_code}
                          </div>
                          <div className="font-medium">{addr.address?.country}</div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-[13px] text-text-tertiary">No shipping info</div>
                  )}
                  {order.shipping_cost > 0 && (
                    <div className="text-[12px] text-text-tertiary mt-1">
                      Shipping: {formatCurrency(order.shipping_cost / 100)}
                    </div>
                  )}
                </div>
              </div>

              {/* Date & Actions Row */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-3 border-t border-line-soft">
                <div className="text-[13px] text-text-tertiary">
                  <div>Created: {formatDate(order.created_at)}</div>
                  {order.updated_at !== order.created_at && (
                    <div>Updated: {formatDate(order.updated_at)}</div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {(order.status === 'paid' || order.status === 'pending') && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      className="px-3 py-2 rounded-10 bg-[rgba(59,130,246,.12)] text-blue-500 hover:opacity-90 font-medium text-[12px]"
                    >
                      📦 Mark Shipped
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="px-3 py-2 rounded-10 bg-[rgba(34,197,94,.12)] text-success hover:opacity-90 font-medium text-[12px]"
                    >
                      ✅ Mark Delivered
                    </button>
                  )}
                  {(order.status === 'paid' || order.status === 'completed' || order.status === 'delivered' || order.status === 'partially_refunded') && order.status !== 'refunded' && (
                    <button 
                      onClick={() => openRefundModal(order)}
                      className="px-3 py-2 rounded-10 bg-[rgba(245,158,11,.12)] text-warning hover:opacity-90 font-medium text-[12px]"
                    >
                      💰 Refund
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'failed')}
                      className="px-3 py-2 rounded-10 bg-[rgba(239,68,68,.12)] text-danger hover:opacity-90 font-medium text-[12px]"
                    >
                      ❌ Cancel
                    </button>
                  )}
                  <button 
                    onClick={() => openDetailsModal(order)}
                    className="px-3 py-2 rounded-10 bg-[rgba(99,102,241,.12)] text-brand hover:opacity-90 font-medium text-[12px]"
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">📦</div>
            <p className="text-gray-500">
              {error ? error : 'No orders found'}
            </p>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-elev1 rounded-12 p-6 w-full max-w-md mx-4 shadow-elev2 border border-line-soft">
            <h3 className="text-[18px] font-semibold text-text-primary mb-4">
              Process Refund
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[13px] text-text-tertiary mb-2">
                  Order #{refundModal.order?.id} - {refundModal.order?.customer_email || refundModal.order?.user_email}
                </p>
                <p className="text-[13px] text-text-tertiary">
                  Order Total: {formatCurrency((refundModal.order?.amount_total || refundModal.order?.total_amount * 100) / 100)}
                </p>
                {refundModal.order?.refund_amount > 0 && (
                  <p className="text-[13px] text-warning">
                    Already Refunded: {formatCurrency(refundModal.order.refund_amount / 100)}
                  </p>
                )}
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
                  className="w-full h-9 px-3 rounded-10 bg-elev0 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                  placeholder="Enter refund amount"
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1">
                  Reason
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full h-9 px-3 rounded-10 bg-elev0 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                >
                  <option value="requested_by_customer">Customer Request</option>
                  <option value="duplicate">Duplicate Charge</option>
                  <option value="fraudulent">Fraudulent</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeRefundModal}
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

      {/* Order Details Modal */}
      {detailsModal.open && detailsModal.order && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-elev1 rounded-12 p-6 w-full max-w-2xl mx-4 shadow-elev2 border border-line-soft max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[18px] font-semibold text-text-primary">Order Details</h3>
                <p className="text-[13px] text-text-tertiary mt-1">Order #{detailsModal.order.id}</p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Status and Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[12px] font-medium text-text-tertiary mb-2">Status</p>
                  <span 
                    className="inline-block px-3 py-1 text-xs font-medium rounded-full"
                    style={{ 
                      backgroundColor: getStatusColor(detailsModal.order.status) + '20', 
                      color: getStatusColor(detailsModal.order.status) 
                    }}
                  >
                    {detailsModal.order.status}
                  </span>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-text-tertiary mb-2">Payment Status</p>
                  <p className="text-[14px] text-text-primary">{detailsModal.order.payment_status || 'N/A'}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <p className="text-[12px] font-medium text-text-tertiary mb-2">Customer Information</p>
                <div className="bg-elev0 rounded-10 p-4 space-y-2">
                  <p className="text-[14px] text-text-primary">
                    <span className="font-medium">Name:</span> {detailsModal.order.customer_name || `${detailsModal.order.user_first_name || ''} ${detailsModal.order.user_last_name || ''}`.trim() || 'N/A'}
                  </p>
                  <p className="text-[14px] text-text-primary">
                    <span className="font-medium">Email:</span> {detailsModal.order.customer_email || detailsModal.order.user_email || 'N/A'}
                  </p>
                  {detailsModal.order.customer_phone && (
                    <p className="text-[14px] text-text-primary">
                      <span className="font-medium">Phone:</span> {detailsModal.order.customer_phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-[12px] font-medium text-text-tertiary mb-2">Order Items</p>
                <div className="bg-elev0 rounded-10 p-4 space-y-3">
                  {detailsModal.order.items && detailsModal.order.items.length > 0 ? (
                    detailsModal.order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start pb-3 border-b border-line-soft last:border-0 last:pb-0">
                        <div>
                          <p className="text-[14px] font-medium text-text-primary">{item.product_name}</p>
                          <p className="text-[13px] text-text-tertiary">Quantity: {item.quantity}</p>
                          {item.unlocks_stls && (
                            <span className="inline-block mt-1 bg-[rgba(99,102,241,.12)] text-brand px-2 py-0.5 rounded text-[11px]">
                              Includes STL Files
                            </span>
                          )}
                        </div>
                        <p className="text-[14px] font-medium text-text-primary">{formatCurrency(item.price)}</p>
                      </div>
                    ))
                  ) : detailsModal.order.line_items ? (
                    JSON.parse(typeof detailsModal.order.line_items === 'string' ? detailsModal.order.line_items : JSON.stringify(detailsModal.order.line_items)).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <p className="text-[14px] text-text-primary">Product ID: {item.productId} (x{item.quantity})</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[13px] text-text-tertiary">No items found</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {detailsModal.order.shipping_address && (
                <div>
                  <p className="text-[12px] font-medium text-text-tertiary mb-2">Shipping Address</p>
                  <div className="bg-elev0 rounded-10 p-4">
                    {(() => {
                      const addr = typeof detailsModal.order.shipping_address === 'string' 
                        ? JSON.parse(detailsModal.order.shipping_address) 
                        : detailsModal.order.shipping_address;
                      return (
                        <div className="text-[14px] text-text-primary space-y-1">
                          {addr.name && <p className="font-medium">{addr.name}</p>}
                          {addr.address?.line1 && <p>{addr.address.line1}</p>}
                          {addr.address?.line2 && <p>{addr.address.line2}</p>}
                          <p>
                            {addr.address?.city}{addr.address?.state ? `, ${addr.address.state}` : ''} {addr.address?.postal_code}
                          </p>
                          <p className="font-medium">{addr.address?.country}</p>
                          {addr.phone && <p className="text-text-tertiary text-[13px] mt-2">Phone: {addr.phone}</p>}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Billing Address */}
              {detailsModal.order.billing_address && (
                <div>
                  <p className="text-[12px] font-medium text-text-tertiary mb-2">Billing Address</p>
                  <div className="bg-elev0 rounded-10 p-4">
                    {(() => {
                      const addr = typeof detailsModal.order.billing_address === 'string' 
                        ? JSON.parse(detailsModal.order.billing_address) 
                        : detailsModal.order.billing_address;
                      return (
                        <div className="text-[14px] text-text-primary space-y-1">
                          {addr.line1 && <p>{addr.line1}</p>}
                          {addr.line2 && <p>{addr.line2}</p>}
                          <p>
                            {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postal_code}
                          </p>
                          <p className="font-medium">{addr.country}</p>
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
                  {detailsModal.order.amount_subtotal && (
                    <div className="flex justify-between">
                      <span className="text-[14px] text-text-secondary">Subtotal</span>
                      <span className="text-[14px] text-text-primary">{formatCurrency(detailsModal.order.amount_subtotal / 100)}</span>
                    </div>
                  )}
                  {detailsModal.order.shipping_cost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[14px] text-text-secondary">Shipping</span>
                      <span className="text-[14px] text-text-primary">{formatCurrency(detailsModal.order.shipping_cost / 100)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-line-soft">
                    <span className="text-[16px] font-semibold text-text-primary">Total</span>
                    <span className="text-[16px] font-semibold text-text-primary">{formatCurrency(detailsModal.order.total_amount)}</span>
                  </div>
                  {detailsModal.order.refund_amount > 0 && (
                    <div className="flex justify-between text-warning">
                      <span className="text-[14px]">Refunded</span>
                      <span className="text-[14px]">-{formatCurrency(detailsModal.order.refund_amount / 100)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stripe Information */}
              {detailsModal.order.stripe_session_id && (
                <div>
                  <p className="text-[12px] font-medium text-text-tertiary mb-2">Stripe Information</p>
                  <div className="bg-elev0 rounded-10 p-4 space-y-2">
                    <p className="text-[13px] text-text-primary">
                      <span className="font-medium">Session ID:</span> {detailsModal.order.stripe_session_id}
                    </p>
                    {detailsModal.order.payment_intent_id && (
                      <p className="text-[13px] text-text-primary">
                        <span className="font-medium">Payment Intent:</span> {detailsModal.order.payment_intent_id}
                      </p>
                    )}
                    {detailsModal.order.invoice_id && (
                      <p className="text-[13px] text-text-primary">
                        <span className="font-medium">Invoice ID:</span> {detailsModal.order.invoice_id}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <p className="text-[12px] font-medium text-text-tertiary mb-2">Timeline</p>
                <div className="bg-elev0 rounded-10 p-4 space-y-2">
                  <p className="text-[14px] text-text-primary">
                    <span className="font-medium">Created:</span> {formatDate(detailsModal.order.created_at)}
                  </p>
                  {detailsModal.order.paid_at && (
                    <p className="text-[14px] text-text-primary">
                      <span className="font-medium">Paid:</span> {formatDate(detailsModal.order.paid_at)}
                    </p>
                  )}
                  {detailsModal.order.updated_at && detailsModal.order.updated_at !== detailsModal.order.created_at && (
                    <p className="text-[14px] text-text-primary">
                      <span className="font-medium">Updated:</span> {formatDate(detailsModal.order.updated_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-line-soft">
              <button
                onClick={closeDetailsModal}
                className="w-full h-9 rounded-10 bg-brand text-white hover:opacity-90 font-medium text-[13px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-orders {
          padding: 0;
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .orders-header h2 {
          margin: 0;
          color: #2d3748;
        }

        .order-stats {
          display: flex;
          gap: 24px;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: #2d3748;
        }

        .stat-label {
          font-size: 12px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .orders-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 20px;
        }

        .search-box {
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 10px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          color: #1a202c;
          background-color: #ffffff;
        }

        .filter-controls {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          color: #1a202c;
        }

        .orders-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        }

        .table-header {
          display: grid;
          grid-template-columns: 120px 1fr 1fr 120px 100px 140px 150px;
          gap: 16px;
          padding: 16px 20px;
          background: #f7fafc;
          border-bottom: 1px solid #e2e8f0;
          font-weight: 600;
          color: #4a5568;
          font-size: 14px;
        }

        .table-body {
          max-height: 600px;
          overflow-y: auto;
        }

        .table-row {
          display: grid;
          grid-template-columns: 120px 1fr 1fr 120px 100px 140px 150px;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid #f7fafc;
          align-items: center;
        }

        .table-row:hover {
          background: #f7fafc;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .order-id {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .stripe-id {
          font-size: 11px;
          color: #a0aec0;
        }

        .customer-email {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .customer-name {
          font-size: 13px;
          color: #718096;
        }

        .product-name {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .product-quantity {
          font-size: 13px;
          color: #718096;
          margin-bottom: 4px;
        }

        .stl-indicator {
          font-size: 12px;
          color: #38a169;
        }

        .amount-total {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .amount-unit {
          font-size: 13px;
          color: #718096;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .date-created {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .date-updated {
          font-size: 12px;
          color: #718096;
        }

        .col-actions {
          display: flex;
          gap: 6px;
          flex-direction: column;
        }

        .action-btn {
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .action-btn.complete {
          background: #c6f6d5;
          color: #22543d;
        }

        .action-btn.complete:hover {
          background: #9ae6b4;
        }

        .action-btn.fail {
          background: #fed7d7;
          color: #742a2a;
        }

        .action-btn.fail:hover {
          background: #feb2b2;
        }

        .action-btn.refund {
          background: #faf0e6;
          color: #c05621;
        }

        .action-btn.refund:hover {
          background: #f7d794;
        }

        .action-btn.view {
          background: #bee3f8;
          color: #2c5282;
        }

        .action-btn.view:hover {
          background: #90cdf4;
        }

        .no-orders {
          text-align: center;
          padding: 60px 20px;
          color: #718096;
          font-size: 16px;
        }

        .error {
          color: #e53e3e;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          color: #718096;
          font-size: 18px;
        }

        @media (max-width: 1200px) {
          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .orders-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-controls {
            justify-content: flex-start;
          }

          .order-stats {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;