import React, { createContext, useContext, useState, useEffect } from 'react';
import useCartNetwork from '../hooks/cart/useCart';
import useAuth from '../hooks/auth/useAuth';
import useRole from '../hooks/useRole';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { hasAdminAccess } = useRole();
  // this hook is only responsible for performing API calls; the provider
  // wraps its results with state and caching.
  const {
    getCart,
    addToCart,
    changeItemQuantity,
    clearCart: clearCartNetwork,
    getPaymentMethods,
    checkout: checkoutNetwork,
    removeFromCart: removeItemNetwork,
    applyCoupon: applyCouponNetwork,
    removeCoupon: removeCouponNetwork,
    updateCartItemRequiredFields: updateCartItemRequiredFieldsNetwork,
    updateCartItemRequiredFieldsImage: updateCartItemRequiredFieldsImageNetwork,
    loading,
    error,
  } = useCartNetwork();

  const EMPTY_CART = { cart_items: [], subtotal: 0, discount: 0, total: 0 };
  const [cart, setCart] = useState(EMPTY_CART);

  const normalizeCart = (raw) => {
    if (!raw) return EMPTY_CART;
    if (Array.isArray(raw.cart_items)) return { ...EMPTY_CART, ...raw };
    if (raw.data && Array.isArray(raw.data.cart_items)) return { ...EMPTY_CART, ...raw.data };
    if (raw.cart && Array.isArray(raw.cart.cart_items)) return { ...EMPTY_CART, ...raw.cart };
    if (Array.isArray(raw.items)) {
      return {
        ...EMPTY_CART,
        cart_items: raw.items,
        subtotal: raw.subtotal ?? 0,
        discount: raw.discount ?? 0,
        total: raw.total ?? 0,
      };
    }
    for (const key of Object.keys(raw)) {
      const nested = raw[key];
      if (nested && typeof nested === 'object' && Array.isArray(nested.cart_items)) {
        return { ...EMPTY_CART, ...nested };
      }
    }
    return EMPTY_CART;
  };

  const loadCart = async () => {
    try {
      const c = await getCart();
      setCart(normalizeCart(c));
    } catch (e) {
      console.error('failed to load cart', e);
      // Important: if backend returns 404/empty after checkout, context must still refresh to empty cart
      setCart(EMPTY_CART);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !hasAdminAccess) {
      loadCart();
    } else {
      setCart(EMPTY_CART);
    }
  }, [isAuthenticated, hasAdminAccess]);

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await changeItemQuantity(itemId, quantity);
      await loadCart();
    } catch (e) {
      console.error('failed update quantity', e);
      loadCart();
    }
  };

  const removeItem = async id => {
    try {
      await removeItemNetwork(id);
      await loadCart();
    } catch (e) {
      console.error('failed remove item', e);
      loadCart();
    }
  };

  const addProductToCart = async (productId, quantity) => {
    await addToCart(productId, quantity);
    await loadCart();
  };

  const applyCoupon = async (itemId, code) => {
    await applyCouponNetwork(itemId, code);
    await loadCart();
  };

  const removeCoupon = async itemId => {
    await removeCouponNetwork(itemId);
    await loadCart();
  };

  const updateCartItemRequiredFields = async (itemId, data) => {
    await updateCartItemRequiredFieldsNetwork(itemId, data);
    await loadCart();
  };

  const clearCart = async () => {
    await clearCartNetwork();
    await loadCart();
  }

  const updateCartItemRequiredFieldsImage = async (itemId, reqFieldDefId, imageData) => {
    await updateCartItemRequiredFieldsImageNetwork(itemId, reqFieldDefId, imageData);
    await loadCart();
  }

  const checkout = async (formData) => {
    const result = await checkoutNetwork(formData);
    // optimistic clear so UI updates immediately even if /cart response is delayed
    setCart(EMPTY_CART);
    await loadCart();
    return result;
  };

  const value = {
    cart,
    loading,
    error,
    loadCart,
    addToCart: addProductToCart,
    updateQuantity,
    clearCart,
    removeFromCart: removeItem,
    applyCoupon,
    removeCoupon,
    updateCartItemRequiredFields,
    updateCartItemRequiredFieldsImage,
    checkout,
    getPaymentMethods,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
