import axios from "axios"
import { getToken, isLoggedIn } from "./auth-services"

// Base URL for API requests
const API_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000"

// Function to get all containers
export const getAllContainers = async () => {
  try {
    const response = await axios.get(`${API_URL}/containers`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })

    return response.data
  } catch (error) {
    console.error("Error fetching containers:", error)
    throw error
  }
}

// Function to get a container by ID
export const getContainerById = async (containerId) => {
  try {
    const response = await axios.get(`${API_URL}/containers/${containerId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching container with ID ${containerId}:`, error)
    throw error
  }
}

// Function to get all lectures
export const getAllLectures = async () => {
  try {
    if (!isLoggedIn()) {
      throw new Error("User not authenticated")
    }

    const response = await axios.get(`${API_URL}/lectures`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })

    return response.data
  } catch (error) {
    console.error("Error fetching lectures:", error)
    throw error
  }
}

// Function to get lectures by container ID
export const getLecturesByContainerId = async (containerId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("User not authenticated")
    }

    // First get the container to access its children array
    const containerResponse = await getContainerById(containerId)
    const childrenArray = containerResponse.data.container.children
    
    console.log("Children array:", childrenArray)
    
    if (!childrenArray || childrenArray.length === 0) {
      return { data: { lectures: [] } }
    }
    
    // Extract lecture IDs from the children array
    const lectureIds = childrenArray.map(child => child._id || child.id)
    console.log("Extracted lecture IDs:", lectureIds)
    
    // Get lectures directly from the children array
    // Since the children array already contains basic lecture info
    const lectures = childrenArray.map(child => ({
      _id: child._id || child.id,
      name: child.name,
      kind: child.kind || "Lecture", // Default to "Lecture" if kind is not provided
      // Add other properties that might be needed
      parent: containerId
    }))
    
    return { data: { lectures } }
  } catch (error) {
    console.error(`Error fetching lectures for container ${containerId}:`, error)
    throw error
  }
}

// Function to get a lecture by ID
export const getLectureById = async (lectureId) => {
  try {
    const response = await axios.get(`${API_URL}/lectures/${lectureId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching lecture with ID ${lectureId}:`, error)
    throw error
  }
}
