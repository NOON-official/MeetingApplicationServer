import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { MatchingSucceededEvent } from '../events/matching-succeeded.event';
import { MatchingSucceededContentConstant } from 'src/common/sms/constants/matching-succeeded-content.constant';

@Injectable()
export class MatchingSucceededListener {
  // 매칭 수락받은 유저에게 문자 보내기
  @OnEvent('matching.succeeded', { async: true })
  async handleMatchingSucceededEvent(event: MatchingSucceededEvent) {
    const user = event.user;

    !user.deletedAt && // 회원 탈퇴한 경우 제외
      postNaverCloudSMS(
        SmsType.LMS,
        ContentType.COMM,
        user.phone,
        MatchingSucceededContentConstant.CONTENT,
        MatchingSucceededContentConstant.SUBJECT,
      );
  }
}
