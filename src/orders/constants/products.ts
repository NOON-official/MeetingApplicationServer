export interface ProductType {
  name: string;
  tingCount: number;
  originalPrice: number;
  price: number;
  id: number;
}

export const Products: ProductType[] = [
  { name: '팅 10개', tingCount: 10, originalPrice: 4900, price: 4900, id: 1 },
  { name: '팅 20개', tingCount: 20, originalPrice: 10000, price: 9000, id: 2 },
  { name: '팅 30개', tingCount: 30, originalPrice: 15000, price: 13500, id: 3 },
  { name: '팅 50개', tingCount: 50, originalPrice: 25000, price: 19900, id: 4 },
];
