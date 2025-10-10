// Mobile-first image optimization utilities

export const IMAGE_BREAKPOINTS = {
  mobile: 320,
  mobileLarge: 576,
  tablet: 768,
  desktop: 992,
  desktopLarge: 1200
};

export const IMAGE_FORMATS = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  png: 'image/png'
};

/**
 * Generate responsive image URLs for different screen sizes
 * Mobile-first approach: starts with smallest size
 */
export const generateResponsiveImageUrls = (baseUrl, sizes = {}) => {
  const defaultSizes = {
    mobile: 320,
    mobileLarge: 576,
    tablet: 768,
    desktop: 992,
    desktopLarge: 1200
  };
  
  const imageSizes = { ...defaultSizes, ...sizes };
  
  return Object.entries(imageSizes).map(([breakpoint, width]) => {
    // For now, return original URL - can be enhanced with image processing service
    return {
      breakpoint,
      width,
      url: baseUrl,
      srcset: `${baseUrl} ${width}w`
    };
  });
};

/**
 * Create picture element with mobile-first responsive images
 */
export const createResponsivePicture = (src, alt, className = '', loading = 'lazy') => {
  // Check for modern format support
  const supportsWebP = (() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (e) {
      return false;
    }
  })();

  const supportsAvif = (() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch (e) {
      return false;
    }
  })();

  return {
    src,
    alt,
    className,
    loading,
    supportsWebP,
    supportsAvif
  };
};

/**
 * Lazy loading intersection observer
 */
export class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Load the actual image
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.add('loaded');
          
          // Remove from observer once loaded
          this.observer.unobserve(img);
        }

        // Handle srcset for responsive images
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
      }
    });
  }

  observe(element) {
    this.observer.observe(element);
  }

  unobserve(element) {
    this.observer.unobserve(element);
  }

  disconnect() {
    this.observer.disconnect();
  }
}

/**
 * Mobile-first image component factory
 */
export const createMobileFirstImage = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  sizes = '(max-width: 576px) 100vw, (max-width: 768px) 50vw, (max-width: 992px) 33vw, 25vw',
  placeholder = null
}) => {
  const imageConfig = {
    src,
    alt,
    className: `max-w-full h-auto ${className}`,
    loading,
    sizes,
    style: {
      objectFit: 'cover',
      transition: 'opacity 0.3s ease-in-out'
    }
  };

  // Add placeholder handling
  if (placeholder) {
    imageConfig.style.backgroundColor = '#f3f4f6';
    imageConfig.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(placeholder)}")`;
    imageConfig.style.backgroundSize = 'cover';
    imageConfig.style.backgroundPosition = 'center';
  }

  return imageConfig;
};

/**
 * Generate WebP fallback URLs
 */
export const getWebPFallback = (originalUrl) => {
  if (!originalUrl) return originalUrl;
  
  // Check if URL already has WebP extension
  if (originalUrl.includes('.webp')) {
    return originalUrl;
  }
  
  // Convert common formats to WebP
  const webpUrl = originalUrl
    .replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
  
  return webpUrl;
};

/**
 * Image performance optimization checker
 */
export const checkImagePerformance = (imageElement) => {
  if (!imageElement) return null;
  
  const metrics = {
    naturalWidth: imageElement.naturalWidth,
    naturalHeight: imageElement.naturalHeight,
    displayedWidth: imageElement.width,
    displayedHeight: imageElement.height,
    loadTime: null,
    format: null,
    fileSize: null
  };
  
  // Calculate compression ratio
  metrics.compressionRatio = (metrics.displayedWidth * metrics.displayedHeight) / 
                            (metrics.naturalWidth * metrics.naturalHeight);
  
  // Determine if image is oversized
  metrics.isOversized = metrics.naturalWidth > metrics.displayedWidth * 2 ||
                       metrics.naturalHeight > metrics.displayedHeight * 2;
  
  // Performance recommendations
  metrics.recommendations = [];
  
  if (metrics.isOversized) {
    metrics.recommendations.push('Consider using a smaller image size');
  }
  
  if (!imageElement.loading || imageElement.loading !== 'lazy') {
    metrics.recommendations.push('Consider adding lazy loading');
  }
  
  return metrics;
};

/**
 * Mobile-first image preloader
 */
export const preloadCriticalImages = (imageSrcs = []) => {
  // Only preload critical above-the-fold images on mobile
  const isMobile = window.innerWidth <= 768;
  const maxPreload = isMobile ? 3 : 6;
  
  imageSrcs.slice(0, maxPreload).forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Export singleton instance
export const lazyLoader = new LazyImageLoader();