import axiosInstance from "../lib/axiosInterceptor";
import type {
  ApiCartItem,
  GetCartData,
  AddToCartData,
  AddToCartResponse,
  UpdateCartData,
} from "@/types/api.types";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch cart items for a user
 */
export const getCartItems = async (
  data: GetCartData
): Promise<ApiCartItem[]> => {
  const response = await axiosInstance.post("/getCart", data);
  return response.data || [];
};

/**
 * Add item to cart
 */
export const addToCart = async (
  data: AddToCartData
): Promise<AddToCartResponse> => {
  const response = await axiosInstance.post("/cart", data);
  return response.data;
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
  cartItemId: string,
  data: UpdateCartData
): Promise<void> => {
  await axiosInstance.put(`/cart/${cartItemId}`, data);
};

/**
 * Delete single cart item
 */
export const deleteCartItem = async (cartItemId: string): Promise<void> => {
  await axiosInstance.delete(`/cart/${cartItemId}`);
};
