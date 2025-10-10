import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import AdminProductCard from './AdminProductCard';
import './AdminProductCard.css';
import getApiUrl from '../utils/api.js';

const AdminProductsList = () => {
  const { getToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('Fetching admin products...');
      const response = await fetch(getApiUrl('/api/admin/products'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Admin products API response:', data);
      
      // Debug: Log each product's image data
      data.forEach((product, index) => {
        console.log(`Product ${index + 1} (${product.name}):`, {
          id: product.id,
          uploaded_image: product.uploaded_image,
          image: product.image,
          image_count: product.image_count
        });
      });

      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    console.log('Edit product:', product);
    // TODO: Implement edit functionality
    alert(`Edit functionality not yet implemented for: ${product.name}`);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(getApiUrl(`/api/admin/products/${productId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh the products list
        fetchProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete product');
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(getApiUrl(`/api/admin/products/${productId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      });

      if (response.ok) {
        // Refresh the products list
        fetchProducts();
      } else {
        throw new Error('Failed to update product status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update product status');
    }
  };

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-products-error">
        <div className="error-icon">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3>Failed to Load Products</h3>
        <p>{error}</p>
        <button onClick={fetchProducts} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="admin-products-empty">
        <div className="empty-icon">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3>No Products Found</h3>
        <p>No products are currently available in the admin panel.</p>
        <button onClick={fetchProducts} className="refresh-btn">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="admin-products-list">
      <div className="products-header">
        <h2>Products ({products.length})</h2>
        <button onClick={fetchProducts} className="refresh-btn">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <AdminProductCard
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        ))}
      </div>

      {/* Debug Summary */}
      <div className="debug-summary" style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', fontSize: '14px' }}>
        <h4>Debug Summary:</h4>
        <p>Total products: {products.length}</p>
        <p>Products with uploaded images: {products.filter(p => p.uploaded_image).length}</p>
        <p>Products with Stripe images: {products.filter(p => p.image && !p.uploaded_image).length}</p>
        <p>Products with no images: {products.filter(p => !p.uploaded_image && !p.image).length}</p>
      </div>
    </div>
  );
};

export default AdminProductsList;
