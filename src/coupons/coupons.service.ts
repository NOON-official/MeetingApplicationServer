import { CreateCouponDto } from './dtos/create-coupon.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import { UserCoupon } from './../users/interfaces/user-coupon.interface';
import { CouponsRepository } from './repositories/coupons.repository';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Coupon } from './entities/coupon.entity';
import { CouponTypes, CouponType } from './constants/coupons.constant';
import { RegisterCouponDto } from './dtos/register-coupon.dto';
import * as moment from 'moment-timezone';
import { UsersService } from 'src/users/users.service';
import { CouponCodes } from './constants/coupon-codes.constant';
import { CouponExpirationPeriod } from './enums/coupon-expiration-period.enum';

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

  async getCouponTypesPagedata(): Promise<{ CouponTypes: CouponType[] }> {
    return { CouponTypes };
  }

  async registerCoupon(userId: number, registerCouponDto: RegisterCouponDto): Promise<void> {
    const couponCode = registerCouponDto.code;
    const commonCode = CouponCodes.find((c) => c.name === couponCode);

    // 공통 쿠폰 코드인 경우
    if (commonCode) {
      const coupons = await this.couponsRepository.getCouponsByUserIdAndCode(userId, couponCode);

      // 유저가 이미 해당 코드로 쿠폰을 발급한 경우
      if (coupons.length >= commonCode.maxUseCount) {
        throw new BadRequestException(`already issued coupon`);
      }

      let expiresAt: Date; // 만료 기한

      switch (commonCode.expirationPeriod) {
        case CouponExpirationPeriod['2WEEKS']: // 2주
          expiresAt = new Date(moment().tz('Asia/Seoul').add(2, 'w').format('YYYY-MM-DD'));
          break;
        default: // 기본: 두 달
          expiresAt = new Date(moment().tz('Asia/Seoul').add(2, 'M').format('YYYY-MM-DD'));
      }

      const newCoupon: CreateCouponDto = {
        couponTypeId: commonCode.couponTypeId,
        couponCode: commonCode.name,
        expiresAt,
      };

      // 해당 유저에게 쿠폰 발급
      return await this.createCouponWithUserId(userId, newCoupon);
    }
    // 개별 쿠폰 코드인 경우
    else {
      const coupon = await this.couponsRepository.getCouponByCode(couponCode);

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
  }

  async createCouponWithUserId(userId: number, createCouponDto: CreateCouponDto): Promise<void> {
    const couponTypeId = createCouponDto.couponTypeId;
    const isExistingType = CouponTypes.find((c) => c.id === couponTypeId);

    // 해당 쿠폰 타입이 존재하지 않는 경우
    if (!isExistingType) {
      throw new BadRequestException('invalid coupon type');
    }

    const user = await this.usersService.getUserById(userId);
    return this.couponsRepository.createCouponWithUser(
      user,
      createCouponDto.couponTypeId,
      createCouponDto.couponCode,
      createCouponDto.expiresAt,
    );
  }

  async getCouponCountByTypeIdAndUserId(typeId: number, userId: number): Promise<{ couponCount: number }> {
    return this.couponsRepository.getCouponCountByTypeIdAndUserId(typeId, userId);
  }

  async deleteCouponsByUserId(userId: number): Promise<void> {
    return this.couponsRepository.deleteCouponsByUserId(userId);
  }
}
