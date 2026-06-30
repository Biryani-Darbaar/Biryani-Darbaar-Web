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
  const response = await axiosInstance.get("/special-offer-media");
  // The axios interceptor has already unwrapped { success, data } → response.data
  // is now the inner object.  Backend returns: { media: [...], total: N }
  const inner = response.data;
  if (Array.isArray(inner)) return inner;              // future-proof flat array
  if (Array.isArray(inner?.media)) return inner.media; // normal case
  return [];
};
