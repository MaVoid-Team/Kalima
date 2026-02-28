import React, { useState } from "react";
import {
  Minus,
  Plus,
  Lock,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import CartHeader from "@/components/cart/CartHeader";
import CartItemsTable from "@/components/cart/CartItemsTable";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import EmptyCartState from "@/components/cart/EmptyCartState";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { t, i18n } = useTranslation("cart");
  const navigate = useNavigate();
  const { cart, loading, error, updateQuantity, removeFromCart, applyCoupon, removeCoupon, updateCartItemRequiredFields, updateCartItemRequiredFieldsImage } = useCart();
  const [promoCode, setPromoCode] = useState("");

  const localize = (item, base) => {
    const langSuffix = i18n.language === "ar" ? "Ar" : "En";
    return (
      item[`${base}${langSuffix}`] ??
      item[base] ??
      item[`${base}En`] ??
      item[`${base}Ar`] ??
      ""
    );
  };

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
              updateQuantity={updateQuantity}
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
    </motion.div>
  );
}
