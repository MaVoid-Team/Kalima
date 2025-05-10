import axios from "axios"
import { getToken } from "./auth-services"

/**
 * Get all student lecture accesses for a specific lecture
 * @param {string} lectureId - The ID of the lecture
 * @param {number} limit - The maximum number of records to return
 * @returns {Promise<Object>} - The response data
 */
export const getAllStudentLectureAccess = async (lectureId, limit = 100) => {
  try {
    if (!lectureId) {
      throw new Error("Lecture ID is required")
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/student-lecture-access`,
      {
        params: {
          lecture: lectureId,
          limit
        },
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    )

    return {
      success: true,
      data: response.data.data,
      results: response.data.results,
      status: response.data.status
    }
  } catch (error) {
    console.error("Error fetching student lecture access:", error)
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch student lecture access",
    }
  }
}

/**
 * Get student lecture access by lecture ID
 * @param {string} lectureId - The ID of the lecture
 * @returns {Promise<Object>} - The response data
 */
export const getStudentLectureAccessByLectureId = async (lectureId) => {
  try {
    if (!lectureId) {
      throw new Error("Lecture ID is required")
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/student-lecture-access/lecture/${lectureId}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      },
    )

    return {
      success: response.data.status === "success",
      data: response.data.data,
      status: response.data.status,
      results: response.data.results,
    }
  } catch (error) {
    console.error("Error fetching student lecture access by lecture ID:", error)
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch student lecture access",
    }
  }
}

/**
 * Update student lecture access
 * @param {string} accessId - The ID of the access record
 * @param {Object} data - The data to update
 * @returns {Promise<Object>} - The response data
 */
export const updateStudentLectureAccess = async (accessId, data) => {
  try {
    if (!accessId) {
      throw new Error("Access ID is required")
    }

    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/v1/student-lecture-access/${accessId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      },
    )

    return {
      success: response.data.success,
      data: response.data.data,
    }
  } catch (error) {
    console.error("Error updating student lecture access:", error)
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to update student lecture access",
    }
  }
}
