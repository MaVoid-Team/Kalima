import axios from "axios";

const API_URL = process.env.REACT_APP_BASE_URL;
const TOKEN_KEY = "authToken";

// Axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Generic request handler
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

// --- AUTH API CALLS ---

export const registerUser = (userData) => {
  return handleRequest("post", "/api/v1/register", userData);
};

export const loginUser = async (credentials) => {
  const result = await handleRequest("post", "/api/v1/auth", credentials);

  if (result.success && result.data.accessToken) {
    localStorage.setItem(TOKEN_KEY, result.data.accessToken);
  }

  return result;
};

export const logoutUser = async () => {
  const token = getToken();

  // Optional: Call backend to invalidate token
  await handleRequest("post", "/api/v1/logout", { token });

  // Clear token regardless of server response
  localStorage.removeItem(TOKEN_KEY);
};

// --- USER DATA API CALL ---

export const getUserDashboard = async () => {
  const token = getToken();
  
  // If token doesn't exist, return an error
  if (!token) {
    return { success: false, error: "No auth token found" };
  }

  // Set the authorization header with the token
  api.defaults.headers['Authorization'] = `Bearer ${token}`;

  // Call the API endpoint to fetch the logged-in user's data
  const result = await handleRequest("get", "/api/v1/users/me/dashboard");

  return result;
};

// --- AUTH HELPERS ---

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const isLoggedIn = () => {
  const token = getToken();
  return !!token;
};

// Optional: Get decoded token (if JWT)
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const { exp, ...user } = JSON.parse(atob(token.split(".")[1])); // quick decode
    if (Date.now() >= exp * 1000) return null;
    return user;
  } catch {
    return null;
  }
};
