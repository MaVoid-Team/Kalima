/**
 * API Configuration Utility
 * 
 * This utility ensures that the API_URL is properly formatted
 * and doesn't contain duplicate /api/v1 paths.
 */

/**
 * Get the normalized API URL
 * Removes any trailing /api/v1 or /api/v1/ from the VITE_API_URL
 * to prevent duplicate paths when constructing API endpoints
 * 
 * @returns {string} The normalized API URL without /api/v1
 */
export const getApiUrl = () => {
  const rawApiUrl = import.meta.env.VITE_API_URL || ''
  // Remove /api/v1 or /api/v1/ from the end if present
  return rawApiUrl.replace(/\/api\/v1\/?$/, '')
}

/**
 * Get the base API URL (same as getApiUrl for backward compatibility)
 */
export const API_URL = getApiUrl()

export default API_URL
