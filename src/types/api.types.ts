/**
 * API-related type definitions
 * All types used in API requests and responses
 */

// ============================================================================
// Auth API Types
// ============================================================================

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginWithGoogleData {
  idToken: string;
}

export interface SignupWithGoogleData {
  idToken: string;
  phoneNumber: string;
  address: string;
}

/**
 * AuthResponse reflects what the axios interceptor returns AFTER unwrapping the
 * standard { success, statusCode, data } envelope. The shape is the inner `data`
 * object that the backend places inside `data`:
 *   { user, tokens: { accessToken, refreshToken, expiresIn }, sessionId }
 */
export interface AuthResponse {
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    email: string;
    phoneNumber: string;
    address: string;
    role: string;
    isGoldMember: boolean;
    emailVerified?: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
  sessionId?: number;
}

/**
 * RefreshTokenResponse reflects what the axios interceptor returns AFTER
 * unwrapping the { success, statusCode, data } envelope — i.e. just the
 * inner data object: { accessToken, expiresIn }.
 */
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: string;
}

export interface LoginWithGoogleResponse {
  sessionId: string;
  sessionUserId: string;
}

// ============================================================================
// Cart API Types
// ============================================================================

export interface ApiCartItem {
  cartItemId: string;
  dishId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  addons?: { name: string; price: number }[];
}

export interface GetCartData {
  userId: string;
}

export interface AddToCartData {
  userId: string;
  dishId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  addons?: { name: string; price: number }[];
}

export interface AddToCartResponse {
  cartItemId: string;
}

export interface UpdateCartData {
  userId: string;
  quantity: number;
}

// ============================================================================
// Contact API Types
// ============================================================================

export interface ContactFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  description: string;
}

// ============================================================================
// Dishes API Types
// ============================================================================

export interface ApiDish {
  dishId: string;
  name?: string;
  dishName?: string;
  category?: string;
  description: string;
  image: string;
  price: number;
  goldPrice?: number;
  available: boolean;
  offerAvailable: boolean;
  discount: number;
  addons?: { addonName: string; price: string | number }[];
}

// ============================================================================
// Orders API Types
// ============================================================================

export interface ApiOrderItem {
  dishId: string;
  /** Field name from backend */
  dishName?: string;
  /** Alternative name field used in some responses */
  name?: string;
  cartItemId?: string;
  quantity: number;
  price: number;
}

export interface ApiOrder {
  orderId: string;
  userId?: string;
  userName?: string;
  orderItems: ApiOrderItem[];
  totalPrice: number;
  orderDate: string;
  orderStatus: string;
  /** Delivery address or 'Pickup' */
  address?: string;
  customerAddress?: string;
  paymentIntentId?: string;
  paymentVerified?: boolean;
}

export interface CreateOrderData {
  userId: string;
  userName: string;
  phoneNumber: string;
  address: string;
  orderItems: {
    cartItemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  /** Stripe PaymentIntent ID — stored for reference and dispute resolution */
  paymentIntentId?: string;
  /** Initial order status; defaults to 'pending' on the backend */
  orderStatus?: string;
  /** Coins redeemed for a discount on this order */
  coinsUsed?: number;
  /** AUD discount applied from coins (coinsUsed * 0.10) */
  coinDiscount?: number;
}

export interface CreateOrderResponse {
  orderId: string;
}

// ============================================================================
// Payment API Types
// ============================================================================

export interface CreatePaymentIntentData {
  /** Amount in dollars (backend converts to cents automatically) */
  amount: number;
  currency: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface VerifyPaymentData {
  paymentIntentId: string;
  /** Optional: if provided the backend will confirm the order in Firestore */
  orderId?: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  status: string;
  amount: number;
  currency: string;
}

// ============================================================================
// Promo API Types
// ============================================================================

export interface ValidatePromoData {
  promoCode: string;
}

export interface ValidatePromoResponse {
  success: boolean;
  message?: string;
  finalDiscount: number;
}

// ============================================================================
// User API Types
// ============================================================================

export interface ApiUser {
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  isGoldMember: boolean;
  reward: number;
  discount: number;
}

export interface ApplyRewardData {
  reward: number;
  userId: string;
  dollar: number;
}

export interface ApplyRewardResponse {
  reward: number;
  totalPrice: number;
}

// ============================================================================
// Wallet / Spin-Wheel API Types
// ============================================================================

export interface WalletData {
  walletBalance: number;
  lastSpinAt: string | null;
  canSpinToday: boolean;
}

export interface WalletSpinResponse {
  coinsWon: number;
  walletBalance: number;
  lastSpinAt: string;
}

export interface WalletRedeemData {
  coinsToRedeem: number;
}

export interface WalletRedeemResponse {
  coinsRedeemed: number;
  /** AUD discount — 1 coin = $0.10 */
  discountAmount: number;
  walletBalance: number;
}

export interface WalletAdminUpdateData {
  action: "increase" | "decrease" | "reset";
  amount?: number;
}
