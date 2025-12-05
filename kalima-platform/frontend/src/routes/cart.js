import axios from "axios";
import { getToken } from "./auth-services";

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to generate safe filename for uploads
const generateSafeFilename = (file) => {
  if (!file || !file.name) return `${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
  try {
    const orig = file.name;
    const m = orig.match(/\.([0-9a-zA-Z]+)(?:\?.*)?$/);
    const ext = m ? m[1] : "";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `${timestamp}-${rand}${ext ? `.${ext}` : ""}`;
  } catch (e) {
    return `${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
  }
};

// Get user's active cart
export const getCart = async () => {
  try {
    const response = await axios.get(`${API_URL}/ec/carts/`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    // Response format: {"status":"success","data":{"cart":null,"itemCount":0}}
    // or: {"status":"success","data":{"cart":{...},"itemCount":2}}
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // If 404 or cart doesn't exist, return success with null cart
    if (error.response?.status === 404 || error.response?.status === 400) {
      return {
        success: true,
        data: {
          status: "success",
          data: {
            cart: null,
            itemCount: 0,
          },
        },
      };
    }
    return {
      success: false,
      error: `Failed to fetch cart: ${error.response?.data?.message || error.message}`,
    };
  }
};

// Add product to cart
export const addToCart = async (productId) => {
  try {
    const response = await axios.post(
      `${API_URL}/ec/carts/add`,
      { productId },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to add to cart: ${error.response?.data?.message || error.message}`,
    };
  }
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
  try {
    const response = await axios.delete(`${API_URL}/ec/carts/remove-item/${itemId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to remove from cart: ${error.response?.data?.message || error.message}`,
    };
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    const response = await axios.delete(`${API_URL}/ec/carts/clear`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to clear cart: ${error.response?.data?.message || error.message}`,
    };
  }
};

// Apply coupon to cart
export const applyCouponToCart = async (couponCode) => {
  try {
    const response = await axios.post(
      `${API_URL}/ec/carts/apply-coupon`,
      { couponCode },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to apply coupon: ${error.response?.data?.message || error.message}`,
    };
  }
};

// Get checkout preview
export const getCheckoutPreview = async () => {
  try {
    const response = await axios.get(`${API_URL}/ec/carts/checkout-preview`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get checkout preview: ${error.response?.data?.message || error.message}`,
    };
  }
};

// Create cart purchase (checkout)
export const createCartPurchase = async (purchaseData) => {
  try {
    const formData = new FormData();
    
    // Only append payment fields if they exist (for paid products)
    if (purchaseData.numberTransferredFrom) {
      formData.append("numberTransferredFrom", purchaseData.numberTransferredFrom);
    }
    
    if (purchaseData.paymentScreenShot) {
      const safePayment = generateSafeFilename(purchaseData.paymentScreenShot);
      formData.append("paymentScreenShot", purchaseData.paymentScreenShot, safePayment);
    }

    if (purchaseData.notes) {
      formData.append("notes", purchaseData.notes);
    }

    // Book-specific fields (only if cart has books)
    if (purchaseData.nameOnBook) {
      formData.append("nameOnBook", purchaseData.nameOnBook);
    }
    if (purchaseData.numberOnBook) {
      formData.append("numberOnBook", purchaseData.numberOnBook);
    }
    if (purchaseData.seriesName) {
      formData.append("seriesName", purchaseData.seriesName);
    }

    const response = await axios.post(`${API_URL}/ec/cart-purchases`, formData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to checkout: ${error.response?.data?.message || error.message}`,
    };
  }
};

// Get cart item count
export const getCartItemCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/ec/cart-items/count`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // If cart doesn't exist, return 0
    return {
      success: true,
      data: { data: { count: 0 } },
    };
  }
};

export const getCartPurchases = async (queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ec/cart-purchases`, {
      params: queryParams,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch cart purchases: ${error.response?.data?.message || error.message}`,
    };
  }
};

// Get user's purchased product IDs
export const getUserPurchasedProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/ec/cart-purchases`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    
    if (response.data?.status === "success" && response.data?.data?.purchases) {
      // Extract all product IDs from all purchases
      const productIds = new Set();
      response.data.data.purchases.forEach(purchase => {
        if (purchase.items && Array.isArray(purchase.items)) {
          purchase.items.forEach(item => {
            if (item.product) {
              // Handle both populated and non-populated product references
              const productId = typeof item.product === 'object' ? item.product._id : item.product;
              productIds.add(productId);
            }
          });
        }
      });
      return {
        success: true,
        productIds: Array.from(productIds),
      };
    }
    return {
      success: true,
      productIds: [],
    };
  } catch (error) {
    console.error("Error fetching purchased products:", error);
    return {
      success: false,
      productIds: [],
      error: error.message,
    };
  }
};

export const getAdminCartPurchases = async (queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ec/cart-purchases/admin/all`, {
      params: queryParams,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch admin cart purchases: ${error.response?.data?.message || error.message}`,
    };
  }
};

// Get confirmed orders report
export const getConfirmedOrdersReport = async () => {
  try {
    const response = await axios.get(`${API_URL}/ec/cart-purchases/admin/confirmed-report`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch confirmed orders report: ${error.response?.data?.message || error.message}`,
    };
  }
};

