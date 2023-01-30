import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Coupon } from '../entities/coupon.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import * as moment from 'moment-timezone';

@CustomRepository(Coupon)
export class CouponsRepository extends Repository<Coupon> {
  async getCouponById(couponId: number): Promise<Coupon> {
    const coupon = await this.findOneBy({ id: couponId });

    if (!coupon) {
      throw new NotFoundException(`Can't find coupon with id ${couponId}`);
    }

    return coupon;
  }

  async updateUsedAt(couponId: number): Promise<void> {
    await this.update({ id: couponId }, { usedAt: moment().tz('Asia/Seoul').format() });
  }
}
