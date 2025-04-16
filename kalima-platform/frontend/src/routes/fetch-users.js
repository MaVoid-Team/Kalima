import axios from "axios";

const API_URL = process.env.REACT_APP_BASE_URL

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/`, {
      headers: getAuthHeader(),
    });

    // Return the data directly since your component expects it in this format
    return {
      success: true,
      data: response.data, // This assumes your API returns the array directly
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch users",
    };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch user",
    };
  }
};

export const getToken = () => {
  return localStorage.getItem("accessToken");
};

// Helper function to check if user is logged in
export const isLoggedIn = () => {
  return !!getToken();
};

// Helper function to logout user
export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  // You can add additional cleanup here if needed
};