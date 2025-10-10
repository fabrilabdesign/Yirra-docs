import React, { useEffect, useState } from 'react';

/**
 * Unified ProductImage component that handles all product image display logic
 * Prioritizes uploaded_image over Stripe image with proper fallbacks and error handling
 */
const ProductImage = ({ 
  product, 
  className = '', 
  alt = null,
  loading = 'lazy',
  showFallbackIcon = true,
  onLoad = null,
  onError = null,
  cacheBuster = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fetchedUrl, setFetchedUrl] = useState(null);

  // Unified image URL logic with proper priority
  const getImageUrl = () => {
    if (imageError) {
      return '/images/products/default.webp';
    }

    // Priority: primary_image_url > uploaded_image > Stripe image > default
    let imageUrl = fetchedUrl || product?.primary_image_url || product?.uploaded_image || product?.image || '/images/products/default.webp';
    
    // Normalize any /uploads/products/* URL to hit backend proxy
    if (typeof imageUrl === 'string' && imageUrl.startsWith('/uploads/products/')) {
      const filename = imageUrl.replace('/uploads/products/', '');
      imageUrl = `/api/uploads/products/${filename}`;
    }
    
    // Handle direct backend API endpoint for uploaded images (nginx proxy workaround)
    if (product?.uploaded_image && product.uploaded_image.startsWith('/uploads/products/')) {
      const filename = product.uploaded_image.replace('/uploads/products/', '');
      imageUrl = `/api/uploads/products/${filename}`;
    }

    // Add cache buster if requested
    if (cacheBuster && imageUrl !== '/images/products/default.webp') {
      const separator = imageUrl.includes('?') ? '&' : '?';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      imageUrl = `${imageUrl}${separator}v=${timestamp}&cb=${random}`;
    }

    return imageUrl;
  };

  // If no primary/uploaded image available (or it's the default placeholder), fetch first image as a fallback
  useEffect(() => {
    const initialCandidate = product?.primary_image_url || product?.uploaded_image || product?.image;
    const isDefault = typeof initialCandidate === 'string' && initialCandidate.includes('/images/products/default.webp');
    const hasProvided = Boolean(initialCandidate && !isDefault);
    if (!imageError && !hasProvided && product?.id) {
      (async () => {
        try {
          const resp = await fetch(`/api/products/${product.id}/images`);
          if (!resp.ok) return;
          const imgs = await resp.json();
          const primary = imgs.find((i) => i.isPrimary) || imgs[0];
          if (primary && primary.url) {
            const url = typeof primary.url === 'string' && primary.url.startsWith('/uploads/products/')
              ? `/api/uploads/products/${primary.url.replace('/uploads/products/', '')}`
              : primary.url;
            setFetchedUrl(url);
          }
        } catch (e) {
          // ignore network errors; fallback image will handle
        }
      })();
    }
  }, [product?.id]);

  const handleLoad = (e) => {
    setImageLoaded(true);
    e.target.classList.add('loaded');
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    console.warn('Image failed to load:', e.target.src);
    if (!imageError) {
      setImageError(true);
      e.target.src = '/images/products/default.webp';
      e.target.classList.add('loaded');
    }
    if (onError) onError(e);
  };

  const imageUrl = getImageUrl();
  const imageAlt = alt || product?.name || 'Product image';

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageUrl}
        alt={imageAlt}
        className="w-full h-full object-cover"
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Loading state */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-bl">
          {product?.uploaded_image ? 'U' : product?.image ? 'S' : 'D'}
        </div>
      )}
    </div>
  );
};

export default ProductImage;
