import React, { useEffect } from 'react';
import CartHeader from '@/components/cart/CartHeader';
import CartItemsTable from '@/components/cart/CartItemsTable';
import CartOrderSummary from '@/components/cart/CartOrderSummary';
import { useCart } from '@/contexts/CartContext';

export default function CartStep({ onProceed }) {
    const {
        cart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        updateCartItemRequiredFields,
        updateCartItemRequiredFieldsImage
    } = useCart();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="w-full">
            {/* Header */}
            <CartHeader itemCount={cart?.cart_items?.length} />

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
                        updateCartItemRequiredFieldsImage={updateCartItemRequiredFieldsImage}
                    />
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <CartOrderSummary
                        subtotal={cart?.subtotal}
                        discount={cart?.discount}
                        total={cart?.total}
                        isCartItemsRequiredFieldsFilled={cart?.cart_items?.every(item => item.required_fields_filled)}
                        onProceed={onProceed}
                    />
                </div>
            </div>
        </div>
    );
}
