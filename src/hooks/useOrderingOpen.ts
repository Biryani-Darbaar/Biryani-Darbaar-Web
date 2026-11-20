import { useSyncExternalStore } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

/**
 * Live "online ordering ON/OFF" switch set from the admin panel
 * (Firestore settings/ordering, public read). One shared listener for the app.
 * If the listener fails we assume open — the API still refuses orders when off.
 */
let open = true;
const listeners = new Set<() => void>();
let unsub: (() => void) | null = null;

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  if (!unsub) {
    unsub = onSnapshot(
      doc(firestore, "settings", "ordering"),
      (snap) => { open = snap.data()?.open !== false; listeners.forEach((l) => l()); },
      () => { open = true; listeners.forEach((l) => l()); },
    );
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && unsub) { unsub(); unsub = null; }
  };
};

/** Lets the checkout flip the UI to "paused" when the API says so (503 ORDERS_PAUSED). */
export const markOrderingPaused = () => { open = false; listeners.forEach((l) => l()); };

export const isOrdersPausedError = (e: unknown): boolean =>
  (e as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode === "ORDERS_PAUSED" ||
  (e as { errorCode?: string })?.errorCode === "ORDERS_PAUSED";

export const useOrderingOpen = (): boolean => useSyncExternalStore(subscribe, () => open);
