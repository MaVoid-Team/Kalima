import useApiMutation from "./useApiMutation";
import { useNavigate } from "react-router-dom";

export function useFastBuy() {
  const { mutate, loading: isLoading } = useApiMutation();
  const navigate = useNavigate();

  const startFastBuy = async (productId, quantity = 1) => {
    try {
      await mutate({
        endpoint: "/cart/fast-buy/start",
        method: "post",
        data: {
          product_id: productId,
          quantity,
        },
        showToast: false,
      });

      navigate("/fast-buy/checkout");
    } catch {
      // Global error handler handles failure toasts
    }
  };

  return { startFastBuy, isLoading };
}
