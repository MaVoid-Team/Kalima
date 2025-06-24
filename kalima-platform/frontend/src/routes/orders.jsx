import axios from "axios"
import { getToken } from "./auth-services"

const API_URL = import.meta.env.VITE_API_URL

// Function to check if user is logged in
const isLoggedIn = () => {
  return !!getToken()
}

// Function to get all product purchases with pagination
export const getAllProductPurchases = async (queryParams = {}) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    const response = await axios.get(`${API_URL}/api/v1/ec/purchases/`, {
      params: {
        limit: 6, // Fixed limit as requested
        ...queryParams,
      },
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch product purchases: ${error.message}`,
    }
  }
}

// Function to get all book purchases with pagination

// Function to confirm a product purchase
export const confirmProductPurchase = async (purchaseId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    const response = await axios.patch(
      `${API_URL}/api/v1/ec/purchases/${purchaseId}/confirm`,
      {},
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      },
    )

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to confirm product purchase: ${error.message}`,
    }
  }
}

// Function to confirm a book purchase
export const confirmBookPurchase = async (purchaseId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    const response = await axios.patch(
      `${API_URL}/api/v1/ec/book-purchases/${purchaseId}/confirm`,
      {},
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      },
    )

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to confirm book purchase: ${error.message}`,
    }
  }
}
