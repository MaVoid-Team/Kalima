import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CartHeader from "@/components/cart/CartHeader";
import CartItemsTable from "@/components/cart/CartItemsTable";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import EmptyCartState from "@/components/cart/EmptyCartState";
import { useCart } from "@/contexts/CartContext";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function CartPage() {
  const navigate = useNavigate();
   const { cart, loading, removeFromCart, applyCoupon, removeCoupon, updateCartItemRequiredFields, updateCartItemRequiredFieldsImage } = useCart();
  const [promoCode, setPromoCode] = useState("");


  // Use cart data from context
  const cartItems = cart?.cart_items || [];
  const subtotal = cart?.subtotal || 0;
  const discount = cart?.discount || 0;
  const total = cart?.total || 0;

  // Empty Cart State
  if (!loading && cartItems.length === 0) {
    return <EmptyCartState onBrowseProducts={() => navigate('/market')} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="min-h-screen bg-muted/50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <CartHeader
          itemCount={cartItems.length}
          onContinueShopping={() => navigate('/market')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <CartItemsTable
              cartItems={cartItems}
              removeFromCart={removeFromCart}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
              updateCartItemRequiredFields={updateCartItemRequiredFields}
              updateCartItemRequiredFieldsImage={updateCartItemRequiredFieldsImage}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartOrderSummary
              subtotal={subtotal}
              discount={discount}
              total={total}
              promoCode={promoCode}
              onPromoCodeChange={setPromoCode}
              onCheckout={() => navigate("/checkout")}
            />
          </div>
        </div>
      </div>
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10" data-testid="cart-page-loading-overlay">
          <LoadingSpinner className="w-8 h-8" />
        </div>
      )}
    </motion.div>
  );
}
