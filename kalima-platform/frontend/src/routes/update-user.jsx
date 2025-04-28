// routes/update-user.js

import axios from 'axios';
import { getToken, isLoggedIn } from './auth-services';
import api from '../services/errorHandling';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Updates a user's information
 * @param {string} userId - The ID of the user to update
 * @param {Object} updateData - Object containing the fields to update
 * @returns {Promise<Object>} - Response object with success status and data or error
 */
export const updateUser = async (userId, updateData) => {
  try {
    // Check if user is logged in
    if (!isLoggedIn()) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the auth token
    const token = getToken();
    if (!token) {
      return { success: false, error: "No authentication token found" };
    }

    // Make the API request
    const response = await api.patch(`${API_URL}/api/v1/users/${userId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    // console.error("Error updating user:", error);
    
    // // Log more detailed error information for debugging
    // if (error.response) {
    //   console.error("Error response data:", error.response.data);
    //   console.error("Error response status:", error.response.status);
    // }

    // // Return appropriate error message
    // return {
    //   success: false,
    //   error: error.response?.data?.message || 
    //          "Failed to update user information. Please try again."
    // };
    return `Error updating user: ${error.message}`
  }
};

/**
 * Updates the currently logged in user's information
 * @param {Object} updateData - Object containing the fields to update
 * @returns {Promise<Object>} - Response object with success status and data or error
 */
export const updateCurrentUser = async (updateData) => {
  try {
    // Fetch current user data to get the ID and role
    const userDataResponse = await api.get(`${API_URL}/api/v1/users/me/dashboard`, {
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
    return `Error updating current user: ${error.message}`
  }
};