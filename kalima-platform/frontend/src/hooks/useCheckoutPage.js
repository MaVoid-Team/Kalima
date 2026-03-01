import { useState, useEffect } from "react";
import axios from "@/api/axios";
import useApiMutation from "@/hooks/useApiMutation";

export function useCheckoutPage() {
  const { mutate, loading: submitting } = useApiMutation();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseSerial, setPurchaseSerial] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const { data } = await mutate({
          endpoint: "/cart/checkout/preview",
          method: "get",
          showToast: false,
        });
        setPreview(data?.data ?? data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, []);

  const handleCheckout = async (formData) => {
    try {
      const { data } = await mutate({
        endpoint: "/cart/checkout",
        method: "post",
        data: formData,
      });
      const serial = data?.purchase?.purchase_serial;
      alert("Here 1: ", serial);
      if (serial) setPurchaseSerial(serial);
    } catch {
      // Error toast handled globally
    }
  };

  return {
    state: {
      preview,
      loading,
      error,
      purchaseSerial,
    },
    submitting,
    handleCheckout,
  };
}
