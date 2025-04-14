import  axios  from "axios";
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
  }