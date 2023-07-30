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
import { concat, difference, intersection, take, uniq } from 'lodash';
import { TEAM_LIMIT } from 'src/teams/constants/recommended_team.constant';
import { TeamForMatching } from 'src/teams/interfaces/team-for-matching.interface';

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

  // 추천팀 찾은 후 업데이트
  // matchingTeam: 추천팀 정보 업데이트하려는 팀, matchedTeam: 매칭 대상이 되는 팀
  async matchTeam(matchingTeams: TeamForMatching[], matchedTeams: TeamForMatching[]) {
    for (const matchingTeam of matchingTeams) {
      // 0. 예외 처리 된 팀 제외하기
      const availableTeams = matchedTeams.filter((matchedTeam) => {
        return (
          !matchedTeam.excludedTeamIds?.includes(matchingTeam.id) &&
          !matchingTeam.excludedTeamIds?.includes(matchedTeam.id)
        );
      });

      // 1. 지역 일치하는 팀 조회
      const areaSameTeamIds = matchedTeams
        .filter((matchedTeam) => {
          return matchingTeam.areas.some((a) => matchedTeam.areas.includes(a));
        })
        .map((t) => t.id);

      // 지역 일치하는 팀 수가 최대 추천팀 수(4명) 이하인 경우 바로 저장 및 중단
      if (areaSameTeamIds.length <= TEAM_LIMIT.MAX_RECOMMENDED_TEAM) {
        await this.teamsService.upsertNextRecommendedTeamIdsByUserIdAndNextRecommendedTeamIds(
          matchingTeam.ownerId,
          areaSameTeamIds,
        );
        continue;
      }

      // 2. 인원 일치하는 팀 조회
      matchingTeam.memberCounts?.push(matchingTeam.memberCount);
      const memberCountsSameTeamIds = availableTeams
        .filter((availableTeam) => {
          availableTeam.memberCounts?.push(availableTeam.memberCount);
          return matchingTeam.memberCounts?.some((m) => availableTeam.memberCounts?.includes(m));
        })
        .map((t) => t.id);

      // 3. 나이 일치하는 팀 조회
      const ageSameTeamIds = availableTeams
        .filter((availableTeam) => {
          return (
            matchingTeam.prefAge[0] <= availableTeam.age &&
            availableTeam.age <= matchingTeam.prefAge[1] &&
            availableTeam.prefAge[0] <= matchingTeam.age &&
            matchingTeam.age <= availableTeam.prefAge[1]
          );
        })
        .map((t) => t.id);

      // 4. 일정 일치하는 팀 조회
      const dateSameTeamIds = availableTeams
        .filter((availableTeam) => {
          return matchingTeam.availableDate?.some((a) => availableTeam.availableDate?.includes(a));
        })
        .map((t) => t.id);

      // [가장 잘 맞는 팀 조회]
      // 1순위: 지역 + 인원 + 나이 + 일정
      // 2순위: 지역 + 인원 + 나이
      // 3순위: 지역 + 인원
      // 4순위: 지역만
      const areaMemberCountsSameTeamIds = intersection(areaSameTeamIds, memberCountsSameTeamIds);
      const areaMemberCountsAgeSameTeamIds = intersection(areaMemberCountsSameTeamIds, ageSameTeamIds);
      const areaMemberCountsAgeDateSameTeamIds = intersection(areaMemberCountsAgeSameTeamIds, dateSameTeamIds);

      // 가장 잘 맞는 팀 2팀 조회
      const bestRecommendedTeamIds = take(
        uniq(
          concat(
            areaMemberCountsAgeDateSameTeamIds,
            areaMemberCountsAgeSameTeamIds,
            areaMemberCountsSameTeamIds,
            areaSameTeamIds,
          ),
        ),
        TEAM_LIMIT.BEST_RECOMMENDED_TEAM,
      );

      // [덜 맞는 팀 조회]
      // 1순위: 지역만
      // 2순위: 지역 + 인원만
      // 3순위: 지역 + 인원 + 나이만
      // 4순위: 지역 + 인원 + 나이 + 일정
      const onlyAreaSameTeams = difference(areaSameTeamIds, memberCountsSameTeamIds, ageSameTeamIds, dateSameTeamIds);
      const onlyAreaMemberCountsSameTeams = difference(areaSameTeamIds, ageSameTeamIds, dateSameTeamIds);
      const onlyAreaMemberCountsAgeSameTeams = difference(areaSameTeamIds, dateSameTeamIds);
      const onlyAreaMemberCountsAgeDateSameTeams = areaSameTeamIds;

      // 덜 맞는 팀 2팀 조회
      const otherRecommendedTeamIds = take(
        uniq(
          concat(
            onlyAreaSameTeams,
            onlyAreaMemberCountsSameTeams,
            onlyAreaMemberCountsAgeSameTeams,
            onlyAreaMemberCountsAgeDateSameTeams,
          ),
        ),
        TEAM_LIMIT.OTHER_RECOMMENDED_TEAM,
      );

      // 다음 추천팀(가장 잘 맞는팀 + 덜 맞는 팀) 정보 저장
      const nextRecommendedTeamIds = uniq(concat(bestRecommendedTeamIds, otherRecommendedTeamIds));
      await this.teamsService.upsertNextRecommendedTeamIdsByUserIdAndNextRecommendedTeamIds(
        matchingTeam.ownerId,
        nextRecommendedTeamIds,
      );
    }
  }
  // 매일 오후 10:50에 실행 (UTC 13:50)
  @Cron('50 13 * * *')
  async updateNextRecommendedTeamIds() {
    const { teams: maleTeams } = await this.teamsService.getTeamsByGenderForMatching(TeamGender.male);
    const { teams: femaleTeams } = await this.teamsService.getTeamsByGenderForMatching(TeamGender.female);

    await this.matchTeam(maleTeams, femaleTeams); // 남자팀의 추천팀 업데이트
    await this.matchTeam(femaleTeams, maleTeams); // 여자팀의 추천팀 업데이트
  }
}
