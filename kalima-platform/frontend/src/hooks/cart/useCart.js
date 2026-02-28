import React, { useCallback } from "react";
import useApiMutation from "../useApiMutation";
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";

export default function useCart() {
    const { mutate, loading, error } = useApiMutation();
    const { t } = useTranslation('cart');

    const getCart = useCallback(async () => {
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
    }, []);

    const addToCart = useCallback(async (productId, quantity) => {
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
    }, []);

    const changeItemQuantity = useCallback(async (itemId, quantity) => {
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
    }, []);

    const clearCart = useCallback(async () => {
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
    }, []);

    const removeFromCart = useCallback(async (itemId) => {
        return await mutate({
            method: "DELETE",
            endpoint: `/cart/items/${itemId}`
        });
    }, []);

    const applyCoupon = useCallback(async (itemId, couponCode) => {
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
    }, []);

    const removeCoupon = useCallback(async (itemId) => {
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
    }, []);

    const updateCartItemRequiredFields = useCallback(async (itemId, requiredFieldsData) => {
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
    }, []);

    const updateCartItemRequiredFieldsImage = useCallback(async (itemId, reqFieldDefId, file) => {
        try {
            const formData = new FormData();
            formData.append("cart_item_id", itemId);
            formData.append("required_field_definition_id", reqFieldDefId);
            formData.append("image", file);

            const res = await mutate({
                method: "PATCH",
                endpoint: `/cart/items/required-fields/image`,
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            if (res.success) {
                toast.success(t("requiredFieldsImageUpdated", "Required fields image updated"));
                return res.data;
            }
            else {
                throw new Error(res?.message || "Failed to update cart item required fields image");
            }
        } catch (error) {
            console.error("Failed to update cart item required fields image:", error);
            throw error;
        }
    }, []);

    const checkout = useCallback(async (checkoutData) => {
        try {
            const res = await mutate({
                method: "POST",
                endpoint: `/cart/checkout`,
                data: checkoutData
            });
            if (res.success) {
                toast.success(t("checkoutSuccess", "Checkout successful"));
                return res.data;
            } else {
                throw new Error(res?.message || "Failed to checkout");
            }
        } catch (error) {
            console.error("Failed to checkout:", error);
            throw error;
        }
    }, []);

    const getPaymentMethods = useCallback(async () => {
        try {
            const res = await mutate({
                method: "GET",
                endpoint: `/payment-methods`
            });
            if (res.success) {
                const payload = res.data;
                if (Array.isArray(payload)) return payload;
                if (Array.isArray(payload?.data)) return payload.data;
                if (Array.isArray(payload?.payment_methods)) return payload.payment_methods;
                if (Array.isArray(payload?.methods)) return payload.methods;
                return [];
            } else {
                throw new Error(res?.message || "Failed to get payment methods");
            }
        } catch (error) {
            console.error("Failed to get payment methods:", error);
            throw error;
        }
    }, []);

    return {
        getCart,
        addToCart,
        changeItemQuantity,
        clearCart,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        updateCartItemRequiredFields,
        updateCartItemRequiredFieldsImage,
        checkout,
        getPaymentMethods,
        loading,
        error
    };
}

// hook used internally by the context provider; exported for convenience
export { useCart as useCartNetwork };
