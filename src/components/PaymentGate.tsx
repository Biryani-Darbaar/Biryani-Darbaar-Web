// PaymentGate.tsx
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { paymentAPI, ordersAPI } from "@/apis";
import { useCart } from "../contexts/CartContext";
// Stripe publishable key is loaded from environment variable
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
);

interface OrderItem {
  cartItemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface CheckoutProps {
  amount: number;
  order: OrderItem[];
  onClose: () => void;
  user: {
    data: {
      userName: string;
      phoneNumber: string;
      address: string;
      userId: string;
    };
  };
}

const Checkout: React.FC<CheckoutProps> = ({
  amount,
  order,
  onClose,
  user,
}) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [toastState, setToastState] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setPaymentError(null);
    try {
      setLoading(true);
      const { clientSecret } = await paymentAPI.createPaymentIntent({
        amount,
        currency: "AUD",
      });

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });

      if (result.error) {
        setPaymentError(result.error.message || "An unknown error occurred.");
      } else if (result.paymentIntent?.status === "succeeded") {
        const orderDetails = {
          userId: user.data.userId,
          userName: user.data.userName,
          phoneNumber: user.data.phoneNumber,
          address: user.data.address,
          orderItems: order.map((orderItem) => ({
            cartItemId: orderItem.cartItemId,
            name: orderItem.name,
            quantity: orderItem.quantity,
            price: orderItem.price,
          })),
          totalPrice: amount,
        };

        await ordersAPI.createOrder(orderDetails);
        await ordersAPI.deleteCartItemsAfterOrder(
          order.map((item) => item.cartItemId),
        );
        clearCart();
        setToastState(true);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setPaymentError("An error occurred while processing your payment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (toastState) {
      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    }
  }, [toastState, navigate]);

  return (
    <motion.div
      className="payment-modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onClick={onClose}
    >
      <motion.div
        className="payment-modal-content bg-white p-6 rounded-lg relative w-96"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4">
          <X className="w-6 h-6 text-neutral-600 hover:text-red-500 transition" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-4 text-black">
          Checkout
        </h2>
        <div className="mb-6">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#32325d",
                  "::placeholder": { color: "#a0aec0" },
                },
                invalid: { color: "#fa755a" },
              },
            }}
          />
        </div>
        <button
          onClick={handlePayment}
          disabled={!stripe || loading}
          className={`w-full px-4 py-2 text-white rounded-lg transition ${
            loading
              ? "bg-neutral-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </button>
        {paymentError && (
          <div className="mt-4 text-red-500 text-sm">{paymentError}</div>
        )}
        {toastState && (
          <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            Payment successful! Your order has been placed.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const CheckoutPage: React.FC<Omit<CheckoutProps, "onClose">> = ({
  amount,
  order,
  user,
}) => {
  const [showCheckoutModal, setShowCheckoutModal] = useState(true);

  return (
    <>
      {showCheckoutModal && (
        <Elements stripe={stripePromise}>
          <Checkout
            amount={amount}
            order={order}
            onClose={() => setShowCheckoutModal(false)}
            user={user}
          />
        </Elements>
      )}
    </>
  );
};

export default CheckoutPage;
