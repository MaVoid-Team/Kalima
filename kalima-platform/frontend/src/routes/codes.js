import axios from "axios";
import { getToken } from "./auth-services"; // Adjust the path based on your project structure

const API_URL = process.env.REACT_APP_BASE_URL;

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
    if (error.response) {
      // Server responded with a status outside 2xx
      return { success: false, error: error.response.data.message || 'Redemption failed' };
    } else if (error.request) {
      // No response received from server
      return { success: false, error: 'No response from server' };
    } else {
      // Error in request setup
      return { success: false, error: 'Request setup error' };
    }
  }
};