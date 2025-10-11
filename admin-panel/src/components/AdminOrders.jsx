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
      case 'pending': return '#ed8936';
      case 'failed': return '#e53e3e';
      case 'refunded': return '#718096';
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="text-[12px] font-medium text-text-tertiary">Customer</div>
                  <div className="text-[13px] text-text-primary">{order.user_email}</div>
                  <div className="text-[13px] text-text-tertiary">
                    {order.user_first_name} {order.user_last_name}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-[12px] font-medium text-text-tertiary">Product</div>
                  <div className="text-[13px] text-text-primary">{order.product_name}</div>
                  <div className="flex items-center gap-2 text-[13px] text-text-tertiary">
                    <span>Qty: {order.quantity}</span>
                    {order.unlocks_stls && (
                      <span className="bg-[rgba(99,102,241,.12)] text-brand px-2 py-1 rounded text-[12px]">
                        🗂️ Includes STLs
                      </span>
                    )}
                  </div>
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
                  {order.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="px-3 py-2 rounded-10 bg-[rgba(34,197,94,.12)] text-success hover:opacity-90 font-medium text-[12px]"
                      >
                        ✅ Complete
                      </button>
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'failed')}
                        className="px-3 py-2 rounded-10 bg-[rgba(239,68,68,.12)] text-danger hover:opacity-90 font-medium text-[12px]"
                      >
                        ❌ Fail
                      </button>
                    </>
                  )}
                  {order.status === 'completed' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'refunded')}
                      className="px-3 py-2 rounded-10 bg-[rgba(245,158,11,.12)] text-warning hover:opacity-90 font-medium text-[12px]"
                    >
                      💰 Refund
                    </button>
                  )}
                  <button className="px-3 py-2 rounded-10 bg-[rgba(99,102,241,.12)] text-brand hover:opacity-90 font-medium text-[12px]">
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