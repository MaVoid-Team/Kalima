import { useState, useEffect, useCallback } from "react";
import axios from "@/api/axios";
import useApiMutation from "@/hooks/useApiMutation";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// Pure function extracting payload formatting
const separateRequiredFields = (itemFields) => {
  const imageUploads = [];
  const textPayloads = [];

  for (const [cartItemId, fieldsObj] of Object.entries(itemFields)) {
    const textFieldsArray = [];

    for (const [fieldDefId, value] of Object.entries(fieldsObj)) {
      if (value instanceof File) {
        const formData = new FormData();
        formData.append("cart_item_id", cartItemId);
        formData.append("required_field_definition_id", fieldDefId);
        formData.append("image", value);
        imageUploads.push(formData);
      } else if (value) {
        textFieldsArray.push({
          required_field_definition_id: Number(fieldDefId),
          value: value,
        });
      }
    }

    if (textFieldsArray.length > 0) {
      textPayloads.push({
        cart_item_id: Number(cartItemId),
        required_fields: textFieldsArray,
      });
    }
  }

  return { imageUploads, textPayloads };
};

export function useFastBuyCheckoutPage() {
  const { mutate, loading: isSubmitting } = useApiMutation();
  const navigate = useNavigate();
  const { t } = useTranslation('checkout');
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (active = true) => {
    try {
      const [previewRes, cartRes, paymentMethodsRes] = await Promise.all([
        axios.get("/cart/fast-buy/checkout/preview").catch(() => null),
        axios.get("/cart/fast-buy").catch(() => null),
        axios.get("/payment-methods").catch(() => null),
      ]);

      if (!active) return;

      const previewData = previewRes?.data?.data ?? {};
      const cartData = cartRes?.data?.data ?? {};
      const paymentMethodsData = paymentMethodsRes?.data?.data ?? [];

      setPreview({
        ...previewData,
        ...cartData,
        cart_items: cartData.cart_items || [],
        subtotal: cartData.subtotal ?? 0,
        total: cartData.total ?? 0,
        discount: cartData.discount ?? 0,
        paymentMethods: Array.isArray(paymentMethodsData)
          ? paymentMethodsData
          : [],
      });
    } catch (err) {
      if (active) setError(err);
    } finally {
      if (active) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchData(active);
    return () => {
      active = false;
    };
  }, [fetchData]);

  const submitItemFields = async (itemFields) => {
    const { imageUploads, textPayloads } = separateRequiredFields(itemFields);

    for (const formData of imageUploads) {
      await mutate({
        endpoint: "/cart/fast-buy/items/required-fields/image",
        method: "patch",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
        showToast: false,
      });
    }

    for (const textPayload of textPayloads) {
      await mutate({
        endpoint: "/cart/fast-buy/items/required-fields",
        method: "patch",
        data: textPayload,
        showToast: false,
      });
    }
  };

  const handleCheckout = async ({ checkoutData, itemFields }) => {
    try {
      const hasItemFields = itemFields && Object.keys(itemFields).length > 0;
      if (hasItemFields) {
        await submitItemFields(itemFields);
      }

      await mutate({
        endpoint: "/cart/fast-buy/checkout",
        method: "post",
        data: checkoutData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(t('fastBuy.checkoutSuccess', 'Checkout successful! Redirecting to market...'));
      navigate("/market", { replace: true });
    } catch {
      // Global error handler will trigger toasts
    }
  };

  const handleApplyCoupon = async (itemId, couponCode) => {
    try {
      await mutate({
        endpoint: "/cart/fast-buy/items/coupon",
        method: "post",
        data: { itemId, couponCode },
      });
      setIsLoading(true);
      await fetchData(true);
    } catch {
      // Handled by global error toaster
    }
  };

  return {
    state: {
      preview,
      isLoading,
      error,
      isSubmitting,
    },
    handleCheckout,
    handleApplyCoupon,
  };
}
