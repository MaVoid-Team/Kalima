import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import axios from "@/api/axios";
import useApiMutation from "@/hooks/useApiMutation";
import { getImageUrl } from "@/lib/storeUtils";

const separateRequiredFields = (itemFields) => {
  const imageUploads = [];
  const textPayloads = [];

  for (const [cartItemId, fieldsObj] of Object.entries(itemFields || {})) {
    const textFieldsArray = [];

    for (const [fieldDefId, value] of Object.entries(fieldsObj || {})) {
      if (value instanceof File) {
        const formData = new FormData();
        formData.append("cart_item_id", cartItemId);
        formData.append("required_field_definition_id", fieldDefId);
        formData.append("image", value);
        imageUploads.push(formData);
      } else if (value) {
        textFieldsArray.push({
          required_field_definition_id: Number(fieldDefId),
          value,
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

const isAllFieldsFilled = (missingItems, answers) =>
  missingItems.every((item) =>
    item.missing_fields.every((field) => !!(answers[item.cart_item_id] || {})[field.id]),
  );

const formatCartItems = (items = []) =>
  items.map(({ id, products = {}, final_price, quantity = 1 }) => ({
    id,
    name: products.title || "",
    price: parseFloat(final_price || 0) / quantity,
    image: getImageUrl(products.images?.[0]?.url || products.thumbnail_image?.url || ""),
    type: products.type || "",
    description: products.description || "",
    quantity,
  }));

export function useFastBuy({ checkout = false } = {}) {
  const { mutate, loading } = useApiMutation();
  const navigate = useNavigate();
  const { t } = useTranslation("checkout");

  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(checkout);
  const [error, setError] = useState(null);
  const [itemFields, setItemFields] = useState({});
  const [formData, setFormData] = useState({
    paymentMethodId: "",
    numberTransferredFrom: "",
    paymentScreenshot: null,
    notes: "",
  });

  const fetchCheckoutData = useCallback(async () => {
    if (!checkout) return;
    setIsLoading(true);

    try {
      const [previewRes, cartRes, paymentMethodsRes] = await Promise.all([
        axios.get("/cart/fast-buy/checkout/preview").catch(() => null),
        axios.get("/cart/fast-buy").catch(() => null),
        axios.get("/payment-methods").catch(() => null),
      ]);

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
        paymentMethods: Array.isArray(paymentMethodsData) ? paymentMethodsData : [],
      });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [checkout]);

  useEffect(() => {
    fetchCheckoutData();
  }, [fetchCheckoutData]);

  useEffect(() => {
    const defaultMethodId = preview?.paymentMethods?.[0]?.id;
    if (defaultMethodId && !formData.paymentMethodId) {
      setFormData((prev) => ({ ...prev, paymentMethodId: defaultMethodId }));
    }
  }, [preview?.paymentMethods, formData.paymentMethodId]);

  const computed = useMemo(() => {
    const commonFields = preview?.requiredFields?.common || [];
    const itemsMissingFields = preview?.requiredFields?.itemsMissingFields || [];

    const needsScreenshot = commonFields.some((f) => f.toLowerCase() === "paymentscreenshot");
    const needsTransferNumber = commonFields.includes("numberTransferredFrom");
    const missingTransNum = needsTransferNumber && !formData.numberTransferredFrom;
    const missingScreenshot = needsScreenshot && !formData.paymentScreenshot;

    return {
      items: formatCartItems(preview?.cart_items),
      subtotal: parseFloat(preview?.subtotal || 0),
      total: parseFloat(preview?.total || 0),
      discount: parseFloat(preview?.discount || 0),
      needsScreenshot,
      needsTransferNumber,
      itemsMissingFields,
      screenshotName: formData.paymentScreenshot?.name || "",
      isSubmitDisabled:
        !isAllFieldsFilled(itemsMissingFields, itemFields) || missingTransNum || missingScreenshot,
      hasItems: (preview?.cart_items || []).length > 0,
    };
  }, [preview, formData, itemFields]);

  const startFastBuy = async (productId, quantity = 1) => {
    try {
      await mutate({
        endpoint: "/cart/fast-buy/start",
        method: "post",
        data: { product_id: productId, quantity },
        showToast: false,
      });

      navigate("/fast-buy/checkout");
    } catch {
      // Global error handler handles failure toasts
    }
  };

  const clearFastBuyCart = async (showToast = false) => {
    try {
      await mutate({
        endpoint: "/cart/fast-buy",
        method: "delete",
        showToast,
      });
      return true;
    } catch {
      return false;
    }
  };

  const applyCoupon = async (itemId, couponCode) => {
    try {
      await mutate({
        endpoint: "/cart/fast-buy/items/coupon",
        method: "post",
        data: { itemId, couponCode },
      });
      await fetchCheckoutData();
    } catch {
      // Handled by global error toaster
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItemField = (itemId, fieldId, value) => {
    setItemFields((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), [fieldId]: value },
    }));
  };

  const submitItemFields = async () => {
    const { imageUploads, textPayloads } = separateRequiredFields(itemFields);

    for (const data of imageUploads) {
      await mutate({
        endpoint: "/cart/fast-buy/items/required-fields/image",
        method: "patch",
        data,
        headers: { "Content-Type": "multipart/form-data" },
        showToast: false,
      });
    }

    for (const payload of textPayloads) {
      await mutate({
        endpoint: "/cart/fast-buy/items/required-fields",
        method: "patch",
        data: payload,
        showToast: false,
      });
    }
  };

  const checkoutFastBuy = async () => {
    try {
      if (itemFields && Object.keys(itemFields).length > 0) {
        await submitItemFields();
      }

      const data = new FormData();
      if (formData.paymentMethodId) {
        data.append("payment_method_id", Number(formData.paymentMethodId));
      }
      if (computed.needsTransferNumber && formData.numberTransferredFrom) {
        data.append("numberTransferredFrom", formData.numberTransferredFrom);
      }
      if (computed.needsScreenshot && formData.paymentScreenshot) {
        data.append("paymentScreenshot", formData.paymentScreenshot);
      }
      if (formData.notes) {
        data.append("notes", formData.notes);
      }

      await mutate({
        endpoint: "/cart/fast-buy/checkout",
        method: "post",
        data,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(t("fastBuy.checkoutSuccess", "Checkout successful! Redirecting to market..."));
      navigate("/market", { replace: true, state: { skipFastBuyClear: true } });
    } catch {
      // Global error handler will trigger toasts
    }
  };

  return {
    loading,
    startFastBuy,
    checkout: {
      preview,
      isLoading,
      error,
      isSubmitting: loading,
      formData,
      itemFields,
      computed,
      updateField,
      updateItemField,
      fetchCheckoutData,
      checkoutFastBuy,
      applyCoupon,
      clearFastBuyCart,
    },
  };
}
