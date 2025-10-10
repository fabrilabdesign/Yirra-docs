import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminCustomers = () => {
  const { getToken } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        role: 'customer', // Only fetch customers
        ...filters
      });

      const response = await fetch(`/api/admin/users/enhanced?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.users);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
        setError(null);
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        throw new Error('Failed to fetch customers');
      }
    } catch (err) {
      console.error('Customers fetch error:', err);
      setError('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  if (loading) {
    return (
      <div className="admin-customers">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-customers">
        <div className="error-state">
          <h3>Error Loading Customers</h3>
          <p>{error}</p>
          <button onClick={fetchCustomers} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Mobile Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">
          Customer Management ({pagination.total})
        </h2>
        <button 
          onClick={fetchCustomers} 
          className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2"
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Mobile Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search customers by name, email, or Clerk ID..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
          />
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
          >
            <option value="created_at">Sort by Registration Date</option>
            <option value="first_name">Sort by First Name</option>
            <option value="last_name">Sort by Last Name</option>
            <option value="email">Sort by Email</option>
          </select>
          
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Mobile Customer Cards */}
      {customers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">👥</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Customers Found</h3>
          <p className="text-gray-300">No customers match your current search criteria.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300">
                {/* Header Row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-700 font-semibold text-lg">
                    {customer.first_name?.[0] || customer.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {customer.first_name && customer.last_name 
                        ? `${customer.first_name} ${customer.last_name}`
                        : customer.email
                      }
                    </h3>
                    <p className="text-sm text-gray-500">ID: {customer.clerk_id?.slice(-8) || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => viewCustomerDetails(customer)}
                    className="bg-blue-50 text-blue-700 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                    title="View Details"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-700">Email</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{customer.email}</span>
                      {customer.email_verified && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">✓ Verified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-700">Newsletter</div>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      customer.newsletter_subscribed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {customer.newsletter_subscribed ? 'Subscribed' : 'Not Subscribed'}
                    </span>
                  </div>
                </div>

                {/* Registration Date */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Registered:</span> {formatDate(customer.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  pagination.page === 1 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                ← Previous
              </button>
              
              <div className="text-center">
                <div className="text-sm text-white">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="text-xs text-gray-300">
                  {pagination.total} total customers
                </div>
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  pagination.page === pagination.totalPages 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Details</h3>
              <button 
                onClick={() => setShowCustomerModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="customer-detail-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{selectedCustomer.first_name} {selectedCustomer.last_name}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="detail-item">
                  <label>Clerk ID:</label>
                  <span>{selectedCustomer.clerk_id}</span>
                </div>
                <div className="detail-item">
                  <label>Registration:</label>
                  <span>{formatDate(selectedCustomer.created_at)}</span>
                </div>
                <div className="detail-item">
                  <label>Email Verified:</label>
                  <span className={selectedCustomer.email_verified ? 'verified' : 'unverified'}>
                    {selectedCustomer.email_verified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Newsletter:</label>
                  <span className={selectedCustomer.newsletter_subscribed ? 'subscribed' : 'not-subscribed'}>
                    {selectedCustomer.newsletter_subscribed ? 'Subscribed' : 'Not Subscribed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-customers {
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
          color: #f0f6fc;
          font-size: 24px;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #21262d;
          border: 1px solid #30363d;
          color: #f0f6fc;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover {
          background: #30363d;
          border-color: #484f58;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .filters-section {
          background: #161b22;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #30363d;
          margin-bottom: 24px;
        }

        .search-box {
          margin-bottom: 16px;
        }

        .search-input {
          width: 100%;
          background: #0d1117;
          border: 1px solid #30363d;
          color: #f0f6fc;
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: #58a6ff;
          box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
        }

        .filter-controls {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          background: #21262d;
          border: 1px solid #30363d;
          color: #f0f6fc;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
        }

        .customers-table {
          background: #161b22;
          border-radius: 8px;
          border: 1px solid #30363d;
          overflow: hidden;
        }

        .customers-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .customers-table th {
          background: #21262d;
          color: #8b949e;
          font-weight: 600;
          text-align: left;
          padding: 16px;
          border-bottom: 1px solid #30363d;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .customers-table td {
          padding: 16px;
          border-bottom: 1px solid #21262d;
          vertical-align: middle;
        }

        .customers-table tr:hover {
          background: #0d1117;
        }

        .customer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .customer-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #58a6ff, #1f6feb);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .customer-details {
          flex: 1;
        }

        .customer-name {
          color: #f0f6fc;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .customer-id {
          color: #8b949e;
          font-size: 12px;
        }

        .email-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .verified-badge {
          color: #3fb950;
          font-weight: bold;
        }

        .date-cell {
          color: #8b949e;
          font-size: 14px;
        }

        .newsletter-status .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.subscribed {
          background: rgba(63, 185, 80, 0.1);
          color: #3fb950;
          border: 1px solid rgba(63, 185, 80, 0.3);
        }

        .status-badge.not-subscribed {
          background: rgba(248, 81, 73, 0.1);
          color: #f85149;
          border: 1px solid rgba(248, 81, 73, 0.3);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          background: #21262d;
          border: 1px solid #30363d;
          color: #8b949e;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          background: #30363d;
          color: #f0f6fc;
        }

        .view-btn:hover {
          border-color: #58a6ff;
          color: #58a6ff;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          padding: 16px 0;
        }

        .pagination-btn {
          background: #21262d;
          border: 1px solid #30363d;
          color: #f0f6fc;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #30363d;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          color: #8b949e;
          font-size: 14px;
        }

        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #8b949e;
        }

        .spinner {
          width: 40px;
          height: 40px;
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

        .empty-icon {
          margin-bottom: 16px;
          color: #484f58;
        }

        .retry-btn {
          background: #238636;
          border: 1px solid #2ea043;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 16px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(1, 4, 9, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #30363d;
        }

        .modal-header h3 {
          margin: 0;
          color: #f0f6fc;
          font-size: 18px;
        }

        .close-btn {
          background: none;
          border: none;
          color: #8b949e;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
        }

        .close-btn:hover {
          background: #30363d;
          color: #f0f6fc;
        }

        .modal-body {
          padding: 20px;
        }

        .customer-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item label {
          color: #8b949e;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-item span {
          color: #f0f6fc;
          font-size: 14px;
        }

        .detail-item span.verified {
          color: #3fb950;
        }

        .detail-item span.unverified {
          color: #f85149;
        }

        .detail-item span.subscribed {
          color: #3fb950;
        }

        .detail-item span.not-subscribed {
          color: #f85149;
        }

        @media (max-width: 768px) {
          .customer-detail-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-controls {
            flex-direction: column;
          }
          
          .customers-table {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminCustomers; 