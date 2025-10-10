import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminUserManagement = () => {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
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
    role: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    userType: 'consumer',
    isAdmin: false,
    adminLevel: 'admin',
    password: '',
    confirmPassword: '',
    sendWelcomeEmail: true
  });
  const [createFormErrors, setCreateFormErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
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
        ...filters
      });

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
        setError(null);
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Users fetch error:', err);
      setError('Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const toggleUserRole = async (userId, currentIsAdmin) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isAdmin: !currentIsAdmin,
          adminLevel: !currentIsAdmin ? 'admin' : 'user'
        })
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (err) {
      console.error('Role update error:', err);
      setError('Failed to update user role');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required. Please sign in again.');
        return;
      }
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setError(''); // Clear any previous errors
        fetchUsers(); // Refresh the list
        // Show success message if available
        if (result.message) {
          console.log('User deleted:', result.message);
        }
      } else {
        // Parse error response for specific error messages
        let errorMessage = 'Failed to delete user';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If we can't parse the error, use status-based messages
          if (response.status === 403) {
            errorMessage = 'Permission denied. Super admin access required to delete users.';
          } else if (response.status === 404) {
            errorMessage = 'User not found.';
          } else if (response.status === 422) {
            errorMessage = 'Cannot delete user due to active sessions or restrictions.';
          }
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('User deletion error:', err);
      setError(err.message || 'Failed to delete user');
    }
  };

  const validateCreateForm = () => {
    const errors = {};
    
    if (!createFormData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(createFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!createFormData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!createFormData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!createFormData.password) {
      errors.password = 'Password is required';
    } else if (createFormData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (createFormData.password !== createFormData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!validateCreateForm()) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(getApiUrl('/api/admin/users'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: createFormData.email,
          firstName: createFormData.firstName,
          lastName: createFormData.lastName,
          password: createFormData.password,
          userType: createFormData.isAdmin ? createFormData.adminLevel : createFormData.userType,
          isAdmin: createFormData.isAdmin,
          adminLevel: createFormData.isAdmin ? createFormData.adminLevel : null,
          sendWelcomeEmail: createFormData.sendWelcomeEmail
        })
      });

      if (response.ok) {
        const newUser = await response.json();
        setShowCreateForm(false);
        setCreateFormData({
          email: '',
          firstName: '',
          lastName: '',
          userType: 'consumer',
          isAdmin: false,
          adminLevel: 'admin',
          password: '',
          confirmPassword: '',
          sendWelcomeEmail: true
        });
        setCreateFormErrors({});
        fetchUsers(); // Refresh the list
      } else if (response.status === 409) {
        setCreateFormErrors({ email: 'A user with this email already exists' });
      } else if (response.status === 403) {
        setError('Insufficient permissions to create users');
      } else {
        throw new Error('Failed to create user');
      }
    } catch (err) {
      console.error('User creation error:', err);
      setError('Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateFormChange = (field, value) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear specific field error when user starts typing
    if (createFormErrors[field]) {
      setCreateFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-user-management">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-user-management">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-user-management">
      <div className="management-header">
        <h1>User Management</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Create New User
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="consumer">Consumer</option>
            <option value="business">Business</option>
            <option value="educational">Educational</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
            <option value="support">Support</option>
            <option value="content_manager">Content Manager</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="created_at">Date Created</option>
            <option value="email">Email</option>
            <option value="first_name">First Name</option>
            <option value="last_name">Last Name</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Stats</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-name">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="user-id">ID: {user.id}</div>
                  </div>
                </td>
                <td>
                  <div className="email-info">
                    <div className="email">{user.email}</div>
                    {user.email_verified && (
                      <span className="verified-badge">✓ Verified</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="role-info">
                    <span className={`role-badge ${user.role === 'super_admin' ? 'super-admin' : user.is_admin ? 'admin' : 'user'}`}>
                      {user.role === 'super_admin' ? 'SUPER ADMIN' : user.is_admin ? user.admin_level : user.user_type}
                    </span>
                    {user.role === 'super_admin' && (
                      <div className="super-admin-indicator">
                        <span className="crown-icon">👑</span>
                        <span className="protected-text">PROTECTED</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="user-stats">
                    <div className="stat">
                      <span className="stat-value">{user.total_purchases}</span>
                      <span className="stat-label">Purchases</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">${parseFloat(user.total_spent || 0).toFixed(2)}</span>
                      <span className="stat-label">Spent</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{user.total_downloads}</span>
                      <span className="stat-label">Downloads</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetails(true);
                      }}
                    >
                      View
                    </button>
                    {user.role !== 'super_admin' && (
                      <button 
                        className={`btn-${user.is_admin ? 'warning' : 'success'}`}
                        onClick={() => toggleUserRole(user.id, user.is_admin)}
                      >
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    )}
                    {user.role === 'super_admin' ? (
                      <button 
                        className="btn-disabled"
                        disabled
                        title="Super admins cannot be deleted or modified"
                      >
                        Protected
                      </button>
                    ) : (
                      <button 
                        className="btn-danger"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                    )}
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
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button 
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreateForm(false)}>
          <div className="modal create-user-modal">
            <div className="modal-header">
              <h2>Create New User</h2>
              <button 
                className="close-button"
                onClick={() => setShowCreateForm(false)}
                disabled={isCreating}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="create-user-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      value={createFormData.email}
                      onChange={(e) => handleCreateFormChange('email', e.target.value)}
                      className={createFormErrors.email ? 'error' : ''}
                      disabled={isCreating}
                      required
                    />
                    {createFormErrors.email && (
                      <span className="error-message">{createFormErrors.email}</span>
                    )}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      value={createFormData.firstName}
                      onChange={(e) => handleCreateFormChange('firstName', e.target.value)}
                      className={createFormErrors.firstName ? 'error' : ''}
                      disabled={isCreating}
                      required
                    />
                    {createFormErrors.firstName && (
                      <span className="error-message">{createFormErrors.firstName}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      value={createFormData.lastName}
                      onChange={(e) => handleCreateFormChange('lastName', e.target.value)}
                      className={createFormErrors.lastName ? 'error' : ''}
                      disabled={isCreating}
                      required
                    />
                    {createFormErrors.lastName && (
                      <span className="error-message">{createFormErrors.lastName}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Account Security</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      value={createFormData.password}
                      onChange={(e) => handleCreateFormChange('password', e.target.value)}
                      className={createFormErrors.password ? 'error' : ''}
                      disabled={isCreating}
                      minLength={8}
                      required
                    />
                    {createFormErrors.password && (
                      <span className="error-message">{createFormErrors.password}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password *</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={createFormData.confirmPassword}
                      onChange={(e) => handleCreateFormChange('confirmPassword', e.target.value)}
                      className={createFormErrors.confirmPassword ? 'error' : ''}
                      disabled={isCreating}
                      minLength={8}
                      required
                    />
                    {createFormErrors.confirmPassword && (
                      <span className="error-message">{createFormErrors.confirmPassword}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>User Role & Permissions</h3>
                
                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={createFormData.isAdmin}
                        onChange={(e) => handleCreateFormChange('isAdmin', e.target.checked)}
                        disabled={isCreating}
                      />
                      <span className="checkbox-text">Admin User</span>
                    </label>
                    <small className="help-text">Admin users have access to the admin panel</small>
                  </div>
                </div>
                
                {createFormData.isAdmin ? (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="adminLevel">Admin Level</label>
                      <select
                        id="adminLevel"
                        value={createFormData.adminLevel}
                        onChange={(e) => handleCreateFormChange('adminLevel', e.target.value)}
                        disabled={isCreating}
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="support">Support</option>
                        <option value="content_manager">Content Manager</option>
                      </select>
                      <small className="help-text">
                        Super Admin: Full system access | Admin: User & content management | 
                        Support: Customer service | Content Manager: STL & product management
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="userType">User Type</label>
                      <select
                        id="userType"
                        value={createFormData.userType}
                        onChange={(e) => handleCreateFormChange('userType', e.target.value)}
                        disabled={isCreating}
                      >
                        <option value="consumer">Consumer</option>
                        <option value="business">Business</option>
                        <option value="educational">Educational</option>
                      </select>
                      <small className="help-text">Consumer: Individual customer | Business: Company account | Educational: School/University</small>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3>Notification Preferences</h3>
                
                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={createFormData.sendWelcomeEmail}
                        onChange={(e) => handleCreateFormChange('sendWelcomeEmail', e.target.checked)}
                        disabled={isCreating}
                      />
                      <span className="checkbox-text">Send welcome email</span>
                    </label>
                    <small className="help-text">User will receive account setup instructions</small>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal would go here */}
      {showUserDetails && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>User Details: {selectedUser.first_name} {selectedUser.last_name}</h2>
            <p>Detailed user information would be displayed here</p>
            <button onClick={() => setShowUserDetails(false)}>Close</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-user-management {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(56, 68, 82, 0.3);
        }

        .management-header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 2rem;
        }

        .filters-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
          border-radius: 8px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(10px);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .search-input, .filter-group select {
          padding: 8px 12px;
          border: 1px solid rgba(56, 68, 82, 0.5);
          border-radius: 6px;
          font-size: 14px;
          color: #ffffff;
          background: rgba(30, 41, 59, 0.8);
        }

        .search-input {
          min-width: 250px;
        }

        .users-table-container {
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
          border-radius: 8px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(10px);
          overflow: hidden;
          margin-bottom: 24px;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          background: rgba(30, 41, 59, 0.5);
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #94a3b8;
          border-bottom: 1px solid rgba(56, 68, 82, 0.3);
        }

        .users-table td {
          padding: 16px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.2);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-name {
          font-weight: 600;
          color: #ffffff;
        }

        .user-id {
          font-size: 12px;
          color: #718096;
        }

        .email-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .email {
          color: #e2e8f0;
        }

        .verified-badge {
          font-size: 12px;
          color: #38a169;
          font-weight: 500;
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .role-badge.admin {
          background: #fed7d7;
          color: #c53030;
        }

        .role-badge.super-admin {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #1a202c;
          font-weight: 700;
          border: 2px solid #ffd700;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }

        .super-admin-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .crown-icon {
          font-size: 14px;
        }

        .protected-text {
          font-size: 10px;
          color: #ffd700;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-disabled {
          padding: 6px 12px;
          border: 1px solid #4a5568;
          border-radius: 4px;
          background: #2d3748;
          color: #a0aec0;
          font-size: 12px;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .role-badge.user {
          background: #e6fffa;
          color: #319795;
        }

        .user-stats {
          display: flex;
          gap: 12px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-value {
          font-weight: 600;
          color: #ffffff;
        }

        .stat-label {
          font-size: 11px;
          color: #718096;
        }

        .date-info {
          color: #94a3b8;
          font-size: 14px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-primary, .btn-secondary, .btn-success, .btn-warning, .btn-danger {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background: #4299e1;
          color: white;
        }

        .btn-secondary {
          background: #718096;
          color: white;
        }

        .btn-success {
          background: #38a169;
          color: white;
        }

        .btn-warning {
          background: #ed8936;
          color: white;
        }

        .btn-danger {
          background: #e53e3e;
          color: white;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
          border-radius: 8px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(10px);
        }

        .pagination-info {
          color: #94a3b8;
          font-size: 14px;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pagination-controls button {
          padding: 8px 16px;
          border: 1px solid rgba(56, 68, 82, 0.5);
          background: rgba(30, 41, 59, 0.5);
          color: #e2e8f0;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          color: #94a3b8;
          font-size: 14px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(20, 25, 30, 0.95) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(56, 68, 82, 0.4);
          padding: 24px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .create-user-modal {
          max-width: 700px;
          width: 95%;
          max-height: 90vh;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.3);
        }

        .modal-header h2 {
          margin: 0;
          color: #ffffff;
          font-size: 1.5rem;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          color: #718096;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
        }

        .close-button:hover {
          color: #e53e3e;
        }

        .create-user-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-section h3 {
          margin: 0;
          color: #ffffff;
          font-size: 1.125rem;
          font-weight: 600;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.3);
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 600;
          color: #94a3b8;
          font-size: 14px;
        }

        .form-group input,
        .form-group select {
          padding: 10px 12px;
          border: 1px solid rgba(56, 68, 82, 0.5);
          border-radius: 6px;
          font-size: 14px;
          color: #ffffff;
          background: rgba(30, 41, 59, 0.8);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        .form-group input.error,
        .form-group select.error {
          border-color: #ff6b6b;
        }

        .form-group input:disabled,
        .form-group select:disabled {
          background-color: rgba(15, 20, 25, 0.5);
          color: #64748b;
          cursor: not-allowed;
        }

        .checkbox-group {
          flex-direction: row;
          align-items: center;
          gap: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          margin: 0;
        }

        .checkbox-text {
          color: #e2e8f0;
          font-size: 14px;
        }

        .help-text {
          color: #64748b;
          font-size: 12px;
          line-height: 1.4;
          margin-top: 4px;
        }

        .error-message {
          color: #ff6b6b;
          font-size: 12px;
          font-weight: 500;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(56, 68, 82, 0.3);
          margin-top: 8px;
        }

        .modal-actions button {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading, .error {
          text-align: center;
          padding: 60px 20px;
          color: #94a3b8;
          font-size: 18px;
        }

        .error {
          color: #ff6b6b;
        }

        @media (max-width: 1024px) {
          .filters-section {
            flex-direction: column;
          }

          .user-stats {
            flex-direction: column;
            gap: 4px;
          }

          .action-buttons {
            flex-direction: column;
          }
        }

        @media (max-width: 768px) {
          .create-user-modal {
            max-width: 95%;
            margin: 10px;
            max-height: 95vh;
          }

          .form-row {
            flex-direction: column;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .modal-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminUserManagement;