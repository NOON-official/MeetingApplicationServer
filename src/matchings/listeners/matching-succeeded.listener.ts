import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { TeamsService } from './../../teams/teams.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';
import { MatchingSucceededEvent } from '../events/matching-succeeded.event';
import { MatchingSucceededContentConstant } from 'src/common/sms/constants/matching-succeeded.-content.constant';

@Injectable()
export class MatchingSucceededListener {
  constructor(
    @Inject(forwardRef(() => TeamsService))
    private teamsService: TeamsService,
  ) {}

  // 매칭 성공(상호 수락)한 유저에게 문자 보내기
  @OnEvent('matching.succeeded', { async: true })
  async handleMatchingSucceededEvent(event: MatchingSucceededEvent) {
    const team = await this.teamsService.getTeamById(event.teamId);

    postNaverCloudSMS(
      SmsType.LMS,
      ContentType.COMM,
      team.user.phone,
      MatchingSucceededContentConstant.CONTENT,
      MatchingSucceededContentConstant.SUBJECT,
    );
  }
}
