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
import { NextRecommendedTeamUpdatedEvent } from 'src/teams/events/next-recommended-team-updated.event';

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
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handlePartnerTeamNotRespondedTeams() {
    const matchings = await this.matchingsService.getMatchings();

    for await (const matching of matchings) {
      const now = moment(new Date()).format('YYYY-MM-DD HH:mm');
      const afterTwoDays = moment(matching.createdAt).add(2, 'days').format('YYYY-MM-DD HH:mm');

      // 48시간 이상 무응답인 경우
      if (now >= afterTwoDays && matching.receivedTeamIsAccepted === null && matching.appliedTeamIsAccepted === true) {
        // 매칭 거절 처리
        await this.matchingsService.refuseMatching(matching.id);
      }
    }
  }

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

  // 매일 오후 11:00에 실행 (UTC 14:00)
  // 추천팀이 업데이트된 유저에게 알림 문자 발송
  @Cron('0 14 * * *')
  async handleNextRecommendedTeamUpdatedTeams() {
    const { teams: nextRecommendedTeams } = await this.teamsService.getAllNextRecommendedTeams();
    for await (const team of nextRecommendedTeams) {
      const nextRecommendedTeamIds = team.nextRecommendedTeamIds;
      const userId = team.userId;
      const user = team.user;

      // (1) 다음 추천팀이 존재하고,
      if (nextRecommendedTeamIds?.length > 0) {
        const recommendedTeam = await this.teamsService.getRecommendedTeamByUserId(userId);
        const recommendedTeamIds = recommendedTeam?.recommendedTeamIds;

        // (2) 기존 추천팀 외에 새로운 추천팀이 존재하는 경우
        if (!nextRecommendedTeamIds.every((nr) => recommendedTeamIds?.includes(nr))) {
          const nextRecommendedTeamUpdatedEvent = new NextRecommendedTeamUpdatedEvent();
          // 추천팀 업데이트 알림 문자 보내기
          nextRecommendedTeamUpdatedEvent.user = user;
          this.eventEmitter.emit('next-recommended-team.updated', nextRecommendedTeamUpdatedEvent);
        }
      }
    }
  }
}
