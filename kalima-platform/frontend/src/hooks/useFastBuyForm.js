import { useState, useMemo, useEffect } from "react";
import { getImageUrl } from "@/lib/storeUtils";

const isAllFieldsFilled = (missingItems, answers) =>
  missingItems.every((item) =>
    item.missing_fields.every(
      (field) => !!(answers[item.cart_item_id] || {})[field.id],
    ),
  );

const formatCartItems = (items = []) =>
  items.map(
    ({
      id,
      products = {},
      final_price,
      quantity = 1,
    }) => ({
      id,
      name: products.title || "",
      price: parseFloat(final_price  || 0) / quantity,
      image: getImageUrl(
        products.images?.[0]?.url || products.thumbnail_image?.url || "",
      ),
      type: products.type || "",
      description: products.description || "",
      quantity,
    }),
  );

export function useFastBuyForm(preview, paymentMethods, onSubmit) {
  const [formData, setFormData] = useState({
    paymentMethodId: "",
    numberTransferredFrom: "",
    paymentScreenshot: null,
    notes: "",
  });

  const [itemFields, setItemFields] = useState({});

  useEffect(() => {
    if (paymentMethods?.length > 0 && !formData.paymentMethodId) {
      setFormData((prev) => ({
        ...prev,
        paymentMethodId: paymentMethods[0].id,
      }));
    }
  }, [paymentMethods, formData.paymentMethodId]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItemField = (itemId, fieldId, value) => {
    setItemFields((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), [fieldId]: value },
    }));
  };

  const computed = useMemo(() => {
    const commonFields = preview?.requiredFields?.common || [];
    const itemsMissingFields =
      preview?.requiredFields?.itemsMissingFields || [];

    const needsScreenshot = commonFields.some(
      (f) => f.toLowerCase() === "paymentscreenshot",
    );
    const needsTransferNumber = commonFields.includes("numberTransferredFrom");

    const missingTransNum =
      needsTransferNumber && !formData.numberTransferredFrom;
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
        !isAllFieldsFilled(itemsMissingFields, itemFields) ||
        missingTransNum ||
        missingScreenshot,
    };
  }, [preview, formData, itemFields]);

  const handleSubmit = () => {
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

    onSubmit({ checkoutData: data, itemFields });
  };

  return {
    state: formData,
    itemFields,
    updateField,
    updateItemField,
    computed,
    handlers: { handleSubmit },
  };
}
