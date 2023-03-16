export interface ProductType {
  name: string;
  ticketCount: number;
  originalPrice: number;
  price: number;
  id: number;
}

export const Products: ProductType[] = [
  { name: '이용권 1장', ticketCount: 1, originalPrice: 4900, price: 4900, id: 1 },
  { name: '이용권 2장', ticketCount: 2, originalPrice: 9800, price: 8900, id: 2 },
  { name: '이용권 5장', ticketCount: 5, originalPrice: 24500, price: 19900, id: 3 },
  { name: '이용권 10장', ticketCount: 10, originalPrice: 49000, price: 29900, id: 4 },
];
