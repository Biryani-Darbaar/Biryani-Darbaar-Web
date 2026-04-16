/**
 * Menu Constants
 * Centralized constants for categories, dishes, and menu-related configurations
 */

// ============================================================================
// Dish Status Constants
// ============================================================================

export const DISH_STATUS = {
  AVAILABLE: true,
  UNAVAILABLE: false,
} as const;

export const OFFER_STATUS = {
  AVAILABLE: true,
  UNAVAILABLE: false,
} as const;

// ============================================================================
// Price Configuration
// ============================================================================

export const PRICE_CONFIG = {
  GOLD_MEMBER_DISCOUNT_PERCENT: 30, // Gold members get discount on price
  MIN_ORDER_VALUE: 20, // Minimum order value in AUD
  MIN_PAYMENT_AMOUNT: 0.50, // Stripe minimum in AUD
} as const;

// ============================================================================
// Delivery Configuration
// ============================================================================

export const DELIVERY_CONFIG = {
  TIERS: [
    { maxKm: 5, fee: 10 },
    { maxKm: 10, fee: 15 },
    { maxKm: 15, fee: 20 },
    { maxKm: 20, fee: 25 },
    { maxKm: Infinity, fee: 30 },
  ],
  DEFAULT_FEE: 10,
  PICKUP_FEE: 0,
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  CATEGORIES_LOAD_FAILED: "Failed to load categories. Please try again.",
  DISHES_LOAD_FAILED: (category: string) => `Failed to load dishes from ${category}. Please try again.`,
  NO_DISHES_FOUND: "No dishes found in this category.",
  DISH_NOT_AVAILABLE: "This dish is currently unavailable.",
  INVALID_CATEGORY: "Invalid category selected.",
} as const;

// ============================================================================
// Loading Messages
// ============================================================================

export const LOADING_MESSAGES = {
  LOADING_CATEGORIES: "Loading categories...",
  LOADING_DISHES: "Loading delicious dishes...",
  LOADING_MENU: "Loading menu...",
} as const;
