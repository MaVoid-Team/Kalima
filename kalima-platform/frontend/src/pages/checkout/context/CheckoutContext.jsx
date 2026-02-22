import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import axios from "@/api/axios";
import useApiMutation from "@/hooks/useApiMutation";

const CheckoutContext = createContext(null);

// --- API Endpoints ---
const ENDPOINTS = {
  CHECKOUT_PREVIEW: "/cart/checkout/preview",
  CHECKOUT_SUBMIT: "/cart/checkout",
  REQUIRED_FIELDS: "/cart/items/required-fields",
};

export const CheckoutProvider = ({ children }) => {
  // --- State ---
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: RequiredFields, 2: Payment, 3: Success
  const [purchaseSerial, setPurchaseSerial] = useState(null);

  const { mutate, loading: mutationLoading } = useApiMutation();

  // --- Fetch checkout preview on mount ---
  const fetchPreview = useCallback(async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const response = await axios.get(ENDPOINTS.CHECKOUT_PREVIEW);
      setPreviewData(response.data?.data || response.data);
    } catch (err) {
      setPreviewError(err);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // --- Submit required fields for cart items ---
  const submitRequiredFields = useCallback(
    async (formData) => {
      const result = await mutate({
        endpoint: ENDPOINTS.REQUIRED_FIELDS,
        method: "patch",
        data: formData,
        defaultSuccessMessage: "Required fields updated successfully!",
      });
      // Re-fetch preview after updating fields
      await fetchPreview();
      return result;
    },
    [mutate, fetchPreview],
  );

  // --- Finalize checkout ---
  const finalizePurchase = useCallback(
    async (formData) => {
      const result = await mutate({
        endpoint: ENDPOINTS.CHECKOUT_SUBMIT,
        method: "post",
        data: formData,
        defaultSuccessMessage: "Purchase completed successfully!",
      });
      const serial = result?.data?.purchase_serial || result?.purchase_serial;
      if (serial) {
        setPurchaseSerial(serial);
      }
      setCurrentStep(3); // Move to success step
      return result;
    },
    [mutate],
  );

  // --- Context Value ---
  const value = {
    previewData,
    previewLoading,
    previewError,
    currentStep,
    setCurrentStep,
    purchaseSerial,
    submitRequiredFields,
    finalizePurchase,
    mutationLoading,
    refetchPreview: fetchPreview,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

/**
 * Custom hook to access the CheckoutContext.
 */
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};

export default CheckoutContext;
