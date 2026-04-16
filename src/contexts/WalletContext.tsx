import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { walletAPI } from "@/apis";
import type { SpinResult, RedeemResult } from "@/apis/wallet";

// ── Context shape ─────────────────────────────────────────────────────────────

interface WalletContextType {
  walletBalance: number;
  lastSpinAt: string | null;
  canSpinToday: boolean;
  isLoadingWallet: boolean;
  /** Whether to show the spin-wheel popup */
  showSpinWheel: boolean;
  setShowSpinWheel: (v: boolean) => void;
  /** Re-fetch wallet from the backend */
  refreshWallet: () => Promise<void>;
  /** Spin the wheel — resolves with result or rejects with error message */
  spin: () => Promise<SpinResult>;
  /** Redeem coins for a checkout discount */
  redeem: (coins: number) => Promise<RedeemResult>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = (): WalletContextType => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();

  const [walletBalance, setWalletBalance] = useState(0);
  const [lastSpinAt,    setLastSpinAt]    = useState<string | null>(null);
  const [canSpinToday,  setCanSpinToday]  = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  // Track previous userId so we know when auth state changed
  const prevUserIdRef = useRef<string | null>(null);

  const refreshWallet = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingWallet(true);
    try {
      const data = await walletAPI.getWallet();
      setWalletBalance(data.walletBalance);
      setLastSpinAt(data.lastSpinAt);
      setCanSpinToday(data.canSpinToday);
    } catch {
      // Non-blocking — wallet data is a nice-to-have, not mission-critical
    } finally {
      setIsLoadingWallet(false);
    }
  }, [isAuthenticated]);

  // Fetch wallet whenever the authenticated user changes
  useEffect(() => {
    const currentId = user?.userId ?? null;

    if (isAuthenticated && currentId) {
      refreshWallet();

      // Show spin-wheel popup when a new login happens (userId just became set)
      if (prevUserIdRef.current !== currentId) {
        // Delay slightly so the page has settled
        const timer = setTimeout(async () => {
          try {
            const data = await walletAPI.getWallet();
            setWalletBalance(data.walletBalance);
            setLastSpinAt(data.lastSpinAt);
            setCanSpinToday(data.canSpinToday);
            if (data.canSpinToday) {
              setShowSpinWheel(true);
            }
          } catch {
            // ignore
          }
        }, 1500);

        prevUserIdRef.current = currentId;
        return () => clearTimeout(timer);
      }
    } else if (!isAuthenticated) {
      // Reset wallet state on logout
      setWalletBalance(0);
      setLastSpinAt(null);
      setCanSpinToday(false);
      setShowSpinWheel(false);
      prevUserIdRef.current = null;
    }
  }, [isAuthenticated, user?.userId, refreshWallet]);

  const spin = useCallback(async (): Promise<SpinResult> => {
    const result = await walletAPI.spinWheel();
    setWalletBalance(result.walletBalance);
    setLastSpinAt(result.lastSpinAt);
    setCanSpinToday(false);
    return result;
  }, []);

  const redeem = useCallback(async (coins: number): Promise<RedeemResult> => {
    const result = await walletAPI.redeemCoins(coins);
    setWalletBalance(result.walletBalance);
    return result;
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletBalance,
        lastSpinAt,
        canSpinToday,
        isLoadingWallet,
        showSpinWheel,
        setShowSpinWheel,
        refreshWallet,
        spin,
        redeem,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
