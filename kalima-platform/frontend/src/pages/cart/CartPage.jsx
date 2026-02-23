import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/loading-spinner';
import CartHeader from '@/components/cart/CartHeader';
import CartItemsTable from '@/components/cart/CartItemsTable';
import CartOrderSummary from '@/components/cart/CartOrderSummary';
import EmptyCartState from '@/components/cart/EmptyCartState';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { 
    cart,
    loading,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    updateCartItemRequiredFields,
  } = useCart();
  const navigator = useNavigate();
  
// Sample Cart Object Structure (for reference)
//         "id": 2,
//         "user_id": 1800,
//         "status": "active",
//         "subtotal": "500",
//         "discount": "100",
//         "total": "400",
//         "created_at": "2026-02-22T00:20:55.023Z",
//         "updated_at": null,
//         "deleted_at": null,
//         "cart_items": [
//             {
//                 "id": 17,
//                 "cart_id": 2,
//                 "product_id": 8,
//                 "quantity": 5,
//                 "price_at_add": "100",
//                 "final_price": "400",
//                 "discount": "100",
//                 "required_fields_filled": false,
//                 "created_at": "2026-02-22T23:37:02.831Z",
//                 "updated_at": null,
//                 "products": {
//                     "id": 8,
//                     "title": "Algebra Book",
//                     "description": "A comprehensive guide to algebra for students of all levels.",
//                     "price": "100",
//                     "price_after_discount": null,
//                     "type": "Book",
//                     "serial": null,
//                     "thumbnail_image": {
//                         "url": "/uploads/images/1771796681616-694fec0880ee.webp"
//                     }
//                 },
//                 "cart_item_required_fields": [],
//                 "coupons": {
//                     "code": "C056C7",
//                     "discount_amount": "0",
//                     "discount_percentage": 20
//                 }
//             }
//         ]
//     }
  

  // Empty Cart State
  if (!cart || cart.cart_items.length === 0) {
    return (
      <EmptyCartState onBrowseProducts={() => navigator('/market')} />
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-20 bg-white/70 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <CartHeader
          itemCount={cart?.cart_items?.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <CartItemsTable
              cartItems={cart?.cart_items}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
              updateCartItemRequiredFields={updateCartItemRequiredFields}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartOrderSummary
              subtotal={cart?.subtotal}
              discount={cart?.discount}
              total={cart?.total}
              isCartItemsRequiredFieldsFilled={cart?.cart_items?.every(item => item.required_fields_filled)}
            />
          </div>
          </div>
        </div>
    </motion.div>
    </div>
  );
}

