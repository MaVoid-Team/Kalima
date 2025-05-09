import axios from "axios";
import { getToken } from "./auth-services"; // Adjust the path based on your project structure
import { getAuthHeader } from "./fetch-users"; // Adjust the path based on your project structure

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches student submissions for a specific lecture
 * @param {string} lectureId - The ID of the lecture
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>} 
 *          - On success: { success: true, data: response.data }
 *          - On failure: { success: false, error: errorMessage }
 */
export const getStudentSubmissionsByLectureId = async (lectureId) => {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        error: "Authentication token not found. Please log in again.",
      };
    }

    const response = await axios.get(`${API_URL}/assistant-homework/lecture/${lectureId}`, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch student submissions",
    };
  }
};