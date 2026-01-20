import axios from 'axios';
import { getToken } from './auth-services';

const API_URL = import.meta.env.VITE_API_URL;

// Helper: generate a safe filename for uploads (preserve extension if present)
const generateSafeFilename = (file) => {
  if (!file || !file.name) return `${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
  try {
    const orig = file.name;
    // Extract extension if present
    const m = orig.match(/\.([0-9a-zA-Z]+)(?:\?.*)?$/);
    const ext = m ? m[1] : '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `${timestamp}-${rand}${ext ? `.${ext}` : ''}`;
  } catch (e) {
    return `${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
  }
};

// Function to get all sections (categories)
export const getAllSections = async (queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ec/sections`, {
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

// Function to get all books with pagination support
export const getAllBooks = async (queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ec/books`, {
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

// Function to get all products with pagination support
export const getAllProducts = async (queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ec/products`, {
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
    const response = await axios.get(`${API_URL}/ec/books/${bookId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching book by ID: ${error.message}`);
    throw error;
  }
};

// Function to get a product by ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/ec/products/${productId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching product by ID: ${error.message}`);
    throw error;
  }
};

// Function to get books by section
export const getBooksBySection = async (sectionId, queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ec/books`, {
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
    const response = await axios.get(`${API_URL}/ec/sections/${sectionId}/products`, {
      params: queryParams,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching products by section: ${error.message}`);
    throw error;
  }
};

export const createSection = async (sectionData) => {
  try {
    const response = await axios.post(`${API_URL}/ec/sections`, sectionData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error creating section: ${error.message}`);
    throw error;
  }
};

// Function to update a section
export const updateSection = async (sectionId, updateData) => {
  try {
    const response = await axios.patch(`${API_URL}/ec/sections/${sectionId}`, updateData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating section: ${error.message}`);
    throw error;
  }
};

