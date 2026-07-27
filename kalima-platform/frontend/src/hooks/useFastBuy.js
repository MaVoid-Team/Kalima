import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import axios from "@/api/axios";
import useApiMutation from "@/hooks/useApiMutation";
import { getImageUrl } from "@/lib/storeUtils";
import { egyptPhoneSchema } from "@/components/ui/phone-input";
import useRole from "@/hooks/useRole";
import {
  beginRepeatPurchaseCheck,
  confirmRepeatPurchase,
  dismissRepeatPurchase,
  emptyRepeatPurchaseState,
} from "@/lib/repeatPurchaseFlow";

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

const normalizeRequiredField = (field) => {
  const definition = field.required_field_definitions || field;

  return {
    id: field.id ?? field.field_definition_id,
    label: definition.label || field.label || "",
    field_type: definition.field_type || field.field_type || "text",
    is_required: field.is_required ?? true,
    value: field.value ?? null,
  };
};

const buildRequiredFieldItems = (cartItems = [], fallbackMissingItems = []) => {
  const items = cartItems
    .map((item) => ({
      cart_item_id: item.id,
      product_name: item.products?.title || "",
      required_fields: (item.cart_item_required_fields || []).map(normalizeRequiredField),
    }))
    .filter((item) => item.required_fields.length > 0);

  if (items.length > 0) return items;

  return fallbackMissingItems.map((item) => ({
    cart_item_id: item.cart_item_id,
    product_name: item.product_name || "",
    required_fields: (item.missing_fields || []).map(normalizeRequiredField),
  }));
};

const getAnsweredValue = (answers, cartItemId, field) => {
  const itemAnswers = answers[cartItemId] || {};
  return Object.prototype.hasOwnProperty.call(itemAnswers, field.id)
    ? itemAnswers[field.id]
    : field.value;
};

const isRequiredFieldFilled = (field, value, t) => {
  if (!field.is_required) return true;

  if (field.field_type === "image") {
    return value instanceof File || (typeof value === "string" && value.trim() !== "");
  }

  const normalized = typeof value === "string" ? value.trim() : value;
  if (!normalized || normalized === "+20") return false;

  if (field.field_type === "number") {
    return egyptPhoneSchema(t).safeParse(normalized).success;
  }

  return true;
};

const areAllRequiredFieldsFilled = (requiredFieldItems, answers, t) =>
  requiredFieldItems.every((item) =>
    item.required_fields.every((field) =>
      isRequiredFieldFilled(field, getAnsweredValue(answers, item.cart_item_id, field), t),
    ),
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
  const { isTeacher } = useRole();
  const ordersPath = isTeacher ? "/teacher/orders" : "/orders";

  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(checkout);
  const [error, setError] = useState(null);
  const [itemFields, setItemFields] = useState({});
  const [repeatPurchase, setRepeatPurchase] = useState(emptyRepeatPurchaseState);
  const [checkingRepeatPurchase, setCheckingRepeatPurchase] = useState(false);
  const submissionInFlightRef = useRef(false);
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
      const paymentMethodsData = paymentMethodsRes?.data?.data?.data ?? [];

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
    const requiredFieldItems = buildRequiredFieldItems(preview?.cart_items, itemsMissingFields);
    const total = parseFloat(preview?.total || 0);
    const isFreeOrder = total <= 0;

    const needsScreenshot = !isFreeOrder && commonFields.some((f) => f.toLowerCase() === "paymentscreenshot");
    const needsTransferNumber = !isFreeOrder && commonFields.includes("numberTransferredFrom");
    const transferNumberValue = formData.numberTransferredFrom || "";
    const missingTransNum = needsTransferNumber && !transferNumberValue;
    const invalidTransferNumber =
      needsTransferNumber && !egyptPhoneSchema(t).safeParse(transferNumberValue).success;
    const missingScreenshot = needsScreenshot && !formData.paymentScreenshot;

    return {
      items: formatCartItems(preview?.cart_items),
      subtotal: parseFloat(preview?.subtotal || 0),
      total,
      discount: parseFloat(preview?.discount || 0),
      isFreeOrder,
      needsScreenshot,
      needsTransferNumber,
      requiredFieldItems,
      screenshotName: formData.paymentScreenshot?.name || "",
      isSubmitDisabled:
        !areAllRequiredFieldsFilled(requiredFieldItems, itemFields, t) ||
        missingTransNum ||
        missingScreenshot ||
        invalidTransferNumber,
      hasItems: (preview?.cart_items || []).length > 0,
    };
  }, [preview, formData, itemFields, t]);

  const startFastBuy = async (productId) => {
    try {
      await mutate({
        endpoint: "/cart/fast-buy/start",
        method: "post",
        data: { product_id: productId, quantity: 1 },
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

  const submitFastBuy = async (data) => {
    try {
      if (itemFields && Object.keys(itemFields).length > 0) {
        await submitItemFields();
      }

      await mutate({
        endpoint: "/cart/fast-buy/checkout",
        method: "post",
        data,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (typeof window !== 'undefined' && window.fbq) {
        const reducedPrice = parseFloat(computed.total || 0) * 0.75;
        window.fbq('track', 'Purchase', {
            value: Number(reducedPrice.toFixed(2)),
            currency: 'EGP'
        });
      }

      toast.success(t("fastBuy.checkoutSuccess", "Checkout successful! Redirecting to market..."));
      navigate(ordersPath, { replace: true, state: { skipFastBuyClear: true } });
    } catch {
      // Global error handler will trigger toasts
    }
  };

  const checkoutFastBuy = async () => {
    if (submissionInFlightRef.current) return;
    submissionInFlightRef.current = true;

    const data = new FormData();
    if (!computed.isFreeOrder && formData.paymentMethodId) {
      data.append("payment_method_id", Number(formData.paymentMethodId));
    }
    if (computed.needsTransferNumber && formData.numberTransferredFrom) {
      data.append("numberTransferredFrom", formData.numberTransferredFrom);
    }
    if (computed.needsScreenshot && formData.paymentScreenshot) {
      data.append("paymentScreenshot", formData.paymentScreenshot);
    }
    if (formData.notes) data.append("notes", formData.notes);

    setCheckingRepeatPurchase(true);
    let repeatedItems = [];
    try {
      const response = await axios.get("/cart/fast-buy/checkout/repeat-purchases");
      repeatedItems = response?.data?.data?.items ?? [];
    } catch {}

    const decision = beginRepeatPurchaseCheck(repeatedItems, data);
    setRepeatPurchase(decision.state);
    setCheckingRepeatPurchase(false);
    try {
      if (decision.shouldSubmit) await submitFastBuy(decision.submission);
    } finally {
      submissionInFlightRef.current = false;
    }
  };

  const confirmRepeatedPurchase = async () => {
    if (submissionInFlightRef.current) return;
    submissionInFlightRef.current = true;
    const confirmation = confirmRepeatPurchase(repeatPurchase);
    setRepeatPurchase(confirmation.state);
    try {
      if (confirmation.submission) await submitFastBuy(confirmation.submission);
    } finally {
      submissionInFlightRef.current = false;
    }
  };

  const dismissRepeatedPurchase = () => {
    setRepeatPurchase((current) => dismissRepeatPurchase(current));
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
      repeatPurchase,
      checkingRepeatPurchase,
      confirmRepeatedPurchase,
      dismissRepeatedPurchase,
      applyCoupon,
      clearFastBuyCart,
    },
  };
}
