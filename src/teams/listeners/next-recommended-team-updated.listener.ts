import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { NextRecommendedTeamUpdatedEvent } from '../events/next-recommended-team-updated.event';
import { NextRecommendedTeamUpdatedContentConstant } from 'src/common/sms/constants/next-recommended-team-updated-content.constant';

@Injectable()
export class NextRecommendedTeamUpdatedListener {
  // 다음 추천팀이 업데이트된 유저에게 문자 보내기
  @OnEvent('next-recommended-team.updated', { async: true })
  async handleNextRecommendedTeamUpdatedEvent(event: NextRecommendedTeamUpdatedEvent) {
    const user = event.user;

    !user.deletedAt && // 회원 탈퇴한 경우 제외
      postNaverCloudSMS(
        SmsType.LMS,
        ContentType.COMM,
        user.phone,
        NextRecommendedTeamUpdatedContentConstant.CONTENT,
        NextRecommendedTeamUpdatedContentConstant.SUBJECT,
      );
  }
}
