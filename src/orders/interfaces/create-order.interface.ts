export interface CreateOrder {
  productId: number;
  price: number;
  discountAmount: number;
  totalAmount: number;
  tossPaymentKey?: string;
  tossOrderId?: string;
  tossMethod?: string;
  tossOrderName?: string;
  tossAmount?: number;
}
