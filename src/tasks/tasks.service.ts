import { MatchingPartnerTeamNotRespondedEvent } from './../matchings/events/matching-partner-team-not-responded.event';
import { MatchingsService } from './../matchings/matchings.service';
import { TicketsService } from 'src/tickets/tickets.service';
import { TeamsService } from './../teams/teams.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TeamGender } from 'src/teams/entities/team-gender.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TasksService {
  constructor(
    private teamsService: TeamsService,
    private ticketsService: TicketsService,
    private matchingsService: MatchingsService,
    private eventEmitter: EventEmitter2,
  ) {}

  // 매 분(0초)마다 실행
  @Cron(CronExpression.EVERY_MINUTE)
  async handlePartnerTeamNotRespondedTeams() {
    // 상대팀이 무응답하고, 이용권 환불받지 않은 팀 조회
    const { teams: partnerTeamNotRespondedMaleTeams } = await this.teamsService.getPartnerTeamNotRespondedTeamsByGender(
      TeamGender.male,
    );
    const { teams: partnerTeamNotRespondedFemaleTeams } =
      await this.teamsService.getPartnerTeamNotRespondedTeamsByGender(TeamGender.female);

    for await (const maleTeam of partnerTeamNotRespondedMaleTeams) {
      const matchingPartnerTeamNotRespondedEvent = new MatchingPartnerTeamNotRespondedEvent();

      // 1) 이용권 환불
      await this.ticketsService.refundTicketById(maleTeam.ticketId);
      await this.matchingsService.deleteTicketInfoByMatchingIdAndGender(maleTeam.matchingId, TeamGender.male);

      // 2) 매칭 거절 당함 문자 보내기
      matchingPartnerTeamNotRespondedEvent.teamId = maleTeam.teamId;
      this.eventEmitter.emit('matching.partnerTeamNotResponded', matchingPartnerTeamNotRespondedEvent);
    }

    for await (const femaleTeam of partnerTeamNotRespondedFemaleTeams) {
      const matchingPartnerTeamNotRespondedEvent = new MatchingPartnerTeamNotRespondedEvent();

      // 1) 이용권 환불
      await this.ticketsService.refundTicketById(femaleTeam.ticketId);
      await this.matchingsService.deleteTicketInfoByMatchingIdAndGender(femaleTeam.matchingId, TeamGender.female);

      // 2) 매칭 거절 당함 문자 보내기
      matchingPartnerTeamNotRespondedEvent.teamId = femaleTeam.teamId;
      this.eventEmitter.emit('matching.partnerTeamNotResponded', matchingPartnerTeamNotRespondedEvent);
    }
  }
}
