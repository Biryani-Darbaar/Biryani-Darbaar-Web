/**
 * ActiveOrderContext — REAL-TIME order tracking via Firestore onSnapshot.
 *
 * Root-cause fix for "label stuck at Order Confirmed":
 *   On page reload there is a race condition where the Firestore listener is
 *   set up BEFORE Firebase auth resolves (signInWithCustomToken is async).
 *   Firestore replies with `permission-denied`, which was silently swallowed,
 *   so the listener died and never retried → status never updated.
 *
 * Fix: wrap the onSnapshot setup inside `onAuthStateChanged`.  The listener is
 * established (or re-established) every time Firebase auth state changes to a
 * signed-in user, so auth-resolution races are impossible.
 *
 * Auto-clear timings:
 *   delivered  → 62 s  (widget shows for 60 s, then context clears 2 s later)
 *   cancelled  →  8 s  (dismiss quickly)
 *
 * Data flow:
 *   Admin updates Firestore → onSnapshot fires → trackingStatus state updates
 *   → ActiveOrderWidget + OrderSuccess re-render with real status.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { doc, onSnapshot } from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { firestore, firebaseAuth } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ActiveOrder {
  orderId: string;
  total: number;
  paymentIntentId?: string;
  items: ActiveOrderItem[];
  /** ISO timestamp when the order was placed */
  placedAt: string;
}

export type TrackingStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface TrackingStage {
  key: TrackingStatus;
  label: string;
  description: string;
}

export interface ActiveOrderContextType {
  activeOrder:    ActiveOrder | null;
  trackingStatus: TrackingStatus | null;
  /** All pipeline stages with computed done/active flags */
  stages: (TrackingStage & { done: boolean; active: boolean })[];
  setActiveOrder:  (order: ActiveOrder) => void;
  clearActiveOrder: () => void;
}

// ─── Stage pipeline ───────────────────────────────────────────────────────────

export const TRACKING_STAGES: TrackingStage[] = [
  {
    key:         "confirmed",
    label:       "Order Confirmed",
    description: "Your order has been received",
  },
  {
    key:         "preparing",
    label:       "Preparing",
    description: "The kitchen is cooking your order",
  },
  {
    key:         "packed",
    label:       "Packed",
    description: "Your order is being packed",
  },
  {
    key:         "out_for_delivery",
    label:       "Out for Delivery",
    description: "Your order is on its way",
  },
  {
    key:         "delivered",
    label:       "Delivered",
    description: "Enjoy your meal! 🎉",
  },
];

// ─── localStorage keys ────────────────────────────────────────────────────────

const STORAGE_KEY        = "activeOrder";
const STORAGE_STATUS_KEY = "activeOrderStatus";

// ─── Context ──────────────────────────────────────────────────────────────────

const ActiveOrderContext = createContext<ActiveOrderContextType | undefined>(
  undefined,
);

export const useActiveOrder = (): ActiveOrderContextType => {
  const ctx = useContext(ActiveOrderContext);
  if (!ctx)
    throw new Error("useActiveOrder must be used within <ActiveOrderProvider>");
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ActiveOrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Rehydrate persisted order from localStorage on mount
  const [activeOrder, setActiveOrderState] = useState<ActiveOrder | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as ActiveOrder) : null;
    } catch {
      return null;
    }
  });

  // Rehydrate last-known status (immediately corrected by first onSnapshot event)
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus | null>(
    () => {
      try {
        const stored = localStorage.getItem(STORAGE_STATUS_KEY);
        return stored ? (stored as TrackingStatus) : null;
      } catch {
        return null;
      }
    },
  );

  const unsubRef      = useRef<Unsubscribe | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Persist to localStorage ───────────────────────────────────────────────

  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeOrder]);

  useEffect(() => {
    if (trackingStatus) {
      localStorage.setItem(STORAGE_STATUS_KEY, trackingStatus);
    } else {
      localStorage.removeItem(STORAGE_STATUS_KEY);
    }
  }, [trackingStatus]);

  // ── Firestore real-time listener ──────────────────────────────────────────
  //
  // Key design: we wrap the onSnapshot setup inside onAuthStateChanged so the
  // listener is (re-)established the moment Firebase auth resolves.  This
  // eliminates the page-reload race condition where onSnapshot used to fire
  // permission-denied (before signInWithCustomToken completed) and silently die.

  useEffect(() => {
    if (!activeOrder?.orderId) {
      // No active order — tear down any existing listener
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      return;
    }

    const orderId = activeOrder.orderId;

    /** (Re-)subscribe to the Firestore document for this order. */
    const subscribeToOrder = () => {
      // Tear down stale listener before creating a new one
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }

      const orderRef = doc(firestore, "order", orderId);

      unsubRef.current = onSnapshot(
        orderRef,
        (snapshot) => {
          if (!snapshot.exists()) return;

          const data      = snapshot.data();
          const newStatus = data?.orderStatus as TrackingStatus | undefined;

          if (!newStatus) return;

          setTrackingStatus(newStatus);

          // Cancel any pending auto-clear timer if status changes back to active
          if (newStatus !== "delivered" && newStatus !== "cancelled") {
            if (clearTimerRef.current) {
              clearTimeout(clearTimerRef.current);
              clearTimerRef.current = null;
            }
            return;
          }

          // Terminal status — schedule auto-clear (only once per terminal event)
          if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

          const delay = newStatus === "delivered" ? 62_000 : 8_000;

          clearTimerRef.current = setTimeout(() => {
            setActiveOrderState(null);
            setTrackingStatus(null);
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_STATUS_KEY);
            clearTimerRef.current = null;
          }, delay);
        },
        (error) => {
          // permission-denied is expected before Firebase auth resolves —
          // onAuthStateChanged will trigger re-subscription once auth is ready.
          if (error.code !== "permission-denied") {
            console.error("[ActiveOrderContext] Firestore listener error:", error);
          }
        },
      );
    };

    // Watch Firebase auth state. Re-subscribe to onSnapshot every time the user
    // signs in (covers page-reload race + custom-token refresh scenarios).
    const unsubAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        subscribeToOrder();
      } else {
        // Signed out — tear down the order listener but preserve state so the
        // widget remains visible if the user re-authenticates quickly.
        if (unsubRef.current) {
          unsubRef.current();
          unsubRef.current = null;
        }
      }
    });

    return () => {
      unsubAuth();
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [activeOrder?.orderId]);

  // ── Public API ────────────────────────────────────────────────────────────

  const setActiveOrder = useCallback((order: ActiveOrder) => {
    // Cancel any pending clear timer from the previous order
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    setActiveOrderState(order);
    // Optimistic "confirmed" — onSnapshot corrects it within milliseconds
    setTrackingStatus("confirmed");
  }, []);

  const clearActiveOrder = useCallback(() => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    setActiveOrderState(null);
    setTrackingStatus(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_STATUS_KEY);
  }, []);

  // ── Derived: stage done/active flags ─────────────────────────────────────

  const currentStageIdx = TRACKING_STAGES.findIndex(
    (s) => s.key === trackingStatus,
  );

  const stages = TRACKING_STAGES.map((stage, idx) => ({
    ...stage,
    done:   idx < currentStageIdx,
    active: idx === currentStageIdx,
  }));

  return (
    <ActiveOrderContext.Provider
      value={{
        activeOrder,
        trackingStatus,
        stages,
        setActiveOrder,
        clearActiveOrder,
      }}
    >
      {children}
    </ActiveOrderContext.Provider>
  );
};
