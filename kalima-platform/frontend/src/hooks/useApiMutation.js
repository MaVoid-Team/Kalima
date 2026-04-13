import { useState, useCallback } from 'react';
import axios from '../api/axios';
import { toast } from 'sonner';
import { translateBackendMessage } from '../lib/utils';

/**
 * Generic hook for handling API mutations.
 * Standardizes loading, error, and success toast states.
 */
export default function useApiMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (config, showToast = true) => {
    const { endpoint, method = 'post', data, defaultSuccessMessage, onUploadProgress, signal } = config;

    setLoading(true);
    setError(null);

    try {
      // if we are sending a FormData object, make sure we don't force JSON
      const axiosConfig = { method, url: endpoint, data };
      if (onUploadProgress) {
        axiosConfig.onUploadProgress = onUploadProgress;
      }
      if (signal) {
        axiosConfig.signal = signal;
      }
      if (data instanceof FormData) {
        axiosConfig.headers = { 'Content-Type': 'multipart/form-data' };
      }

      const response = await axios(axiosConfig);

      const rawMessage = response.data?.message || defaultSuccessMessage;
      const translatedMessage = translateBackendMessage(rawMessage);
      if (translatedMessage && showToast) {
        toast.success(translatedMessage);
      }

      return response.data;
    } catch (err) {
      setError(err);
      // Error toasts are handled globally by the axios response interceptor
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
