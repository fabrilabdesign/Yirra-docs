import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import AdminInventoryAddModal from './AdminInventoryAddModal';

const AdminInventory = () => {
  const { getToken } = useAuth();
  const [inventoryData, setInventoryData] = useState([]);
  const [componentsData, setComponentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({ quantity: 0, notes: '' });
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchInventoryData();
  }, [activeTab, filter]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      
      if (activeTab === 'products') {
        const response = await fetch(`/api/admin/inventory?filter=${filter}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setInventoryData(data);
        }
      } else {
        // Map UI filter to backend stockStatus param
        const stockStatus =
          filter === 'low_stock' ? 'low_stock' :
          filter === 'out_of_stock' ? 'out_of_stock' :
          filter === 'tracked' ? 'in_stock' :
          'all';

        const response = await fetch(`/api/admin/components?stockStatus=${stockStatus}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setComponentsData(data);
        }
      }
    } catch (err) {
      console.error('Inventory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (itemData) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const endpoint = activeTab === 'products' 
        ? `/api/admin/inventory` 
        : `/api/admin/components`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        fetchInventoryData();
        setShowAddModal(false);
      }
    } catch (err) {
      console.error('Add item error:', err);
    }
  };

  const handleScanLabel = async (imageFile) => {
    try {
      console.log('Starting scan with file:', imageFile.name, 'Size:', imageFile.size);
      setIsScanning(true);
      const token = await getToken();
      if (!token) {
        console.error('No auth token available');
        return;
      }
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      console.log('Making request to /api/ml/scan/label');
      const response = await fetch('/api/ml/scan/label', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Scan result:', result);
        setScanResult(result);
        
        // If we found data, pre-fill the add modal
        if (result.sku || result.parsed?.sku) {
          const itemData = {
            name: result.sku || result.parsed?.sku || '',
            sku: result.sku || result.parsed?.sku || '',
            category: '',
            initialStock: parseInt(result.qty || result.parsed?.qty || '0'),
            lowStockThreshold: 10,
            trackInventory: true
          };
          
          // Close scan modal and open add modal with pre-filled data
          setShowScanModal(false);
          setShowAddModal(true);
          
          // You might want to pass this data to the add modal
          // This would require updating AdminInventoryAddModal to accept initial data
        }
      } else {
        const errorText = await response.text();
        console.error('Scan failed:', response.status, response.statusText, errorText);
        alert(`Scan failed: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Scan error:', err);
      alert(`Scan error: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAdjustStock = async (itemId, itemType) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const endpoint = itemType === 'product' 
        ? `/api/admin/inventory/${itemId}/adjust` 
        : `/api/admin/components/${itemId}/adjust`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newQuantity: parseInt(adjustmentData.quantity),
          notes: adjustmentData.notes
        })
      });

      if (response.ok) {
        fetchInventoryData();
        setShowAdjustModal(false);
        setAdjustmentData({ quantity: 0, notes: '' });
      }
    } catch (err) {
      console.error('Stock adjustment error:', err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'danger';
      case 'in_stock': return 'success';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'in_stock': return 'In Stock';
      default: return 'Not Tracked';
    }
  };

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Mobile Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
        <div className="flex gap-3">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
          >
            <option value="all">All Items</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="tracked">Tracked Items</option>
          </select>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
            onClick={() => setShowScanModal(true)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Scan Label</span>
            <span className="sm:hidden">Scan</span>
          </button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="flex rounded-xl bg-white/20 p-1">
        <button 
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'products' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-white hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'components' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-white hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('components')}
        >
          Components
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          {activeTab === 'products' ? 'Product Inventory' : 'Component Inventory'}
        </h3>
        <div className="flex gap-2">
          <button className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="hidden sm:inline">Import</span>
          </button>
          <button className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Mobile Inventory Cards */}
      <div className="space-y-4">
        {(activeTab === 'products' ? inventoryData : componentsData).map((item) => (
          <div key={item.id || item.component_id} className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300">
            {/* Header Row */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'products' ? item.name : item.component_name}
                </h3>
                <p className="text-sm text-gray-600">
                  SKU: {activeTab === 'products' ? item.sku : item.component_sku}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                item.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' :
                item.stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getStatusText(item.stock_status)}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Category</div>
                <div className="text-sm text-gray-900">{item.category || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Stock Quantity</div>
                <div className="text-lg font-bold text-gray-900">{item.stock_quantity}</div>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button 
                className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                onClick={() => {
                  setSelectedItem(item);
                  setAdjustmentData({ quantity: item.stock_quantity, notes: '' });
                  setShowAdjustModal(true);
                }}
              >
                📊 Adjust Stock
              </button>
            </div>
          </div>
        ))}
        
        {(activeTab === 'products' ? inventoryData : componentsData).length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">📦</div>
            <p className="text-gray-500">No inventory items found</p>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Adjust Stock</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAdjustModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Item Name</label>
                <input 
                  type="text" 
                  value={activeTab === 'products' ? selectedItem?.name : selectedItem?.component_name}
                  disabled
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Current Quantity</label>
                <input 
                  type="text" 
                  value={selectedItem?.stock_quantity}
                  disabled
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>New Quantity</label>
                <input 
                  type="number" 
                  value={adjustmentData.quantity}
                  onChange={(e) => setAdjustmentData({...adjustmentData, quantity: e.target.value})}
                  className="form-input"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  value={adjustmentData.notes}
                  onChange={(e) => setAdjustmentData({...adjustmentData, notes: e.target.value})}
                  className="form-textarea"
                  placeholder="Reason for adjustment..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowAdjustModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleAdjustStock(selectedItem?.id || selectedItem?.component_id, activeTab.slice(0, -1))}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminInventoryAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
        activeTab={activeTab}
      />

      {/* Scan Label Modal */}
      {showScanModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Scan Label</h3>
              <button 
                className="modal-close"
                onClick={() => setShowScanModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="scan-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleScanLabel(file);
                    }
                  }}
                  className="file-input"
                  id="scan-file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="scan-file-input" className="scan-button">
                  {isScanning ? (
                    <>
                      <div className="spinner"></div>
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Choose Image to Scan</span>
                    </>
                  )}
                </label>
                {scanResult && (
                  <div className="scan-results">
                    <h4>Scan Results:</h4>
                    <div className="result-item">
                      <strong>SKU:</strong> {scanResult.sku || scanResult.parsed?.sku || 'Not found'}
                    </div>
                    <div className="result-item">
                      <strong>Quantity:</strong> {scanResult.qty || scanResult.parsed?.qty || 'Not found'}
                    </div>
                    <div className="result-item">
                      <strong>Lot:</strong> {scanResult.lot || scanResult.parsed?.lot || 'Not found'}
                    </div>
                    {scanResult.text && (
                      <div className="result-item">
                        <strong>Full Text:</strong>
                        <div className="text-content">{scanResult.text}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowScanModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-inventory {
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

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.2);
        }

        .page-header h2 {
          margin: 0;
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
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
          border-color: rgba(96, 165, 250, 0.3);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-primary svg {
          width: 16px;
          height: 16px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
        }
        
        .inventory-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.2);
        }

        .tab {
          padding: 12px 24px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
        }

        .tab:hover {
          color: #ffffff;
        }

        .tab.active {
          color: #60a5fa;
          border-bottom-color: #60a5fa;
        }

        .inventory-table {
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
          padding: 0;
          border-radius: 12px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.2);
        }

        .table-header h3 {
          margin: 0;
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
        }

        .table-actions {
          display: flex;
          gap: 12px;
        }

        .btn-action {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(56, 68, 82, 0.3);
          border-radius: 6px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-action:hover {
          background: rgba(96, 165, 250, 0.1);
          border-color: rgba(96, 165, 250, 0.3);
          color: #60a5fa;
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th, .data-table td {
          padding: 16px 28px;
          text-align: left;
          border-bottom: 1px solid rgba(56, 68, 82, 0.2);
          color: #e2e8f0;
          font-size: 14px;
        }

        .data-table th {
          color: #94a3b8;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .item-name {
          font-weight: 600;
          color: #ffffff;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.success {
          background-color: rgba(74, 222, 128, 0.1);
          color: #4ade80;
        }

        .status-badge.warning {
          background-color: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
        }

        .status-badge.danger {
          background-color: rgba(248, 113, 113, 0.1);
          color: #f87171;
        }

        .btn-action-small {
          padding: 6px 12px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(56, 68, 82, 0.3);
          border-radius: 6px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-action-small:hover {
          background: rgba(96, 165, 250, 0.1);
          border-color: rgba(96, 165, 250, 0.3);
          color: #60a5fa;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal {
          background: #1e293b;
          border: 1px solid rgba(56, 68, 82, 0.5);
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from { transform: translateY(-20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.5);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: #ffffff;
        }

        .modal-close {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #94a3b8;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 10px 12px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          color: #e2e8f0;
          font-size: 14px;
        }
        
        .form-input:disabled {
          background: #1e293b;
          cursor: not-allowed;
        }

        .form-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid rgba(56, 68, 82, 0.5);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: #334155;
          color: #e2e8f0;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }
        
        .loading {
          text-align: center;
          padding: 80px;
          color: #94a3b8;
          font-size: 16px;
          font-weight: 500;
        }

        .scan-area {
          text-align: center;
          padding: 20px;
        }

        .scan-button {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px 60px;
          border: 2px dashed #475569;
          border-radius: 12px;
          background: #1e293b;
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
          font-weight: 500;
        }

        .scan-button:hover {
          border-color: #22c55e;
          background: #22c55e/10;
          color: #22c55e;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #475569;
          border-top: 2px solid #22c55e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .scan-results {
          margin-top: 24px;
          padding: 20px;
          background: #0f172a;
          border-radius: 8px;
          text-align: left;
        }

        .scan-results h4 {
          margin: 0 0 16px 0;
          color: #22c55e;
          font-size: 16px;
          font-weight: 600;
        }

        .result-item {
          margin-bottom: 12px;
          color: #e2e8f0;
          font-size: 14px;
        }

        .result-item strong {
          color: #94a3b8;
          margin-right: 8px;
        }

        .text-content {
          margin-top: 8px;
          padding: 12px;
          background: #1e293b;
          border-radius: 6px;
          font-family: monospace;
          font-size: 12px;
          color: #cbd5e1;
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default AdminInventory; 