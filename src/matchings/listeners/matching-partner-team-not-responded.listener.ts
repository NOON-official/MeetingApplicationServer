import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { TeamsService } from '../../teams/teams.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { MatchingPartnerTeamNotRespondedEvent } from '../events/matching-partner-team-not-responded.event';
import { MatchingPartnerTeamNotRespondedContentConstant } from 'src/common/sms/constants/matching-partner-team-not-responded-content.constant';

@Injectable()
export class MatchingPartnerTeamNotRespondedListener {
  constructor(
    @Inject(forwardRef(() => TeamsService))
    private teamsService: TeamsService,
  ) {}

  // 상대팀 무응답인 유저에게 문자 보내기
  @OnEvent('matching.partnerTeamNotResponded', { async: true })
  async handleMatchingPartnerTeamNotRespondedEvent(event: MatchingPartnerTeamNotRespondedEvent) {
    const team = await this.teamsService.getTeamById(event.teamId);

    !team.user.deletedAt && // 회원 탈퇴한 경우 제외
      postNaverCloudSMS(
        SmsType.LMS,
        ContentType.COMM,
        team.user.phone,
        MatchingPartnerTeamNotRespondedContentConstant.CONTENT,
        MatchingPartnerTeamNotRespondedContentConstant.SUBJECT,
      );
  }
}
