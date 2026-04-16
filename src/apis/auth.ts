import axiosInstance from "../lib/axiosInterceptor";
import type {
  RegisterData,
  LoginData,
  LoginWithGoogleData,
  SignupWithGoogleData,
  AuthResponse,
  RefreshTokenResponse,
  LoginWithGoogleResponse,
} from "@/types/api.types";

// ============================================================================
// API Functions
// ============================================================================

/**
 * Register a new user with email and password
 */
export const registerUser = async (
  data: RegisterData
): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

/**
 * Login user with email and password
 */
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

/**
 * Login user with Google OAuth
 */
export const loginWithGoogle = async (
  data: LoginWithGoogleData
): Promise<LoginWithGoogleResponse> => {
  const response = await axiosInstance.post("/login", data);
  return response.data;
};

/**
 * Signup user with Google OAuth
 */
export const signupWithGoogle = async (
  data: SignupWithGoogleData
): Promise<void> => {
  await axiosInstance.post("/signup", data);
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<RefreshTokenResponse> => {
  const response = await axiosInstance.post("/auth/refresh-token", {
    refreshToken,
  });
  return response.data;
};

/**
 * Logout user and invalidate tokens
 */
export const logoutUser = async (accessToken?: string): Promise<void> => {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  await axiosInstance.post("/auth/logout", {}, { headers });
};

/**
 * Request a short-lived Firebase custom token for the currently authenticated
 * user. The token lets the frontend sign into the Firebase client SDK so it
 * can use Firestore `onSnapshot` for real-time order tracking.
 */
export const getFirebaseToken = async (): Promise<string> => {
  const response = await axiosInstance.get("/auth/firebase-token");
  // Backend returns: { success, data: { customToken } }
  return (response.data?.data ?? response.data)?.customToken as string;
};
