import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import CartHeader from '@/components/cart/CartHeader';
import CartItemsTable from '@/components/cart/CartItemsTable';
import CartOrderSummary from '@/components/cart/CartOrderSummary';
import EmptyCartState from '@/components/cart/EmptyCartState';

export default function CartPage() {
  const { t, i18n } = useTranslation('cart');
  const location = useLocation();
  const { cart } = location.state || { cart: [] }; // Get cart items from location state or default to empty array
  const [cartItems, setCartItems] = useState(cart);
  const [promoCode, setPromoCode] = useState('');

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item)));
  };

  const localize = (item, base) => {
    const langSuffix = i18n.language === 'ar' ? 'Ar' : 'En';
    return item[`${base}${langSuffix}`] ?? item[base] ?? item[`${base}En`] ?? item[`${base}Ar`] ?? '';
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingEstimate = t('shipping_calculated_next');
  const taxEstimate = 15.2;
  const total = subtotal + taxEstimate;

  // Empty Cart State
  if (cartItems.length === 0) {
    return (
      <EmptyCartState onBrowseProducts={(e) => e.preventDefault()} />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <CartHeader
          itemCount={cartItems.length}
          onContinueShopping={(e) => e.preventDefault()}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <CartItemsTable
              cartItems={cartItems}
              localize={localize}
              updateQuantity={updateQuantity}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartOrderSummary
              subtotal={subtotal}
              shippingEstimate={shippingEstimate}
              taxEstimate={taxEstimate}
              total={total}
              promoCode={promoCode}
              onPromoCodeChange={setPromoCode}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

