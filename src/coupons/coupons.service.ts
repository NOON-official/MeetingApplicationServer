import { CouponsRepository } from './repositories/coupons.repository';
import { Injectable } from '@nestjs/common';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponsService {
  constructor(private couponsRepository: CouponsRepository) {}

  async getCouponById(couponId: number): Promise<Coupon> {
    return this.couponsRepository.getCouponById(couponId);
  }

  async updateUsedAt(couponId: number): Promise<void> {
    return this.couponsRepository.updateUsedAt(couponId);
  }
}
