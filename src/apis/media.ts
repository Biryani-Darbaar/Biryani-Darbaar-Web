import axiosInstance from "../lib/axiosInterceptor";

export interface SpecialMediaItem {
  id: string;
  url: string;
  mediaUrl?: string;
  type?: string;
  order?: number;
  fileName?: string;
}

/**
 * Fetch special offer media items uploaded via the admin panel.
 * Public endpoint — no auth required.
 */
export const getSpecialOfferMedia = async (): Promise<SpecialMediaItem[]> => {
  const response = await axiosInstance.get("/special-offer-media", {
    skipAuth: true,
  });
  const data = response.data?.data ?? response.data ?? [];
  return Array.isArray(data) ? data : [];
};
