import axiosInstance from "../lib/axiosInterceptor";
import type {
  CheckoutInput,
  CheckoutQuote,
  CreatePaymentIntentData,
  CreatePaymentIntentResponse,
  VerifyPaymentData,
  VerifyPaymentResponse,
} from "@/types/api.types";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Server-side price for the cart — this is what will be charged.
 */
export const getQuote = async (data: CheckoutInput): Promise<CheckoutQuote> => {
  const response = await axiosInstance.post("/checkout/quote", data);
  return response.data;
};

/**
 * Create a Stripe PaymentIntent for the server-quoted total of this cart.
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