// Function to delete a section
export const deleteSection = async (sectionId) => {
  try {
    const response = await axios.delete(`${API_URL}/ec/sections/${sectionId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting section: ${error.message}`);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    // Validate required fields including subSection
    if (!productData.subSection || productData.subSection === '' || productData.subSection === 'undefined') {
      console.error('❌ DEBUG createProduct - SubSection validation failed!');
      throw new Error('SubSection is required. Please select a subsection before creating the product.');
    }

    const formData = new FormData();

    // Append all the required form fields
    formData.append('title', productData.title);
    formData.append('serial', productData.serial);
    formData.append('section', productData.section);

    formData.append('subSection', productData.subSection);

    formData.append('price', productData.price);
    formData.append('priceAfterDiscount', productData.priceAfterDiscount || '0');
    formData.append('paymentNumber', productData.paymentNumber);

    // NEW REQUIRED FIELDS
    formData.append('whatsAppNumber', productData.whatsAppNumber);
    formData.append('description', productData.description);

    // Append files if they exist
    if (productData.thumbnail) {
      const safeThumb = generateSafeFilename(productData.thumbnail);
      console.log('[createProduct] Appending thumbnail:', productData.thumbnail.name, '=>', safeThumb);
      formData.append('thumbnail', productData.thumbnail, safeThumb);
    }
    if (productData.sample) {
      const safeSample = generateSafeFilename(productData.sample);
      console.log('[createProduct] Appending sample:', productData.sample.name, '=>', safeSample);
      formData.append('sample', productData.sample, safeSample);
    }

    // Handle gallery files (multiple files)
    if (productData.gallery && productData.gallery.length > 0) {
      // If gallery is a FileList or array of files
      for (let i = 0; i < productData.gallery.length; i++) {
        const safeGallery = generateSafeFilename(productData.gallery[i]);
        console.log(`[createProduct] Appending gallery[${i}]:`, productData.gallery[i].name, '=>', safeGallery);
        formData.append('gallery', productData.gallery[i], safeGallery);
      }
    }

    const response = await axios.post(`${API_URL}/ec/products`, formData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error creating product: ${error.message}`);
    throw error;
  }
};

export const createBook = async (bookData) => {
  try {
    // Validate required fields including subSection
    if (!bookData.subSection || bookData.subSection === '' || bookData.subSection === 'undefined') {
      console.error('❌ DEBUG createBook - SubSection validation failed!');
      throw new Error('SubSection is required. Please select a subsection before creating the book.');
    }

    const formData = new FormData();

    // Append all the form fields
    formData.append('title', bookData.title);
    formData.append('serial', bookData.serial);
    formData.append('section', bookData.section);

    formData.append('subSection', bookData.subSection);

    formData.append('price', bookData.price);
    formData.append('priceAfterDiscount', bookData.priceAfterDiscount || '0');
    formData.append('subject', bookData.subject);
    formData.append('paymentNumber', bookData.paymentNumber);
    formData.append('description', bookData.description);
    formData.append('whatsAppNumber', bookData.whatsAppNumber);

    // Append files if they exist
    if (bookData.thumbnail) {
      const safeThumb = generateSafeFilename(bookData.thumbnail);
      console.log('[createBook] Appending thumbnail:', bookData.thumbnail.name, '=>', safeThumb);
      formData.append('thumbnail', bookData.thumbnail, safeThumb);
    }
    if (bookData.sample) {
      const safeSample = generateSafeFilename(bookData.sample);
      console.log('[createBook] Appending sample:', bookData.sample.name, '=>', safeSample);
      formData.append('sample', bookData.sample, safeSample);
    }
    if (bookData.gallery && bookData.gallery.length > 0) {
      // If gallery is a FileList or array of files
      for (let i = 0; i < bookData.gallery.length; i++) {
        const safeGallery = generateSafeFilename(bookData.gallery[i]);
        console.log(`[createBook] Appending gallery[${i}]:`, bookData.gallery[i].name, '=>', safeGallery);
        formData.append('gallery', bookData.gallery[i], safeGallery);
      }
    }

    const response = await axios.post(`${API_URL}/ec/books`, formData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error creating book: ${error.message}`);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const formData = new FormData();

    // Append all the form fields that are provided
    if (productData.title !== undefined) formData.append('title', productData.title);
    if (productData.serial !== undefined) formData.append('serial', productData.serial);
    if (productData.section !== undefined) formData.append('section', productData.section);
    if (productData.subSection !== undefined) formData.append('subSection', productData.subSection);
    if (productData.price !== undefined) formData.append('price', productData.price);
    if (productData.priceAfterDiscount !== undefined)
      formData.append('priceAfterDiscount', productData.priceAfterDiscount);
    if (productData.paymentNumber !== undefined) formData.append('paymentNumber', productData.paymentNumber);
    if (productData.whatsAppNumber !== undefined) formData.append('whatsAppNumber', productData.whatsAppNumber);
    if (productData.subject !== undefined) formData.append('subject', productData.subject);
    if (productData.description !== undefined) formData.append('description', productData.description);

    // Append files if they exist
    if (productData.thumbnail) {
      const safeThumb = generateSafeFilename(productData.thumbnail);
      console.log('[updateProduct] Appending thumbnail:', productData.thumbnail.name, '=>', safeThumb);
      formData.append('thumbnail', productData.thumbnail, safeThumb);
    }
    if (productData.sample) {
      const safeSample = generateSafeFilename(productData.sample);
      console.log('[updateProduct] Appending sample:', productData.sample.name, '=>', safeSample);
      formData.append('sample', productData.sample, safeSample);
    }

    const response = await axios.patch(`${API_URL}/ec/products/${productId}`, formData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating product: ${error.message}`);
    throw error;
  }
};

// Function to delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`${API_URL}/ec/products/${productId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting product: ${error.message}`);
    throw error;
  }
};

export const purchaseProduct = async (purchaseData) => {
  try {
    const formData = new FormData();
    formData.append('productId', purchaseData.productId);
    formData.append('numberTransferredFrom', purchaseData.numberTransferredFrom);

    if (purchaseData.paymentScreenShot) {
      const safePayment = generateSafeFilename(purchaseData.paymentScreenShot);
      console.log(
        '[purchaseProduct] Appending paymentScreenShot:',
        purchaseData.paymentScreenShot.name,
        '=>',
        safePayment
      );
      formData.append('paymentScreenShot', purchaseData.paymentScreenShot, safePayment);
    }

    if (purchaseData.notes) {
      formData.append('notes', purchaseData.notes);
    }

    if (purchaseData.couponCode) {
      formData.append('couponCode', purchaseData.couponCode);
    }

    const response = await axios.post(`${API_URL}/ec/purchases/`, formData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error purchasing product: ${error.message}`);
    throw error;
  }
};

// Function to purchase a book
export const purchaseBook = async (purchaseData) => {
  try {
    const formData = new FormData();

    formData.append('productId', purchaseData.productId);
    formData.append('numberTransferredFrom', purchaseData.numberTransferredFrom);
    if (purchaseData.paymentScreenShot) {
      const safePayment = generateSafeFilename(purchaseData.paymentScreenShot);
      console.log(
        '[purchaseBook] Appending paymentScreenShot:',
        purchaseData.paymentScreenShot.name,
        '=>',
        safePayment
      );
      formData.append('paymentScreenShot', purchaseData.paymentScreenShot, safePayment);
    }
    if (purchaseData.notes) {
      formData.append('notes', purchaseData.notes);
    }
    formData.append('nameOnBook', purchaseData.nameOnBook);
    formData.append('numberOnBook', purchaseData.numberOnBook);
    formData.append('seriesName', purchaseData.seriesName);

    if (purchaseData.couponCode) {
      formData.append('couponCode', purchaseData.couponCode);
    }

    const response = await axios.post(`${API_URL}/ec/book-purchases/`, formData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error purchasing book: ${error.message}`);
    throw error;
  }
};

export const RecalculateInvites = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/ec/referrals/recalculate`,
      {},
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error Calculating Invites: ${error.message}`);
    throw error;
  }
};

// Subsection functions

// Function to get all subsections
export const getAllSubSections = async (queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ec/subsections`, {
      params: queryParams,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching subsections: ${error.message}`);
    throw error;
  }
};

// Function to get subsections by section ID
export const getSubSectionsBySection = async (sectionId, queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ec/sections/${sectionId}/subsections`, {
      params: queryParams,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching subsections by section: ${error.message}`);
    throw error;
  }
};

// Function to get a single subsection with its products
export const getSubSectionById = async (subSectionId) => {
  try {
    const response = await axios.get(`${API_URL}/ec/subsections/${subSectionId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching subsection by ID: ${error.message}`);
    throw error;
  }
};

// Function to create a new subsection
export const createSubSection = async (subSectionData) => {
  try {
    const response = await axios.post(`${API_URL}/ec/subsections`, subSectionData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error creating subsection: ${error.message}`);
    throw error;
  }
};

// Function to update a subsection
export const updateSubSection = async (subSectionId, updateData) => {
  try {
    const response = await axios.patch(`${API_URL}/ec/subsections/${subSectionId}`, updateData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating subsection: ${error.message}`);
    throw error;
  }
};

// Function to delete a subsection
export const deleteSubSection = async (subSectionId) => {
  try {
    const response = await axios.delete(`${API_URL}/ec/subsections/${subSectionId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting subsection: ${error.message}`);
    throw error;
  }
};

export const createPaymentMethod = async (data) => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phoneNumber', data.phoneNumber);
    if (data.paymentMethodImg) {
      formData.append('paymentMethodImg', data.paymentMethodImg);
    }

    const response = await axios.post(
      `${API_URL}/api/v1/ec/payment-methods`,
      formData,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data
  } catch (error) {
    console.error(`Error creating payment method: ${error.message}`);
    throw error;
  }
};

export const getAllPaymentMethods = async (queryParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ec/payment-methods`, {
      params: queryParams,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment methods: ${error.message}`);
    throw error;
  }
};

export const getPaymentMethodById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/ec/payment-methods/${id}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment method by id: ${error.message}`);
    throw error;
  }
};

export const updatePaymentMethod = async (id, updateData) => {
  try {
    const formData = new FormData();
    if (updateData.name) formData.append('name', updateData.name);
    if (updateData.phoneNumber) formData.append('phoneNumber', updateData.phoneNumber);
    if (updateData.paymentMethodImg) {
      formData.append('paymentMethodImg', updateData.paymentMethodImg);
    }

    const response = await axios.patch(
      `${API_URL}/api/v1/ec/payment-methods/${id}`,
      formData,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data
  } catch (error) {
    console.error(`Error updating payment method: ${error.message}`);
    throw error;
  }
};

export const changePaymentMethodStatus = async (id, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/ec/payment-methods/${id}/status`,
      { status },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error changing payment method status: ${error.message}`);
    throw error;
  }
};

export const deletePaymentMethod = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/ec/payment-methods/${id}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting payment method: ${error.message}`);
    throw error;
  }
};
