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
  showSpinWheel: boolean;
  setShowSpinWheel: (v: boolean) => void;
  refreshWallet: () => Promise<void>;
  spin: () => Promise<SpinResult>;
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

  const [walletBalance,   setWalletBalance]   = useState(0);
  const [lastSpinAt,      setLastSpinAt]      = useState<string | null>(null);
  const [canSpinToday,    setCanSpinToday]    = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [showSpinWheel,   setShowSpinWheel]   = useState(false);

  // Track the userId that was active on the last fetch so we only re-fetch
  // when the user actually changes (new login), not on every re-render.
  const prevUserIdRef = useRef<string | null>(null);

  // ── Shared fetch helper — used by both the auto-fetch and manual refresh ──
  const fetchWallet = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;
    setIsLoadingWallet(true);
    try {
      const data = await walletAPI.getWallet();
      setWalletBalance(data.walletBalance);
      setLastSpinAt(data.lastSpinAt);
      setCanSpinToday(data.canSpinToday);
    } catch {
      // Non-blocking — wallet is a nice-to-have; never crash the app over it.
    } finally {
      setIsLoadingWallet(false);
    }
  }, [isAuthenticated]);

  // Public refreshWallet — used by Checkout, spin result handler, etc.
  const refreshWallet = fetchWallet;

  // ── Auto-fetch on login / user change ─────────────────────────────────────
  //
  // Rules:
  //  • Fetch ONCE per new userId (i.e. when the user logs in for the first
  //    time in this tab session). Guard with prevUserIdRef so re-renders of
  //    parent providers don't trigger extra round-trips.
  //  • Do NOT put `fetchWallet` in the dep array — it recreates whenever
  //    `isAuthenticated` changes, which would cause a second fetch immediately
  //    after the first one completes (because setting wallet state changes
  //    isLoadingWallet, which can trigger parent re-renders).
  //  • On logout: reset everything synchronously (no network call needed).
  //
  useEffect(() => {
    const currentId = user?.userId ?? null;

    // ── Logout ──
    if (!isAuthenticated) {
      setWalletBalance(0);
      setLastSpinAt(null);
      setCanSpinToday(false);
      setShowSpinWheel(false);
      prevUserIdRef.current = null;
      return;
    }

    // ── Same user, no re-fetch needed ──
    if (!currentId || prevUserIdRef.current === currentId) return;

    // ── New login — fetch once, then decide whether to show spin wheel ──
    prevUserIdRef.current = currentId;

    // Small delay (800 ms) so the page has settled before the popup can appear
    const timer = setTimeout(async () => {
      if (!isAuthenticated) return; // guard against logout-during-delay
      setIsLoadingWallet(true);
      try {
        const data = await walletAPI.getWallet();
        setWalletBalance(data.walletBalance);
        setLastSpinAt(data.lastSpinAt);
        setCanSpinToday(data.canSpinToday);
        if (data.canSpinToday) {
          setShowSpinWheel(true);
        }
      } catch {
        // ignore — wallet failure must never disrupt login flow
      } finally {
        setIsLoadingWallet(false);
      }
    }, 800);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    // NOTE: `fetchWallet` intentionally omitted from deps — see comment above.
  }, [isAuthenticated, user?.userId]);

  // ── Spin ──────────────────────────────────────────────────────────────────
  const spin = useCallback(async (): Promise<SpinResult> => {
    const result = await walletAPI.spinWheel();
    setWalletBalance(result.walletBalance);
    setLastSpinAt(result.lastSpinAt);
    setCanSpinToday(false);
    return result;
  }, []);

  // ── Redeem ────────────────────────────────────────────────────────────────
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
