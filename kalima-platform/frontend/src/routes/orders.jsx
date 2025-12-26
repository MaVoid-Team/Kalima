import axios from "axios"
import { getToken } from "./auth-services"

const API_URL = import.meta.env.VITE_API_URL

// Function to check if user is logged in
const isLoggedIn = () => {
  return !!getToken()
}

export const getAllProductPurchases = async (queryParams = {}) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }
    const response = await axios.get(`${API_URL}/ec/cart-purchases/admin/all`, {
      params: {
        limit: 6,
        ...queryParams,
      },
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })

    return {
      success: true,
      data: {
        ...response.data,
        cartPurchases: response.data.data?.purchases || [],
        totalPages: response.data.pagination?.pages || 1,
        totalPurchases: response.data.pagination?.total || 0,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch cart purchases: ${error.message}`,
    }
  }
}

export const receiveProductPurchase = async (purchaseId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    const response = await axios.patch(
      `${API_URL}/ec/cart-purchases/${purchaseId}/receive`,
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
      error: `Failed to receive purchase: ${error.message}`,
    }
  }
}

export const confirmProductPurchase = async (purchaseId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    const response = await axios.patch(
      `${API_URL}/ec/cart-purchases/${purchaseId}/confirm`,
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
      error: `Failed to confirm purchase: ${error.message}`,
    }
  }
}
export const  ReturnProductPurchase = async (purchaseId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    const response = await axios.patch(
      `${API_URL}/ec/cart-purchases/${purchaseId}/return`,
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
      error: `Failed to confirm purchase: ${error.message}`,
    }
  }
}

export const confirmBookPurchase = async (purchaseId) => {
  return confirmProductPurchase(purchaseId)
}

export const getAllStats = async (endDate = null, startDate = null) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    const response = await axios.get(`${API_URL}/ec/cart-purchases/admin/statistics`, {
      params: {
        endDate,
        startDate,
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
      error: `Failed to fetch stats: ${error.message}`,
    }
  }
}

export const getProductStats = async (endDate = null) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    let url = `${API_URL}/ec/cart-purchases/admin/product-statistics`

    if (endDate) {
      url = `${API_URL}/ec/cart-purchases/admin/product-statistics?endDate=${endDate}`
    }

    const response = await axios.get(url, {
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
      error: `Failed to fetch product stats: ${error.message}`,
    }
  }
}

export const getResponseTimeStats = async () => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    const response = await axios.get(`${API_URL}/ec/cart-purchases/admin/response-time`, {
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
      error: `Failed to fetch response time stats: ${error.message}`,
    }
  }
}

export const updatePurchase = async (purchaseId, updateData) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }

    // If only adminNotes are being updated, use the dedicated admin-note endpoint
    if (Object.keys(updateData).length === 1 && updateData.adminNotes !== undefined) {
      const response = await axios.patch(
        `${API_URL}/ec/cart-purchases/${purchaseId}/admin-note`,
        { adminNotes: updateData.adminNotes },
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
    }

    // Fallback for other updates
    const response = await axios.patch(`${API_URL}/ec/purchases/${purchaseId}`, updateData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to update purchase: ${error.message}`,
    }
  }
}

// Delete a product purchase
export const deleteProductPurchase = async (purchaseId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }
    const response = await axios.delete(`${API_URL}/ec/cart-purchases/${purchaseId}`, {
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
      error: `Failed to delete product purchase: ${error.message}`,
    }
  }
}

// Delete a book purchase
export const deleteBookPurchase = async (purchaseId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("Not authenticated")
    }
    const response = await axios.delete(`${API_URL}/ec/book-purchases/${purchaseId}`, {
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
      error: `Failed to delete purchase: ${error.message}`,
    }
  }
}
