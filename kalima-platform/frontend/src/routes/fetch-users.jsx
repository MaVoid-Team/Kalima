import axios from "axios";
import api from "../services/errorHandling";

const API_URL = import.meta.env.VITE_API_URL;

export const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
// --------START FETCHING USERS--------
export const getAllStudents = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/users/role/student`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return `Failed to fetch students: ${error.message}`
  }
};

export const getAllParents = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/users/role/parent`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return `Failed to fetch parents : ${error.message}`
  }
};

export const getAllAssistants = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/users/role/assistant`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return `Failed to fetch assistants: ${error.message}`
  }
};

export const getAllLecturers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/lecturers`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error("API Error:", error);
    return `Failed to fetch lecturers: ${error.message}`
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/users/${userId}`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return `Failed to fetch user : ${error.message}`
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/users/`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return `Failed to fetch users: ${error.message}`
  }
};
// --------END FETCHING USERS--------

// --------START CREATE USER--------
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/users/`, userData, {
      headers: getAuthHeader(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || error.response.data.error || `Failed to create user: ${error.message}`,
      };
    }
    return {
      success: false,
      error: `Failed to create user: ${error.message}`,
    };
  }
};

export const bulkCreateUsers = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/users/accounts/bulk-create`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return `Failed to bulk create users: ${error.message}`
  }
};

// --------END CREATE USER--------

// --------START DELETE USER--------
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/v1/users/${userId}`, {
      headers: getAuthHeader(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return `Failed to delete user: ${error.message}`
  }
};
// --------END DELETE USER--------