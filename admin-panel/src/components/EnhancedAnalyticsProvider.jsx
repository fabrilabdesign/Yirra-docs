import React, { useEffect } from 'react';
import EnhancedAnalytics from './EnhancedAnalytics';

const EnhancedAnalyticsProvider = ({ children }) => {
  useEffect(() => {
    // Initialize enhanced analytics with feature flag
    // Support both VITE and REACT_APP prefixes for compatibility
    const enableEnhancedAnalytics = 
      import.meta.env.VITE_ENHANCED_ANALYTICS === 'true' || 
      process.env.REACT_APP_ENHANCED_ANALYTICS === 'true';
    
    if (enableEnhancedAnalytics) {
      console.log('Enhanced analytics enabled');
      EnhancedAnalytics.init({ enabled: true });
    } else {
      console.log('Enhanced analytics disabled');
    }
    
    // Cleanup on unmount
    return () => {
      EnhancedAnalytics.cleanup();
    };
  }, []);
  
  return <>{children}</>;
};

export default EnhancedAnalyticsProvider;
