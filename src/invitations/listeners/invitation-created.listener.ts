import { InvitationCreatedEvent } from '../events/invitation-created.event';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CouponsService } from 'src/coupons/coupons.service';
import * as moment from 'moment-timezone';

@Injectable()
export class InvitationCreatedListener {
  constructor(
    @Inject(forwardRef(() => CouponsService))
    private couponsService: CouponsService,
  ) {}

  // 회원 코드 입력한 유저에게 1회 이용권 50% 할인 쿠폰 발급
  @OnEvent('invitation.created')
  handleInvitationCreatedEvent(event: InvitationCreatedEvent) {
    const expiresAt = new Date(moment().tz('Asia/Seoul').add(2, 'M').format('YYYY-MM-DD')); // 만료 기한: 두 달

    this.couponsService.createCouponWithUserId(event.inviteeId, { couponTypeId: 1, expiresAt });
  }
}
