import axios from "axios";
import { getToken } from "./auth-services";
import api from "../services/errorHandling";

// Use the correct API URL format
const API_URL = import.meta.env.VITE_API_URL;

export const getAllCenters = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await api.get(`${API_URL}/api/v1/centers/`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Check if the response has the expected structure
    if (response.data && response.data.status === "success") {
      return {
        status: "success",
        data: response.data
      };
    } else {
      console.error("Unexpected API response structure:", response.data);
      return {
        status: "error",
        message: "Unexpected API response structure"
      };
    }
  } catch (error) {
    return `Failed to fetch centers: ${error.message}`
  }
};

// New function to get center data by type
export const getCenterDataByType = async (centerId, type) => {
  try {
    if (!centerId) {
      throw new Error("Center ID is required");
    }
    
    if (!type || !["lecturers", "students", "lessons"].includes(type)) {
      throw new Error("Valid type is required (lecturers, students, or lessons)");
    }

    const token = getToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await api.get(`${API_URL}/api/v1/centers/${centerId}/${type}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Check if the response has the expected structure
    if (response.data && response.data.status === "success") {
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
    return `Failed to fetch ${type} : ${error.message}`
  }
};

// Keep this function for backward compatibility if needed
export const getCenterTimetable = async (centerId) => {
  try {
    if (!centerId) {
      throw new Error("Center ID is required");
    }

    const token = getToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await api.get(`${API_URL}/api/v1/centers/${centerId}/timetable`, {
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
    return `Failed to fetch timetable:${error.message}`
  }
};

export const addNewLesson = async (lessonData) => {
  try {
    if (!lessonData) {
      throw new Error("Lesson data is required");
    }

    // Validate required fields
    const requiredFields = ['subject', 'lecturer', 'level', 'startTime', 'duration', 'centerId'];
    for (const field of requiredFields) {
      if (!lessonData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    const token = getToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Format date to YYYY-MM-DD if it's a Date object
    let formattedData = { ...lessonData };
    if (formattedData.startTime instanceof Date) {
      formattedData.startTime = formattedData.startTime.toISOString().split('T')[0];
    }

    // Ensure duration is a number
    formattedData.duration = parseInt(formattedData.duration);

    const response = await api.post(
      `${API_URL}/api/v1/centers/lessons`,
      formattedData,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the response has the expected structure
    if (response.data && response.data.status === "success") {
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
    return `Failed to add new lesson:${error.message}`
  }
};