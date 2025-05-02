import axios from "axios";
import { getToken } from "./auth-services"; // Adjust the path based on your project structure
import { getAuthHeader } from "./fetch-users"; // Adjust the path based on your project structure
import api from "../services/errorHandling";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Redeems a promo code by sending a POST request to the server.
 * 
 * @param {string} code - The promo code to redeem.
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>} 
 *          - On success: { success: true, data: response.data }
 *          - On failure: { success: false, error: errorMessage }
 */
export const redeemPromoCode = async (code) => {
  try {
    const response = await axios.post(
      `${API_URL}/codes/redeem`,
      { code },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    // if (error.response) {
    //   // Server responded with a status outside 2xx
    //   return { success: false, error: error.response.data.message || 'Redemption failed' };
    // } else if (error.request) {
    //   // No response received from server
    //   return { success: false, error: 'No response from server' };
    // } else {
    //   // Error in request setup
    //   return { success: false, error: 'Request setup error' };
    // }
    return `Redemption failed:${error.message}`
  }
};

export const generatePromoCodes = async (data) => {
  try {
    if (!data) {
      throw new Error("Promo code data is required");
    }

    // Validate required fields
    const requiredFields = ['pointsAmount', 'numOfCodes', 'type'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // If type is specific, lecturerId is required
    if (data.type === "specific" && !data.lecturerId) {
      throw new Error("Lecturer ID is required for specific promo codes");
    }

    const response = await axios.post(
      `${API_URL}/codes`,
      data,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    if (response.data && response.data.status === "success") {
      return {
        status: "success",
        data: response.data.data
      };
    } else {
      console.error("Unexpected API response structure:", response.data);
      return {
        status: "error",
        message: "Unexpected API response structure"
      };
    }
  } catch (error) {
    return `Failed to generate promo codes: ${error.message}`
  }
};
export const getPromoCodes = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      limit: 100,
      type: 'promo',
      ...filters
    });

    const response = await api.get(`${API_URL}/codes?${queryParams.toString()}`, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    const promoCodes = response.data?.data?.codes || [];
    return { success: true, data: promoCodes };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to fetch promo codes' };
  }
};