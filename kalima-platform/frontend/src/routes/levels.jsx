import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllLevels = async () => {
  try {
    const response = await axios.get(`${API_URL}/levels/`, {
      headers: getAuthHeader(),
      withCredentials: true,
    });

    return {
      success: true,
      data: response.data.data, // This will contain the levels array
    };
  } catch (error) {
    console.error("Error fetching levels:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch levels",
    };
  }
};
