import React, { createContext, useContext, useState, useEffect } from "react";
import { signInWithCustomToken, signOut as firebaseSignOut } from "firebase/auth";
import { authAPI } from "@/apis";
import { firebaseAuth } from "@/lib/firebase";
import {
  saveTokens,
  saveUserData,
  getUserData,
  getAccessToken,
  getRefreshToken,
  clearAuthData,
  isAccessTokenExpired,
  StoredUserData,
} from "@/lib/authStorage";
import { getErrorMessage, AuthProviderProps } from "@/types";
import type { LoginData, RegisterData } from "@/types/api.types";

// ── Firebase sign-in helper ────────────────────────────────────────────────────
// Requests a custom token from our backend and signs into the Firebase client SDK.
// Called after every successful JWT login so onSnapshot listeners can authenticate.
const signIntoFirebase = async (): Promise<void> => {
  try {
    const customToken = await authAPI.getFirebaseToken();
    if (customToken) {
      await signInWithCustomToken(firebaseAuth, customToken);
    }
  } catch (err) {
    // Non-blocking: real-time tracking will gracefully degrade if Firebase
    // auth fails; the core JWT-based app continues to work.
    console.warn("[AuthContext] Firebase sign-in skipped:", err);
  }
};

interface AuthContextType {
  user: StoredUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<StoredUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthExpired = () => {
      void firebaseSignOut(firebaseAuth).catch(() => {});
      sessionStorage.removeItem("sessionUserId");
      setUser(null);
    };

    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  }, []);

  // Initialize auth state from localStorage.
  // If the access token is expired but a refresh token exists, silently refresh
  // before the first API call so users don't see a brief 401 flash.
  useEffect(() => {
    const initAuth = async () => {
      const userData = getUserData();
      const accessToken = getAccessToken();

      if (userData && accessToken) {
        // Optimistically set the user so the UI renders immediately
        setUser(userData);
        // Restore sessionUserId so CartProvider can fetch the backend cart
        if (!sessionStorage.getItem("sessionUserId")) {
          sessionStorage.setItem("sessionUserId", userData.userId);
        }

        if (isAccessTokenExpired()) {
          const storedRefreshToken = getRefreshToken();
          if (storedRefreshToken) {
            try {
              const response =
                await authAPI.refreshAccessToken(storedRefreshToken);
              saveTokens(response.accessToken, storedRefreshToken);
              // Re-establish Firebase auth after token refresh
              await signIntoFirebase();
            } catch {
              clearAuthData();
              setUser(null);
            }
          } else {
            clearAuthData();
            setUser(null);
          }
        } else {
          // Token still valid — restore Firebase auth if not already signed in
          if (!firebaseAuth.currentUser) {
            await signIntoFirebase();
          }
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authAPI.loginUser(data);
      const { accessToken, refreshToken } = response.tokens;
      const user = response.user;

      saveTokens(accessToken, refreshToken);
      saveUserData(user);
      sessionStorage.setItem("sessionUserId", user.userId);
      localStorage.setItem("sessionUserId", user.userId);
      setUser(user);

      // Sign into Firebase client SDK for real-time order tracking
      await signIntoFirebase();
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.registerUser(data);
      const { accessToken, refreshToken } = response.tokens;
      const user = response.user;

      saveTokens(accessToken, refreshToken);
      saveUserData(user);
      sessionStorage.setItem("sessionUserId", user.userId);
      localStorage.setItem("sessionUserId", user.userId);
      setUser(user);

      // Sign into Firebase client SDK for real-time order tracking
      await signIntoFirebase();
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  };

  const logout = async () => {
    try {
      const accessToken = getAccessToken();
      if (accessToken) {
        await authAPI.logoutUser(accessToken);
      }
      // Sign out of Firebase client SDK so onSnapshot listeners lose auth
      await firebaseSignOut(firebaseAuth).catch(() => {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      sessionStorage.removeItem("sessionUserId");
      setUser(null);
      window.dispatchEvent(new CustomEvent("cart:clear"));
    }
  };

  const refreshToken = async () => {
    const currentRefreshToken = getRefreshToken();

    if (!currentRefreshToken) {
      await logout();
      throw new Error("No refresh token available");
    }

    try {
      // response is already unwrapped by the interceptor: { accessToken, expiresIn }
      const response = await authAPI.refreshAccessToken(currentRefreshToken);
      saveTokens(response.accessToken, currentRefreshToken);
    } catch (error) {
      // Refresh token expired or invalid — force re-login
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
