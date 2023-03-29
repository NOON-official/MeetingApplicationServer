import { CouponExpirationPeriod } from '../enums/coupon-expiration-period.enum';

export interface CouponCode {
  id: number;
  name: string; // 쿠폰 코드
  couponTypeId: number; // 쿠폰 타입 ID
  expirationPeriod: CouponExpirationPeriod; // 사용 기한
  maxUseCount: number; // 유저당 최대 사용 횟수
}

export const CouponCodes: CouponCode[] = [
  {
    id: 1,
    name: 'GIFT50',
    couponTypeId: 1, // 50% 할인 쿠폰
    expirationPeriod: CouponExpirationPeriod['2WEEKS'],
    maxUseCount: 1,
  },
];
