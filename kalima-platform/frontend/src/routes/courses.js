import axios from "axios";

// Base URL from environment variable
const API_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

// Configure axios with auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all subjects/courses
export const getAllSubjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/subjects/`, {
      headers: getAuthHeader()
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch subjects'
    };
  }
};

// Get a specific subject by ID
export const getSubjectById = async (subjectId) => {
  try {
    const response = await axios.get(`${API_URL}/subjects/${subjectId}`, {
      headers: getAuthHeader()
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch subject'
    };
  }
};

// Additional course-related API functions can be added here
