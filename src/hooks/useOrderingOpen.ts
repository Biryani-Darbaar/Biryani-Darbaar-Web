import { useSyncExternalStore } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

/**
 * Live online-ordering switches set from the admin panel (Firestore settings/ordering,
 * public read): master ON/OFF plus pickup and delivery. One shared listener for the app.
 * Missing fields mean ON. If the listener fails we assume everything is open — the API
 * still refuses orders that are switched off.
 */
export type ShippingMethod = "pickup" | "delivery";
export type OrderingSettings = { open: boolean; pickup: boolean; delivery: boolean };

let settings: OrderingSettings = { open: true, pickup: true, delivery: true };
const listeners = new Set<() => void>();
let unsub: (() => void) | null = null;

const emit = (next: OrderingSettings) => { settings = next; listeners.forEach((l) => l()); };

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  if (!unsub) {
    unsub = onSnapshot(
      doc(firestore, "settings", "ordering"),
      (snap) => {
        const d = snap.data() ?? {};
        emit({ open: d.open !== false, pickup: d.pickup !== false, delivery: d.delivery !== false });
      },
      () => emit({ open: true, pickup: true, delivery: true }),
    );
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && unsub) { unsub(); unsub = null; }
  };
};

/** Lets the checkout flip the UI to "paused" when the API says so (503 ORDERS_PAUSED). */
export const markOrderingPaused = () => emit({ ...settings, open: false });

/** Same for one method (503 SHIPPING_METHOD_PAUSED) before the live listener catches up. */
export const markMethodPaused = (m: ShippingMethod) => emit({ ...settings, [m]: false });

const errorCode = (e: unknown) =>
  (e as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode ??
  (e as { errorCode?: string })?.errorCode;

export const isOrdersPausedError = (e: unknown): boolean => errorCode(e) === "ORDERS_PAUSED";
export const isMethodPausedError = (e: unknown): boolean => errorCode(e) === "SHIPPING_METHOD_PAUSED";

/** Current value outside React render (e.g. inside an async payment handler). */
export const getOrderingSettings = (): OrderingSettings => settings;

export const useOrderingSettings =(): OrderingSettings => useSyncExternalStore(subscribe, () => settings);
export const useOrderingOpen = (): boolean => useOrderingSettings().open;
