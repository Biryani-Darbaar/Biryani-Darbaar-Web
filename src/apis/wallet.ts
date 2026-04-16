import axiosInstance from "../lib/axiosInterceptor";

// ── Response shapes ───────────────────────────────────────────────────────────

export interface WalletData {
  walletBalance: number;
  lastSpinAt: string | null;
  canSpinToday: boolean;
}

export interface SpinResult {
  coinsWon: number;
  walletBalance: number;
  lastSpinAt: string;
}

export interface RedeemResult {
  coinsRedeemed: number;
  discountAmount: number; // AUD — 1 coin = $0.10
  walletBalance: number;
}

// ── API functions ─────────────────────────────────────────────────────────────

/** Fetch the authenticated user's wallet balance + daily spin eligibility */
export const getWallet = async (): Promise<WalletData> => {
  const response = await axiosInstance.get("/wallet");
  return response.data;
};

/** Spin the daily wheel — server enforces once-per-day limit */
export const spinWheel = async (): Promise<SpinResult> => {
  const response = await axiosInstance.post("/wallet/spin");
  return response.data;
};

/**
 * Redeem coins for an AUD discount (min 50 coins, 1 coin = $0.10).
 * Deducts coins from the user's wallet immediately.
 */
export const redeemCoins = async (coinsToRedeem: number): Promise<RedeemResult> => {
  const response = await axiosInstance.post("/wallet/redeem", { coinsToRedeem });
  return response.data;
};
