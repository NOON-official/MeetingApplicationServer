import { MatchingPartnerTeamNotRespondedEvent } from './../matchings/events/matching-partner-team-not-responded.event';
import { MatchingsService } from './../matchings/matchings.service';
import { TicketsService } from 'src/tickets/tickets.service';
import { TeamsService } from './../teams/teams.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TeamGender } from 'src/teams/entities/team-gender.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoggerService } from 'src/common/utils/logger-service.util';
import { MatchingStatus } from 'src/matchings/interfaces/matching-status.enum';
import * as moment from 'moment-timezone';
import { MatchingOurteamNotRespondedEvent } from 'src/matchings/events/matching-ourteam-not-responded.event';

@Injectable()
export class TasksService {
  constructor(
    private teamsService: TeamsService,
    private ticketsService: TicketsService,
    private matchingsService: MatchingsService,
    private eventEmitter: EventEmitter2,
  ) {}

  // 두 시간마다 실행
  @Cron(CronExpression.EVERY_2_HOURS)
  async handleEventListenerCount() {
    const loggerService = new LoggerService('EVENT');

    // 이벤트 리스너 개수 출력
    loggerService.verbose(
      `[Event Listener]\n            Event Name             | Listener Count\n----------------------------------------------------\n       'invitation.created'        |      ${this.eventEmitter.listenerCount(
        'invitation.created',
      )}개\n      'invitation.succeeded'       |      ${this.eventEmitter.listenerCount(
        'invitation.succeeded',
      )}개\n        'matching.failed'          |      ${this.eventEmitter.listenerCount(
        'matching.failed',
      )}개\n        'matching.matched'         |      ${this.eventEmitter.listenerCount(
        'matching.matched',
      )}개\n'matching.partnerTeamNotResponded' |      ${this.eventEmitter.listenerCount(
        'matching.partnerTeamNotResponded',
      )}개\n  'matching.ourteamNotResponded'   |      ${this.eventEmitter.listenerCount(
        'matching.ourteamNotResponded',
      )}개\n   'matching.partnerTeamRefused'   |      ${this.eventEmitter.listenerCount(
        'matching.partnerTeamRefused',
      )}개\n       'matching.succeeded'        |      ${this.eventEmitter.listenerCount(
        'matching.succeeded',
      )}개\n          'team.created'           |      ${this.eventEmitter.listenerCount(
        'team.created',
      )}개\n                                       총 ${this.eventEmitter.listenerCount()}개`,
    );
  }

  // 매 분(0초)마다 실행
  // @Cron(CronExpression.EVERY_MINUTE)
  // async handlePartnerTeamNotRespondedTeams() {
  //   // 상대팀이 무응답하고, 이용권 환불받지 않은 팀 조회
  //   const { teams: partnerTeamNotRespondedMaleTeams } = await this.teamsService.getPartnerTeamNotRespondedTeamsByGender(
  //     TeamGender.male,
  //   );
  //   const { teams: partnerTeamNotRespondedFemaleTeams } =
  //     await this.teamsService.getPartnerTeamNotRespondedTeamsByGender(TeamGender.female);

  //   for await (const maleTeam of partnerTeamNotRespondedMaleTeams) {
  //     const matchingPartnerTeamNotRespondedEvent = new MatchingPartnerTeamNotRespondedEvent();

  //     // 1) 이용권 환불
  //     await this.ticketsService.refundTicketById(maleTeam.ticketId);
  //     await this.matchingsService.deleteTicketInfoByMatchingIdAndGender(maleTeam.matchingId, TeamGender.male);

  //     // 2) 매칭 거절 당함 문자 보내기
  //     matchingPartnerTeamNotRespondedEvent.teamId = maleTeam.teamId;
  //     this.eventEmitter.emit('matching.partnerTeamNotResponded', matchingPartnerTeamNotRespondedEvent);
  //   }

  //   for await (const femaleTeam of partnerTeamNotRespondedFemaleTeams) {
  //     const matchingPartnerTeamNotRespondedEvent = new MatchingPartnerTeamNotRespondedEvent();

