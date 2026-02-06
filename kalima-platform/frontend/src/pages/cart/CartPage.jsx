import React, { useState } from 'react';
import { Minus, Plus, Lock, MessageCircle, ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export default function CartPage() {
  const { t, i18n } = useTranslation('cart');
  const location = useLocation();
  const { cartItems } = location.state || { cartItems: [] }; // Get cart items from location state or default to empty array

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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="py-8 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">😕</span>
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {t('empty')}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {t('emptyHint')}
              </p>

              <button className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                {i18n.language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                {t('browseProducts')}
              </button>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">{t('popularCategories')}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[t('categories.textbooks'), t('categories.schoolSupplies'), t('categories.studyGuides'), t('categories.digitalResources')].map((category, idx) => (
                    <button
                      key={idx}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <button className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium">
              {i18n.language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {t('continueShopping')}
            </button>
          </div>
          <p className="text-gray-600 text-sm">{t('itemsInCart', { count: cartItems.length })}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200">
                <div className="col-span-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('header.product')}</div>
                <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center hidden md:block">{t('header.quantity')}</div>
                <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right hidden md:block">{t('header.total')}</div>
              </div>

              {/* Cart Items */}
              <div className="divide-y divide-gray-200">
                {cartItems.map((item, idx) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, duration: 0.35 }} className="grid grid-cols-12 gap-4 px-6 py-6 items-center">
                    {/* Product Info */}
                    <div className="col-span-12 md:col-span-6 flex gap-4">
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img src={item.image} alt={localize(item, 'name')} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{localize(item, 'name')}</h3>
                        <p className="text-xs text-gray-600 mb-2">{localize(item, 'description')}</p>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-500">{localize(item, 'type')}</span>
                          <span className={`text-xs font-medium flex items-center gap-1 ${item.stockLow ? 'text-red-600' : 'text-green-600'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {localize(item, 'stock')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-12 md:col-span-3 order-3 md:order-2 flex items-center md:justify-center">
                      <div className="flex items-center justify-between md:justify-center gap-3 border border-gray-300 rounded-lg px-3 py-2 w-full md:w-auto">
                        <button aria-label={t('decreaseQuantity')} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 md:p-0"><Minus className="w-4 h-4" /></button>
                        <span className="text-sm font-medium text-gray-900 w-6 text-center">{item.quantity}</span>
                        <button aria-label={t('increaseQuantity')} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 md:p-0"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-12 md:col-span-3 order-2 md:order-3">
                      <div className="flex items-center justify-between md:block">
                        <div className="text-lg font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                        <div className="text-xs text-gray-500 md:text-right">{t('each', { price: `$${item.price.toFixed(2)}` })}</div>
                      </div>
                    </div>
                  </motion.div>))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-20">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('orderSummary')}</h2>

                {/* Summary Items */}
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('subtotal')}</span>
                    <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('shippingEstimate')}</span>
                    <span className="text-xs text-gray-500">{shippingEstimate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('taxEstimate')}</span>
                    <span className="font-semibold text-gray-900">${taxEstimate.toFixed(2)}</span>
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-4 border-t border-b border-gray-200 mb-6">
                    <span className="text-base font-bold text-gray-900">{t('total')}</span>
                    <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('promoLabel')}</label>
                    <div className="flex gap-2">
                    <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder={t('promoPlaceholder')} className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition-colors">{t('apply')}</button>
                    </div>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4">{t('proceedToCheckout')}<span>
                                  {i18n.language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}

                    </span></button>

                {/* Security Message */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500"><Lock className="w-3 h-3" /> <span>{t('secureCheckout')}</span></div>
                </div>

                {/* Need Help */}
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0"><MessageCircle className="w-5 h-5 text-red-600" /></div>
                    <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{t('needHelp')}</h3>
                    <p className="text-xs text-gray-600 mb-3">{t('needHelpText')}</p>
                    <button className="text-xs font-semibold text-red-600 hover:text-red-700">{t('chatWithUs')}</button>
                    </div>
                </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

