import { useState } from "react";
import axios from "../api/axios";
import { toast } from "sonner";

/**
 * Generic hook for handling API mutations.
 * Standardizes loading, error, and success toast states.
 */
export default function useApiMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (config) => {
    const {
      endpoint,
      method = "post",
      data,
      headers,
      defaultSuccessMessage,
    } = config;

    setLoading(true);
    setError(null);

    try {
      const response = await axios({ method, url: endpoint, data, headers });

      const message = response.data?.message || defaultSuccessMessage;
      if (message) {
        toast.success(message);
      }

      return response.data;
    } catch (err) {
      setError(err);
      // Error toasts are handled globally by the axios response interceptor
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
