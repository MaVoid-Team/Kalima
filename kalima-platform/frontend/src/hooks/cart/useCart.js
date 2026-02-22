import React from "react";
import useApiMutation from "../useApiMutation";

export default function useCart() {
    const { mutate, loading, error } = useApiMutation();

    const getCart = async () => {
        try {
            let res = await mutate({
                method: "get",
                endpoint: "/cart"
            });
            console.log("Cart response:", res);
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
                data: { productId, quantity }
            });
            if (res.success) {
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

    const getProductThumbnail = React.useCallback(async(product_id) => {
    try {
            const res = await mutate({
                method: "GET",
                endpoint: `/products/${product_id}/thumbnail`
            });
            if (res.success) {
                return res.data;
            } else {
                throw new Error(res?.message || "Failed to get product thumbnail");
            }
        } catch (error) {
            console.error("Failed to get product thumbnail:", error);
            throw error;
        }
    }, [mutate]);

    return {
        getCart,
        addToCart,
        changeItemQuantity,
        clearCart,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        getProductThumbnail,
        loading,
        error
    };
}