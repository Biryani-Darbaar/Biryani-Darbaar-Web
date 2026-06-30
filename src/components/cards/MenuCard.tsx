import React from "react";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { MenuCardProps } from "@/types";

const MenuCard: React.FC<MenuCardProps> = ({
  title,
  description,
  imageUrl,
  dishId,
  price,
}) => {
  const { cartItems, updateQuantity, addToCart } = useCart();

  const cartItem = cartItems.find((item) => item.dishId === dishId);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAdd = async () => {
    if (cartItem) {
      updateQuantity(cartItem.cartItemId, 1);
    } else {
      await addToCart(
        { dishId, name: title, description, image: imageUrl, price },
        1
      );
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl border transition-all duration-300 p-6 w-full max-w-lg border-neutral-100"
      whileHover={{ scale: 1.02, y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with image and info */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-neutral-800 mb-2 leading-tight">
            {title}
          </h3>

          {/* Spice level indicator */}
          <div className="flex items-center gap-2 mb-3">
            <img src="/assets/icons/chilli.png" alt="Biryani Darbaar - Spice Level" className="w-5 h-5" />
            <span className="text-sm text-orange-600 font-medium">Medium Spicy</span>
          </div>

          <p className="text-sm text-neutral-600 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="relative">
          <img
            src={imageUrl}
            alt={`Biryani Darbaar - ${title}`}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-md"
          />
          {currentQuantity > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {currentQuantity}
            </div>
          )}
        </div>
      </div>

      {/* Price and add-to-cart */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <span className="text-xl font-black text-green-700">
          ${typeof price === "number" ? price.toFixed(2) : price}
        </span>

        {currentQuantity === 0 ? (
          <motion.button
            onClick={handleAdd}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add to Cart
          </motion.button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => cartItem && updateQuantity(cartItem.cartItemId, -1)}
              className="w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4 text-red-600" />
            </button>
            <span className="font-bold text-lg text-neutral-800 min-w-[2rem] text-center">
              {currentQuantity}
            </span>
            <button
              onClick={() => cartItem && updateQuantity(cartItem.cartItemId, 1)}
              className="w-9 h-9 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 text-green-600" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MenuCard;
