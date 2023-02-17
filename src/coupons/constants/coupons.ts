export interface CouponType {
  name: string;
  discountRate: number;
  condition: string;
  applicableProducts: number[];
  id: number;
}

export const CouponTypes: CouponType[] = [
  {
    name: '미팅학개론 50% 할인 쿠폰',
    discountRate: 50,
    condition: '이용권 1장에만 사용 가능',
    applicableProducts: [1],
    id: 1,
  },
  {
    name: '미팅학개론 1회 무료 이용 쿠폰',
    discountRate: 100,
    condition: '이용권 1장에만 사용 가능',
    applicableProducts: [1],
    id: 2,
  },
];
