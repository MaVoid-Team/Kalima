import axios from "axios"

// Base URL for API requests
const API_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000"; // Replace with your actual API base URL

// Function to get all lectures
export const getAllLectures = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/lectures`)
    return response.data
  } catch (error) {
    console.error("Error fetching lectures:", error)
    throw error
  }
}

// Function to get a lecture by ID
export const getLectureById = async (lectureId) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/lectures/${lectureId}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching lecture with ID ${lectureId}:`, error)
    throw error
  }
}

