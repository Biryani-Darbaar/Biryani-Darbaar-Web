// LocalStorage keys
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_DATA_KEY = "userData";

// ─── JWT helpers (no library needed — we only READ the payload, never trust it) ──

/**
 * Decode a JWT payload without verifying the signature.
 * Safe to use client-side for reading non-sensitive claims like `exp`.
 */
const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payloadB64 = token.split(".")[1];
    if (!payloadB64) return null;
    // atob requires standard base64; JWT uses URL-safe base64 — replace chars
    const padded = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

/**
 * Returns true if the stored access token is expired (or missing).
 * Uses a 30-second buffer so we refresh slightly before actual expiry.
 */
export const isAccessTokenExpired = (): boolean => {
  const token = getAccessToken();
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return false; // can't tell — assume valid
  const expiryMs = payload.exp * 1000;
  return Date.now() >= expiryMs - 30_000; // 30s buffer
};

export interface StoredUserData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  isGoldMember: boolean;
}

// Save tokens to localStorage
export const saveTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Get access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Get refresh token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Save user data
export const saveUserData = (userData: StoredUserData): void => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

// Get user data
export const getUserData = (): StoredUserData | null => {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

// Clear all auth data
export const clearAuthData = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};
