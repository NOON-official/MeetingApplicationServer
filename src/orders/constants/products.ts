export interface ProductType {
  name: string;
  ticketCount: number;
  discountRate: number;
  originalPrice: number;
  price: number;
  id: number;
}

export const Products: ProductType[] = [
  { name: '이용권 1장', ticketCount: 1, discountRate: 0, originalPrice: 5000, price: 5000, id: 1 },
  { name: '이용권 2장', ticketCount: 2, discountRate: 10, originalPrice: 10000, price: 9000, id: 2 },
  { name: '이용권 5장', ticketCount: 5, discountRate: 25, originalPrice: 25000, price: 20000, id: 3 },
  { name: '이용권 10장', ticketCount: 10, discountRate: 40, originalPrice: 50000, price: 30000, id: 4 },
];
