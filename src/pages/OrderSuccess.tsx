import React, { useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ShoppingBag,
  Home,
  Receipt,
  ClipboardList,
  Package,
  Truck,
  BoxIcon,
  Clock,
  XCircle,
} from "lucide-react";
import { useActiveOrder, type TrackingStatus } from "@/contexts/ActiveOrderContext";

interface OrderSuccessState {
  orderId: string;
  total: number;
  paymentIntentId: string;
  items: { name: string; quantity: number; price: number }[];
}

// ─── Status icon map ─────────────────────────────────────────────────────────

const STAGE_ICONS: Record<TrackingStatus, React.ReactNode> = {
  pending:          <Clock     className="w-5 h-5" />,
  confirmed:        <CheckCircle className="w-5 h-5" />,
  preparing:        <Package   className="w-5 h-5" />,
  packed:           <BoxIcon   className="w-5 h-5" />,
  out_for_delivery: <Truck     className="w-5 h-5" />,
  delivered:        <CheckCircle className="w-5 h-5" />,
  cancelled:        <XCircle  className="w-5 h-5" />,
};

// ─── Real-time order tracker ──────────────────────────────────────────────────
// Status comes exclusively from Firestore via ActiveOrderContext.
// No timers, no fake progression — admin controls this in real-time.

const OrderTracker: React.FC = () => {
  const { trackingStatus, stages } = useActiveOrder();

  if (!trackingStatus) return null;

  const isCancelled = trackingStatus === "cancelled";

  if (isCancelled) {
    return (
      <div className="bg-red-50 rounded-xl p-5 mb-6 border border-red-200 flex items-center gap-3">
        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <p className="text-red-700 font-semibold">Order Cancelled</p>
          <p className="text-red-500 text-sm">Please contact us if you have any questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 rounded-xl p-5 mb-6 border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
          Live Tracking
        </h3>
        {trackingStatus !== "delivered" && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-xs text-neutral-500">Live</span>
          </div>
        )}
      </div>

      {/* Pipeline steps */}
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.key} className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                stage.done
                  ? "bg-green-500 text-white"
                  : stage.active
                    ? "bg-red-600 text-white ring-4 ring-red-100"
                    : "bg-neutral-200 text-neutral-400"
              }`}
            >
              {STAGE_ICONS[stage.key as TrackingStatus]}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-semibold ${
                  stage.done || stage.active ? "text-neutral-900" : "text-neutral-400"
                }`}
              >
                {stage.label}
              </p>
              <p
                className={`text-xs ${
                  stage.active ? "text-red-600 font-medium" : "text-neutral-400"
                }`}
              >
                {stage.active ? stage.description : stage.done ? "Complete ✓" : "Pending"}
              </p>
            </div>
            {stage.active && trackingStatus !== "delivered" && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const OrderSuccess: React.FC = () => {
  const { state } = useLocation() as { state: OrderSuccessState | null };
  const navigate  = useNavigate();
  const { setActiveOrder } = useActiveOrder();

  if (!state?.orderId) {
    return <Navigate to="/" replace />;
  }

  const { orderId, total, paymentIntentId, items = [] } = state;

  // Register the order — ActiveOrderContext will immediately subscribe to
  // Firestore and start receiving real-time status updates from admin.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setActiveOrder({
      orderId,
      total,
      paymentIntentId: paymentIntentId ?? "",
      items,
      placedAt: new Date().toISOString(),
    });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Success icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold text-center text-neutral-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-neutral-500 text-center mb-6">
          Thank you for your order. Track its progress below — updates are live.
        </p>

        {/* Real-time status tracker */}
        <OrderTracker />

        {/* Order summary */}
        <div className="bg-neutral-50 rounded-xl p-5 mb-6 space-y-4">
          <div className="flex items-center gap-2 text-neutral-700">
            <Receipt className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-500">Order ID</span>
            <span className="ml-auto text-sm font-mono font-semibold text-neutral-800">
              {orderId}
            </span>
          </div>

          {paymentIntentId && (
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-neutral-500 whitespace-nowrap">
                Payment Ref
              </span>
              <span className="ml-auto text-xs font-mono text-neutral-600 text-right break-all">
                {paymentIntentId}
              </span>
            </div>
          )}

          {items.length > 0 && (
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-2">Items</p>
              <ul className="space-y-1">
                {items.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm text-neutral-700">
                    <span>{item.quantity}× {item.name}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 border-t border-neutral-200 flex justify-between font-bold text-neutral-900">
            <span>Total Paid</span>
            <span className="text-green-600">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(`/order-history/${orderId}`)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            View Full Order Details
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/Order")}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Order Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
