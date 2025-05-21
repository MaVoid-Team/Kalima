import axios from "axios"
import { getToken, isLoggedIn } from "./auth-services"

const API_URL = import.meta.env.VITE_API_URL



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
    const response = await axios.patch(
      `${API_URL}/users/update/password`,
      passwordData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    
    
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

export const updateUser = async (userId, updateData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/v1/users/${userId}`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    )

    return {
      success: true,
      data: response.data,
      message: "User updated successfully"
    }

  } catch (error) {
    console.error("Update user error:", error)
    return {
      success: false,
      error: error.response?.data?.message || 
           error.message || 
           "Failed to update user"
    }
  }
}