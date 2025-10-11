import React, { useState, useEffect } from 'react';

export function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // Start exit animation before removing
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, 300); // Match transition duration
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer);
    };
  }, [duration, onClose]);

  if (!isVisible && !isExiting) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-success text-text-inverse border-success';
      case 'error':
        return 'bg-danger text-text-inverse border-danger';
      case 'warning':
        return 'bg-warning text-text-inverse border-warning';
      case 'info':
        return 'bg-brand text-text-inverse border-brand';
      default:
        return 'bg-elev2 text-text-primary border-line-strong';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return React.createElement('div', {
    className: `fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 transform ${
      isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${getTypeStyles()}`,
    style: {
      minWidth: '300px',
      maxWidth: '400px'
    }
  },
    React.createElement('span', {
      className: 'text-lg font-semibold'
    }, getIcon()),
    React.createElement('span', {
      className: 'flex-1 font-medium'
    }, message),
    React.createElement('button', {
      onClick: () => {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose && onClose();
        }, 300);
      },
      className: 'ml-2 text-lg hover:opacity-70 transition-opacity',
      'aria-label': 'Close notification'
    }, '×')
  );
}

// Toast manager to handle multiple toasts
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleAddToCart = (event) => {
      const product = event.detail;
      const toastId = Date.now();
      
      // Create appropriate message based on product details
      let message = `${product.name} added to cart!`;
      if (product.includeBattery) {
        message = `${product.name} added to cart with battery!`;
      }
      
      const newToast = {
        id: toastId,
        message,
        type: 'success'
      };
      
      setToasts(prev => [...prev, newToast]);
    };

    const handleCartError = (event) => {
      const toastId = Date.now();
      
      const newToast = {
        id: toastId,
        message: event.detail?.message || 'Something went wrong!',
        type: 'error'
      };
      
      setToasts(prev => [...prev, newToast]);
    };

    window.addEventListener('addToCart', handleAddToCart);
    window.addEventListener('cartError', handleCartError);
    
    return () => {
      window.removeEventListener('addToCart', handleAddToCart);
      window.removeEventListener('cartError', handleCartError);
    };
  }, []);

  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  return React.createElement('div', {
    className: 'fixed top-20 right-4 z-50 space-y-2'
  },
    toasts.map((toast, index) =>
      React.createElement(Toast, {
        key: toast.id,
        message: toast.message,
        type: toast.type,
        duration: 3000,
        onClose: () => removeToast(toast.id),
        style: {
          transform: `translateY(${index * 60}px)`
        }
      })
    )
  );
}