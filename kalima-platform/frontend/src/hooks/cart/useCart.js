import React from "react";
import useApiMutation from "../useApiMutation";
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";

export default function useCart() {
    const { mutate, loading, error } = useApiMutation();
    const { t } = useTranslation('cart');

    const getCart = async () => {
        try {
            let res = await mutate({
                method: "get",
                endpoint: "/cart"
            });
            if (res.success) {
                return res.data;
            }
            else {
                throw new Error(res?.message || "Failed to fetch cart");
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
            throw error;
        }
    }

    const addToCart = async (productId, quantity) => {
        try {
            const res = await mutate({
                method: "POST",
                endpoint: "/cart/items",
                data: { productId, quantity, required_fields: [] }
            });
            if (res.success) {
                toast.success(t("itemAddedToCart", "Item added to cart"));
                return res.data;
            }
            else {
                throw new Error(res?.message || "Failed to add item to cart");
            }
        } catch (error) {
            console.error("Failed to add item to cart:", error);
            throw error;
        }
    };

    const changeItemQuantity = async (itemId, quantity) => {
        try {
            const res = await mutate({
                method: "PATCH",
                endpoint: `/cart/items/${itemId}/quantity`,
                data: { quantity }
            });
            if (res.success) {
                return res.data;
            }
            else {
                throw new Error(res?.message || "Failed to change item quantity");
            }
        } catch (error) {
            console.error("Failed to change item quantity:", error);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            const res = await mutate({
                method: "DELETE",
                endpoint: "/cart"
            });
            if (res.success) {
                return res.data;
            }
            else {
                throw new Error(res?.message || "Failed to clear cart");
            }
        } catch (error) {
            console.error("Failed to clear cart:", error);
            throw error;
        }
    };

    const removeFromCart = async (itemId) => {
        return await mutate({
            method: "DELETE",
            endpoint: `/cart/items/${itemId}`
        });
    };

    const applyCoupon = async (itemId, couponCode) => {
        try {
            const res = await mutate({
                method: "POST",
                endpoint: `/cart/items/coupon`,
                data: { itemId, couponCode }
            });
            if (res.success) {
                return res.data;
            }else {                
                throw new Error(res?.message || "Failed to apply coupon");
            }
        } catch (error) {
            console.error("Failed to apply coupon:", error);
            throw error;
        }
    };

    const removeCoupon = async (itemId) => {
        try {
            const res = await mutate({
                method: "DELETE",
                endpoint: `/cart/items/${itemId}/coupon`
            });
            if (res.success) {
                return res.data;
            } else {
                throw new Error(res?.message || "Failed to remove coupon");
            }
        } catch (error) {
            console.error("Failed to remove coupon:", error);
            throw error;
        }
    };

    const updateCartItemRequiredFields = async (itemId, requiredFieldsData) => {
        try {
            const res = await mutate({
                method: "PATCH",
                endpoint: `/cart/items/required-fields`,
                data: {"cart_item_id": itemId, "required_fields": requiredFieldsData}
            });
            if (res.success) {
                toast.success(t("requiredFieldsUpdated", "Required fields updated"));
                return res.data;
            }
            else {
                throw new Error(res?.message || "Failed to update cart item required fields");
            }
        } catch (error) {
            console.error("Failed to update cart item required fields:", error);
            throw error;
        }
    };

    return {
        getCart,
        addToCart,
        changeItemQuantity,
        clearCart,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        updateCartItemRequiredFields,
        loading,
        error
    };
}

// hook used internally by the context provider; exported for convenience
export { useCart as useCartNetwork };
