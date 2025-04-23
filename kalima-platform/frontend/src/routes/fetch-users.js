import axios from "axios";

const API_URL = process.env.REACT_APP_BASE_URL

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
// --------START FETCHING USERS--------
export const getAllStudents = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/role/student`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch students",
    };
  }
};

export const getAllParents = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/role/parent`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch parents",
    };
  }
};

export const getAllAssistants = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/role/assistant`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch assistants",
    };
  }
};

export const getAllLecturers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/role/lecturer`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch lecturers",
    };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch user",
    };
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/`, {
      headers: getAuthHeader(),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch users",
    };
  }
};
// --------END FETCHING USERS--------

// --------START CREATE USER--------
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/`, userData, {
      headers: getAuthHeader(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create user",
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
    return {
      success: false,
      error: error.response?.data?.message || "Failed to bulk create users",
    };
  }
};

// --------END CREATE USER--------

// --------START DELETE USER--------
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: getAuthHeader(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete user",
    };
  }
};
// --------END DELETE USER--------