import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import CartHeader from '@/components/cart/CartHeader';
import CartItemsTable from '@/components/cart/CartItemsTable';
import CartOrderSummary from '@/components/cart/CartOrderSummary';
import EmptyCartState from '@/components/cart/EmptyCartState';
import useCart from '../../hooks/cart/useCart';

export default function CartPage() {
  const { getCart, changeItemQuantity, removeFromCart, applyCoupon, removeCoupon, getProductThumbnail, loading } = useCart();
  const [cart, setCart] = useState({ cart_items: [], subtotal: 0, discount: 0, total: 0 });
  const [thumbnails, setThumbnails] = useState({});
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // cart data structure example:
//     id: 1,
//     user_id: 1801,
//     status: 'active',
//     subtotal: '0',
//     discount: '0',
//     total: '0',
//     created_at: '2026-02-21T21:59:13.586Z',
//     updated_at: null,
//     deleted_at: null,
//     cart_items: [
//       {
//         id: 1,
//         cart_id: 1,
//         product_id: 8,
//         coupon_id: null,
//         quantity: 2,
//         price_at_add: '100',
//         final_price: '100',
//         discount: '0',
//         required_fields_filled: false,
//         created_at: '2026-02-21T21:59:14.120Z',
//         updated_at: null,
//         deleted_at: null,
//         products: {
//           id: 8,
//           title: 'Algebra Book',
//           description: 'A comprehensive guide to algebra for students of all levels.',
//           type: 'Book',
//           price: '100',
//           price_after_discount: null,
//           serial: null,
//           thumbnail_id: null,
//           sample_url: null,
//           coupon_id: null,
//           is_archived: false,
//           mongo_id: null,
//           created_at: '2026-02-20T15:53:06.816Z',
//           updated_at: null,
//           deleted_at: null,
//         },
//         cart_item_required_fields: [],
//       },
//     ],
  
  useEffect(() =>{
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    // optimistic local update
    setCart(prev => {
      const updatedItems = prev.cart_items.map(i =>
        i.id === id ? { ...i, quantity: newQuantity } : i
      );
      return { ...prev, cart_items: updatedItems };
    });

    changeItemQuantity(id, newQuantity)
      .then(() => loadCart())
      .catch((error) => {
        console.error("Failed to update quantity:", error);
        // rollback by reloading
        loadCart();
      });
  };

  const onRemoveFromCart = (itemId) => {
    removeFromCart(itemId)
      .then(() => loadCart())
      .catch((error) => console.error("Failed to remove item from cart:", error));
  };

  const onApplyCoupon = (itemId, couponCode) => {
    applyCoupon(itemId, couponCode)
      .then(() => loadCart())
      .catch((error) => console.error("Failed to apply coupon:", error));
  };

  const onRemoveCoupon = (itemId) => {
    removeCoupon(itemId)
      .then(() => loadCart())
      .catch((error) => console.error("Failed to remove coupon:", error));
  };

  
  // now expects an ID directly
  const onGetProductThumbnail = useCallback(async (productId) => {
    if (productId == null) return "https://via.placeholder.com/150";
    try {
      const thumbnailUrl = await getProductThumbnail(productId);
      return baseURL.split('api/v2')[0] + thumbnailUrl?.url;
    } catch (error) {
      console.error("Failed to get product thumbnail:", error);
      return "https://via.placeholder.com/150"; // fallback thumbnail
    }
  }, [getProductThumbnail]);
  // cache thumbnails once per cart item
  useEffect(() => {
    cart.cart_items.forEach((item) => {
      const pid = item?.products?.id;
      if (pid && !thumbnails[pid]) {
        onGetProductThumbnail(pid)
          .then(url => {
            setThumbnails(prev => ({ ...prev, [pid]: url || 'https://via.placeholder.com/150' }));
          })
          .catch(() => {});
      }
    });
  }, [cart.cart_items, onGetProductThumbnail, thumbnails]);

  // Empty Cart State
  if (cart.cart_items.length === 0) {
    return (
      <EmptyCartState onBrowseProducts={(e) => e.preventDefault()} />
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-20 bg-white/70 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <CartHeader
          itemCount={cart?.cart_items?.length}
          onContinueShopping={(e) => e.preventDefault()}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <CartItemsTable
              cartItems={cart?.cart_items}
              updateQuantity={updateQuantity}
              removeFromCart={onRemoveFromCart}
              applyCoupon={onApplyCoupon}
              removeCoupon={onRemoveCoupon}
              thumbnails={thumbnails}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartOrderSummary
              subtotal={cart?.subtotal}
              discount={cart?.discount}
              total={cart?.total}
            />
          </div>
          </div>
        </div>
    </motion.div>
    </div>
  );
}

