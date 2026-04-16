/**
 * Order and checkout-related type definitions
 */

export interface Order {
  orderId: string;
  orderItems: OrderItem[];
  totalPrice: number;
  orderDate: string;
  orderStatus: string;
  customerAddress?: string;
  address?: string;
  paymentIntentId?: string;
  paymentVerified?: boolean;
}

export interface OrderItem {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number;
}

export type ShippingMethod = "delivery" | "pickup";

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PaymentGateProps {
  amount: number;
  order: Array<{
    cartItemId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  user: {
    data: {
      userName: string;
      phoneNumber: string;
      address: string;
      userId: string;
    };
  };
}
