import axios from "axios";
import {jwtDecode} from "jwt-decode";

const API_URL = process.env.REACT_APP_BASE_URL;
const TOKEN_KEY = "accessToken";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
console.log("Axios Base URL:", api.defaults.baseURL);
// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.error("Authentication error:", error.response.data);
      // You could trigger a logout or token refresh here
    }
    return Promise.reject(error);
  }
);

// Enhanced request handler with better error details
const handleRequest = async (method, url, data = {}, options = {}) => {
  try {
    const config = {
      ...options,
    };
    
    let response;
    if (method === "get" || method === "delete") {
      response = await api[method](url, config);
    } else {
      response = await api[method](url, data, config);
    }
    
    return { 
      success: true, 
      data: response.data,
      status: response.status,
      headers: response.headers,
      error: response.data.error
    };
  } catch (error) {
    console.error(`API Error (${method.toUpperCase()} ${url}):`, error.response || error);
    
    return {
      success: false,
      status: error.response?.status,
      error: data,
      details: error.response?.data || error.message
    };
  }
};

// --- AUTH API CALLS ---

export const registerUser = (userData) => {
  return handleRequest("post", "/register", userData);
};

export const loginUser = async (credentials) => {
  try {
    const result = await handleRequest("post", "/auth", credentials);

    if (result.success && result.data.accessToken) {
      // Store token
      setToken(result.data.accessToken);
      
      // Log successful login
      console.log("Login successful, token stored");
      if (result.data.user) {
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }
    } else {
      console.error("Login failed:", result.error);
    }

    return result;
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Login process failed"
    };
  }
};

export const logoutUser = async () => {
  try {
    const token = getToken();

    if (token) {
      // Make a POST request to logout endpoint (no credentials needed)
      await handleRequest("post", "/auth/logout");
    }

    // Clear all auth-related data
    clearAuthData();

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);

    // Still clear local data even if server logout fails
    clearAuthData();

    return {
      success: false,
      error: "Logout failed on server, but local session was cleared",
    };
  }
};

// --- USER DATA API CALLS ---

export const getUserDashboard = async (options = {}) => {
  try {
    if (!isLoggedIn()) {
      return { success: false, error: "Not authenticated" };
    }
    
    const result = await handleRequest("get", "/users/me/dashboard", {}, options);
    return result;
  } catch (error) {
    console.error("Error fetching user dashboard:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard data"
    };
  }
};
// --- AUTHENTICATED API HELPERS ---

export const getAuthenticatedRequest = async (url, options = {}) => {
  return handleRequest("get", url, {}, options);
};

export const postAuthenticatedRequest = async (url, data = {}, options = {}) => {
  return handleRequest("post", url, data, options);
};

export const putAuthenticatedRequest = async (url, data = {}, options = {}) => {
  return handleRequest("put", url, data, options);
};

export const deleteAuthenticatedRequest = async (url, options = {}) => {
  return handleRequest("delete", url, {}, options);
};

// --- AUTH HELPERS ---

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (!token) {
    console.warn("Attempted to set empty token");
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("user");
  // Clear any other auth-related data you might be storing
};

export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;
  
  // Check if token is expired
  try {
    const decodedToken = decodeToken(token);
    const currentTime = Date.now() / 1000;
    
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.warn("Token has expired");
      removeToken(); // Clean up expired token
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
};

// Safer token decoding
export const decodeToken = (token) => {
  try {
    // If you added jwt-decode:
    return jwtDecode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return {};
  }
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decodedToken = decodeToken(token);
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.warn("Token has expired");
      removeToken(); // Clean up expired token
      return null;
    }
    
    // Return user data from token (excluding exp, iat, etc.)
    const { exp, iat, nbf, jti, ...userData } = decodedToken;
    return userData;
  } catch (error) {
    console.error("Error extracting user from token:", error);
    return null;
  }
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getUserFromToken();
  if (!user || !user.role) return false;
  
  // Handle both string roles and array of roles
  if (Array.isArray(user.role)) {
    return user.role.includes(role);
  }
  
  return user.role === role;
};

// Debug helper
export const debugAuthState = () => {
  const token = getToken();
  const isLoggedInStatus = isLoggedIn();
  const user = getUserFromToken();
  
  console.group("Auth State Debug");
  console.log("Has Token:", !!token);
  if (token) {
    console.log("Token (first 10 chars):", token.substring(0, 10) + "...");
  }
  console.log("Is Logged In:", isLoggedInStatus);
  console.log("User Data:", user);
  console.groupEnd();
  
  return {
    hasToken: !!token,
    isLoggedIn: isLoggedInStatus,
    userData: user
  };
};