import axios from "axios";
import api from "../services/errorHandling";
const API_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllLevels = async () => {
  try {
    const response = await api.get(`${API_URL}/api/v1/levels/`, {
      headers: getAuthHeader(),
      withCredentials: true,
    });

    return {
      success: true,
      data: response.data.data, // This will contain the levels array
    };
  } catch (error) {
    return `Error fetching levels: ${error.message}`
  }
};