import axios from "axios"
import { getToken, isLoggedIn } from "./auth-services"

// Base URL for API requests
const API_URL = process.env.REACT_APP_BASE_URL

// Function to get all containers
export const getAllContainers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/containers`, {
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

// Function to get all containers
export const getAllContainersPublic = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/containers/public`, {
      withCredentials: true,

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
    const response = await axios.get(`${API_URL}/api/v1/containers/${containerId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })

    return response.data
  } catch (error) {
    console.error(`Error fetching container ${containerId}:`, error)
    throw error
  }
}

export const getMyContainers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/containers/my-containers`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })

    return response.data
  } catch (error) {
    console.error("Error fetching my containers:", error)
    throw error
  }
}

// Function to get all lectures
export const getAllLectures = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/lectures`, {withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },});
    return response.data;
  } catch (error) {
    console.error("Error fetching lectures:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch lectures",
    };
  }
};

export const getContainersByLecturerId = async (lecturerId) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/containers/lecturer/${lecturerId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching containers for lecturer ${lecturerId}:`, error);
    throw error;
  }
};

// Function to get lectures by container ID
export const getLecturesByContainerId = async (containerId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("User not authenticated")
    }

    const containerResponse = await getContainerById(containerId)
    const containerData = containerResponse.data
    const childrenArray = containerData?.children || containerData?.container?.children || []

    console.log("Children array:", childrenArray)

    if (!childrenArray.length) {
      return { data: { lectures: [] } }
    }

    const lectures = childrenArray.map(child => ({
      _id: child._id || child.id,
      name: child.name,
      kind: child.kind || "Lecture",
      parent: containerId,
      price: child.price || 0,
      description: child.description || "",
      numberOfViews: child.numberOfViews || 0,
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
    const response = await axios.get(`${API_URL}/api/v1/lectures/${lectureId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })

    return {
      success: true,
      data: response.data.data, // Access the data property from the response
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch lecture",
    }
  }
}
