import axios from 'axios';

// Base URL can be moved to an environment variable
const API_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/register`, userData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed'
    };
  }
};

export const loginUser = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth`, credentials)
  
      // Store the token in localStorage for future API calls
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken)
      }
  
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      }
    }
  }
  
  // Helper function to get the stored token
  export const getToken = () => {
    return localStorage.getItem("accessToken")
  }
  
  // Helper function to check if user is logged in
  export const isLoggedIn = () => {
    return !!getToken()
  }
  
  // Helper function to logout user
  export const logoutUser = () => {
    localStorage.removeItem("accessToken")
    // You can add additional cleanup here if needed
  }
// You can add more auth-related API calls here (login, logout, etc.)
