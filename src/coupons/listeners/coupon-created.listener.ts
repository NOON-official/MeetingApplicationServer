import { CouponCreatedEvent } from '../events/coupon-created.event';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { discount50CouponCreatedContentConstant } from 'src/common/sms/constants/discount-50-coupon-created-content.constant';
import { freeCouponCreatedContentConstant } from 'src/common/sms/constants/free-coupon-created-content.constant';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CouponCreatedListener {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  // 회원 코드 입력한 유저에게 1회 이용권 50% 할인 쿠폰 발급
  @OnEvent('coupon.created', { async: true })
  async handleCouponCreatedEvent(event: CouponCreatedEvent) {
    const user = await this.usersService.getUserById(event.userId);

    let smsContent: {
      SUBJECT: string;
      CONTENT: string;
    };

    // 미팅학개론 50% 할인 쿠폰
    if (event.couponTypeId == 1) {
      smsContent = discount50CouponCreatedContentConstant;
    }
    // 미팅학개론 1회 무료 이용 쿠폰
    else if (event.couponTypeId == 2) {
      smsContent = freeCouponCreatedContentConstant;
    }

    !user.deletedAt && // 회원 탈퇴한 경우 제외
      user.phone &&
      postNaverCloudSMS(SmsType.LMS, ContentType.COMM, user.phone, smsContent.CONTENT, smsContent.SUBJECT);
  }
}
