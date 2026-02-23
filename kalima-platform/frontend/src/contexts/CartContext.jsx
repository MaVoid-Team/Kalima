import React, { createContext, useContext, useState, useEffect } from 'react';
import useCartNetwork from '../hooks/cart/useCart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // this hook is only responsible for performing API calls; the provider
  // wraps its results with state and caching.
  const {
    getCart,
    addToCart,
    changeItemQuantity,
    clearCart,
    removeFromCart: removeItemNetwork,
    applyCoupon: applyCouponNetwork,
    removeCoupon: removeCouponNetwork,
    getProductRequiredFields,
    updateCartItemRequiredFields: updateCartItemRequiredFieldsNetwork,
    loading,
    error,
  } = useCartNetwork();

  const [cart, setCart] = useState({ cart_items: [], subtotal: 0, discount: 0, total: 0 });

  const loadCart = async () => {
    try {
      const c = await getCart();
      setCart(c);
    } catch (e) {
      console.error('failed to load cart', e);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

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

  const value = {
    cart,
    loading,
    error,
    loadCart,
    addToCart,
    updateQuantity,
    clearCart,
    removeFromCart: removeItem,
    applyCoupon,
    removeCoupon,
    getProductRequiredFields,
    updateCartItemRequiredFields,
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
