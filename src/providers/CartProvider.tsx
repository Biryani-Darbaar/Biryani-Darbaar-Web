import React, { useState, useEffect, useCallback } from "react";
import { cartAPI } from "@/apis";
import { CartContext } from "@/contexts/CartContext";
import { CartItem } from "@/types/cart.types";
import { CartProviderProps } from "@/types";

// Custom event name used by AuthContext to signal a cart clear in the same tab
const CART_CLEAR_EVENT = "cart:clear";

// Safe JSON parse helper
const safeJsonParse = (jsonStr: string | null): CartItem[] => {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("[CartProvider] Failed to parse local cart:", err);
    return [];
  }
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // ── Core fetch: loads from backend (if logged in) or localStorage ──────────
  const refetchCart = useCallback(async () => {
    const userId = sessionStorage.getItem("sessionUserId");

    if (!import.meta.env.VITE_API_ENDPOINT) {
      const local = localStorage.getItem("local_cart");
      setCartItems(safeJsonParse(local));
      return;
    }

    if (!userId) {
      const local = localStorage.getItem("local_cart");
      setCartItems(safeJsonParse(local));
      return;
    }

    try {
      const data = await cartAPI.getCartItems({ userId });
      const mappedItems: CartItem[] = data.map((apiItem) => ({
        ...apiItem,
        description: "",
      }));
      setCartItems(mappedItems);
    } catch (error) {
      console.error("[CartProvider] Error fetching cart:", error);
      const local = localStorage.getItem("local_cart");
      setCartItems(safeJsonParse(local));
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    refetchCart();
  }, [refetchCart]);

  // ── Re-fetch when user logs in (same-tab localStorage change) ──────────────
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sessionUserId" && e.newValue) {
        refetchCart();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refetchCart]);

  // ── Clear cart on logout (same-tab CustomEvent from AuthContext) ─────────────
  useEffect(() => {
    const handleCartClear = () => {
      setCartItems([]);
      localStorage.removeItem("local_cart");
    };
    window.addEventListener(CART_CLEAR_EVENT, handleCartClear);
    return () => window.removeEventListener(CART_CLEAR_EVENT, handleCartClear);
  }, []);

  const addToCart = async (
    item: Omit<CartItem, "cartItemId" | "quantity">,
    quantity: number,
  ) => {
    if (quantity <= 0) return;

    // If no backend is configured, operate purely in localStorage
    if (!import.meta.env.VITE_API_ENDPOINT) {
      setCartItems((prevItems) => {
        const existing = prevItems.find((i) => i.dishId === item.dishId);
        let updated: CartItem[];
        if (existing) {
          updated = prevItems.map((i) =>
            i.dishId === item.dishId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
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
            i.dishId === item.dishId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
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
        cartItemId:
          response.cartItemId ||
          `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        quantity,
      };

      setCartItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.dishId === item.dishId);
        if (existingItem) {
          return prevItems.map((i) =>
            i.dishId === item.dishId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
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
            : item,
        )
        .filter((item) => item.quantity > 0);

      // Update the backend if available, otherwise persist locally
      const item = updatedItems.find((i) => i.cartItemId === cartItemId);
      const userId = sessionStorage.getItem("sessionUserId");
      if (!import.meta.env.VITE_API_ENDPOINT) {
        localStorage.setItem("local_cart", JSON.stringify(updatedItems));
      } else if (userId) {
        if (item) {
          cartAPI
            .updateCartItem(cartItemId, {
              userId,
              quantity: item.quantity,
            })
            .catch((e: unknown) => console.error(e));
        } else {
          cartAPI
            .deleteCartItem(cartItemId)
            .catch((e: unknown) => console.error(e));
        }
      }

      return updatedItems;
    });
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      if (!import.meta.env.VITE_API_ENDPOINT) {
        setCartItems((prevItems) => {
          const updated = prevItems.filter(
            (item) => item.cartItemId !== cartItemId,
          );
          localStorage.setItem("local_cart", JSON.stringify(updated));
          return updated;
        });
      } else {
        await cartAPI.deleteCartItem(cartItemId);
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.cartItemId !== cartItemId),
        );
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const clearCart = async () => {
    // Capture items BEFORE clearing state (otherwise cartItems will be empty)
    const itemsToDelete = [...cartItems];
    // Always clear local state immediately — never leave a stale cart visible
    setCartItems([]);
    localStorage.removeItem("local_cart");

    // Best-effort backend sync — failure is logged but does not block the user
    if (import.meta.env.VITE_API_ENDPOINT && itemsToDelete.length > 0) {
      try {
        await Promise.all(
          itemsToDelete.map((item) => cartAPI.deleteCartItem(item.cartItemId)),
        );
      } catch (error) {
        console.error(
          "[clearCart] Backend sync failed (local state already cleared):",
          error,
        );
      }
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
        refetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
