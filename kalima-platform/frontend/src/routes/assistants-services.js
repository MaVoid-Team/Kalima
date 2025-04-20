import  axios  from "axios";
import { getToken, isLoggedIn } from "../routes/auth-services";
const API_URL = process.env.REACT_APP_BASE_URL
export const AssistantService = {
    // Fetch all assistants
    getAssistants: async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/assistants/`)
  
        if (response.data.status === "success") {
          return {
            success: true,
            data: response.data.data,
          }
        } else {
          return {
            success: false,
            error: "Failed to fetch assistants",
          }
        }
      } catch (error) {
        return {
          success: false,
          error: error.message || "An error occurred while fetching assistants",
        }
      }
    },

    getMyData: async () => {
      try {
        if (!isLoggedIn()) throw new Error("User not authenticated");
        
        const response = await axios.get(`${API_URL}/api/v1/users/me/dashboard`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        
        return {
          success: true,
          data: response.data.data.userInfo
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || "Failed to fetch user data"
        };
      }
    },
  
    getAssistantsByLecturer: async (lecturerId) => {
      try {
        if (!isLoggedIn()) throw new Error("User not authenticated");
  
        const response = await axios.get(
          `${API_URL}/api/v1/assistants/lecturer/${lecturerId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
  
        return {
          success: true,
          data: response.data.data.assistants
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || "Failed to fetch assistants"
        };
      }
    }
  };