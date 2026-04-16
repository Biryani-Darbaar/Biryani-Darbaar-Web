import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag, X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

const MIN_ORDER = 25;

interface CartItemType {
  cartItemId: string;
  dishId: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  quantity: number;
}

interface CartModalProps {
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // Lock background scroll while modal is open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const handleCheckout = () => {
    navigate("/Checkout");
    onClose();
  };

  const subTotal = cartItems.reduce(
    (s: number, i: CartItemType) => s + i.price * i.quantity,
    0,
  );
  const discount = 0;
  const deliveryFee = subTotal > 0 ? 2.5 : 0;
  const totalToPay = subTotal + deliveryFee + discount;
  const isCartEmpty = cartItems.length === 0;
  const meetsMinimum = subTotal >= MIN_ORDER;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-xl font-bold">My Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {isCartEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-neutral-300 mb-4" />
              <p className="text-lg font-semibold text-neutral-600 mb-1">
                Your cart is empty
              </p>
              <p className="text-sm text-neutral-400 mb-6">
                Add some delicious items to get started!
              </p>
              <button
                onClick={() => { navigate("/Order"); onClose(); }}
                className="px-8 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 hover:shadow-md transition-all duration-200"
              >
                Order Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item: CartItemType) => (
                <div
                  key={item.cartItemId}
                  className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  {/* Quantity badge */}
                  <div className="flex-shrink-0 w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    ×{item.quantity}
                  </div>

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-neutral-900 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="font-bold text-red-600 whitespace-nowrap text-sm">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    {item.description && (
                      <p className="text-xs text-neutral-500 line-clamp-1 mb-2">
                        {item.description}
                      </p>
                    )}

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="w-7 h-7 bg-white border border-neutral-300 rounded-md flex items-center justify-center hover:bg-neutral-50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5 text-neutral-600" />
                      </button>
                      <span className="font-semibold text-neutral-900 w-6 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="w-7 h-7 bg-white border border-neutral-300 rounded-md flex items-center justify-center hover:bg-neutral-50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5 text-neutral-600" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="ml-auto w-7 h-7 bg-red-50 text-red-500 rounded-md flex items-center justify-center hover:bg-red-100 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals — only shown when cart has items */}
        {!isCartEmpty && (
          <div className="border-t border-neutral-200 p-5 bg-neutral-50 flex-shrink-0">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold">${subTotal.toFixed(2)}</span>
              </div>
              {discount !== 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">
                    −${Math.abs(discount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Delivery Fee</span>
                <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-300">
                <span>Total</span>
                <span className="text-red-600">${totalToPay.toFixed(2)}</span>
              </div>
            </div>

            {/* Minimum order warning */}
            {!meetsMinimum && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">
                    Minimum order amount is ${MIN_ORDER}.
                  </span>{" "}
                  Please add{" "}
                  <span className="font-bold">
                    ${(MIN_ORDER - subTotal).toFixed(2)} more
                  </span>{" "}
                  to proceed.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => clearCart()}
                className="px-4 py-2.5 bg-neutral-200 text-neutral-700 rounded-lg font-semibold text-sm hover:bg-neutral-300 transition-colors"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                disabled={isCartEmpty || !meetsMinimum}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  isCartEmpty || !meetsMinimum
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700 hover:shadow-md"
                }`}
              >
                {isCartEmpty
                  ? "Cart is Empty"
                  : !meetsMinimum
                    ? `Add $${(MIN_ORDER - subTotal).toFixed(2)} more`
                    : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default CartModal;
