import axios from "axios";
import { jwtDecode } from "jwt-decode";
import api from "../services/errorHandling";

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "accessToken";
const REFRESH_THRESHOLD_SECONDS = 300; // 5 minutes before expiry
const CHECK_INTERVAL_MS = 60000; // Check every 60 seconds

// Create a dedicated axios instance for refresh token requests
const refreshAxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];
let refreshInterval = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor for refresh token requests only
refreshAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url === `${API_URL}/auth/refresh`
    ) {
      clearAuthData();
      processQueue(new Error("Token refresh failed"));
      return Promise.reject(new Error("Token refresh failed"));
    }
    return Promise.reject(error);
  }
);

// Start periodic token refresh check
const startTokenRefreshCheck = () => {
  if (refreshInterval) return; // Prevent multiple intervals
  refreshInterval = setInterval(async () => {
    if (isLoggedIn()) {
      const token = getToken();
      if (token && isTokenNearExpiry(token)) {
        await refreshToken();
      }
    } else {
      stopTokenRefreshCheck();
    }
  }, CHECK_INTERVAL_MS);
};

// Stop periodic token refresh check
const stopTokenRefreshCheck = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Check if token is near expiry
const isTokenNearExpiry = (token) => {
  try {
    const decodedToken = decodeToken(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp && decodedToken.exp - currentTime < REFRESH_THRESHOLD_SECONDS;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return false;
  }
};

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
    // return {
    //   success: false,
    //   status: error.response?.status,
    //   error: error.response?.data?.message || error.message || "Registration failed",
    //   details: error.response?.data,
    // };
    return `Registration failed: ${error.message}`
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth`, credentials, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.accessToken) {
      setToken(response.data.accessToken);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      startTokenRefreshCheck(); // Start periodic refresh after login
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
    // if (error.response) {
    //   return {
    //     success: false,
    //     status: error.response.status,
    //     error: error.response.data?.message || "Login failed",
    //     details: error.response.data,
    //   };
    // } else if (error.request) {
    //   return {
    //     success: false,
    //     error: "No response from server. Please check your internet connection.",
    //   };
    // } else {
    //   return {
    //     success: false,
    //     error: "An error occurred during login. Please try again.",
    //   };
    // }
    return `Login failed: ${error.message}`
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/password-reset/request`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(
      `${API_URL}/password-reset/verify-otp`,
      { email, otp },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (resetToken, password, confirmPassword) => {
  try {
    const response = await axios.post(
      `${API_URL}/password-reset/reset`,
      { resetToken, password, confirmPassword },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
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
    stopTokenRefreshCheck(); // Stop periodic refresh on logout
    return { success: true };
  } catch (error) {
    clearAuthData();
    stopTokenRefreshCheck(); // Stop periodic refresh on logout
    return {
      success: false,
      error: "Logout failed on server, but local session was cleared",
    };
  }
};

// --- TOKEN REFRESH ---

export const refreshToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const token = getToken();
    if (!token) {
      isRefreshing = false;
      processQueue(new Error("No token available"));
      return { success: false, error: "No token available" };
    }
    const response = await refreshAxiosInstance.post(
      `${API_URL}/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.accessToken) {
      setToken(response.data.accessToken);
      processQueue(null, response.data.accessToken);
      isRefreshing = false;
      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    } else {
      clearAuthData();
      processQueue(new Error("Refresh failed: No access token received"));
      isRefreshing = false;
      return {
        success: false,
        error: "Refresh failed: No access token received",
      };
    }
  } catch (error) {
    clearAuthData();
    processQueue(error);
    isRefreshing = false;
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || "Token refresh failed",
      details: error.response?.data,
    };
  }
};

// --- USER DATA API CALLS ---

export const getUserDashboard = async ({ params = {} } = {}) => {
  const defaultParams = { page: 1, limit: 200 };
  const finalParams = { ...defaultParams, ...params };

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
      params: finalParams,
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            return axios.get(`${API_URL}/users/me/dashboard`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
              params: finalParams,
            }).then((response) => ({
              success: true,
              data: response.data,
              status: response.status,
              headers: response.headers,
            }));
          })
          .catch((err) => ({
            success: false,
            error: err.message || "Failed to fetch dashboard data after token refresh",
          }));
      }

      isRefreshing = true;
      try {
        const refreshResult = await refreshToken();
        if (refreshResult.success && refreshResult.data.accessToken) {
          processQueue(null, refreshResult.data.accessToken);
          const response = await axios.get(`${API_URL}/users/me/dashboard`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshResult.data.accessToken}`,
            },
            params: finalParams,
          });
          return {
            success: true,
            data: response.data,
            status: response.status,
            headers: response.headers,
          };
        } else {
          clearAuthData();
          processQueue(new Error("Token refresh failed"));
          return { success: false, error: "Token refresh failed" };
        }
      } catch (refreshError) {
        clearAuthData();
        processQueue(refreshError);
        return {
          success: false,
          error: "Token refresh failed",
        };
      } finally {
        isRefreshing = false;
      }
    }

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
    const response = await api.get(`${API_URL}${url}`, {
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
    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            return axios.get(`${API_URL}${url}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
              ...options,
            }).then((response) => ({
              success: true,
              data: response.data,
              status: response.status,
              headers: response.headers,
            }));
          })
          .catch((err) => ({
            success: false,
            error: err.message || "Request failed after token refresh",
          }));
      }

      isRefreshing = true;
      try {
        const refreshResult = await refreshToken();
        if (refreshResult.success && refreshResult.data.accessToken) {
          processQueue(null, refreshResult.data.accessToken);
          const response = await axios.get(`${API_URL}${url}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshResult.data.accessToken}`,
            },
            ...options,
          });
          return {
            success: true,
            data: response.data,
            status: response.status,
            headers: response.headers,
          };
        } else {
          clearAuthData();
          processQueue(new Error("Token refresh failed"));
          return { success: false, error: "Token refresh failed" };
        }
      } catch (refreshError) {
        clearAuthData();
        processQueue(refreshError);
        return {
          success: false,
          error: "Token refresh failed",
        };
      } finally {
        isRefreshing = false;
      }
    }

    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || error.message || "Request failed",
      details: error.response?.data,
    };
    return `Request failed: ${error.message}`
  }
};

export const postAuthenticatedRequest = async (url, data = {}, options = {}) => {
  try {
    const token = getToken();
    const response = await api.post(`${API_URL}${url}`, data, {
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
    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            return axios.post(`${API_URL}${url}`, data, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
              ...options,
            }).then((response) => ({
              success: true,
              data: response.data,
              status: response.status,
              headers: response.headers,
            }));
          })
          .catch((err) => ({
            success: false,
            error: err.message || "Request failed after token refresh",
          }));
      }

      isRefreshing = true;
      try {
        const refreshResult = await refreshToken();
        if (refreshResult.success && refreshResult.data.accessToken) {
          processQueue(null, refreshResult.data.accessToken);
          const response = await axios.post(`${API_URL}${url}`, data, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshResult.data.accessToken}`,
            },
            ...options,
          });
          return {
            success: true,
            data: response.data,
            status: response.status,
            headers: response.headers,
          };
        } else {
          clearAuthData();
          processQueue(new Error("Token refresh failed"));
          return { success: false, error: "Token refresh failed" };
        }
      } catch (refreshError) {
        clearAuthData();
        processQueue(refreshError);
        return {
          success: false,
          error: "Token refresh failed",
        };
      } finally {
        isRefreshing = false;
      }
    }

    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || error.message || "Request failed",
      details: error.response?.data,
    };
    return `Request failed: ${error.message}`
  }
};

