import React, { createContext, useContext, useState, useEffect } from 'react';
import { notifications } from '../components/FloatingNotifications';
import getApiUrl from '../utils/api.js';
import { useAuth } from '@clerk/clerk-react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { getToken } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [lastValidated, setLastValidated] = useState(null);

  // Validate cart against server
  const validateCart = async (showToast = true) => {
    if (cartItems.length === 0) {
      setValidationErrors([]);
      return { valid: true, items: [] };
    }
    
    try {
      // Get authentication token
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required for cart validation');
      }
      
      const response = await fetch(getApiUrl('/api/cart/validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cartItems: cartItems }) // Fix: use cartItems, not items
      });
      
      if (!response.ok) {
        throw new Error('Validation failed');
      }
      
      const validation = await response.json();
      setValidationErrors(validation.items.filter(item => !item.valid));
      setLastValidated(Date.now());
      
      // Handle invalid items
      if (!validation.valid) {
        const itemsToRemove = [];
        const itemsToUpdate = [];
        
        validation.items.forEach(item => {
          if (!item.valid) {
            if (item.action === 'remove') {
              itemsToRemove.push(item.productId);
            } else if (item.action === 'update_price') {
              itemsToUpdate.push({
                id: item.productId,
                newPrice: item.newPrice,
                oldPrice: item.oldPrice
              });
            }
          }
        });
        
        // Remove discontinued items
        if (itemsToRemove.length > 0) {
          setCartItems(prev => prev.filter(item => !itemsToRemove.includes(item.id)));
          
          if (showToast) {
            // Trigger notification
            notifications.cartUpdate(
              `${itemsToRemove.length} item(s) removed from cart (no longer available)`,
              [{ label: 'Continue Shopping', type: 'navigate', url: '/products' }]
            );
          }
        }
        
        // Update prices
        if (itemsToUpdate.length > 0) {
          setCartItems(prev => prev.map(item => {
            const priceUpdate = itemsToUpdate.find(update => update.id === item.id);
            if (priceUpdate) {
              return { ...item, price: priceUpdate.newPrice };
            }
            return item;
          }));
          
          if (showToast) {
            notifications.cartUpdate(
              `${itemsToUpdate.length} item(s) price updated`,
              [{ label: 'Review Cart', type: 'navigate', url: '/cart' }]
            );
          }
        }
      }
      
      return validation;
    } catch (error) {
      console.error('Cart validation error:', error);
      if (showToast) {
        notifications.error(
          'Failed to validate cart. Please refresh the page.',
          { actions: [{ label: 'Refresh', callback: () => window.location.reload(), primary: true }] }
        );
      }
      return { valid: false, error: error.message };
    }
  };

  // Check stock for a specific product
  const checkStock = async (productId) => {
    try {
      const response = await fetch(getApiUrl(`/api/products/${productId}/stock`));
      if (!response.ok) {
        throw new Error('Failed to check stock');
      }
      return await response.json();
    } catch (error) {
      console.error('Stock check error:', error);
      return { available: false, error: error.message };
    }
  };

  // Load cart from localStorage on mount and validate
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const cartTimestamp = localStorage.getItem('cartTimestamp');
    
    if (savedCart && cartTimestamp) {
      const now = Date.now();
      const savedTime = parseInt(cartTimestamp);
      const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      
      // Check if cart is older than 7 days
      if (now - savedTime > sevenDays) {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTimestamp');
        return; // Start with empty cart
      }
      
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        
        // Validate cart after loading (don't show toast on initial load)
        setTimeout(() => validateCart(false), 1000);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTimestamp');
      }
    }
  }, []);

  // Set up event listener for adding to cart
  useEffect(() => {
    const handleAddToCartEvent = (event) => {
      const product = event.detail;
      console.log('Cart event received:', product); // Debug log
      
      setCartItems(prevItems => {
        // Create a unique key for cart items including configuration options
        const getCartItemKey = (item) => {
          return `${item.id}_${item.includeBattery || false}_${item.batteryPrice || 0}`;
        };

        const newProductKey = getCartItemKey(product);
        const existingItem = prevItems.find(item => getCartItemKey(item) === newProductKey);
        
        let updatedItems;
        if (existingItem) {
          // Update quantity if item with same configuration already exists
          updatedItems = prevItems.map(item =>
            getCartItemKey(item) === newProductKey
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Add new item with unique configuration
          updatedItems = [...prevItems, { 
            ...product, 
            quantity: 1, 
            addedAt: Date.now(),
            cartItemKey: newProductKey
          }];
        }
        
        // Trigger notification after state update
        setTimeout(() => {
          console.log('Triggering cart notification for:', product.name); // Debug log
          notifications.cartUpdate(`${product.name} added to cart`, [
            { label: 'View Cart', type: 'navigate', url: '/cart', primary: true },
            { label: 'Continue Shopping', type: 'navigate', url: '/products' }
          ]);
        }, 100);
        
        return updatedItems;
      });
    };

    window.addEventListener('addToCart', handleAddToCartEvent);
    
    return () => {
      window.removeEventListener('addToCart', handleAddToCartEvent);
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      localStorage.setItem('cartTimestamp', Date.now().toString());
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('cartTimestamp');
    }
  }, [cartItems]);

  // Add item to cart with stock validation
  const addToCart = async (product) => {
    try {
      // Check stock before adding
      const stockInfo = await checkStock(product.id);
      
      if (!stockInfo.available) {
        notifications.warning(`${product.name} is currently out of stock`, {
          actions: [{ label: 'View Alternatives', type: 'navigate', url: '/products' }]
        });
        return false;
      }
      
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          return prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Add new item
          return [...prevItems, { ...product, quantity: 1, addedAt: Date.now() }];
        }
      });
      
      notifications.cartUpdate(`${product.name} added to cart`, [
        { label: 'View Cart', type: 'navigate', url: '/cart', primary: true },
        { label: 'Continue Shopping', type: 'navigate', url: '/products' }
      ]);
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      notifications.error('Failed to add item to cart. Please try again.', {
        actions: [{ label: 'Retry', callback: () => addToCart(product), primary: true }]
      });
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    localStorage.removeItem('cartTimestamp');
  };

  // Clear cart after successful payment completion
  const clearCartAfterPayment = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    localStorage.removeItem('cartTimestamp');
    localStorage.removeItem('checkoutSessionId');
    localStorage.removeItem('checkoutTimestamp');
  };

  // Check if user has an incomplete checkout session
  const hasIncompleteCheckout = () => {
    const sessionId = localStorage.getItem('checkoutSessionId');
    const timestamp = localStorage.getItem('checkoutTimestamp');
    
    if (!sessionId || !timestamp) return false;
    
    // Consider checkout incomplete if it's less than 1 hour old
    const oneHour = 60 * 60 * 1000;
    const isRecent = (Date.now() - parseInt(timestamp)) < oneHour;
    
    return isRecent;
  };

  // Get cart totals
  const getCartTotals = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + (parseFloat(item.price) * item.quantity), 
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
    };
  };

  // Merge guest cart with user cart on login
  const mergeGuestCart = async (userToken) => {
    if (cartItems.length === 0) return;
    
    setLoading(true);
    try {
      // Send guest cart to backend for merging
      const response = await fetch(getApiUrl('/api/cart/merge'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ guestCartItems: cartItems })
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.mergedCart || cartItems);
      }
    } catch (error) {
      console.error('Error merging cart:', error);
      // Keep local cart if merge fails
    } finally {
      setLoading(false);
    }
  };

  // Create checkout session for all cart items
  const createCheckoutSession = async () => {
    if (cartItems.length === 0) return null;
    
    setLoading(true);
    try {
      // Validate cart before checkout
      const validation = await validateCart(true);
      if (!validation.valid && validation.error) {
        throw new Error('Cart validation failed. Please review your items.');
      }
      
      // Re-check if cart is empty after validation
      if (cartItems.length === 0) {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'warning',
            message: 'Your cart is empty'
          }
        }));
        return null;
      }
      const token = await getToken();
      
      // Try authenticated checkout first if we have a token
      if (token) {
        try {
          const response = await fetch(getApiUrl('/api/cart/checkout'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cartItems, isGuest: false })
          });

          const data = await response.json();
          
          if (data.sessionId) {
            // Clear cart after successful checkout session creation
            clearCart();
            return data;
          } else if (response.status === 401) {
            // Token invalid/expired, fall back to guest checkout
            console.log('Token invalid, falling back to guest checkout');
            localStorage.removeItem('token'); // Clear invalid token
          } else {
            throw new Error(data.error || 'Failed to create checkout session');
          }
        } catch (authError) {
          console.log('Authenticated checkout failed, trying guest checkout:', authError.message);
        }
      }

      // Guest checkout (fallback or primary)
      const response = await fetch(getApiUrl('/api/cart/checkout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cartItems, isGuest: true })
      });

      const data = await response.json();
      
      if (data.sessionId) {
        // Store checkout session ID with cart for recovery, but don't clear cart yet
        // Cart will be cleared only when payment is actually completed
        localStorage.setItem('checkoutSessionId', data.sessionId);
        localStorage.setItem('checkoutTimestamp', Date.now().toString());
        
        return data;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    cartItems,
    loading,
    validationErrors,
    lastValidated,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearCartAfterPayment,
    hasIncompleteCheckout,
    getCartTotals,
    mergeGuestCart,
    createCheckoutSession,
    validateCart,
    checkStock
  };

  return React.createElement(CartContext.Provider, { value: contextValue }, children);
};