import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Truck,
  Package,
  Plus,
  Minus,
  Trash2,
  Tag,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { paymentAPI, ordersAPI, promoAPI } from "@/apis";
import toast from "react-hot-toast";
import AddressAutocomplete, {
  AddressResult,
} from "@/components/AddressAutocomplete";

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_COINS_TO_REDEEM = 50;  // must match backend constant
const COIN_TO_AUD         = 0.1; // 1 coin = $0.10 AUD

/** Avoid floating-point drift in money arithmetic */
const roundCents = (n: number): number => Math.round(n * 100) / 100;

// Load Stripe once outside component to avoid re-creation on every render
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
);

// ─────────────────────────────────────────────────────────────────────────────
// Inner checkout form — has access to Stripe hooks
// ─────────────────────────────────────────────────────────────────────────────
const CheckoutInner: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user }                                                  = useAuth();
  const { walletBalance, isLoadingWallet, refreshWallet }         = useWallet();
  const navigate  = useNavigate();
  const stripe    = useStripe();
  const elements  = useElements();

  // ── Shipping ────────────────────────────────────────────────────────────
  const [shippingMethod, setShippingMethod] = useState<"delivery" | "pickup">("delivery");
  const [formData, setFormData] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : "",
    phone:    user?.phoneNumber || "",
  });

  // ── Address ─────────────────────────────────────────────────────────────
  const [houseNo,         setHouseNo]         = useState("");
  const [addressQuery,    setAddressQuery]    = useState("");
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);

  // ── Promo code ───────────────────────────────────────────────────────────
  const [promoInput,    setPromoInput]    = useState("");
  const [promoLoading,  setPromoLoading]  = useState(false);
  const [promoError,    setPromoError]    = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0); // e.g. 0.10 = 10 %
  const [promoApplied,  setPromoApplied]  = useState("");

  // ── Coin redemption ──────────────────────────────────────────────────────
  const [coinsInputValue, setCoinsInputValue] = useState("");
  const [coinsToUse,      setCoinsToUse]      = useState(0);    // committed value
  const [coinsApplied,    setCoinsApplied]    = useState(false);
  const [coinsError,      setCoinsError]      = useState("");

  // ── Payment ──────────────────────────────────────────────────────────────
  const [isLoading,    setIsLoading]    = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Pre-fill contact fields when user object loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || `${user.firstName} ${user.lastName}`,
        phone:    prev.phone    || user.phoneNumber,
      }));
    }
  }, [user]);

  // Reset coin state if balance drops below committed coins
  // (e.g. wallet updated from another tab / admin action)
  useEffect(() => {
    if (coinsApplied && coinsToUse > walletBalance) {
      setCoinsApplied(false);
      setCoinsToUse(0);
      setCoinsInputValue("");
      toast.error("Wallet balance changed — coin discount removed.");
    }
  }, [walletBalance, coinsApplied, coinsToUse]);

  // ── Price calculations (all derived — no stale state) ────────────────────
  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const minOrder = 25;
  const needsMore = Math.max(0, minOrder - subTotal);

  const deliveryFee =
    shippingMethod === "pickup"
      ? 0
      : selectedAddress
        ? selectedAddress.deliveryFee
        : 10;

  const promoDiscountAmt = roundCents(subTotal * promoDiscount);
  const coinDiscountAmt  = roundCents(coinsToUse * COIN_TO_AUD);

  // Prevent total going below $0
  const total = Math.max(
    0,
    roundCents(subTotal - promoDiscountAmt - coinDiscountAmt + deliveryFee),
  );

  // Max coins the user can apply without making total go negative
  const maxUsableCoins = Math.min(
    walletBalance,
    Math.floor((subTotal - promoDiscountAmt + deliveryFee) / COIN_TO_AUD),
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await promoAPI.validatePromoCode({ promoCode: promoInput.trim() });
      if (res.success) {
        setPromoDiscount(res.finalDiscount);
        setPromoApplied(promoInput.trim());
        toast.success(`Promo applied: ${Math.round(res.finalDiscount * 100)}% off`);
      } else {
        setPromoError(res.message || "Invalid promo code");
      }
    } catch {
      setPromoError("Invalid or expired promo code");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoDiscount(0);
    setPromoApplied("");
    setPromoInput("");
    setPromoError("");
  };

  /** Validate and commit the coin value the user typed */
  const handleApplyCoins = useCallback(() => {
    setCoinsError("");
    const parsed = parseInt(coinsInputValue, 10);

    if (isNaN(parsed) || parsed <= 0) {
      setCoinsError("Please enter a valid number of coins.");
      return;
    }
    if (parsed < MIN_COINS_TO_REDEEM) {
      setCoinsError(`Minimum ${MIN_COINS_TO_REDEEM} coins required.`);
      return;
    }
    if (parsed > walletBalance) {
      setCoinsError(`You only have ${walletBalance} coins available.`);
      return;
    }
    if (parsed > maxUsableCoins) {
      setCoinsError(
        `Using ${parsed} coins would make the total $0 or negative. Maximum usable: ${maxUsableCoins} coins.`,
      );
      return;
    }

    setCoinsToUse(parsed);
    setCoinsApplied(true);
    toast.success(
      `${parsed} coins applied — $${roundCents(parsed * COIN_TO_AUD).toFixed(2)} off!`,
    );
  }, [coinsInputValue, walletBalance, maxUsableCoins]);

  const handleRemoveCoins = useCallback(() => {
    setCoinsToUse(0);
    setCoinsInputValue("");
    setCoinsApplied(false);
    setCoinsError("");
  }, []);

  // ── Payment flow ──────────────────────────────────────────────────────────
  //
  // CRITICAL ORDER OF OPERATIONS:
  //   1. Create Stripe PaymentIntent (charged amount = total, already discounted)
  //   2. Confirm card payment with Stripe
  //   3. On payment success → call createOrder
  //        └── Backend atomically:  creates order + deducts coins (Firestore batch)
  //   4. On order success → refreshWallet() to sync UI
  //   5. Clear cart → navigate to success page
  //
  // Coins are NEVER deducted before payment success (no standalone /wallet/redeem
  // call here — the backend handles everything inside createOrder).
  //
  const handlePay = async () => {
    if (!stripe || !elements) {
      setPaymentError("Payment system is not ready. Please refresh the page.");
      return;
    }
    if (!user) {
      toast.error("Please log in to place an order.");
      return;
    }
    if (cartItems.length === 0 || subTotal < minOrder) return;

    // Stripe minimum is $0.50 AUD
    const STRIPE_MIN = 0.5;
    if (total < STRIPE_MIN) {
      toast.error(
        `Total is too low ($${total.toFixed(2)}). Minimum chargeable amount is $${STRIPE_MIN.toFixed(2)}.`,
      );
      return;
    }

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (shippingMethod === "delivery" && !selectedAddress) {
      toast.error("Please select a delivery address from the suggestions.");
      return;
    }
    if (shippingMethod === "delivery" && selectedAddress?.isOutOfRange) {
      toast.error("We currently deliver within 25 km. Please select a closer address.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError("Please enter your card details.");
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      // ── Step 1: Create PaymentIntent (discounted amount) ──────────────────
      // `total` already has coin discount subtracted — Stripe charges exactly this.
      const { clientSecret } = await paymentAPI.createPaymentIntent({
        amount:   total,
        currency: "AUD",
      });

      // ── Step 2: Confirm card payment ──────────────────────────────────────
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name:  formData.fullName,
              phone: formData.phone,
            },
          },
        });

      if (stripeError) {
        // Payment failed — nothing deducted, safe to retry
        setPaymentError(stripeError.message || "Payment failed. Please try again.");
        return;
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        setPaymentError(
          `Payment status: ${paymentIntent?.status ?? "unknown"}. Please try again or contact support.`,
        );
        return;
      }

      // ── Step 3: Payment succeeded — build order payload ───────────────────
      const deliveryAddress =
        shippingMethod === "delivery" && selectedAddress
          ? `${houseNo ? houseNo + ", " : ""}${selectedAddress.streetLine}, ${selectedAddress.suburb}, ${selectedAddress.state} ${selectedAddress.postcode}`
          : "Pickup";

      const orderPayload = {
        userId:         user.userId,
        userName:       `${user.firstName} ${user.lastName}`,
        phoneNumber:    formData.phone,
        address:        deliveryAddress,
        orderItems:     cartItems.map((item) => ({
          cartItemId: item.cartItemId,
          name:       item.name,
          quantity:   item.quantity,
          price:      item.price,
        })),
        totalPrice:     total,           // final charged amount (after all discounts)
        paymentIntentId: paymentIntent.id,
        orderStatus:    "confirmed",
        // Coin fields — backend validates and deducts these atomically
        coinsUsed:      coinsToUse  > 0 ? coinsToUse      : 0,
        coinDiscount:   coinDiscountAmt > 0 ? coinDiscountAmt : 0,
      };

      // ── Step 4: Create order (backend validates coins + deducts atomically) ─
      let orderId: string | undefined;

      try {
        const orderResponse = await ordersAPI.createOrder(orderPayload);
        orderId = orderResponse.orderId;
      } catch (orderErr: unknown) {
        const errMsg =
          orderErr instanceof Error ? orderErr.message : "Unknown error";

        // If coin validation caused the failure, retry WITHOUT coins so that
        // the order is still recorded (payment already succeeded — must not lose it).
        const isCoinError = /coin|wallet|insufficient/i.test(errMsg);

        if (isCoinError && coinsToUse > 0) {
          console.warn(
            "[Checkout] Coin validation failed after payment — retrying without coins.",
            errMsg,
          );
          try {
            const retryResponse = await ordersAPI.createOrder({
              ...orderPayload,
              coinsUsed:    0,
              coinDiscount: 0,
            });
            orderId = retryResponse.orderId;
            handleRemoveCoins();
            toast("Order placed. Coin discount could not be verified — coins not deducted.", {
              icon: "⚠️",
              duration: 7000,
            });
          } catch (retryErr: unknown) {
            console.error("Order creation retry failed:", retryErr);
            toast.error(
              `Payment succeeded (${paymentIntent.id}) but the order could not be saved. ` +
              `Please contact support with this reference.`,
              { duration: 12000 },
            );
            return;
          }
        } else {
          console.error("Order creation failed after payment:", orderErr);
          toast.error(
            `Payment succeeded (${paymentIntent.id}) but the order could not be saved. ` +
            `Please contact support with this reference.`,
            { duration: 12000 },
          );
          return;
        }
      }

      // ── Step 5: Sync wallet UI (coins may have been deducted by backend) ───
      if (coinsToUse > 0) {
        // Refresh wallet silently; failure is non-blocking (backend deducted already)
        refreshWallet().catch(() => {});
      }

      // ── Step 6: Capture items, clear cart, navigate ────────────────────────
      const orderedItems = cartItems.map((i) => ({
        name:     i.name,
        quantity: i.quantity,
        price:    i.price,
      }));

      await clearCart();

      navigate("/order-success", {
        state: {
          orderId,
          total,
          paymentIntentId: paymentIntent.id,
          items:           orderedItems,
          coinsUsed:       coinsToUse,
          coinDiscount:    coinDiscountAmt,
        },
        replace: true,
      });
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      setPaymentError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derived helpers for rendering ─────────────────────────────────────────
  const hasEnoughCoins = walletBalance >= MIN_COINS_TO_REDEEM;

  const previewDiscount =
    coinsInputValue && !isNaN(parseInt(coinsInputValue, 10))
      ? roundCents(parseInt(coinsInputValue, 10) * COIN_TO_AUD)
      : null;

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-20 md:gap-28 pt-12">
      <div className="container-custom section-spacing">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold text-neutral-800">Checkout</h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Left: Shipping Information ───────────────────────────────── */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Shipping method */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h2 className="text-xl font-semibold mb-4 text-neutral-800">
                Delivery Method
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    shippingMethod === "delivery"
                      ? "border-green-500 bg-green-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                  onClick={() => setShippingMethod("delivery")}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Truck
                      className={`w-6 h-6 ${shippingMethod === "delivery" ? "text-green-600" : "text-neutral-500"}`}
                    />
                  </div>
                  <p className="font-medium text-center">Delivery</p>
                  <p className="text-sm text-neutral-500 text-center">$2.50 fee</p>
                </button>

                <button
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    shippingMethod === "pickup"
                      ? "border-blue-500 bg-blue-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                  onClick={() => setShippingMethod("pickup")}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Package
                      className={`w-6 h-6 ${shippingMethod === "pickup" ? "text-blue-600" : "text-neutral-500"}`}
                    />
                  </div>
                  <p className="font-medium text-center">Pickup</p>
                  <p className="text-sm text-neutral-500 text-center">Free</p>
                </button>
              </div>
            </div>

            {/* Contact information */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h2 className="text-xl font-semibold mb-4 text-neutral-800">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Delivery address */}
            {shippingMethod === "delivery" && (
              <motion.div
                className="bg-white rounded-2xl p-6 border border-neutral-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4 text-neutral-800">
                  Delivery Address
                </h2>
                <AddressAutocomplete
                  houseNo={houseNo}
                  onHouseNoChange={setHouseNo}
                  addressQuery={addressQuery}
                  onAddressQueryChange={setAddressQuery}
                  onAddressSelect={setSelectedAddress}
                  selectedAddress={selectedAddress}
                  disabled={isLoading}
                />
              </motion.div>
            )}
          </motion.div>

          {/* ── Right: Order Summary ─────────────────────────────────────── */}
          <motion.div
            className="bg-white rounded-2xl p-6 border border-neutral-200 h-fit"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">Order Summary</h2>
              <button
                onClick={() => clearCart()}
                className="text-sm px-4 py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                title="Clear all items"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-500 mb-4">Your cart is empty</p>
                  <button
                    onClick={() => navigate("/order")}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={`Biryani Darbaar - ${item.name}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-200 rounded-full" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-800 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        disabled={isLoading}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isLoading ? "bg-neutral-100 cursor-not-allowed" : "bg-neutral-200 hover:bg-neutral-300"
                        }`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        disabled={isLoading}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isLoading ? "bg-neutral-100 cursor-not-allowed" : "bg-neutral-200 hover:bg-neutral-300"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        disabled={isLoading}
                        className={`ml-2 transition-colors ${
                          isLoading ? "text-neutral-300 cursor-not-allowed" : "text-red-500 hover:text-red-700"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order totals + discount inputs */}
            {cartItems.length > 0 && (
              <>
                {/* Price breakdown */}
                <div className="space-y-2 pb-4 border-b border-neutral-200">
                  <div className="flex justify-between text-neutral-600">
                    <span>
                      Subtotal (
                      {cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                    <span>${subTotal.toFixed(2)}</span>
                  </div>

                  {promoDiscountAmt > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Promo ({promoApplied})</span>
                      <span>−${promoDiscountAmt.toFixed(2)}</span>
                    </div>
                  )}

                  {coinDiscountAmt > 0 && (
                    <div className="flex justify-between text-amber-600 font-medium">
                      <span className="flex items-center gap-1">
                        🪙 Coins ({coinsToUse})
                      </span>
                      <span>−${coinDiscountAmt.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600">
                    <span>
                      Delivery Fee
                      {selectedAddress && shippingMethod === "delivery" && (
                        <span className="ml-1 text-xs text-neutral-400">
                          ({selectedAddress.distanceKm.toFixed(1)} km)
                        </span>
                      )}
                    </span>
                    <span>
                      {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : "Free"}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between text-xl font-bold text-neutral-800 mt-4 mb-5">
                  <span>Total</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>

                {/* ── Promo code ─────────────────────────────────────────── */}
                {!promoApplied ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading}
                        className="px-3 py-2 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {promoLoading ? "…" : "Apply"}
                      </button>
                    </div>
                    {promoError && (
                      <p className="mt-1 text-xs text-red-600">{promoError}</p>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-green-700 font-medium flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {promoApplied} applied
                    </span>
                    <button
                      onClick={handleRemovePromo}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* ── Wallet / Coin Redemption ────────────────────────────
                 *  Always visible when the user is logged in.
                 *  Shows balance + allows redemption when ≥ 50 coins.
                 ─────────────────────────────────────────────────────── */}
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
                  {/* Header row */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-amber-200">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
                      🪙 Wallet Coins
                    </span>
                    <span className="text-sm font-bold text-amber-700">
                      {isLoadingWallet ? (
                        <span className="text-xs text-amber-500 animate-pulse">Loading…</span>
                      ) : (
                        <>{walletBalance} available</>
                      )}
                    </span>
                  </div>

                  <div className="px-3 py-3">
                    {isLoadingWallet ? null : !hasEnoughCoins ? (
                      /* Not enough coins */
                      <p className="text-xs text-amber-600">
                        You need at least {MIN_COINS_TO_REDEEM} coins to redeem.
                        {walletBalance > 0 && (
                          <> Earn {MIN_COINS_TO_REDEEM - walletBalance} more coins to unlock.</>
                        )}
                      </p>
                    ) : !coinsApplied ? (
                      /* Input form */
                      <div className="space-y-2">
                        <p className="text-xs text-amber-700">
                          1 coin = $0.10 AUD · Min {MIN_COINS_TO_REDEEM} · Max {maxUsableCoins} coins
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={MIN_COINS_TO_REDEEM}
                            max={maxUsableCoins}
                            step={1}
                            value={coinsInputValue}
                            onChange={(e) => {
                              setCoinsInputValue(e.target.value);
                              setCoinsError("");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleApplyCoins()}
                            placeholder={`${MIN_COINS_TO_REDEEM} – ${maxUsableCoins}`}
                            disabled={isLoading}
                            className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50"
                          />
                          <button
                            onClick={handleApplyCoins}
                            disabled={isLoading || !coinsInputValue}
                            className="px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
                          >
                            Apply
                          </button>
                        </div>

                        {/* Live discount preview */}
                        {previewDiscount !== null && !isNaN(previewDiscount) && (
                          <p className="text-xs text-amber-700 font-medium">
                            = ${previewDiscount.toFixed(2)} AUD discount
                          </p>
                        )}

                        {/* Validation error */}
                        {coinsError && (
                          <p className="text-xs text-red-600">{coinsError}</p>
                        )}
                      </div>
                    ) : (
                      /* Applied badge */
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-800 font-semibold">
                          🪙 {coinsToUse} coins → −${coinDiscountAmt.toFixed(2)} off
                        </span>
                        <button
                          onClick={handleRemoveCoins}
                          disabled={isLoading}
                          className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Stripe Card Input ──────────────────────────────────── */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-1">
                    <CreditCard className="w-4 h-4" /> Card Details
                  </label>
                  <div className="px-4 py-3 border border-neutral-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#374151",
                            "::placeholder": { color: "#9ca3af" },
                          },
                          invalid: { color: "#ef4444" },
                        },
                        hidePostalCode: true,
                      }}
                    />
                  </div>
                </div>

                {/* Minimum order warning */}
                {subTotal < minOrder && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">
                      Minimum order is ${minOrder}. Add ${needsMore.toFixed(2)} more to proceed.
                    </p>
                  </div>
                )}

                {/* Out-of-range delivery warning */}
                {shippingMethod === "delivery" && selectedAddress?.isOutOfRange && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">
                      We currently deliver within 25 km. Please select a closer address.
                    </p>
                  </div>
                )}

                {/* Payment error */}
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{paymentError}</p>
                  </div>
                )}

                {/* Pay button */}
                <button
                  onClick={handlePay}
                  disabled={
                    isLoading ||
                    subTotal < minOrder ||
                    cartItems.length === 0 ||
                    !stripe ||
                    total < 0.5 ||
                    (shippingMethod === "delivery" && !!selectedAddress?.isOutOfRange)
                  }
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    !isLoading &&
                    subTotal >= minOrder &&
                    cartItems.length > 0 &&
                    stripe &&
                    !(shippingMethod === "delivery" && selectedAddress?.isOutOfRange)
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                      : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : subTotal >= minOrder ? (
                    `Pay $${total.toFixed(2)}`
                  ) : (
                    `Add $${needsMore.toFixed(2)} to Order`
                  )}
                </button>

                <p className="mt-3 text-xs text-neutral-400 text-center">
                  Payments are secured by Stripe. Card details are never stored on our servers.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ─── Page wrapper: provides Stripe context ────────────────────────────────────
const Checkout: React.FC = () => (
  <Elements stripe={stripePromise}>
    <CheckoutInner />
  </Elements>
);

export default Checkout;
