import axios from "axios";

const API_URL = process.env.REACT_APP_BASE_URL

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
export const registerUser = (userData) => handleRequest("post", "/register", userData);

export const loginUser = async (credentials) => {
  const result = await handleRequest("post", "/auth", credentials);

  if (result.success && result.data.accessToken) {
    sessionStorage.setItem("authToken", result.data.accessToken);
  }

  return result;
};

// Auth Helpers
export const getToken = () => sessionStorage.getItem("authToken");

export const isLoggedIn = () => !!getToken();

export const logoutUser = () => {
  sessionStorage.removeItem("authToken");
  sessionStorage.clear();
}
