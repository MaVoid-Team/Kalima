import axios from "axios"
import api from "../services/errorHandling";
const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getAllSubjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/subjects/`, {
      headers: getAuthHeader(),
      withCredentials: true,
    });

    return {
      success: true,
      data: response.data.data, // This will contain the subjects array
    };
  } catch (error) {
    return `Failed to fetch subjects: ${error.message}`
  }
};

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
    return `Failed to fetch subject: ${error.message}`
  }
}

export const getLecturesBySubject = async (subjectId) => {
  try {
    const response = await axios.get(`${API_URL}/lectures?subject=${subjectId}`, {
      headers: getAuthHeader(),
    })
    return {
      success: true,
      data: response.data.data.lectures // Adjust based on your API response
    }
  } catch (error) {
    return `Failed to fetch lectures : ${error.message}`
  }
}