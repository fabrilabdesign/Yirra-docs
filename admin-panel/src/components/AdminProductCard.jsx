import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import getApiUrl from '../utils/api.js';

const AdminProductCard = ({ product, onEdit, onDelete, onToggleStatus }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Simple image URL logic - prioritize uploaded_image
  const getImageUrl = () => {
    if (product.uploaded_image) {
      // Use direct API endpoint to bypass nginx proxy issues
      if (product.uploaded_image.startsWith('/uploads/products/')) {
        const filename = product.uploaded_image.replace('/uploads/products/', '');
        return `/api/uploads/products/${filename}`;
      }
      return product.uploaded_image;
    }
    if (product.image) {
      return product.image;
    }
    return '/images/products/default.webp';
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  return (
    <div className="admin-product-card">
      {/* Image Section */}
      <div className="product-image-section">
        {imageLoading && (
          <div className="image-loading">
            <div className="spinner"></div>
          </div>
        )}
        
        {!imageError ? (
          <img
            src={getImageUrl()}
            alt={product.name}
            className="product-image"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        ) : (
          <div className="image-placeholder">
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>No Image</span>
          </div>
        )}

        {/* Image Source Badge */}
        {product.uploaded_image && (
          <div className="image-source-badge uploaded">
            <span>Uploaded</span>
          </div>
        )}
        {product.image && !product.uploaded_image && (
          <div className="image-source-badge stripe">
            <span>Stripe</span>
          </div>
        )}

        {/* Status Badge */}
        <div className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
          {product.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Content Section */}
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-price">{formatPrice(product.price)}</div>
        </div>

        {product.description && (
          <p className="product-description">
            {product.description.length > 100
              ? product.description.substring(0, 100) + '...'
              : product.description
            }
          </p>
        )}

        <div className="product-meta">
          {product.category && (
            <span className="meta-tag category">{product.category}</span>
          )}
          {product.sku && (
            <span className="meta-tag sku">SKU: {product.sku}</span>
          )}
          {product.image_count > 0 && (
            <span className="meta-tag images">
              {product.image_count} image{product.image_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="product-actions">
          <button
            onClick={() => onEdit(product)}
            className="action-btn edit"
            title="Edit Product"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </button>
          
          <button
            onClick={() => onToggleStatus(product.id, product.is_active)}
            className={`action-btn ${product.is_active ? 'deactivate' : 'activate'}`}
            title={product.is_active ? 'Deactivate' : 'Activate'}
          >
            {product.is_active ? (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Deactivate
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Activate
              </>
            )}
          </button>
          
          <button
            onClick={() => onDelete(product.id)}
            className="action-btn delete"
            title="Delete Product"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Debug Info (temporary) */}
      <div className="debug-info" style={{ fontSize: '10px', color: '#666', padding: '4px', borderTop: '1px solid #eee' }}>
        <div>ID: {product.id}</div>
        <div>Uploaded Image: {product.uploaded_image || 'None'}</div>
        <div>Stripe Image: {product.image || 'None'}</div>
        <div>Image Count: {product.image_count || 0}</div>
      </div>
    </div>
  );
};

export default AdminProductCard;
