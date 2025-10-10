import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import ProductImageGallery from './ProductImageGallery';
import ImageUpload from './ImageUpload';
import ProductImage from './ProductImage';

// Smart cache busting utility - only for local images, not external URLs
const addCacheBuster = (url) => {
  if (!url) return url;
  // Don't add cache busters to external URLs (like Stripe)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Only add cache busters to local uploaded images
  const separator = url.includes('?') ? '&' : '?';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${url}${separator}v=${timestamp}&cb=${random}`;
};

const AdminProducts = () => {
  const { getToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    is_digital: false,
    unlocks_stls: false,
    stl_bundle_name: '',
    weight: '',
    dimensions: '',
    sku: '',
    stock_quantity: '',
    tags: []
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryProductId, setGalleryProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      console.error('Products fetch error:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const syncStripeProducts = async () => {
    try {
      setSyncing(true);
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      console.log('Starting Stripe sync...');
      const response = await fetch('/api/admin/sync-products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Sync response status:', response.status);
      console.log('Sync response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Sync successful:', data);
        
        // Show detailed success message
        const message = `Products synced successfully!\n- Synced: ${data.synced || 0} products\n- Active: ${data.active || 0}\n- Archived: ${data.archived || 0}`;
        alert(message);
        
        // Refresh products list
        fetchProducts();
      } else {
        const errorData = await response.text();
        console.error('Sync failed with status:', response.status);
        console.error('Error response:', errorData);
        
        let errorMessage = 'Failed to sync products from Stripe';
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage += `: ${parsedError.error || parsedError.message || 'Unknown error'}`;
        } catch (e) {
          errorMessage += `: HTTP ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Sync error:', err);
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Image upload handlers for unified ImageUpload component
  const handleImageUploadSuccess = (imageUrl, preview) => {
    setProductForm(prev => ({ ...prev, image: imageUrl }));
    setImagePreview(preview);
    console.log('Image upload successful:', imageUrl);
  };

  const handleImageUploadError = (error) => {
    console.error('Image upload error:', error);
    alert(`Failed to upload image: ${error.message}`);
  };

  const handleImageUploadProgress = (progress) => {
    setUploadProgress(progress);
  };

  // Custom uploadImage function removed - now using unified ImageUpload component

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.price) {
      alert('Please provide product name and price');
      return;
    }

    // Image URL is already set by unified ImageUpload component via handleImageUploadSuccess
    const imageUrl = productForm.image;

    const productData = {
      ...productForm,
      image: imageUrl,
      price: parseFloat(productForm.price)
    };
    delete productData.imageFile;

    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const isEdit = !!editingProduct;
      
      const response = await fetch(
        isEdit ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        }
      );

      if (response.ok) {
        alert(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
        setShowAddModal(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      } else {
        throw new Error(`Failed to ${isEdit ? 'update' : 'create'} product`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert(`Failed to ${editingProduct ? 'update' : 'create'} product`);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      is_digital: false,
      unlocks_stls: false,
      stl_bundle_name: '',
      weight: '',
      dimensions: '',
      sku: '',
      stock_quantity: '',
      tags: []
    });
    setImagePreview(null);
    setUploadProgress(0);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    // Prioritize uploaded image over Stripe image
    const displayImage = product.uploaded_image || product.image || '';
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      image: displayImage,
      is_digital: product.is_digital || false,
      unlocks_stls: product.unlocks_stls || false,
      stl_bundle_name: product.stl_bundle_name || '',
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      sku: product.sku || '',
      stock_quantity: product.stock_quantity || '',
      tags: product.tags || []
    });
    setImagePreview(displayImage);
    setShowAddModal(true);
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      const response = await fetch(`/api/admin/products/${productId}`, {
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
        fetchProducts();
      } else {
        throw new Error('Failed to update product status');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update product status');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete product');
    }
  };

  const openImageGallery = (productId) => {
    setGalleryProductId(productId);
    setShowImageGallery(true);
  };

  const closeImageGallery = () => {
    setShowImageGallery(false);
    setGalleryProductId(null);
  };

  const handleImagesUpdated = () => {
    // Refresh products list to update image counts or primary images
    fetchProducts();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'created':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'stock':
        return (b.stock_quantity || 0) - (a.stock_quantity || 0);
      default:
        return 0;
    }
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Mobile Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Product Management</h2>
        <div className="flex gap-3">
          <button 
            onClick={syncStripeProducts} 
            disabled={syncing}
            className={`bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2 ${syncing ? 'opacity-50' : ''}`}
            title={syncing ? 'Syncing products from Stripe...' : 'Sync products from Stripe'}
          >
            <svg 
              className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync Stripe'}</span>
          </button>
          <button onClick={() => {
            resetForm();
            setEditingProduct(null);
            setShowAddModal(true);
          }} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Product Statistics - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-900/50 p-2 rounded-lg">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="text-xl font-bold text-white">{products.length}</div>
          <div className="text-sm text-gray-400">Total Products</div>
        </div>
        
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-900/50 p-2 rounded-lg">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-xl font-bold text-white">{products.filter(p => p.is_active).length}</div>
          <div className="text-sm text-gray-400">Active Products</div>
        </div>
        
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-900/50 p-2 rounded-lg">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <div className="text-xl font-bold text-white">{categories.length}</div>
          <div className="text-sm text-gray-400">Categories</div>
        </div>
        
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-yellow-900/50 p-2 rounded-lg">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-lg font-bold text-white">
            {formatCurrency(products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0))}
          </div>
          <div className="text-sm text-gray-400">Total Value</div>
        </div>
      </div>

      {/* Filters and Search - Mobile First */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
          />
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="created">Sort by Date</option>
            <option value="stock">Sort by Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {sortedProducts.length > 0 ? (
          sortedProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                {(product.uploaded_image || product.image) ? (
                  <>
                    <img 
                      src={addCacheBuster(product.uploaded_image || product.image || '/images/products/default.webp')} 
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        console.error('Image load error:', e.target.src);
                        e.target.src = '/images/products/default.webp';
                      }}
                    />
                    {product.image_source && (
                      <div className="image-source-badge">
                        <span className={`badge badge-${product.image_source}`}>
                          {product.image_type || product.image_source}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-image">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>No Image</span>
                  </div>
                )}
                <div className="product-overlay">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="overlay-btn"
                    title="Edit Product"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => openImageGallery(product.id)}
                    className="overlay-btn images"
                    title={`Manage Images (${product.image_count || 0})`}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="status-badges">
                  <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {product.stripe_product_id && (
                    <span className="status-badge stripe">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '14px', height: '14px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Stripe
                    </span>
                  )}
                  {product.image_count > 0 && (
                    <span className="status-badge images">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '14px', height: '14px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {product.image_count}
                    </span>
                  )}
                </div>
              </div>

              <div className="product-content">
                <div className="product-header">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">{formatCurrency(product.price)}</div>
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
                  {product.stock_quantity !== null && product.stock_quantity !== undefined && (
                    <span className={`meta-tag stock ${product.stock_quantity > 0 ? 'in-stock' : 'out-stock'}`}>
                      Stock: {product.stock_quantity}
                    </span>
                  )}
                </div>

                {product.unlocks_stls && (
                  <div className="stl-indicator">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span>Includes STL Files</span>
                  </div>
                )}

                <div className="product-actions">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="action-btn"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    onClick={() => toggleProductStatus(product.id, product.is_active)}
                    className={`action-btn ${product.is_active ? 'deactivate' : 'activate'}`}
                  >
                    {product.is_active ? (
                      <>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Deactivate
                      </>
                    ) : (
                      <>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Activate
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => deleteProduct(product.id)}
                    className="action-btn delete"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            {error ? (
              <div className="error">{error}</div>
            ) : (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3>No products found</h3>
                <p>Create your first product to get started</p>
                <button onClick={() => {
                  resetForm();
                  setEditingProduct(null);
                  setShowAddModal(true);
                }} className="btn-primary">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Product
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="close-btn"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="product-form">
                {/* Image Upload Section - Using Unified ImageUpload Component */}
                <div className="image-upload-section">
                  <label>Product Image</label>
                  <ImageUpload
                    onUploadSuccess={handleImageUploadSuccess}
                    onUploadError={handleImageUploadError}
                    onUploadProgress={handleImageUploadProgress}
                    productId={editingProduct?.id}
                    currentImage={imagePreview || productForm.image}
                    className="w-full"
                    buttonText="Upload Product Image"
                    showPreview={true}
                    disabled={uploadingImage}
                  />
                </div>

                {/* Basic Information */}
                <div className="form-section">
                  <h4>Basic Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({...prev, name: e.target.value}))}
                        className="form-input"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>SKU</label>
                      <input
                        type="text"
                        value={productForm.sku}
                        onChange={(e) => setProductForm(prev => ({...prev, sku: e.target.value}))}
                        className="form-input"
                        placeholder="Stock keeping unit"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({...prev, description: e.target.value}))}
                      className="form-textarea"
                      rows="4"
                      placeholder="Describe your product..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <input
                        type="text"
                        value={productForm.category}
                        onChange={(e) => setProductForm(prev => ({...prev, category: e.target.value}))}
                        className="form-input"
                        placeholder="e.g., Drones, Parts, Accessories"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Tags (comma separated)</label>
                      <input
                        type="text"
                        value={productForm.tags.join(', ')}
                        onChange={(e) => setProductForm(prev => ({
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        }))}
                        className="form-input"
                        placeholder="drone, fpv, racing"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="form-section">
                  <h4>Pricing & Inventory</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price (USD) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({...prev, price: e.target.value}))}
                        className="form-input"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Stock Quantity</label>
                      <input
                        type="number"
                        value={productForm.stock_quantity}
                        onChange={(e) => setProductForm(prev => ({...prev, stock_quantity: e.target.value}))}
                        className="form-input"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="form-section">
                  <h4>Shipping Details</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.weight}
                        onChange={(e) => setProductForm(prev => ({...prev, weight: e.target.value}))}
                        className="form-input"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Dimensions (L x W x H cm)</label>
                      <input
                        type="text"
                        value={productForm.dimensions}
                        onChange={(e) => setProductForm(prev => ({...prev, dimensions: e.target.value}))}
                        className="form-input"
                        placeholder="10 x 10 x 10"
                      />
                    </div>
                  </div>
                </div>

                {/* STL Bundle */}
                <div className="form-section">
                  <h4>Digital Content</h4>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={productForm.is_digital}
                        onChange={(e) => setProductForm(prev => ({...prev, is_digital: e.target.checked}))}
                        className="form-checkbox"
                      />
                      <span>Mark as Digital Product (show badge, use digital checkout)</span>
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={productForm.unlocks_stls}
                        onChange={(e) => setProductForm(prev => ({...prev, unlocks_stls: e.target.checked}))}
                        className="form-checkbox"
                      />
                      <span>This product includes STL files</span>
                    </label>
                  </div>
                  
                  {productForm.unlocks_stls && (
                    <div className="form-group">
                      <label>STL Bundle Name</label>
                      <input
                        type="text"
                        value={productForm.stl_bundle_name}
                        onChange={(e) => setProductForm(prev => ({...prev, stl_bundle_name: e.target.value}))}
                        className="form-input"
                        placeholder="Enter bundle name"
                      />
                    </div>
                  )}
                </div>
              </div>
            </form>

            <div className="modal-footer">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                type="submit"
                onClick={handleSubmit}
                disabled={uploadingImage}
                className="btn-submit"
              >
                {uploadingImage ? 'Uploading...' : (editingProduct ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      <ProductImageGallery
        productId={galleryProductId}
        isOpen={showImageGallery}
        onClose={closeImageGallery}
        onImagesUpdated={handleImagesUpdated}
      />

      <style jsx>{`
        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .upload-progress-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 20px;
        }

        .upload-spinner {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 3px;
          transition: width 0.3s ease;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }

        .upload-spinner svg.animate-spin {
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .image-preview {
          position: relative;
          width: 200px;
          height: 200px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #e5e7eb;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-image:hover {
          background: rgba(239, 68, 68, 0.8);
          transform: scale(1.1);
        }

        .remove-image svg {
          width: 16px;
          height: 16px;
        }

        .image-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 200px;
          height: 200px;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          text-align: center;
          padding: 20px;
        }

        .image-upload-label:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .image-upload-label svg {
          width: 32px;
          height: 32px;
        }

        .upload-hint {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .file-input {
          display: none;
        }

        .file-input:disabled + .image-upload-label {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .image-upload-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .image-upload-section {
          margin-bottom: 24px;
        }

        .image-upload-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }
        .admin-products {
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

        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 36px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.2);
        }

        .products-header h2 {
          margin: 0;
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .products-header h2::before {
          content: '';
          width: 4px;
          height: 28px;
          background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 2px;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-action, .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-action {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(56, 68, 82, 0.3);
          color: #94a3b8;
        }

        .btn-action:hover {
          background: rgba(30, 41, 59, 0.8);
          border-color: rgba(56, 68, 82, 0.5);
          transform: translateY(-1px);
        }

        .btn-action:disabled,
        .btn-action.syncing {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-action:disabled:hover,
        .btn-action.syncing:hover {
          background: rgba(30, 41, 59, 0.5);
          border-color: rgba(56, 68, 82, 0.3);
          transform: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .btn-action svg, .btn-primary svg {
          width: 16px;
          height: 16px;
        }

        /* Statistics */
        .product-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
          padding: 24px;
          border-radius: 12px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
        }

        .stat-icon.active {
          background: rgba(52, 211, 153, 0.1);
          border-color: rgba(52, 211, 153, 0.2);
          color: #34d399;
        }

        .stat-icon svg {
          width: 24px;
          height: 24px;
          stroke-width: 1.5;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
          font-variant-numeric: tabular-nums;
        }

        .stat-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        /* Controls */
        .products-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 20px;
        }

        .search-box {
          flex: 1;
          max-width: 400px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #64748b;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #1f2937;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .search-input::placeholder {
          color: #6b7280;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: #ffffff;
        }

        .filter-controls {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          padding: 12px 16px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #1f2937;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-select:hover {
          border-color: #3b82f6;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: #ffffff;
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .product-card {
          background: linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(20, 25, 30, 0.8) 100%);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(56, 68, 82, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .product-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        }

        .product-image-container {
          position: relative;
          height: 200px;
          background: rgba(30, 41, 59, 0.5);
          overflow: hidden;
        }

        .image-source-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 10;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .badge-uploaded {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .badge-stripe {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .badge-static {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #64748b;
        }

        .no-image svg {
          width: 48px;
          height: 48px;
        }

        .no-image span {
          font-size: 14px;
          font-weight: 500;
        }

        .product-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .product-card:hover .product-overlay {
          opacity: 1;
        }

        .overlay-btn {
          width: 48px;
          height: 48px;
          background: rgba(59, 130, 246, 0.9);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
        }

        .overlay-btn:hover {
          transform: scale(1.1);
          background: #3b82f6;
        }

        .overlay-btn svg {
          width: 24px;
          height: 24px;
        }

        .overlay-btn.images {
          background: rgba(251, 191, 36, 0.9);
        }

        .overlay-btn.images:hover {
          background: #fbbf24;
        }

        .status-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.active {
          background: rgba(52, 211, 153, 0.9);
          color: white;
        }

        .status-badge.inactive {
          background: rgba(248, 113, 113, 0.9);
          color: white;
        }

        .product-content {
          padding: 24px;
        }

        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .product-name {
          margin: 0;
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          flex: 1;
          margin-right: 12px;
        }

        .product-price {
          color: #3b82f6;
          font-size: 20px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .product-description {
          margin: 0 0 16px 0;
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.5;
        }

        .product-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .meta-tag {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .meta-tag.category {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
        }

        .meta-tag.sku {
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
        }

        .meta-tag.stock {
          background: rgba(52, 211, 153, 0.1);
          color: #34d399;
        }

        .meta-tag.stock.out-stock {
          background: rgba(248, 113, 113, 0.1);
          color: #f87171;
        }

        .stl-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 8px;
          margin-bottom: 16px;
          color: #fbbf24;
          font-size: 13px;
          font-weight: 500;
        }

        .stl-indicator svg {
          width: 16px;
          height: 16px;
        }

        .product-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
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

        .action-btn:hover {
          background: rgba(30, 41, 59, 0.8);
          transform: translateY(-1px);
        }

        .action-btn svg {
          width: 16px;
          height: 16px;
        }

        .action-btn.activate {
          color: #34d399;
        }

        .action-btn.activate:hover {
          background: rgba(52, 211, 153, 0.1);
          border-color: rgba(52, 211, 153, 0.3);
        }

        .action-btn.deactivate {
          color: #fbbf24;
        }

        .action-btn.deactivate:hover {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.3);
        }

        .action-btn.delete {
          color: #f87171;
        }

        .action-btn.delete:hover {
          background: rgba(248, 113, 113, 0.1);
          border-color: rgba(248, 113, 113, 0.3);
        }

        /* Empty State */
        .no-products {
          grid-column: 1 / -1;
          padding: 80px 20px;
          text-align: center;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          color: #475569;
        }

        .empty-state h3 {
          margin: 0;
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
        }

        .empty-state p {
          margin: 0;
          color: #94a3b8;
          font-size: 15px;
        }

        .empty-state .btn-primary {
          margin-top: 16px;
        }

        /* Modal Styles */
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

        .modal-content {
          background: linear-gradient(135deg, #0f1419 0%, #0a0e1a 100%);
          border-radius: 16px;
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          border: 1px solid rgba(56, 68, 82, 0.3);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease-out;
          display: flex;
          flex-direction: column;
        }

        .modal-content.large {
          max-width: 900px;
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

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.2);
        }

        .modal-header h3 {
          margin: 0;
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(56, 68, 82, 0.3);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #94a3b8;
        }

        .close-btn:hover {
          background: rgba(248, 113, 113, 0.1);
          border-color: rgba(248, 113, 113, 0.3);
          color: #f87171;
        }

        .close-btn svg {
          width: 16px;
          height: 16px;
        }

        .modal-body {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        .product-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Image Upload Section */
        .image-upload-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .image-upload-section label {
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .image-upload-container {
          position: relative;
          width: 100%;
          height: 240px;
          border: 2px dashed rgba(56, 68, 82, 0.5);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .image-upload-container:hover {
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(59, 130, 246, 0.05);
        }

        .image-preview {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: rgba(30, 41, 59, 0.3);
        }

        .remove-image {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          background: rgba(248, 113, 113, 0.9);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
        }

        .remove-image:hover {
          transform: scale(1.1);
          background: #f87171;
        }

        .remove-image svg {
          width: 16px;
          height: 16px;
        }

        .image-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          cursor: pointer;
          color: #94a3b8;
          gap: 12px;
        }

        .image-upload-label svg {
          width: 48px;
          height: 48px;
          color: #3b82f6;
        }

        .image-upload-label span {
          font-size: 14px;
          font-weight: 500;
        }

        .upload-hint {
          font-size: 12px;
          color: #64748b;
        }

        .file-input {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        /* Form Sections */
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-section h4 {
          margin: 0;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.2);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
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

        .form-input,
        .form-textarea {
          padding: 12px 16px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #1f2937;
          font-size: 14px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #6b7280;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: #ffffff;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: #ffffff;
          font-size: 14px;
          font-weight: 400;
        }

        .form-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .modal-footer {
          padding: 24px 32px;
          border-top: 1px solid rgba(56, 68, 82, 0.2);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-cancel {
          padding: 10px 24px;
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
          background: rgba(30, 41, 59, 0.8);
          border-color: rgba(56, 68, 82, 0.5);
        }

        .btn-submit {
          padding: 10px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error {
          color: #f87171;
          text-align: center;
          padding: 20px;
          font-size: 16px;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          color: #94a3b8;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .products-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            display: flex;
            gap: 12px;
          }

          .btn-action,
          .btn-primary {
            flex: 1;
          }

          .product-stats {
            grid-template-columns: 1fr 1fr;
          }

          .products-controls {
            flex-direction: column;
            gap: 16px;
          }

          .search-box {
            max-width: none;
          }

          .filter-controls {
            width: 100%;
          }

          .filter-select {
            flex: 1;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-content {
            margin: 20px;
            max-height: calc(100vh - 40px);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminProducts;