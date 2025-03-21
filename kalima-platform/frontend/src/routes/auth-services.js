import axios from "axios";

const API_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

// Create an axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Utility function to handle API requests
const handleRequest = async (method, url, data = {}) => {
  try {
    const response = await api[method](url, data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Something went wrong",
    };
  }
};

// Auth API calls
export const registerUser = (userData) => handleRequest("post", "/api/v1/register", userData);

export const loginUser = async (credentials) => {
  const result = await handleRequest("post", "/api/v1/auth", credentials);

  if (result.success && result.data.accessToken) {
    sessionStorage.setItem("accessToken", result.data.accessToken);
  }

  return result;
};

// Auth Helpers
export const getToken = () => sessionStorage.getItem("accessToken");

export const isLoggedIn = () => !!getToken();

export const logoutUser = () => sessionStorage.removeItem("accessToken");
