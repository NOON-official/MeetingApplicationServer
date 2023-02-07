import { CreateCouponDto } from './dtos/create-coupon.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import { UserCoupon } from './../users/interfaces/user-coupon.interface';
import { CouponsRepository } from './repositories/coupons.repository';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Coupon } from './entities/coupon.entity';
import { Coupons, CouponType } from './constants/coupons';
import { RegisterCouponDto } from './dtos/register-coupon.dto';
import * as moment from 'moment-timezone';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CouponsService {
  constructor(
    private couponsRepository: CouponsRepository,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

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

  async registerCoupon(userId: number, registerCouponDto: RegisterCouponDto): Promise<void> {
    const coupon = await this.couponsRepository.getCouponByCode(registerCouponDto.code);

    // 이미 등록된 쿠폰인 경우
    if (!!coupon.user) {
      throw new BadRequestException('already registered coupon');
    }

    // 이미 사용한 쿠폰인 경우
    if (!!coupon.usedAt) {
      throw new BadRequestException('already used coupon');
    }

    // 기한이 만료된 쿠폰인 경우
    if (!!coupon.expiresAt) {
      const today = new Date(moment().tz('Asia/Seoul').format('YYYY-MM-DD'));
      const expiresDay = new Date(coupon.expiresAt);

      if (expiresDay < today) {
        throw new BadRequestException('already expired coupon');
      }
    }

    return this.couponsRepository.registerCoupon(coupon.id, userId);
  }

  async createCouponWithUserId(userId: number, createCouponDto: CreateCouponDto): Promise<void> {
    const couponType = createCouponDto.type;
    const isExistingType = Coupons.find((c) => c.id === couponType);

    // 해당 쿠폰 타입이 존재하지 않는 경우
    if (!isExistingType) {
      throw new BadRequestException('invalid coupon type');
    }

    const user = await this.usersService.getUserById(userId);
    return this.couponsRepository.createCouponWithUser(user, createCouponDto.type, createCouponDto.expiresAt);
  }
}
