import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { TeamsService } from './../../teams/teams.service';
import { MatchingMatchedEvent } from './../events/matching-matched.event';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { MatchingMatchedContentConstant } from 'src/common/sms/constants/matching-matched-content.constant';

@Injectable()
export class MatchingMatchedListener {
  constructor(
    @Inject(forwardRef(() => TeamsService))
    private teamsService: TeamsService,
  ) {}

  // 매칭되어 수락/거절 대기중인 유저에게 문자 보내기
  @OnEvent('matching.matched', { async: true })
  async handleMatchingMatchedEvent(event: MatchingMatchedEvent) {
    const team = await this.teamsService.getTeamById(event.teamId);

    !team.user.deletedAt && // 회원 탈퇴한 경우 제외
      postNaverCloudSMS(
        SmsType.LMS,
        ContentType.COMM,
        team.user.phone,
        MatchingMatchedContentConstant.CONTENT,
        MatchingMatchedContentConstant.SUBJECT,
      );
  }
}