  //     // 1) 이용권 환불
  //     await this.ticketsService.refundTicketById(femaleTeam.ticketId);
  //     await this.matchingsService.deleteTicketInfoByMatchingIdAndGender(femaleTeam.matchingId, TeamGender.female);

  //     // 2) 매칭 거절 당함 문자 보내기
  //     matchingPartnerTeamNotRespondedEvent.teamId = femaleTeam.teamId;
  //     this.eventEmitter.emit('matching.partnerTeamNotResponded', matchingPartnerTeamNotRespondedEvent);
  //   }
  // }

  // 매 분(0초)마다 실행
  // 수락/거절 대기자 종료 3시간 전 문자 발송
  // @Cron(CronExpression.EVERY_MINUTE)
  // async handleNotRespondedTeams() {
  //   // 수락/거절 대기자 조회
  //   const { teams: matchedMaleTwoTeams } = await this.teamsService.getTeamsByStatusAndMembercountAndGender(
  //     MatchingStatus.MATCHED,
  //     '2',
  //     TeamGender.male,
  //   );

  //   const { teams: matchedMaleThreeTeams } = await this.teamsService.getTeamsByStatusAndMembercountAndGender(
  //     MatchingStatus.MATCHED,
  //     '3',
  //     TeamGender.male,
  //   );

  //   const { teams: matchedFemaleTwoTeams } = await this.teamsService.getTeamsByStatusAndMembercountAndGender(
  //     MatchingStatus.MATCHED,
  //     '2',
  //     TeamGender.female,
  //   );

  //   const { teams: matchedFemaleThreeTeams } = await this.teamsService.getTeamsByStatusAndMembercountAndGender(
  //     MatchingStatus.MATCHED,
  //     '3',
  //     TeamGender.female,
  //   );

  //   const matchedTeams = matchedMaleTwoTeams.concat(
  //     matchedMaleThreeTeams,
  //     matchedFemaleTwoTeams,
  //     matchedFemaleThreeTeams,
  //   );

  //   for await (const matchedTeam of matchedTeams) {
  //     const now = moment(new Date()).format('YYYY-MM-DD HH:mm');
  //     const beforeThreeHours = moment(matchedTeam.matchedAt).add(21, 'hours').format('YYYY-MM-DD HH:mm');

  //     if (now === beforeThreeHours) {
  //       const matchingOurteamNotRespondedEvent = new MatchingOurteamNotRespondedEvent();

  //       // 종료 3시간 전 알림 문자 보내기
  //       matchingOurteamNotRespondedEvent.teamId = matchedTeam.teamId;
  //       this.eventEmitter.emit('matching.ourteamNotResponded', matchingOurteamNotRespondedEvent);
  //     }
  //   }
  // }

  // 매 분(0초)마다 실행
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredMatchings() {
    // 상호 수락 후 7일 경과한 매칭 조회 및 soft delete
    const { matchings } = await this.matchingsService.getSucceededMatchings();

    for await (const matching of matchings) {
      const now = moment(new Date()).format('YYYY-MM-DD HH:mm');
      const afterSevenDays = moment(matching.matchedAt).add(7, 'days').format('YYYY-MM-DD HH:mm');

      if (now > afterSevenDays) {
        await this.matchingsService.deleteMatchingById(matching.id);
      }
    }
  }

  // 매일 오후 10:50에 실행 (UTC 13:50)
  @Cron('50 13 * * *')
  async updateNextRecommendedTeamIds() {
    const { teams: maleTeams } = await this.teamsService.getTeamsByGenderForMatching(TeamGender.male);
    const { teams: femaleTeams } = await this.teamsService.getTeamsByGenderForMatching(TeamGender.female);

    // 남자팀의 추천팀 업데이트
    for (const maleTeam of maleTeams) {
      await this.teamsService.matchTeam(maleTeam, femaleTeams);
    }

    // 여자팀의 추천팀 업데이트
    for (const femaleTeam of femaleTeams) {
      await this.teamsService.matchTeam(femaleTeam, maleTeams);
    }
  }
}
