import axiosInstance from "../lib/axiosInterceptor";
import type {
  ValidatePromoData,
  ValidatePromoResponse,
} from "@/types/api.types";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Validate and apply promo code
 */
export const validatePromoCode = async (
  data: ValidatePromoData
): Promise<ValidatePromoResponse> => {
  const response = await axiosInstance.post("/validate-promo", data);
  return response.data;
};
