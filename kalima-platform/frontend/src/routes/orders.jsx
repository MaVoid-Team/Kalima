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

    const response = await axios.get(`${API_URL}/ec/purchases/`, {
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
export const getAllBookPurchases = async (queryParams = {}) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    const response = await axios.get(`${API_URL}/ec/book-purchases/`, {
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
      error: `Failed to fetch book purchases: ${error.message}`,
    }
  }
}

// Function to confirm a product purchase
export const confirmProductPurchase = async (purchaseId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    const response = await axios.patch(
      `${API_URL}/ec/purchases/${purchaseId}/confirm`,
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
      `${API_URL}/ec/book-purchases/${purchaseId}/confirm`,
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

// Function to get combined purchases with server-side pagination
export const getAllPurchases = async (queryParams = {}) => {
  try {
    const [productPurchasesResponse, bookPurchasesResponse] = await Promise.all([
      getAllProductPurchases(queryParams),
      getAllBookPurchases(queryParams),
    ])

    if (!productPurchasesResponse.success || !bookPurchasesResponse.success) {
      throw new Error("Failed to fetch purchases")
    }

    // Combine both arrays and sort by creation date (newest first)
    const allPurchases = [
      ...(productPurchasesResponse.data.data?.purchases || []),
      ...(bookPurchasesResponse.data.data?.purchases || []),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Calculate totals from both responses
    const totalProductPurchases = productPurchasesResponse.data.totalPurchases || 0
    const totalBookPurchases = bookPurchasesResponse.data.totalPurchases || 0
    const totalPurchases = totalProductPurchases + totalBookPurchases

    // Calculate total pages based on limit of 6
    const totalPages = Math.ceil(totalPurchases / 6)

    return {
      success: true,
      data: {
        purchases: allPurchases,
        totalPurchases: totalPurchases,
        totalPages: totalPages,
        currentPage: queryParams.page || 1,
        productPurchases: productPurchasesResponse.data.data?.purchases?.length || 0,
        bookPurchases: bookPurchasesResponse.data.data?.purchases?.length || 0,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch all purchases: ${error.message}`,
    }
  }
}
