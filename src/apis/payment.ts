import axiosInstance from "../lib/axiosInterceptor";
import type {
  CreatePaymentIntentData,
  CreatePaymentIntentResponse,
  VerifyPaymentData,
  VerifyPaymentResponse,
} from "@/types/api.types";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create Stripe payment intent (amount in dollars; backend converts to cents)
 */
export const createPaymentIntent = async (
  data: CreatePaymentIntentData
): Promise<CreatePaymentIntentResponse> => {
  const response = await axiosInstance.post("/create-payment-intent", data);
  return response.data;
};

/**
 * Verify a completed payment with Stripe and optionally confirm the order
 */
export const verifyPayment = async (
  data: VerifyPaymentData
): Promise<VerifyPaymentResponse> => {
  const response = await axiosInstance.post("/verify-payment", data);
  return response.data;
};
