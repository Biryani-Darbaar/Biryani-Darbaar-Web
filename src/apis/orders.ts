import axiosInstance from "../lib/axiosInterceptor";
import type {
  ApiOrder,
  CreateOrderData,
  CreateOrderResponse,
} from "@/types/api.types";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all orders for the currently authenticated user.
 * The backend resolves the user from the JWT — no userId param needed.
 */
export const getOrders = async (): Promise<ApiOrder[]> => {
  const response = await axiosInstance.get("/orders");
  return response.data || [];
};

/**
 * Fetch a single order by ID for the authenticated user
 */
export const getOrderById = async (orderId: string): Promise<ApiOrder> => {
  const response = await axiosInstance.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * Create a new order
 */
export const createOrder = async (
  data: CreateOrderData
): Promise<CreateOrderResponse> => {
  const response = await axiosInstance.post("/orders", data);
  return response.data;
};

/**
 * Delete cart items after order creation
 */
export const deleteCartItemsAfterOrder = async (
  cartItemIds: string[]
): Promise<void> => {
  await Promise.all(
    cartItemIds.map((cartItemId) => axiosInstance.delete(`/cart/${cartItemId}`))
  );
};
