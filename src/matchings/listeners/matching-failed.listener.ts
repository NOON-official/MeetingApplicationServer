import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { TeamsService } from './../../teams/teams.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { MatchingFailedEvent } from '../events/matching-failed.event';
import { MatchingFailedContentConstant } from 'src/common/sms/constants/matching-failed-content.constant';

@Injectable()
export class MatchingFailedListener {
  constructor(
    @Inject(forwardRef(() => TeamsService))
    private teamsService: TeamsService,
  ) {}

  // 매칭 3회 이상 실패한 유저에게 문자 보내기
  @OnEvent('matching.failed', { async: true })
  async handleMatchingFailedEvent(event: MatchingFailedEvent) {
    const team = await this.teamsService.getTeamById(event.teamId);

    !team.user.deletedAt && // 회원 탈퇴한 경우 제외
      postNaverCloudSMS(
        SmsType.LMS,
        ContentType.COMM,
        team.user.phone,
        MatchingFailedContentConstant.CONTENT,
        MatchingFailedContentConstant.SUBJECT,
      );
  }
}
