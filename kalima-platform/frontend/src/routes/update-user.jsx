import axios from "axios"
import { getToken, isLoggedIn } from "./auth-services"

const API_URL = import.meta.env.VITE_API_URL

/**
 * Updates a user's information
 * @param {string} userId - The ID of the user to update
 * @param {Object} updateData - Object containing the fields to update (name, email, phoneNumber, password)
 * @returns {Promise<Object>} - Response object with success status and data or error
 */
export const updateUser = async (userId, updateData) => {
  try {
    // Check if user is logged in
    if (!isLoggedIn()) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the auth token
    const token = getToken()
    if (!token) {
      return { success: false, error: "No authentication token found" }
    }

    // Make sure to preserve the user's role in the update data
    // This is important to avoid the "invalid or missing role" error
    const dataToSend = { ...updateData }

    // If role is not included in the update data, we need to get it
    if (!dataToSend.role) {
      try {
        // Get the user's current data to extract the role
        const userResponse = await axios.get(`${API_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (userResponse.data && userResponse.data.data && userResponse.data.data.user) {
          dataToSend.role = userResponse.data.data.user.role
        }
      } catch (err) {
        console.error("Error fetching user role:", err)
        // If we can't get the role, we'll proceed without it and let the API handle the error
      }
    }

    // Make the API request
    const response = await axios.patch(`${API_URL}/users/${userId}`, dataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error("Error updating user:", error)

    // Return appropriate error message
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update user information. Please try again.",
    }
  }
}

export const updateCurrentUser = async (updateData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/users/me/update`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return { 
      success: true, 
      data: response.data 
    };

  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 
            error.message || 
            "Failed to update user data"
    };
  }
};

/**
 * Updates the user's password
 * @param {Object} passwordData - { currentPassword: string, newPassword: string }
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const updateUserPassword = async (passwordData) => {
  try {
    // Fetch current user data to get the ID and role
    const userDataResponse = await axios.get(`${API_URL}/users/me/dashboard`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const userInfo = userDataResponse.data.data.userInfo;
    const userId = userInfo.id;
    
    // Include the role in the update data to prevent the "invalid or missing role" error
    const updatedData = {
      ...updateData,
      role: userInfo.role  // Always include the current role
    };
    
    // Call the updateUser function with the retrieved ID and the updated data that includes the role
    return updateUser(userId, updatedData);
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 
            error.message || 
            "Failed to update password"
    };
  }
};