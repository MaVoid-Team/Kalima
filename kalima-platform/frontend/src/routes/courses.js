import axios from "axios"

const API_URL = process.env.REACT_APP_BASE_URL

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getAllSubjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/subjects/`, {
      headers: getAuthHeader(),
    })

    return {
      success: true,
      data: response.data.data.subjects, // Access the subjects array from the response
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch subjects",
    }
  }
}

export const getSubjectById = async (subjectId) => {
  try {
    const response = await axios.get(`${API_URL}/subjects/${subjectId}`, {
      headers: getAuthHeader(),
    })

    return {
      success: true,
      data: response.data.data, // Access the data property from the response
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch subject",
    }
  }
}

export const getLecturesBySubject = async (subjectId) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/lectures?subject=${subjectId}`, {
      headers: getAuthHeader(),
    })
    return {
      success: true,
      data: response.data.data.lectures // Adjust based on your API response
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch lectures"
    }
  }
}