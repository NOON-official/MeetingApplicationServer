import { InvitationSucceededEvent } from '../events/invitation-succeeded.event';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CouponsService } from 'src/coupons/coupons.service';
import * as moment from 'moment-timezone';

@Injectable()
export class InvitationSucceededListener {
  constructor(
    @Inject(forwardRef(() => CouponsService))
    private couponsService: CouponsService,
  ) {}

  // 친구초대 4회 달성한 유저에게 1회 이용권 쿠폰 발급
  @OnEvent('invitation.succeeded')
  handleInvitationSucceededEvent(event: InvitationSucceededEvent) {
    const expiresAt = new Date(moment().tz('Asia/Seoul').add(2, 'M').format('YYYY-MM-DD')); // 만료 기한: 두 달

    this.couponsService.createCouponWithUserId(event.inviterId, { couponTypeId: 2, expiresAt });
  }
}
