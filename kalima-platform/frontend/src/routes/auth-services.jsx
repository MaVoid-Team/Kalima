import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "accessToken";

// --- AUTH API CALLS ---

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || error.message || "Registration failed",
      details: error.response?.data,
    };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth`, credentials, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (response.data.accessToken) {
      setToken(response.data.accessToken);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Login failed: No access token received",
        details: response.data,
      };
    }
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        error: error.response.data?.message || "Login failed",
        details: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        error: "No response from server. Please check your internet connection.",
      };
    } else {
      return {
        success: false,
        error: "An error occurred during login. Please try again.",
      };
    }
  }
};

export const logoutUser = async () => {
  try {
    const token = getToken();
    if (token) {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
    clearAuthData();
    return { success: true };
  } catch (error) {
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
    const token = getToken();
    const response = await axios.get(`${API_URL}/users/me/dashboard`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...options,
    });
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        error: error.response.data?.message || "Failed to fetch dashboard data",
        details: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        error: "No response from server. Please check your internet connection.",
      };
    } else {
      return {
        success: false,
        error: "An error occurred while fetching dashboard data.",
      };
    }
  }
};

// --- AUTHENTICATED API HELPERS ---

export const getAuthenticatedRequest = async (url, options = {}) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...options,
    });
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || error.message || "Request failed",
      details: error.response?.data,
    };
  }
};

export const postAuthenticatedRequest = async (url, data = {}, options = {}) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_URL}${url}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...options,
    });
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || error.message || "Request failed",
      details: error.response?.data,
    };
  }
};

export const putAuthenticatedRequest = async (url, data = {}, options = {}) => {
  try {
    const token = getToken();
    const response = await axios.put(`${API_URL}${url}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...options,
    });
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || error.message || "Request failed",
      details: error.response?.data,
    };
  }
};

export const deleteAuthenticatedRequest = async (url, options = {}) => {
  try {
    const token = getToken();
    const response = await axios.delete(`${API_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...options,
    });
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || error.message || "Request failed",
      details: error.response?.data,
    };
  }
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
};

export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const decodedToken = decodeToken(token);
    const currentTime = Date.now() / 1000;
    
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.warn("Token has expired");
      removeToken();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
};

export const decodeToken = (token) => {
  try {
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
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.warn("Token has expired");
      removeToken();
      return null;
    }
    
    const { exp, iat, nbf, jti, ...userData } = decodedToken;
    return userData;
  } catch (error) {
    console.error("Error extracting user from token:", error);
    return null;
  }
};

export const hasRole = (role) => {
  const user = getUserFromToken();
  if (!user || !user.role) return false;
  
  if (Array.isArray(user.role)) {
    return user.role.includes(role);
  }
  
  return user.role === role;
};

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