import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { BsBox, BsTruck, BsPrinter, BsCheckCircle } from 'react-icons/bs';
import { useAuth } from '@clerk/clerk-react';

const AdminOrderFulfillment = () => {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('processing');
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentData, setShipmentData] = useState({
    trackingNumber: '',
    carrier: 'auspost',
    service: 'standard',
    labelUrl: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/orders/enhanced?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes: `Status updated to ${newStatus} by admin`
        })
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({...selectedOrder, order_status: newStatus});
        }
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const createShipment = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/ship`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shipmentData)
      });

      if (response.ok) {
        setShowShipmentModal(false);
        fetchOrders();
        alert('Shipment created successfully');
      }
    } catch (err) {
      console.error('Shipment error:', err);
      alert('Failed to create shipment');
    }
  };

  const printPackingSlip = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Packing Slip - Order #${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .shipping { margin: 20px 0; }
            .items { margin: 20px 0; }
            .items table { width: 100%; border-collapse: collapse; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Packing Slip</h1>
            <p>Order #${order.order_number}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="shipping">
            <h3>Ship To:</h3>
            <p>${order.shipping_address?.full_name || ''}</p>
            <p>${order.shipping_address?.address_line1 || ''}</p>
            ${order.shipping_address?.address_line2 ? `<p>${order.shipping_address.address_line2}</p>` : ''}
            <p>${order.shipping_address?.city || ''}, ${order.shipping_address?.state_province || ''} ${order.shipping_address?.postal_code || ''}</p>
          </div>
          <div class="items">
            <h3>Items:</h3>
            <table>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Quantity</th>
              </tr>
              ${order.items?.map(item => `
                <tr>
                  <td>${item.sku || 'N/A'}</td>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'processing': '#3b82f6',
      'picking': '#8b5cf6',
      'packing': '#6366f1',
      'shipped': '#10b981',
      'delivered': '#059669',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const workflowSteps = [
    { status: 'pending', label: 'Pending', icon: '📋' },
    { status: 'processing', label: 'Processing', icon: '⚙️' },
    { status: 'picking', label: 'Picking', icon: '🛒' },
    { status: 'packing', label: 'Packing', icon: '📦' },
    { status: 'shipped', label: 'Shipped', icon: '🚚' },
    { status: 'delivered', label: 'Delivered', icon: '✅' }
  ];

  return React.createElement('div', { className: 'admin-order-fulfillment' },
    // Header
    React.createElement('div', { className: 'fulfillment-header' },
      React.createElement('h2', {}, 'Order Fulfillment'),
      React.createElement('div', { className: 'header-actions' },
        React.createElement('select', {
          value: statusFilter,
          onChange: (e) => setStatusFilter(e.target.value),
          className: 'status-filter'
        },
          React.createElement('option', { value: 'all' }, 'All Orders'),
          React.createElement('option', { value: 'pending' }, 'Pending'),
          React.createElement('option', { value: 'processing' }, 'Processing'),
          React.createElement('option', { value: 'picking' }, 'Picking'),
          React.createElement('option', { value: 'packing' }, 'Packing'),
          React.createElement('option', { value: 'shipped' }, 'Shipped')
        )
      )
    ),

    // Main content
    React.createElement('div', { className: 'fulfillment-content' },
      // Orders list
      React.createElement('div', { className: 'orders-list' },
        React.createElement('h3', {}, 'Orders Queue'),
        loading ? React.createElement('div', { className: 'loading' }, 'Loading...') :
        React.createElement('div', { className: 'orders-grid' },
          ...orders.map(order =>
            React.createElement('div', {
              key: order.id,
              className: `order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`,
              onClick: () => setSelectedOrder(order)
            },
              React.createElement('div', { className: 'order-header' },
                React.createElement('span', { className: 'order-number' }, `#${order.order_number}`),
                React.createElement('span', {
                  className: 'order-status',
                  style: { backgroundColor: getStatusColor(order.order_status) }
                }, order.order_status)
              ),
              React.createElement('div', { className: 'order-info' },
                React.createElement('p', {}, order.user_email),
                React.createElement('p', {}, `${order.total_items || 0} items`),
                React.createElement('p', { className: 'order-date' }, 
                  new Date(order.created_at).toLocaleDateString()
                )
              )
            )
          )
        )
      ),

      // Order details
      selectedOrder && React.createElement('div', { className: 'order-details' },
        React.createElement('h3', {}, `Order #${selectedOrder.order_number}`),
        
        // Workflow progress
        React.createElement('div', { className: 'workflow-progress' },
          ...workflowSteps.map((step, index) => {
            const currentIndex = workflowSteps.findIndex(s => s.status === selectedOrder.order_status);
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return React.createElement('div', {
              key: step.status,
              className: `workflow-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`
            },
              React.createElement('div', { className: 'step-icon' }, step.icon),
              React.createElement('div', { className: 'step-label' }, step.label),
              index < workflowSteps.length - 1 && 
              React.createElement('div', { className: 'step-connector' })
            );
          })
        ),

        // Actions
        React.createElement('div', { className: 'order-actions' },
          selectedOrder.order_status === 'processing' &&
          React.createElement('button', {
            onClick: () => updateOrderStatus(selectedOrder.id, 'picking'),
            className: 'action-btn primary'
          }, '🛒 Start Picking'),
          
          selectedOrder.order_status === 'picking' &&
          React.createElement('button', {
            onClick: () => updateOrderStatus(selectedOrder.id, 'packing'),
            className: 'action-btn primary'
          }, '📦 Start Packing'),
          
          selectedOrder.order_status === 'packing' &&
          React.createElement('button', {
            onClick: () => setShowShipmentModal(true),
            className: 'action-btn primary'
          }, '🚚 Create Shipment'),
          
          React.createElement('button', {
            onClick: () => printPackingSlip(selectedOrder),
            className: 'action-btn secondary'
          }, React.createElement(BsPrinter, { className: 'icon' }), 'Print Packing Slip')
        ),

        // Items list
        React.createElement('div', { className: 'order-items' },
          React.createElement('h4', {}, 'Items'),
          React.createElement('table', { className: 'items-table' },
            React.createElement('thead', {},
              React.createElement('tr', {},
                React.createElement('th', {}, 'SKU'),
                React.createElement('th', {}, 'Product'),
                React.createElement('th', {}, 'Qty'),
                React.createElement('th', {}, 'Location'),
                React.createElement('th', {}, 'Status')
              )
            ),
            React.createElement('tbody', {},
              ...(selectedOrder.items || []).map(item =>
                React.createElement('tr', { key: item.id },
                  React.createElement('td', {}, item.sku || 'N/A'),
                  React.createElement('td', {}, item.product_name),
                  React.createElement('td', {}, item.quantity),
                  React.createElement('td', {}, 'A-1-3'), // Mock location
                  React.createElement('td', {},
                    React.createElement('span', {
                      className: `item-status ${item.fulfillment_status}`
                    }, item.fulfillment_status)
                  )
                )
              )
            )
          )
        ),

        // Shipping address
        React.createElement('div', { className: 'shipping-info' },
          React.createElement('h4', {}, 'Shipping Address'),
          selectedOrder.shipping_address && React.createElement('div', { className: 'address' },
            React.createElement('p', {}, selectedOrder.shipping_address.full_name),
            React.createElement('p', {}, selectedOrder.shipping_address.address_line1),
            selectedOrder.shipping_address.address_line2 && 
              React.createElement('p', {}, selectedOrder.shipping_address.address_line2),
            React.createElement('p', {}, 
              `${selectedOrder.shipping_address.city}, ${selectedOrder.shipping_address.state_province} ${selectedOrder.shipping_address.postal_code}`
            )
          )
        )
      )
    ),

    // Shipment modal
    showShipmentModal && React.createElement('div', { className: 'modal-overlay' },
      React.createElement('div', { className: 'modal' },
        React.createElement('h3', {}, 'Create Shipment'),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', {}, 'Tracking Number'),
          React.createElement('input', {
            type: 'text',
            value: shipmentData.trackingNumber,
            onChange: (e) => setShipmentData({...shipmentData, trackingNumber: e.target.value}),
            placeholder: 'Enter tracking number'
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', {}, 'Carrier'),
          React.createElement('select', {
            value: shipmentData.carrier,
            onChange: (e) => setShipmentData({...shipmentData, carrier: e.target.value})
          },
            React.createElement('option', { value: 'auspost' }, 'Australia Post'),
            React.createElement('option', { value: 'startrack' }, 'StarTrack'),
            React.createElement('option', { value: 'fedex' }, 'FedEx'),
            React.createElement('option', { value: 'ups' }, 'UPS'),
            React.createElement('option', { value: 'dhl' }, 'DHL')
          )
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', {}, 'Service'),
          React.createElement('select', {
            value: shipmentData.service,
            onChange: (e) => setShipmentData({...shipmentData, service: e.target.value})
          },
            React.createElement('option', { value: 'standard' }, 'Standard'),
            React.createElement('option', { value: 'express' }, 'Express'),
            React.createElement('option', { value: 'priority' }, 'Priority')
          )
        ),
        React.createElement('div', { className: 'modal-actions' },
          React.createElement('button', {
            onClick: () => setShowShipmentModal(false),
            className: 'btn-cancel'
          }, 'Cancel'),
          React.createElement('button', {
            onClick: createShipment,
            className: 'btn-primary'
          }, 'Create Shipment')
        )
      )
    ),

    // Styles
    React.createElement('style', { jsx: true }, `
      .admin-order-fulfillment {
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

      .fulfillment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 36px;
        padding-bottom: 24px;
        border-bottom: 1px solid rgba(56, 68, 82, 0.2);
      }

      .fulfillment-header h2 {
        margin: 0;
        color: #ffffff;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.02em;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .fulfillment-header h2::before {
        content: '';
        width: 4px;
        height: 28px;
        background: linear-gradient(180deg, #a78bfa 0%, #8b5cf6 100%);
        border-radius: 2px;
        box-shadow: 0 0 12px rgba(167, 139, 250, 0.5);
      }

      .header-actions {
        display: flex;
        gap: 16px;
        align-items: center;
      }

      .filter-select {
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
        min-width: 180px;
      }

      .filter-select:hover {
        background: rgba(15, 20, 25, 0.95);
        border-color: rgba(167, 139, 250, 0.3);
        box-shadow: 0 0 0 1px rgba(167, 139, 250, 0.1);
      }

      .filter-select:focus {
        outline: none;
        border-color: rgba(167, 139, 250, 0.5);
        box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
      }

      .btn-refresh {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
      }

      .btn-refresh:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(167, 139, 250, 0.4);
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .metric-card {
        background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
        padding: 24px;
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
        background: linear-gradient(90deg, transparent 0%, rgba(167, 139, 250, 0.5) 50%, transparent 100%);
        transform: translateX(-100%);
        animation: shimmer 3s ease-in-out infinite;
      }

      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      .metric-card:hover {
        transform: translateY(-2px);
        border-color: rgba(167, 139, 250, 0.3);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
      }

      .metric-card.pending {
        border-left: 3px solid #fbbf24;
      }

      .metric-card.processing {
        border-left: 3px solid #60a5fa;
      }

      .metric-card.ready {
        border-left: 3px solid #a78bfa;
      }

      .metric-card.shipped {
        border-left: 3px solid #34d399;
      }

      .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .metric-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.2);
      }

      .metric-card.pending .metric-icon {
        background: rgba(251, 191, 36, 0.1);
        color: #fbbf24;
      }

      .metric-card.processing .metric-icon {
        background: rgba(96, 165, 250, 0.1);
        color: #60a5fa;
      }

      .metric-card.ready .metric-icon {
        background: rgba(167, 139, 250, 0.1);
        color: #a78bfa;
      }

      .metric-card.shipped .metric-icon {
        background: rgba(52, 211, 153, 0.1);
        color: #34d399;
      }

      .metric-icon svg {
        width: 24px;
        height: 24px;
        stroke-width: 1.5;
      }

      .metric-content h3 {
        margin: 0 0 8px 0;
        font-size: 12px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .metric-value {
        font-size: 32px;
        font-weight: 700;
        color: #ffffff;
        font-variant-numeric: tabular-nums;
      }

      .fulfillment-stages {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 36px;
        padding: 20px;
        background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
        border-radius: 12px;
        border: 1px solid rgba(56, 68, 82, 0.3);
        overflow-x: auto;
      }

      .stage {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(56, 68, 82, 0.3);
        border-radius: 8px;
        color: #94a3b8;
        font-weight: 600;
        font-size: 14px;
        white-space: nowrap;
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
      }

      .stage::before {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 3px;
        background: currentColor;
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }

      .stage.active {
        background: rgba(167, 139, 250, 0.1);
        border-color: rgba(167, 139, 250, 0.3);
        color: #a78bfa;
      }

      .stage.active::before {
        transform: scaleX(1);
      }

      .stage.completed {
        color: #34d399;
        border-color: rgba(52, 211, 153, 0.3);
      }

      .stage:hover:not(.active) {
        background: rgba(56, 68, 82, 0.3);
        transform: translateY(-1px);
      }

      .stage svg {
        width: 18px;
        height: 18px;
      }

      .stage-arrow {
        color: #475569;
        margin: 0 4px;
      }

      .orders-table {
        background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
        border-radius: 12px;
        padding: 0;
        border: 1px solid rgba(56, 68, 82, 0.3);
        overflow: hidden;
        backdrop-filter: blur(10px);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      thead {
        background: rgba(10, 14, 26, 0.5);
        border-bottom: 1px solid rgba(56, 68, 82, 0.3);
      }

      th {
        padding: 16px 20px;
        text-align: left;
        font-size: 12px;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      tbody tr {
        border-bottom: 1px solid rgba(56, 68, 82, 0.2);
        transition: all 0.2s ease;
      }

      tbody tr:last-child {
        border-bottom: none;
      }

      tbody tr:hover {
        background: rgba(167, 139, 250, 0.05);
      }

      td {
        padding: 20px;
        font-size: 14px;
        color: #e2e8f0;
      }

      .order-number {
        font-weight: 600;
        color: #ffffff;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
      }

      .customer-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .customer-name {
        font-weight: 500;
        color: #ffffff;
      }

      .customer-email {
        font-size: 12px;
        color: #64748b;
      }

      .product-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .product-item {
        font-size: 13px;
        color: #94a3b8;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }

      .status-badge.pending {
        background: rgba(251, 191, 36, 0.1);
        color: #fbbf24;
        border: 1px solid rgba(251, 191, 36, 0.2);
      }

      .status-badge.processing {
        background: rgba(96, 165, 250, 0.1);
        color: #60a5fa;
        border: 1px solid rgba(96, 165, 250, 0.2);
      }

      .status-badge.picked {
        background: rgba(167, 139, 250, 0.1);
        color: #a78bfa;
        border: 1px solid rgba(167, 139, 250, 0.2);
      }

      .status-badge.packed {
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
        border: 1px solid rgba(139, 92, 246, 0.2);
      }

      .status-badge.ready_to_ship {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        border: 1px solid rgba(59, 130, 246, 0.2);
      }

      .status-badge.shipped {
        background: rgba(52, 211, 153, 0.1);
        color: #34d399;
        border: 1px solid rgba(52, 211, 153, 0.2);
      }

      .status-badge.delivered {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 6px currentColor;
      }

      .action-buttons {
        display: flex;
        gap: 8px;
      }

      .btn-action {
        padding: 8px 14px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(56, 68, 82, 0.3);
        border-radius: 6px;
        color: #94a3b8;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .btn-action:hover {
        background: rgba(167, 139, 250, 0.1);
        border-color: rgba(167, 139, 250, 0.3);
        color: #a78bfa;
        transform: translateY(-1px);
      }

      .btn-action svg {
        width: 16px;
        height: 16px;
      }

      .btn-action.primary {
        background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
        border: none;
        color: white;
      }

      .btn-action.primary:hover {
        box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
        transform: translateY(-1px);
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid rgba(56, 68, 82, 0.2);
      }

      .pagination button {
        padding: 8px 12px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(56, 68, 82, 0.3);
        border-radius: 6px;
        color: #94a3b8;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pagination button:hover:not(:disabled) {
        background: rgba(167, 139, 250, 0.1);
        border-color: rgba(167, 139, 250, 0.3);
        color: #a78bfa;
      }

      .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .pagination span {
        padding: 0 16px;
        color: #94a3b8;
        font-size: 14px;
      }

      .loading {
        text-align: center;
        padding: 80px 20px;
        color: #94a3b8;
        font-size: 16px;
        font-weight: 500;
      }

      .no-orders {
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
        font-size: 15px;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
      }

      .modal {
        background: linear-gradient(135deg, #0f1419 0%, #0a0e1a 100%);
        border-radius: 16px;
        padding: 32px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid rgba(56, 68, 82, 0.3);
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .modal h3 {
        margin: 0 0 24px 0;
        color: #ffffff;
        font-size: 20px;
        font-weight: 600;
      }

      .shipping-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-group label {
        font-size: 13px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .form-group input,
      .form-group select {
        padding: 12px 16px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(56, 68, 82, 0.3);
        border-radius: 8px;
        color: #ffffff;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: rgba(167, 139, 250, 0.5);
        box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
      }

      .modal-buttons {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }

      .btn-cancel {
        flex: 1;
        padding: 12px 24px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(56, 68, 82, 0.3);
        border-radius: 8px;
        color: #94a3b8;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-cancel:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
        color: #ef4444;
      }

      .btn-submit {
        flex: 1;
        padding: 12px 24px;
        background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
      }

      .btn-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
      }

      @media (max-width: 1024px) {
        .metrics-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .fulfillment-stages {
          overflow-x: scroll;
          scrollbar-width: thin;
          scrollbar-color: rgba(56, 68, 82, 0.5) transparent;
        }
      }

      @media (max-width: 768px) {
        .fulfillment-header {
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }

        .header-actions {
          width: 100%;
          flex-direction: column;
          gap: 12px;
        }

        .filter-select,
        .btn-refresh {
          width: 100%;
        }

        .metrics-grid {
          grid-template-columns: 1fr;
        }

        .orders-table {
          overflow-x: auto;
        }

        table {
          min-width: 800px;
        }

        .action-buttons {
          flex-direction: column;
        }
      }
    `)
  );
};

export default AdminOrderFulfillment; 