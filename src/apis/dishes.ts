import axiosInstance from "../lib/axiosInterceptor";
import type { ApiDish } from "@/types/api.types";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch dishes by category
 */
export const getDishesByCategory = async (
  category: string
): Promise<ApiDish[]> => {
  const response = await axiosInstance.get(
    `/dishes/category/${encodeURIComponent(category)}`
  );
  return response.data || [];
};

/**
 * Fetch special offer dishes
 */
export const getSpecialOffers = async (): Promise<ApiDish[]> => {
  const response = await axiosInstance.get("/specialOffers");
  return response.data || [];
};
