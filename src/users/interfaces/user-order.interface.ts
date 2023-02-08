export interface UserOrder {
  id: number;
  productId: number;
  totalAmount: number;
  couponTypeId: number;
  createdAt: Date;
}
