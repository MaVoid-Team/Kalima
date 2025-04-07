import axios from "axios"

// Base URL for API requests
const API_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

// Function to get all containers
export const getAllContainers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/containers`, {withCredentials: true})
    return response.data
  } catch (error) {
    console.error("Error fetching containers:", error)
    throw error
  }
}

// Function to get a container by ID
export const getContainerById = async (containerId) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/containers/${containerId}`, {withCredentials: true})
    return response.data
  } catch (error) {
    console.error(`Error fetching container with ID ${containerId}:`, error)
    throw error
  }
}