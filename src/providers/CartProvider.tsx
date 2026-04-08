import React, { useState, useEffect } from "react";
import { cartAPI } from "@/apis";
import { CartContext } from "@/contexts/CartContext";
import { CartItem } from "@/types/cart.types";
import { CartProviderProps } from "@/types";

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Try to fetch cart items from backend; fall back to localStorage if unavailable
  useEffect(() => {
    const fetchCartItems = async () => {
      const userId = sessionStorage.getItem("sessionUserId");
      // If no backend endpoint configured, load local cart
      if (!import.meta.env.VITE_API_ENDPOINT) {
        const local = localStorage.getItem("local_cart");
        if (local) setCartItems(JSON.parse(local));
        return;
      }

      
      try {
        if (!userId) {
          // no user id -> load local
          const local = localStorage.getItem("local_cart");
          if (local) setCartItems(JSON.parse(local));
          return;
        }

        const data = await cartAPI.getCartItems({ userId });
        // Map API cart items to local CartItem format
        const mappedItems: CartItem[] = data.map((apiItem) => ({
          ...apiItem,
          description: "", // API doesn't return description, default to empty
        }));
        setCartItems(mappedItems);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        const local = localStorage.getItem("local_cart");
        if (local) setCartItems(JSON.parse(local));
      }
    };
    fetchCartItems();
  }, []);

  const addToCart = async (
    item: Omit<CartItem, "cartItemId" | "quantity">,
    quantity: number
  ) => {
    if (quantity <= 0) return;

    // If no backend is configured, operate purely in localStorage
    if (!import.meta.env.VITE_API_ENDPOINT) {
      setCartItems((prevItems) => {
        const existing = prevItems.find((i) => i.dishId === item.dishId);
        let updated: CartItem[];
        if (existing) {
          updated = prevItems.map((i) =>
            i.dishId === item.dishId ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          const newItem: CartItem = {
            ...item,
            cartItemId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            quantity,
          };
          updated = [...prevItems, newItem];
        }
        localStorage.setItem("local_cart", JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const userId = sessionStorage.getItem("sessionUserId");
    if (!userId) {
      // If there is a backend configured but no user, fallback to local
      const newItem: CartItem = {
        ...item,
        cartItemId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        quantity,
      };
      setCartItems((prev) => {
        const existing = prev.find((i) => i.dishId === item.dishId);
        let updated: CartItem[];
        if (existing) {
          updated = prev.map((i) =>
            i.dishId === item.dishId ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          updated = [...prev, newItem];
        }
        localStorage.setItem("local_cart", JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const response = await cartAPI.addToCart({
        userId,
        dishId: item.dishId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity,
        addons: item.addons,
      });

      const newItem: CartItem = {
        ...item,
        cartItemId: response.cartItemId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        quantity,
      };

      setCartItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.dishId === item.dishId);
        if (existingItem) {
          return prevItems.map((i) =>
            i.dishId === item.dishId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prevItems, newItem];
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const updateQuantity = (cartItemId: string, change: number) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: Math.max(item.quantity + change, 0) }
            : item
        )
        .filter((item) => item.quantity > 0);

      // Update the backend if available, otherwise persist locally
      const item = updatedItems.find((i) => i.cartItemId === cartItemId);
      const userId = sessionStorage.getItem("sessionUserId");
      if (!import.meta.env.VITE_API_ENDPOINT) {
        localStorage.setItem("local_cart", JSON.stringify(updatedItems));
      } else if (userId) {
        if (item) {
          cartAPI.updateCartItem(cartItemId, {
            userId,
            quantity: item.quantity,
          }).catch((e: unknown) => console.error(e));
        } else {
          cartAPI.deleteCartItem(cartItemId).catch((e: unknown) => console.error(e));
        }
      }

      return updatedItems;
    });
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      if (!import.meta.env.VITE_API_ENDPOINT) {
        setCartItems((prevItems) => {
          const updated = prevItems.filter((item) => item.cartItemId !== cartItemId);
          localStorage.setItem("local_cart", JSON.stringify(updated));
          return updated;
        });
      } else {
        await cartAPI.deleteCartItem(cartItemId);
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.cartItemId !== cartItemId)
        );
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      if (!import.meta.env.VITE_API_ENDPOINT) {
        setCartItems([]);
        localStorage.removeItem("local_cart");
      } else {
        await Promise.all(
          cartItems.map((item) => cartAPI.deleteCartItem(item.cartItemId))
        );
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
