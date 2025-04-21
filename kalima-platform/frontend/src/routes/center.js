// src/routes/center.js
import axios from "axios";
import { getToken } from "../routes/auth-services";

// Use the correct API URL format
const API_URL = process.env.REACT_APP_BASE_URL || ""; 

export const getCenterTimetable = async (centerId) => {
  try {
    if (!centerId) {
      throw new Error("Center ID is required");
    }

    const token = getToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await axios.get(`${API_URL}/api/v1/centers/${centerId}/timetable`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
    });

    // Check if the response has the expected structure
    if (response.data && response.data.status === "success" && response.data.data) {
      return {
        status: "success",
        data: response.data.data
      };
    } else {
      console.error("Unexpected API response structure:", response.data);
      return {
        status: "error",
        message: "Unexpected API response structure"
      };
    }
  } catch (error) {
    console.error("Error fetching center timetable:", error);
    return {
      status: "error",
      message: error.response?.data?.message || error.message || "Failed to fetch timetable"
    };
  }
};