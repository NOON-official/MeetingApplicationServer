import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { TeamsService } from '../../teams/teams.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { MatchingOurteamNotRespondedEvent } from '../events/matching-ourteam-not-responded.event';
import { MatchingOurteamNotRespondedContentConstant } from 'src/common/sms/constants/matching-ourteam-not-responded-content.constant';

@Injectable()
export class MatchingOurteamNotRespondedListener {
  constructor(
    @Inject(forwardRef(() => TeamsService))
    private teamsService: TeamsService,
  ) {}

  // 수락/거절 대기자 종료 3시간 전 문자 발송
  @OnEvent('matching.ourteamNotResponded', { async: true })
  async handleMatchingOurteamNotRespondedEvent(event: MatchingOurteamNotRespondedEvent) {
    const team = await this.teamsService.getTeamById(event.teamId);

    !team.user.deletedAt && // 회원 탈퇴한 경우 제외
      postNaverCloudSMS(
        SmsType.LMS,
        ContentType.COMM,
        team.user.phone,
        MatchingOurteamNotRespondedContentConstant.CONTENT,
        MatchingOurteamNotRespondedContentConstant.SUBJECT,
      );
  }
}
