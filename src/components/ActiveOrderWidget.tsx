/**
 * ActiveOrderWidget
 *
 * Persistent floating bottom-right widget shown on every page while an active
 * order exists.  Reads status from ActiveOrderContext (Firestore onSnapshot)
 * so it updates the instant admin changes the order status.
 *
 * Behaviour:
 *  • Shows immediately when an order is placed (Issue 7 — reappears for new order)
 *  • Status label + colour updates in real-time without any page refresh
 *  • Active orders: live-pulse indicator, "Tap for full tracking" footer
 *  • Delivered:  auto-hides after 60 seconds (Issue 6)
 *  • Cancelled:  auto-hides after 6 seconds
 *  • Smooth CSS transition between status colour themes (Issue 5)
 */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  X,
  CheckCircle2,
  Package,
  Truck,
  Clock,
  XCircle,
  BoxIcon,
  PartyPopper,
} from "lucide-react";
import {
  useActiveOrder,
  type TrackingStatus,
} from "@/contexts/ActiveOrderContext";

// ─── Status display config ────────────────────────────────────────────────────
//
// Design spec:
//   confirmed        → neutral  (slate)
//   preparing        → info     (sky blue)
//   packed           → warning  (amber)
//   out_for_delivery → highlight (orange)
//   delivered        → success  (green)
//   cancelled        → error    (red)

interface StatusCfg {
  label: string;
  icon: React.ReactNode;
  colour: string; // Tailwind text colour
  bg: string; // Tailwind bg colour
  border: string; // Tailwind border colour
  pulse: string; // Tailwind bg for live-pulse dot
  accent: string; // Tailwind gradient classes for top strip
}

const STATUS_CONFIG: Record<TrackingStatus, StatusCfg> = {
  pending: {
    label: "Order Pending",
    icon: <Clock className="w-4 h-4" />,
    colour: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    pulse: "bg-slate-400",
    accent: "from-slate-400 to-slate-300",
  },
  confirmed: {
    label: "Order Confirmed",
    icon: <CheckCircle2 className="w-4 h-4" />,
    colour: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-300",
    pulse: "bg-slate-500",
    accent: "from-slate-500 to-slate-400",
  },
  preparing: {
    label: "Preparing Your Order",
    icon: <Package className="w-4 h-4" />,
    colour: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    pulse: "bg-sky-500",
    accent: "from-sky-500 to-sky-400",
  },
  packed: {
    label: "Order Packed",
    icon: <BoxIcon className="w-4 h-4" />,
    colour: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    pulse: "bg-amber-500",
    accent: "from-amber-500 to-amber-400",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: <Truck className="w-4 h-4" />,
    colour: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    pulse: "bg-orange-500",
    accent: "from-orange-500 to-orange-400",
  },
  delivered: {
    label: "Delivered! 🎉",
    icon: <PartyPopper className="w-4 h-4" />,
    colour: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    pulse: "bg-green-500",
    accent: "from-green-500 to-green-400",
  },
  cancelled: {
    label: "Order Cancelled",
    icon: <XCircle className="w-4 h-4" />,
    colour: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    pulse: "bg-red-400",
    accent: "from-red-500 to-red-400",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

const ActiveOrderWidget: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrder, trackingStatus, clearActiveOrder } = useActiveOrder();

  const [visible, setVisible] = useState(true);

  // Countdown shown while in "delivered" state (60 → 0)
  const [deliveredCountdown, setDeliveredCountdown] = useState<number | null>(
    null,
  );
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // ── Reset visibility when a NEW order is set (Issue 7) ───────────────────
  useEffect(() => {
    if (activeOrder?.orderId) {
      setVisible(true);
      setDeliveredCountdown(null);
    }
  }, [activeOrder?.orderId]);

  // ── Auto-hide logic (Issues 5 + 6) ───────────────────────────────────────
  useEffect(() => {
    // Clear any pending timers from a previous status
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
    hideTimerRef.current = null;
    countdownIntervalRef.current = null;

    if (trackingStatus === "delivered") {
      // Show for exactly 60 seconds, then hide (Issue 6)
      const DURATION_S = 60;
      setDeliveredCountdown(DURATION_S);

      // Tick down every second
      countdownIntervalRef.current = setInterval(() => {
        setDeliveredCountdown((c) => {
          if (c === null || c <= 1) return null;
          return c - 1;
        });
      }, 1_000);

      // Hide after 60 s (timer fires ONLY once — ref prevents duplicates)
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        setDeliveredCountdown(null);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }, DURATION_S * 1_000);
    } else if (trackingStatus === "cancelled") {
      setDeliveredCountdown(null);
      hideTimerRef.current = setTimeout(() => setVisible(false), 6_000);
    } else {
      // Active order — make sure widget is visible
      setDeliveredCountdown(null);
      if (visible === false && activeOrder) setVisible(true);
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingStatus]);

  if (!activeOrder || !trackingStatus || !visible) return null;

  const cfg = STATUS_CONFIG[trackingStatus] ?? STATUS_CONFIG.confirmed;
  const isTerminal =
    trackingStatus === "delivered" || trackingStatus === "cancelled";

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
    // Let the exit animation finish before clearing context state
    setTimeout(clearActiveOrder, 400);
  };

  const handleClick = () => {
    navigate(`/order-history/${activeOrder.orderId}`);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="active-order-widget"
          className="fixed bottom-6 right-6 z-50 max-w-xs w-full"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          {/* Outer card — transitions bg + border when status changes */}
          <div
            className={[
              "relative rounded-2xl shadow-xl border cursor-pointer overflow-hidden",
              "transition-colors duration-500",
              cfg.bg,
              cfg.border,
            ].join(" ")}
            onClick={handleClick}
          >
            {/* Top accent strip — colour follows status */}
            <div
              className={[
                "h-1 w-full bg-gradient-to-r transition-all duration-500",
                cfg.accent,
              ].join(" ")}
            />

            <div className="p-4">
              {/* ── Header row ─────────────────────────────────────────── */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {/* Status icon bubble */}
                  <div
                    className={[
                      "p-1.5 rounded-lg border transition-colors duration-500",
                      cfg.bg,
                      cfg.colour,
                      cfg.border,
                    ].join(" ")}
                  >
                    {cfg.icon}
                  </div>

                  <div>
                    <p
                      className={[
                        "text-sm font-bold leading-tight transition-colors duration-500",
                        cfg.colour,
                      ].join(" ")}
                    >
                      {cfg.label}
                    </p>
                    <p className="text-xs text-neutral-500 font-mono">
                      #{activeOrder.orderId.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={handleDismiss}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-white/60 transition-colors flex-shrink-0"
                  aria-label="Dismiss tracking widget"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Live pulse / delivered countdown ───────────────────── */}
              {!isTerminal && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.pulse}`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.pulse}`}
                    />
                  </span>
                  <span className="text-xs text-neutral-600">
                    Live tracking active
                  </span>
                </div>
              )}

              {trackingStatus === "delivered" &&
                deliveredCountdown !== null && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-green-600 font-medium">
                      Closing in {deliveredCountdown}s
                    </span>
                  </div>
                )}

              {/* ── Footer row ─────────────────────────────────────────── */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  {isTerminal
                    ? "Tap to view order details"
                    : "Tap for full tracking"}
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActiveOrderWidget;
