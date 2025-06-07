import axios from "axios"
import { getToken } from "./auth-services"

const API_URL = import.meta.env.VITE_API_URL;

// Function to get all sections (categories)
export const getAllSections = async (queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/sections`, {
      params: queryParams,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching sections: ${error.message}`);
    throw error;
  }
};

// Function to get all books
export const getAllBooks = async (queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/books`, {
      params: queryParams,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching books: ${error.message}`);
    throw error;
  }
};

// Function to get all products
export const getAllProducts = async (queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/products`, {
      params: queryParams,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching products: ${error.message}`);
    throw error;
  }
};

// Function to get books by section
export const getBooksBySection = async (sectionId, queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/books`, {
      params: { section: sectionId, ...queryParams },
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by section: ${error.message}`);
    throw error;
  }
};

export const getProductsBySection = async (sectionId, queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/sections/${sectionId}/products`, {
      params: queryParams,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching products by section: ${error.message}`)
    throw error
  }
}
