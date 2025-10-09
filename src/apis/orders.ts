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
 * Fetch orders for a user
 */
export const getOrders = async (userId: string): Promise<ApiOrder[]> => {
  const response = await axiosInstance.get(`/orders/${userId}`);
  return response.data.data || [];
};

/**
 * Create a new order
 */
export const createOrder = async (
  data: CreateOrderData
): Promise<CreateOrderResponse> => {
  const response = await axiosInstance.post("/orders", data);
  return response.data.data;
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
