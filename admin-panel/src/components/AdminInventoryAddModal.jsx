import React, { useState } from 'react';

const AdminInventoryAddModal = ({ isOpen, onClose, onAdd, activeTab }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    stock_quantity: 0,
    low_stock_threshold: 5,
    track_inventory: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      stock_quantity: parseInt(formData.stock_quantity),
      low_stock_threshold: parseInt(formData.low_stock_threshold)
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Add New {activeTab === 'products' ? 'Product' : 'Component'}</h3>
          <button 
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input 
                type="text" 
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input 
                type="text" 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Initial Stock Quantity</label>
              <input 
                type="number" 
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="form-input"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Low Stock Threshold</label>
              <input 
                type="number" 
                name="low_stock_threshold"
                value={formData.low_stock_threshold}
                onChange={handleChange}
                className="form-input"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>
                <input 
                  type="checkbox" 
                  name="track_inventory"
                  checked={formData.track_inventory}
                  onChange={handleChange}
                  className="mr-2"
                />
                Track Inventory
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn-secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              type="submit"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
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
        
        .btn-primary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AdminInventoryAddModal;
