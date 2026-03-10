import { useState, useMemo } from "react";
import {
  calculateCheckoutSubtotal,
  formatCheckoutItems,
} from "@/lib/storeUtils";

const DEFAULT_PAYMENT_METHOD_ID = "1";

export function useCheckoutForm({ preview, cartItems, onSubmit }) {
  const [formData, setFormData] = useState({
    paymentMethodId: DEFAULT_PAYMENT_METHOD_ID,
    numberTransferredFrom: "",
    paymentScreenshot: null,
    nameOnBook: "",
    numberOnBook: "",
    seriesName: "",
    notes: "",
  });

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const { requiredFields = {}, hasBooks = false } = preview ?? {};
  const commonFields = requiredFields.common ?? [];
  const bookFields = requiredFields.books ?? [];

  const items = useMemo(() => formatCheckoutItems(cartItems), [cartItems]);
  const subtotal = useMemo(
    () => calculateCheckoutSubtotal(preview, items),
    [items, preview],
  );

  const needsScreenshot = commonFields.some((f) =>
    ["paymentScreenShot", "paymentScreenshot"].includes(f),
  );
  const needsTransferNumber = commonFields.includes("numberTransferredFrom");

  const isSubmitDisabled =
    !needsScreenshot &&
    !formData.numberTransferredFrom &&
    !hasBooks &&
    !formData.notes;

  const handleSubmit = () => {
    const data = new FormData();
    data.append("payment_method_id", formData.paymentMethodId);

    if (needsTransferNumber && formData.numberTransferredFrom)
      data.append("numberTransferredFrom", formData.numberTransferredFrom);
    if (formData.notes) data.append("notes", formData.notes);
    if (needsScreenshot && formData.paymentScreenshot)
      data.append("paymentScreenshot", formData.paymentScreenshot);

    if (hasBooks) {
      if (formData.nameOnBook) data.append("nameOnBook", formData.nameOnBook);
      if (formData.numberOnBook)
        data.append("numberOnBook", formData.numberOnBook);
      if (formData.seriesName) data.append("seriesName", formData.seriesName);
    }

    onSubmit(data);
  };

  return {
    state: formData,
    updateField,
    computed: {
      items,
      subtotal,
      needsScreenshot,
      needsTransferNumber,
      hasBooks,
      bookFields,
      isSubmitDisabled,
      screenshotName: formData.paymentScreenshot?.name ?? "",
    },
    handlers: {
      handleSubmit,
    },
  };
}