export const putAuthenticatedRequest = async (url, data = {}, options = {}) => {
  try {
    const token = getToken();
    const response = await api.put(`${API_URL}${url}`, data, {
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
    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            return axios.put(`${API_URL}${url}`, data, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
              ...options,
            }).then((response) => ({
              success: true,
              data: response.data,
              status: response.status,
              headers: response.headers,
            }));
          })
          .catch((err) => ({
            success: false,
            error: err.message || "Request failed after token refresh",
          }));
      }

      isRefreshing = true;
      try {
        const refreshResult = await refreshToken();
        if (refreshResult.success && refreshResult.data.accessToken) {
          processQueue(null, refreshResult.data.accessToken);
          const response = await axios.put(`${API_URL}${url}`, data, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshResult.data.accessToken}`,
            },
            ...options,
          });
          return {
            success: true,
            data: response.data,
            status: response.status,
            headers: response.headers,
          };
        } else {
          clearAuthData();
          processQueue(new Error("Token refresh failed"));
          return { success: false, error: "Token refresh failed" };
        }
      } catch (refreshError) {
        clearAuthData();
        processQueue(refreshError);
        return {
          success: false,
          error: "Token refresh failed",
        };
      } finally {
        isRefreshing = false;
      }
    }

    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || error.message || "Request failed",
      details: error.response?.data,
    };
    return `Request failed: ${error.message}`
  }
};

export const deleteAuthenticatedRequest = async (url, options = {}) => {
  try {
    const token = getToken();
    const response = await api.delete(`${API_URL}${url}`, {
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
    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            return axios.delete(`${API_URL}${url}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
              ...options,
            }).then((response) => ({
              success: true,
              data: response.data,
              status: response.status,
              headers: response.headers,
            }));
          })
          .catch((err) => ({
            success: false,
            error: err.message || "Request failed after token refresh",
          }));
      }

      isRefreshing = true;
      try {
        const refreshResult = await refreshToken();
        if (refreshResult.success && refreshResult.data.accessToken) {
          processQueue(null, refreshResult.data.accessToken);
          const response = await axios.delete(`${API_URL}${url}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshResult.data.accessToken}`,
            },
            ...options,
          });
          return {
            success: true,
            data: response.data,
            status: response.status,
            headers: response.headers,
          };
        } else {
          clearAuthData();
          processQueue(new Error("Token refresh failed"));
          return { success: false, error: "Token refresh failed" };
        }
      } catch (refreshError) {
        clearAuthData();
        processQueue(refreshError);
        return {
          success: false,
          error: "Token refresh failed",
        };
      } finally {
        isRefreshing = false;
      }
    }

    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || error.message || "Request failed",
      details: error.response?.data,
    };
    return `Request failed: ${error.message}`
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
  stopTokenRefreshCheck(); // Stop periodic refresh when clearing auth data
};

export const isLoggedIn = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decodedToken = decodeToken(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.warn("Token has expired");
      clearAuthData();
      return false;
    }

    // Proactively refresh token if near expiry
    if (isTokenNearExpiry(token)) {
      const refreshResult = await refreshToken();
      if (!refreshResult.success) {
        clearAuthData();
        return false;
      }
    }

    return true;
  } catch (error) {
    clearAuthData()
    return `Error checking token validity: ${error.message}`
  }
};

export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return `Error decoding token: ${error.message}`
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
      return null;
    }

    const { exp, iat, nbf, jti, ...userData } = decodedToken;
    return userData;
  } catch (error) {
    return `Error extracting user from token: ${error.message}`
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
    console.log("Is Near Expiry:", isTokenNearExpiry(token));
  }
  console.log("Is Logged In:", isLoggedInStatus);
  console.log("User Data:", user);
  console.groupEnd();

  return {
    hasToken: !!token,
    isLoggedIn: isLoggedInStatus,
    userData: user,
  };
};