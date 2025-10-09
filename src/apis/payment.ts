import axiosInstance from "../lib/axiosInterceptor";
import type {
  CreatePaymentIntentData,
  CreatePaymentIntentResponse,
} from "@/types/api.types";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create Stripe payment intent
 */
export const createPaymentIntent = async (
  data: CreatePaymentIntentData
): Promise<CreatePaymentIntentResponse> => {
  const response = await axiosInstance.post("/create-payment-intent", data);
  return response.data.data;
};
