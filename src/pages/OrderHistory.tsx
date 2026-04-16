import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  RefreshCw,
} from "lucide-react";
import { ordersAPI } from "@/apis";
import type { ApiOrder } from "@/types/api.types";

// ─── helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; colour: string; bg: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="w-4 h-4" />,
    colour: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle className="w-4 h-4" />,
    colour: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  preparing: {
    label: "Preparing",
    icon: <Package className="w-4 h-4" />,
    colour: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
  },
  "out for delivery": {
    label: "Out for Delivery",
    icon: <Truck className="w-4 h-4" />,
    colour: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
  },
  delivered: {
    label: "Delivered",
    icon: <CheckCircle className="w-4 h-4" />,
    colour: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle className="w-4 h-4" />,
    colour: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="w-4 h-4" />,
    colour: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="w-4 h-4" />,
    colour: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status ?? "Unknown",
    icon: <Clock className="w-4 h-4" />,
    colour: "text-neutral-700",
    bg: "bg-neutral-50 border-neutral-200",
  };

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// ─── component ───────────────────────────────────────────────────────────────

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersAPI.getOrders();
      // Sort newest-first (backend already does this, but defensive sort here too)
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
      );
      setOrders(sorted);
    } catch (err) {
      console.error("Failed to fetch order history:", err);
      setError("Could not load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-h-screen pt-12 bg-neutral-50">
      <div className="container-custom section-spacing">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">
              Order History
            </h1>
            <p className="text-neutral-500 mt-1">
              {orders.length > 0
                ? `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`
                : "All your past orders in one place"}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-5 h-5 text-neutral-600 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </motion.div>

        {/* States */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-neutral-200 animate-pulse"
              >
                <div className="flex justify-between mb-4">
                  <div className="h-4 bg-neutral-200 rounded w-32" />
                  <div className="h-6 bg-neutral-200 rounded w-24" />
                </div>
                <div className="h-3 bg-neutral-100 rounded w-48 mb-2" />
                <div className="h-3 bg-neutral-100 rounded w-36" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <XCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-neutral-700 font-medium mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ShoppingBag className="w-20 h-20 text-neutral-300 mb-6" />
            <h2 className="text-2xl font-semibold text-neutral-700 mb-2">
              No orders yet
            </h2>
            <p className="text-neutral-500 mb-8 max-w-sm">
              Looks like you haven't placed any orders. Browse our menu and
              treat yourself!
            </p>
            <button
              onClick={() => navigate("/Order")}
              className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Browse Menu
            </button>
          </motion.div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const st = getStatusConfig(order.orderStatus);
              const itemCount =
                order.orderItems?.reduce((s, i) => s + i.quantity, 0) ?? 0;

              return (
                <motion.div
                  key={order.orderId}
                  className="bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/order-history/${order.orderId}`)}
                >
                  <div className="p-5 flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-6 h-6 text-red-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-neutral-900 text-sm truncate">
                            Order #{order.orderId.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {formatDate(order.orderDate)}
                          </p>
                        </div>
                        {/* Status badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${st.bg} ${st.colour} flex-shrink-0`}
                        >
                          {st.icon}
                          {st.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-neutral-500">
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                          {order.orderItems?.[0]?.dishName &&
                            ` · ${order.orderItems[0].dishName}${itemCount > 1 ? ` +${itemCount - 1} more` : ""}`}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-neutral-900">
                            ${Number(order.totalPrice).toFixed(2)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
