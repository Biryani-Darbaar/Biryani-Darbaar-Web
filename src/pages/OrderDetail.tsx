import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  CreditCard,
  Receipt,
  Clock,
  BoxIcon,
} from "lucide-react";
import { ordersAPI } from "@/apis";
import { firestore } from "@/lib/firebase";
import type { ApiOrder } from "@/types/api.types";

// ─── Status normalisation ─────────────────────────────────────────────────────
// Firestore stores "out_for_delivery" (underscore).  Legacy strings like
// "out for delivery" are normalised to the canonical underscore form so the
// display pipeline handles them consistently.

const normaliseStatus = (raw: string | undefined): string => {
  if (!raw) return "pending";
  const s = raw.toLowerCase().trim();
  // Map any space-variant → underscore canonical form
  if (s === "out for delivery") return "out_for_delivery";
  if (s === "out_for_delivery") return "out_for_delivery";
  return s;
};

// ─── Pipeline steps (canonical underscore keys) ───────────────────────────────

const STATUS_STEPS = [
  { key: "confirmed",        label: "Order Confirmed"  },
  { key: "preparing",        label: "Preparing"        },
  { key: "packed",           label: "Packed"           },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered",        label: "Delivered"        },
];

// ─── Status display config ────────────────────────────────────────────────────

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:          <Clock       className="w-5 h-5" />,
  confirmed:        <CheckCircle className="w-5 h-5" />,
  preparing:        <Package     className="w-5 h-5" />,
  packed:           <BoxIcon     className="w-5 h-5" />,
  out_for_delivery: <Truck       className="w-5 h-5" />,
  delivered:        <CheckCircle className="w-5 h-5" />,
  cancelled:        <XCircle     className="w-5 h-5" />,
  failed:           <XCircle     className="w-5 h-5" />,
};

const STATUS_COLOUR: Record<string, string> = {
  pending:          "text-yellow-600",
  confirmed:        "text-blue-600",
  preparing:        "text-orange-600",
  packed:           "text-indigo-600",
  out_for_delivery: "text-purple-600",
  delivered:        "text-green-600",
  cancelled:        "text-red-600",
  failed:           "text-red-600",
};

const getStatusIndex = (status: string) =>
  STATUS_STEPS.findIndex((s) => s.key === normaliseStatus(status));

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// ─── Progress tracker ─────────────────────────────────────────────────────────

