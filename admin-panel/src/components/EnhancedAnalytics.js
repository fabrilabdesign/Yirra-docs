import { useEffect } from 'react';

// Enhanced Analytics with IP Protection
const EnhancedAnalytics = {
  // Initialize all tracking with feature flags
  init: (options = {}) => {
    // Only initialize if enabled
    if (!options.enabled) return;
    
    console.log('Initializing enhanced analytics with IP protection');
    
    // Track detailed user interactions
    EnhancedAnalytics.trackDetailedBehavior();
    
    // Track scroll depth and engagement
    EnhancedAnalytics.trackScrollBehavior();
    
    // Monitor for content scraping
    EnhancedAnalytics.detectScraping();
    
    // Track screenshot attempts
    EnhancedAnalytics.detectScreenshotAttempts();
    
    // Monitor access to sensitive pages
    EnhancedAnalytics.trackContentAccess();
    
    // Performance monitoring
    EnhancedAnalytics.monitorPerformance();
    
    // Network quality monitoring
    EnhancedAnalytics.monitorNetwork();
  },

  // Track detailed user interactions
  trackDetailedBehavior: () => {
    // Mouse movement patterns (detect bots/crawlers)
    let mouseMoveCount = 0;
    let lastMouseMoveTime = 0;
    
    document.addEventListener('mousemove', (e) => {
      // Throttle to prevent performance issues
      const now = Date.now();
      if (now - lastMouseMoveTime < 100) return; // Limit to 10 events/second
      lastMouseMoveTime = now;
      
      mouseMoveCount++;
      
      // Send data periodically to avoid overwhelming
      if (mouseMoveCount % 50 === 0) {
        const eventData = {
          event: 'mouseMovementBatch',
          count: mouseMoveCount,
          page: window.location.pathname,
          timestamp: now
        };
        
        // Send to Google Analytics
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(eventData);
        
        // Send to our backend analytics API
        this.sendToBackend('userBehavior', eventData);
      }
    });

    // Copy/paste detection (protect sensitive content)
    document.addEventListener('copy', (e) => {
      const selection = document.getSelection().toString();
      const eventData = {
        event: 'contentCopy',
        contentLength: selection.length,
        page: window.location.pathname,
        timestamp: Date.now()
      };
      
      // Send to Google Analytics
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(eventData);
      
      // Send to our backend analytics API
      this.sendToBackend('suspiciousActivity', eventData);
    });
  },

  // Track scroll depth and engagement
  trackScrollBehavior: () => {
    let maxScroll = 0;
    let scrollTimer = null;
    
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }
      
      // Debounce scroll events
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'scrollDepth',
          maxDepth: maxScroll,
          page: window.location.pathname,
          timestamp: Date.now()
        });
      }, 1000);
    });
  },

  // Monitor for content scraping
  detectScraping: () => {
    // Check request frequency
    const requestTimes = [];
    
    // Only monitor fetch requests, not all requests
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      requestTimes.push(Date.now());
      
      // Clean up old requests (older than 10 seconds)
      const cutoffTime = Date.now() - 10000;
      while (requestTimes.length > 0 && requestTimes[0] < cutoffTime) {
        requestTimes.shift();
      }
      
      // If more than 20 requests in 10 seconds, likely scraping
      if (requestTimes.length > 20) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'potentialScraping',
          requestCount: requestTimes.length,
          timeframe: '10s',
          timestamp: Date.now()
        });
      }
      
      return originalFetch.apply(this, args);
    };
  },

  // Track screenshot attempts
  detectScreenshotAttempts: () => {
    // Detect print screen key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PrintScreen') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'screenshotAttempt',
          key: 'PrintScreen',
          timestamp: Date.now()
        });
      }
    });
  },

  // Content protection tracking
  trackContentAccess: () => {
    // Monitor access to sensitive pages
    const sensitivePages = ['/products', '/technology', '/solutions'];
    if (sensitivePages.includes(window.location.pathname)) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'sensitivePageAccess',
        page: window.location.pathname,
        referrer: document.referrer,
        timestamp: Date.now()
      });
    }
  },

  // Performance monitoring
  monitorPerformance: () => {
    // Core Web Vitals tracking
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfEntries = performance.getEntriesByType('navigation');
          if (perfEntries.length > 0) {
            const perfData = perfEntries[0];
            
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: 'pageLoadPerformance',
              page: window.location.pathname,
              loadTime: perfData.loadEventEnd - perfData.loadEventStart,
              domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              timestamp: Date.now()
            });
          }
        }, 1000);
      });
    }
  },

  // Network quality monitoring
  monitorNetwork: () => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'networkInfo',
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        timestamp: Date.now()
      });
    }
  },

  // Send data to backend analytics API
  sendToBackend: async (type, data) => {
    try {
      // Only send data if we're in production or have analytics enabled
      if (typeof window === 'undefined') return;
      
      await fetch('/api/enhanced-analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          timestamp: Date.now(),
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          sessionId: EnhancedAnalytics.getSessionId()
        })
      });
    } catch (error) {
      // Silently fail to avoid disrupting user experience
      console.debug('Enhanced analytics tracking error:', error);
    }
  },

  // Get or create session ID
  getSessionId: () => {
    let sessionId = sessionStorage.getItem('enhanced_analytics_session');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('enhanced_analytics_session', sessionId);
    }
    return sessionId;
  },

  // Cleanup function for easy removal
  cleanup: () => {
    // Remove all event listeners and clear intervals
    // This allows for easy removal of enhanced analytics
    document.removeEventListener('mousemove', () => {});
    document.removeEventListener('copy', () => {});
    document.removeEventListener('keydown', () => {});
    document.removeEventListener('scroll', () => {});
  }
};

export default EnhancedAnalytics;
