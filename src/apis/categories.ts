import axiosInstance from "../lib/axiosInterceptor";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all available categories
 */
export const getCategories = async (): Promise<string[]> => {
  const response = await axiosInstance.get("/categories");
  return response.data || [];
};
