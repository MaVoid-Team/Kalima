import axios from "axios"
import { getToken } from "./auth-services"

const API_URL = import.meta.env.VITE_API_URL;

// Function to get all sections (categories)
export const getAllSections = async (queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/sections`, {
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
    const response = await axios.get(`${API_URL}/books`, {
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
    const response = await axios.get(`${API_URL}/products`, {
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

// Function to get a book by ID
export const getBookById = async (bookId) => {
  try {
    const response = await axios.get(`${API_URL}/books/${bookId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching book by ID: ${error.message}`)
    throw error
  }
}

// Function to get a product by ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching product by ID: ${error.message}`)
    throw error
  }
}

// Function to get books by section
export const getBooksBySection = async (sectionId, queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/books`, {
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
    const response = await axios.get(`${API_URL}/sections/${sectionId}/products`, {
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
export const createSection = async (sectionData) => {
  try {
    const response = await axios.post(`${API_URL}/sections`, sectionData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error creating section: ${error.message}`)
    throw error
  }
}

// Function to update a section
export const updateSection = async (sectionId, updateData) => {
  try {
    const response = await axios.patch(`${API_URL}/sections/${sectionId}`, updateData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error updating section: ${error.message}`)
    throw error
  }
}

// Function to delete a section
export const deleteSection = async (sectionId) => {
  try {
    const response = await axios.delete(`${API_URL}/sections/${sectionId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error deleting section: ${error.message}`)
    throw error
  }
}
export const createProduct = async (productData) => {
  try {
    const formData = new FormData()
    
    // Append all the form fields
    formData.append('title', productData.title)
    formData.append('serial', productData.serial)
    formData.append('section', productData.section)
    formData.append('price', productData.price)
    formData.append('discountPercentage', productData.discountPercentage)
    formData.append('paymentNumber', productData.paymentNumber)
    
    // Append files if they exist
    if (productData.thumbnail) {
      formData.append('thumbnail', productData.thumbnail)
    }
    if (productData.sample) {
      formData.append('sample', productData.sample)
    }

    const response = await axios.post(`${API_URL}/products`, formData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error creating product: ${error.message}`)
    throw error
  }
}
