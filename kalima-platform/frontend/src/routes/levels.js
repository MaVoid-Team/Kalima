import axios from "axios"

const API_URL = process.env.REACT_APP_BASE_URL

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}



export const getAllLevels = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/levels/`, {
        headers: getAuthHeader(),
      })
  
      return {
        success: true,
        data: response.data.data.levels, // Access the subjects array from the response
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch subjects",
      }
    }
  }