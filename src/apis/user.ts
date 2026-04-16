import axiosInstance from "../lib/axiosInterceptor";
import type {
  ApiUser,
  ApplyRewardData,
  ApplyRewardResponse,
} from "@/types/api.types";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch user details by userId
 */
export const getUserById = async (userId: string): Promise<ApiUser> => {
  const response = await axiosInstance.get(`/user/${userId}`);
  return response.data;
};

/**
 * Apply reward discount to an order
 */
export const applyReward = async (
  data: ApplyRewardData
): Promise<ApplyRewardResponse> => {
  const response = await axiosInstance.post("/apply-reward", data);
  return response.data;
};
