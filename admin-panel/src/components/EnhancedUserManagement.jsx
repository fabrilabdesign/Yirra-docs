import getApiUrl from '../utils/api.js';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const EnhancedUserManagement = () => {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [analytics, setAnalytics] = useState(null);

  // Fetch users with debounced search
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`/api/admin/users/enhanced?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch user analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        return;
      }
      const response = await fetch(getApiUrl('/api/admin/users/analytics'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, [fetchUsers, fetchAnalytics]);

  // Bulk operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.size === 0) return;

    if (!window.confirm(`Apply ${bulkAction} to ${selectedUsers.size} selected users?`)) return;

    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        return;
      }
      await fetch(getApiUrl('/api/admin/users/bulk'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: bulkAction,
          userIds: Array.from(selectedUsers)
        })
      });

      setSelectedUsers(new Set());
      setBulkAction('');
      fetchUsers();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  // User actions
  const handleUserAction = async (userId, action, data = {}) => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        return;
      }
      const response = await fetch(`/api/admin/users/${userId}/action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, ...data })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  // Select all users
  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getUserStatusColor = (user) => {
    if (!user.is_active) return 'inactive';
    if (user.is_admin) return 'admin';
    if (user.email_verified) return 'active';
    return 'pending';
  };

  return (
    <div className="enhanced-user-management">
      {/* Analytics Dashboard */}
      {analytics && (
        <div className="analytics-grid">
          <div className="metric-card">
            <div className="metric-value">{analytics.totalUsers}</div>
            <div className="metric-label">Total Users</div>
            <div className="metric-change positive">+{analytics.newUsersToday} today</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{analytics.activeUsers}</div>
            <div className="metric-label">Active Users</div>
            <div className="metric-change">{analytics.activePercentage}% of total</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{formatCurrency(analytics.totalRevenue)}</div>
            <div className="metric-label">Total Revenue</div>
            <div className="metric-change positive">+{formatCurrency(analytics.revenueThisMonth)} this month</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{analytics.adminUsers}</div>
            <div className="metric-label">Admin Users</div>
            <div className="metric-change">{analytics.adminPercentage}% of total</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="controls-section">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
          
          <select
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="consumer">Consumers</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending Verification</option>
          </select>
        </div>

        <div className="action-controls">
          {selectedUsers.size > 0 && (
            <div className="bulk-actions">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="bulk-select"
              >
                <option value="">Select Action</option>
                <option value="activate">Activate Users</option>
                <option value="deactivate">Deactivate Users</option>
                <option value="promote">Promote to Admin</option>
                <option value="demote">Remove Admin</option>
                <option value="delete">Delete Users</option>
              </select>
              <button 
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="bulk-apply-btn"
              >
                Apply to {selectedUsers.size} users
              </button>
            </div>
          )}

          <button 
            onClick={() => setShowUserModal(true)}
            className="create-user-btn"
          >
            + Create User
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>User</th>
              <th>Role & Status</th>
              <th>Activity</th>
              <th>Value</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading-cell">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">No users found</td>
              </tr>
            ) : users.map(user => (
              <tr key={user.id} className={selectedUsers.has(user.id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                  />
                </td>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.first_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="status-info">
                    <span className={`status-badge ${getUserStatusColor(user)}`}>
                      {user.is_admin ? user.admin_level : user.user_type}
                    </span>
                    {user.email_verified && <span className="verified-badge">✓ Verified</span>}
                  </div>
                </td>
                <td>
                  <div className="activity-info">
                    <div className="activity-metric">
                      <span className="metric-value">{user.login_count || 0}</span>
                      <span className="metric-label">Logins</span>
                    </div>
                    <div className="last-seen">
                      {user.last_login ? formatDate(user.last_login) : 'Never'}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="value-info">
                    <div className="revenue">{formatCurrency(user.total_spent)}</div>
                    <div className="order-count">{user.total_purchases} orders</div>
                  </div>
                </td>
                <td className="created-date">
                  {formatDate(user.created_at)}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => {
                        setEditingUser(user);
                        setShowUserModal(true);
                      }}
                      className="action-btn edit"
                      title="Edit User"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleUserAction(user.id, user.is_admin ? 'demote' : 'promote')}
                      className={`action-btn ${user.is_admin ? 'demote' : 'promote'}`}
                      title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    >
                      {user.is_admin ? '👤' : '👑'}
                    </button>
                    <button 
                      onClick={() => handleUserAction(user.id, 'impersonate')}
                      className="action-btn impersonate"
                      title="Impersonate User"
                    >
                      🎭
                    </button>
                    <button 
                      onClick={() => handleUserAction(user.id, 'delete')}
                      className="action-btn delete"
                      title="Delete User"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
        </div>
        <div className="pagination-controls">
          <button 
            disabled={pagination.page <= 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button 
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSave={() => {
            fetchUsers();
            setShowUserModal(false);
            setEditingUser(null);
          }}
        />
      )}

      <style jsx>{`
        .enhanced-user-management {
          padding: 0;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .metric-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.25rem;
        }

        .metric-change {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .metric-change.positive {
          color: #10b981;
        }

        .controls-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        .search-filters {
          display: flex;
          gap: 1rem;
          flex: 1;
        }

        .search-input, .filter-select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #ffffff;
          font-size: 0.875rem;
        }

        .search-input {
          flex: 1;
          min-width: 250px;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .action-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .bulk-select, .bulk-apply-btn, .create-user-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bulk-apply-btn:hover, .create-user-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .create-user-btn {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
          font-weight: 600;
        }

        .users-table-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 1.5rem;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #ffffff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.875rem;
        }

        .users-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          vertical-align: middle;
        }

        .users-table tr.selected {
          background: rgba(255, 255, 255, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.2);
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #ffffff;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .user-name {
          font-weight: 600;
          color: #ffffff;
          font-size: 0.875rem;
        }

        .user-email {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-badge.admin {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid #ef4444;
        }

        .status-badge.active {
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
          border: 1px solid #10b981;
        }

        .status-badge.pending {
          background: rgba(245, 158, 11, 0.2);
          color: #fcd34d;
          border: 1px solid #f59e0b;
        }

        .status-badge.inactive {
          background: rgba(107, 114, 128, 0.2);
          color: #d1d5db;
          border: 1px solid #6b7280;
        }

        .verified-badge {
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 500;
        }

        .activity-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .activity-metric {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .metric-value {
          font-weight: 600;
          color: #ffffff;
        }

        .metric-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .last-seen {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .value-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .revenue {
          font-weight: 600;
          color: #10b981;
        }

        .order-count {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .created-date {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }

        .action-btn.promote:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: #f59e0b;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .pagination-info {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .pagination-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 0.5rem 1rem;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-btn:not(:disabled):hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .page-info {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .loading-cell, .empty-cell {
          text-align: center;
          padding: 3rem;
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
        }

        @media (max-width: 1024px) {
          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-filters {
            flex-direction: column;
          }

          .action-controls {
            justify-content: space-between;
          }

          .users-table-container {
            overflow-x: auto;
          }

          .users-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
};

// User Modal Component (simplified for space)
const UserModal = ({ user, onClose, onSave }) => {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState(user || {
    first_name: '',
    last_name: '',
    email: '',
    user_type: 'consumer',
    is_admin: false,
    admin_level: 'user'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        return;
      }
      const url = user ? `/api/admin/users/${user.id}` : getApiUrl('/api/admin/users');
      const method = user ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      onSave();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{user ? 'Edit User' : 'Create User'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <select
              value={formData.user_type}
              onChange={(e) => setFormData(prev => ({ ...prev, user_type: e.target.value }))}
            >
              <option value="consumer">Consumer</option>
              <option value="business">Business</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{user ? 'Update' : 'Create'}</button>
          </div>
        </form>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            color: #ffffff;
          }

          .modal-content h2 {
            margin: 0 0 1.5rem 0;
            color: #ffffff;
          }

          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .form-grid input, .form-grid select {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 0.75rem;
            color: #ffffff;
            font-size: 0.875rem;
          }

          .form-grid input:nth-child(3) {
            grid-column: 1 / -1;
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
          }

          .form-actions button {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 0.75rem 1.5rem;
            color: #ffffff;
            cursor: pointer;
            transition: all 0.2s;
          }

          .form-actions button:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          .form-actions button[type="submit"] {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10b981;
          }
        `}</style>
      </div>
    </div>
  );
};

export default EnhancedUserManagement;