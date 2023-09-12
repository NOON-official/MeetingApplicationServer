import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { MatchingReceivedEvent } from '../events/matching-received.event';
import { MatchingReceivedContentConstant } from 'src/common/sms/constants/matching-received-content.constant';

@Injectable()
export class MatchingReceivedListener {
  // 매칭 신청받은 유저에게 문자 보내기
  @OnEvent('matching.received', { async: true })
  async handleMatchingReceivedEvent(event: MatchingReceivedEvent) {
    const user = event.user;

    !user.deletedAt && // 회원 탈퇴한 경우 제외
      postNaverCloudSMS(
        SmsType.LMS,
        ContentType.COMM,
        user.phone,
        MatchingReceivedContentConstant.CONTENT,
        MatchingReceivedContentConstant.SUBJECT,
      );
  }
}
