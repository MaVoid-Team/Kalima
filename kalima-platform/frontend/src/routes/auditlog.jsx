import axios from "axios";
import { getToken, isLoggedIn } from "./auth-services";
import api from "../services/errorHandling";

const API_URL = import.meta.env.VITE_API_URL;

export const getAuditLogs = async (page = 1, limit = 10, filters = {}) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("User not authenticated");
    }

    // Corrected params with proper syntax
    const transformedFilters = {
      user: filters.user,
      role: filters.role,
      action: filters.action,
      resource_type: filters.resource_type,
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate
    };

    const params = {
      page,
      limit,
      ...Object.fromEntries(
        Object.entries(transformedFilters).filter(([_, v]) => v !== "")
      )
    };

    const token = getToken();
    const response = await axios.get(`${API_URL}/audit-logs`, {
      params,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      status: "success",
      data: response.data.data
    };
  } catch (error) {
    return `error: ${error.message}`
  }
};
export const getAuditLogById = async (logId) => {
  try {
    if (!isLoggedIn()) {
      throw new Error("User not authenticated");
    }

    const response = await axios.get(`${API_URL}/audit-logs/${logId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    return {
      status: "success",
      data: response.data
    };
  } catch (error) {
    return `Error fetching audit log ${logId}: ${error.message}`
  }
};