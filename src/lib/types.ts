export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  tags?: string[];
  specs?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICartItem {
  product: IProduct;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'ready_for_delivery'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type PaymentMethod =
  | 'stripe_test'
  | 'card'
  | 'upi'
  | 'cod'
  | 'net_banking';

export interface IShippingAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  deliveryNotes?: string;
  shippingMethod?: 'standard' | 'express' | 'overnight';
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    cardBrand?: string;
    cardLast4?: string;
    upiId?: string;
    bankName?: string;
  };
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  createdAt?: string;
}
