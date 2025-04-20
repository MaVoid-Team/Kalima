import axios from "axios";
import { getToken, isLoggedIn } from "./auth-services";

// Base URL for API requests
const API_URL = process.env.REACT_APP_BASE_URL;

// Function to get all audit logs with pagination
export const getAuditLogs = async (page = 1, limit = 10, filters = {}) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("User not authenticated");
    }

    // Build query parameters
    let queryParams = `page=${page}&limit=${limit}`;
    
    // Add any additional filters if provided
    if (filters.userId) queryParams += `&userId=${filters.userId}`;
    if (filters.role) queryParams += `&role=${filters.role}`;
    if (filters.action) queryParams += `&action=${filters.action}`;
    if (filters.resourceType) queryParams += `&resourceType=${filters.resourceType}`;
    if (filters.status) queryParams += `&status=${filters.status}`;
    if (filters.startDate) queryParams += `&startDate=${filters.startDate}`;
    if (filters.endDate) queryParams += `&endDate=${filters.endDate}`;

    const response = await axios.get(`${API_URL}/api/v1/audit-logs?${queryParams}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return {
      status: "success",
      data: response.data
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return {
      status: "error",
      error: error.response?.data?.message || "Failed to fetch audit logs"
    };
  }
};

// Function to get audit log by ID
export const getAuditLogById = async (logId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("User not authenticated");
    }

    const response = await axios.get(`${API_URL}/api/v1/audit-logs/${logId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return {
      status: "success",
      data: response.data
    };
  } catch (error) {
    console.error(`Error fetching audit log ${logId}:`, error);
    return {
      status: "error",
      error: error.response?.data?.message || "Failed to fetch audit log"
    };
  }
};