const OrderProgressTracker: React.FC<{ status: string }> = ({ status }) => {
  const normalised = normaliseStatus(status);
  const isTerminal = normalised === "cancelled" || normalised === "failed";
  const activeIdx  = getStatusIndex(normalised);

  if (isTerminal) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <span className="text-red-700 font-medium capitalize">{normalised.replace(/_/g, " ")}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-neutral-200 z-0" />
      <div className="flex justify-between relative z-10">
        {STATUS_STEPS.map((step, idx) => {
          const done   = idx <= activeIdx;
          const active = idx === activeIdx;
          return (
            <div key={step.key} className="flex flex-col items-center gap-1 w-1/5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-white border-neutral-300 text-neutral-400"
                } ${active ? "ring-4 ring-green-100" : ""}`}
              >
                {done ? <CheckCircle className="w-5 h-5" /> : <span className="text-xs font-bold">{idx + 1}</span>}
              </div>
              <span
                className={`text-xs text-center font-medium leading-tight ${
                  done ? "text-green-700" : "text-neutral-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const OrderDetail: React.FC = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [order, setOrder]     = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // ── Step 1: Load initial order data via REST (gets full payload) ──────
    let cancelled = false;

    const initialLoad = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ordersAPI.getOrderById(id);
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled)
          setError("Could not load this order. It may not exist or you may not have access.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initialLoad();

    // ── Step 2: Subscribe to real-time status updates via Firestore ───────
    // The global `order/{id}` document is the single source of truth for status.
    // Admin updates it → onSnapshot fires → UI updates instantly.
    const orderRef = doc(firestore, "order", id);

    const unsub = onSnapshot(
      orderRef,
      (snapshot) => {
        if (!snapshot.exists() || cancelled) return;
        const data = snapshot.data();
        const newStatus = data?.orderStatus as string | undefined;
        if (newStatus) {
          setOrder((prev) =>
            prev ? { ...prev, orderStatus: newStatus } : prev,
          );
        }
      },
      (err) => {
        // permission-denied is expected before Firebase auth resolves — ignore
        if (err.code !== "permission-denied") {
          console.error("[OrderDetail] Firestore listener error:", err);
        }
      },
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, [id]);

  const statusNorm = normaliseStatus(order?.orderStatus);
  const colour     = STATUS_COLOUR[statusNorm] ?? "text-neutral-700";
  const icon       = STATUS_ICONS[statusNorm]  ?? <Clock className="w-5 h-5" />;
  const deliveryAddress = order?.address ?? order?.customerAddress;

  return (
    <div className="flex flex-col min-h-screen pt-12 bg-neutral-50">
      <div className="container-custom section-spacing max-w-2xl">
        {/* Back */}
        <button
          onClick={() => navigate("/order-history")}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Order History</span>
        </button>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <div className="h-5 bg-neutral-200 rounded w-48 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-32" />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 h-32" />
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 h-48" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center py-20 text-center">
            <XCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-neutral-700 mb-4">{error}</p>
            <button
              onClick={() => navigate("/order-history")}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              View All Orders
            </button>
          </div>
        )}

        {/* Order detail */}
        {!loading && !error && order && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header card */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="w-5 h-5 text-red-600" />
                    <h1 className="text-lg font-bold text-neutral-900">
                      Order #{order.orderId.slice(-8).toUpperCase()}
                    </h1>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {formatDate(order.orderDate)}
                  </p>
                </div>
                <div className={`flex items-center gap-1.5 font-semibold ${colour}`}>
                  {icon}
                  <span className="capitalize">{statusNorm.replace(/_/g, " ")}</span>
                </div>
              </div>

              {/* Live indicator for active orders */}
              {!["delivered", "cancelled", "failed"].includes(statusNorm) && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-xs text-neutral-500">Live tracking — updates instantly</span>
                </div>
              )}
            </div>

            {/* Progress tracker */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h2 className="text-sm font-semibold text-neutral-700 mb-5 uppercase tracking-wide">
                Order Status
              </h2>
              <OrderProgressTracker status={order.orderStatus} />
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4 uppercase tracking-wide">
                Items Ordered
              </h2>
              <div className="space-y-3">
                {order.orderItems?.map((item, idx) => (
                  <div key={item.dishId ?? idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-red-50 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {item.quantity}×
                      </span>
                      <span className="text-neutral-800 font-medium">
                        {item.dishName ?? item.name}
                      </span>
                    </div>
                    <span className="text-neutral-700 font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between font-bold text-neutral-900">
                <span>Total Paid</span>
                <span className="text-green-600">${Number(order.totalPrice).toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery info */}
            {deliveryAddress && (
              <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                <h2 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">
                  Delivery Details
                </h2>
                <div className="flex items-start gap-3 text-neutral-700">
                  <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{deliveryAddress}</span>
                </div>
              </div>
            )}

            {/* Payment info */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h2 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">
                Payment
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-neutral-700">
                  <CreditCard className="w-5 h-5 text-neutral-400" />
                  <span>
                    {order.paymentVerified === true ? "Payment verified" : "Payment processed"}
                  </span>
                  {order.paymentVerified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                {order.paymentIntentId && (
                  <div className="flex items-start gap-3 text-neutral-500">
                    <Receipt className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-mono break-all">{order.paymentIntentId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Re-order CTA */}
            <button
              onClick={() => navigate("/Order")}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
            >
              Order Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
