import { UserCoupon } from './../users/interfaces/user-coupon.interface';
import { CouponsRepository } from './repositories/coupons.repository';
import { Injectable } from '@nestjs/common';
import { Coupon } from './entities/coupon.entity';
import { Coupons, CouponType } from './constants/coupons';

@Injectable()
export class CouponsService {
  constructor(private couponsRepository: CouponsRepository) {}

  async getCouponById(couponId: number): Promise<Coupon> {
    return this.couponsRepository.getCouponById(couponId);
  }

  async updateUsedAt(couponId: number): Promise<void> {
    return this.couponsRepository.updateUsedAt(couponId);
  }

  async getCouponCountByUserId(userId: number): Promise<{ couponCount: number }> {
    return this.couponsRepository.getCouponCountByUserId(userId);
  }

  async getCouponsByUserId(userId: number): Promise<{ coupons: UserCoupon[] }> {
    return this.couponsRepository.getCouponsByUserId(userId);
  }

  async getCouponsPagedata(): Promise<{ Coupons: CouponType[] }> {
    return { Coupons };
  }
}
