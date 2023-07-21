import { UpdateMatchingRefuseReasonDto } from './dtos/update-matching-refuse-reason.dto';
import { TeamGender } from 'src/teams/entities/team-gender.enum';
import { MatchingPartnerTeamRefusedEvent } from './events/matching-partner-team-refused.event';
import { TeamsService } from './../teams/teams.service';
import { MatchingRefuseReasonsRepository } from './repositories/matching-refuse-reasons.repository';
import { CreateMatchingRefuseReasonDto } from './dtos/create-matching-refuse-reason.dto';
import { TicketsService } from 'src/tickets/tickets.service';
import { BadRequestException } from '@nestjs/common/exceptions';
import { MatchingsRepository } from './repositories/matchings.repository';
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Matching } from './entities/matching.entity';
import { GetMatchingDto } from './dtos/get-matching.dto';
import { UsersService } from 'src/users/users.service';
import { MatchingStatus } from './interfaces/matching-status.enum';
import { AdminGetMatchingDto } from 'src/admin/dtos/admin-get-matching.dto';
import { MatchingSucceededEvent } from './events/matching-succeeded.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdminGetOurteamRefusedTeamDto } from 'src/admin/dtos/admin-get-ourteam-refused-team.dto';
import { TingsService } from 'src/tings/tings.service';
import { TingNumberPerAction } from 'src/tings/constants/ting-number-per-action';
import { GetTeamCardDto } from 'src/teams/dtos/get-team-card.dto';

@Injectable()
export class MatchingsService {
  constructor(
    private matchingsRepository: MatchingsRepository,
    private matchingRefuseReasonsRepository: MatchingRefuseReasonsRepository,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => TicketsService))
    private ticketsService: TicketsService,
    @Inject(forwardRef(() => TeamsService))
    private teamsService: TeamsService,
    private eventEmitter: EventEmitter2,
    private tingsService: TingsService,
  ) {}

  async getMatchingWithDeletedByTeamId(teamId: number): Promise<Matching> {
    return this.matchingsRepository.getMatchingWithDeletedByTeamId(teamId);
  }

  async getMatchingByTeamId(teamId: number): Promise<Matching> {
    return this.matchingsRepository.getMatchingByTeamId(teamId);
  }

  // async getMatchingIdByTeamId(teamId: number): Promise<{ matchingId: number }> {
  //   return this.matchingsRepository.getMatchingIdByTeamId(teamId);
  // }

  async getMatchingById(matchingId: number): Promise<Matching> {
    return this.matchingsRepository.getMatchingById(matchingId);
  }

  // async getMatchingInfoById(userId: number, matchingId: number): Promise<GetMatchingDto> {
  //   const matching = await this.getMatchingById(matchingId);

  //   if (!matching || !!matching.deletedAt) {
  //     throw new NotFoundException(`Can't find matching with id ${matchingId}`);
  //   }

  //   const { teamId } = await this.usersService.getTeamIdByUserId(userId);

  //   const ourteamGender =
  //     matching.maleTeam.id === teamId ? 'male' : matching.femaleTeam.id === teamId ? 'female' : null;

  //   if (!ourteamGender) {
  //     throw new NotFoundException(`Can't find matching with id ${matchingId}`);
  //   }

  //   const result = {
  //     ourteamId: ourteamGender === 'male' ? matching.maleTeam.id : matching.femaleTeam.id,
  //     partnerTeamId: ourteamGender === 'male' ? matching.femaleTeam.id : matching.maleTeam.id,
  //     ourteamIsAccepted: ourteamGender === 'male' ? matching.maleTeamIsAccepted : matching.femaleTeamIsAccepted,
  //     partnerTeamIsAccepted: ourteamGender === 'male' ? matching.femaleTeamIsAccepted : matching.maleTeamIsAccepted,
  //     chatCreatedAt: matching.chatCreatedAt,
  //     createdAt: matching.createdAt,
  //     updatedAt: matching.updatedAt,
  //     deletedAt: matching.deletedAt,
  //   };

  //   const result = {
  //     ourteamId: 1,
  //     partnerTeamId: 2,
  //     ourteamIsAccepted: null,
  //     partnerTeamIsAccepted: true,
  //     chatCreatedAt: new Date('2023-01-20T21:37:26.886Z'),
  //     createdAt: new Date('2023-01-20T21:37:26.886Z'),
  //     updatedAt: new Date('2023-01-20T21:37:26.886Z'),
  //     deletedAt: null,
  //   };

  //   return result;
  // }

  async acceptMatchingByTeamId(userId: number, matchingId: number, teamId: number): Promise<void> {
    // const matching = await this.getMatchingById(matchingId);
    // // 해당 매칭 정보가 없는 경우
    // if (!matching || !!matching.deletedAt) {
    //   throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    // }
    // const gender = matching.maleTeam.id === teamId ? 'male' : 'female';
    // if (gender === 'male') {
    //   // 이미 수락 또는 거절한 경우
    //   if (matching.maleTeamIsAccepted === true || matching.maleTeamIsAccepted === false) {
    //     throw new BadRequestException(`already responded team`);
    //   }
    //   // 상대팀이 이미 거절한 경우
    //   if (matching.femaleTeamIsAccepted === false) {
    //     throw new BadRequestException(`partner team already refused`);
    //   }
    // }
    // if (gender === 'female') {
    //   // 이미 수락 또는 거절한 경우
    //   if (matching.femaleTeamIsAccepted === true || matching.femaleTeamIsAccepted === false) {
    //     throw new BadRequestException(`already responded team`);
    //   }
    //   // 상대팀이 이미 거절한 경우
    //   if (matching.maleTeamIsAccepted === false) {
    //     throw new BadRequestException(`partner team already refused`);
    //   }
    // }
    // const ticket = await this.ticketsService.getTicketByUserId(userId);
    // // 이용권이 없는 경우
    // if (!ticket) {
    //   throw new BadRequestException(`user doesn't have a ticket`);
    // }
    // // 이용권 사용 처리
    // await this.ticketsService.useTicketById(ticket.id);
    // // 상대팀이 이미 수락한 경우 두 팀 모두 매칭성공 문자 발송
    // if (
    //   (gender === 'male' && matching.femaleTeamIsAccepted === true) ||
    //   (gender === 'female' && matching.maleTeamIsAccepted === true)
    // ) {
    //   const succeededTeamIds = [matching.maleTeamId, matching.femaleTeamId];
    //   succeededTeamIds.forEach((id) => {
    //     const matchingSucceededEvent = new MatchingSucceededEvent();
    //     matchingSucceededEvent.teamId = id;
    //     this.eventEmitter.emit('matching.succeeded', matchingSucceededEvent);
    //   });
    // }
    // return this.matchingsRepository.acceptMatchingByGender(matchingId, gender, ticket);
  }

  async deleteTicketInfoByMatchingIdAndGender(matchingId: number, gender: TeamGender) {
    // return this.matchingsRepository.deleteTicketInfoByMatchingIdAndGender(matchingId, gender);
    return;
  }

  async refuseMatchingByTeamId(matchingId: number, teamId: number): Promise<void> {
    // const matching = await this.getMatchingById(matchingId);
    // // 해당 매칭 정보가 없는 경우
    // if (!matching || !!matching.deletedAt) {
    //   throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    // }
    // const gender = matching.maleTeam.id === teamId ? 'male' : 'female';
    // // 이미 수락 또는 거절한 경우
    // if (gender === 'male' && (matching.maleTeamIsAccepted === true || matching.maleTeamIsAccepted === false)) {
    //   throw new BadRequestException(`already responded team`);
    // }
    // if (gender === 'female' && (matching.femaleTeamIsAccepted === true || matching.femaleTeamIsAccepted === false)) {
    //   throw new BadRequestException(`already responded team`);
    // }
    // if (gender === 'male') {
    //   // 상대팀이 이미 수락한 경우
    //   if (matching.femaleTeamIsAccepted === true) {
    //     // 1) 상대팀 이용권 환불
    //     await this.ticketsService.refundTicketById(matching.femaleTeamTicket.id);
    //     await this.deleteTicketInfoByMatchingIdAndGender(matchingId, TeamGender.female);
    //     // 2) 상대팀에 매칭 거절 당함 문자 보내기
    //     const matchingPartnerTeamRefusedEvent = new MatchingPartnerTeamRefusedEvent();
    //     matchingPartnerTeamRefusedEvent.teamId = matching.femaleTeamId;
    //     this.eventEmitter.emit('matching.partnerTeamRefused', matchingPartnerTeamRefusedEvent);
    //   }
    //   // 거절한 상대를 user 테이블에 기록
    //   const maleTeamUser = await this.usersService.getUserById(matching.maleTeam.ownerId);
    //   this.usersService.updateRefusedUserIds(matching.maleTeam.ownerId, [
    //     ...(maleTeamUser.refusedUserIds?.filter((id) => id !== matching.femaleTeam.ownerId) || []),
    //     matching.femaleTeam.ownerId,
    //   ]);
    // }
    // if (gender === 'female') {
    //   // 상대팀이 이미 수락한 경우
    //   if (matching.maleTeamIsAccepted === true) {
    //     // 1) 상대팀 이용권 환불
    //     await this.ticketsService.refundTicketById(matching.maleTeamTicket.id);
    //     await this.deleteTicketInfoByMatchingIdAndGender(matchingId, TeamGender.male);
    //     // 2) 상대팀에 매칭 거절 당함 문자 보내기
    //     const matchingPartnerTeamRefusedEvent = new MatchingPartnerTeamRefusedEvent();
    //     matchingPartnerTeamRefusedEvent.teamId = matching.maleTeamId;
    //     this.eventEmitter.emit('matching.partnerTeamRefused', matchingPartnerTeamRefusedEvent);
    //   }
    //   // 거절한 상대를 user 테이블에 기록
    //   const femaleTeamUser = await this.usersService.getUserById(matching.femaleTeam.ownerId);
    //   this.usersService.updateRefusedUserIds(matching.femaleTeam.ownerId, [
    //     ...(femaleTeamUser.refusedUserIds?.filter((id) => id !== matching.maleTeam.ownerId) || []),
    //     matching.maleTeam.ownerId,
    //   ]);
    // }
    // return this.matchingsRepository.refuseMatchingByGender(matchingId, gender);
  }

  async createMatchingRefuseReason(
    matchingId: number,
    teamId: number,
    createMatchingRefuseReasonDto: CreateMatchingRefuseReasonDto,
  ): Promise<void> {
    const matching = await this.getMatchingById(matchingId);

    if (!matching || !!matching.deletedAt) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    const team = await this.teamsService.getTeamById(teamId);

    if (!team || !!team.deletedAt) {
      throw new NotFoundException(`Can't find team with id ${teamId}`);
    }

    // 매칭에 해당하는 팀이 아닌 경우
    if (matching.appliedTeamId !== teamId && matching.receivedTeamId !== teamId) {
      throw new BadRequestException('invalid access');
    }

    const matchingRefuseReason =
      await this.matchingRefuseReasonsRepository.getMatchingRefuseReasonByMatchingIdAndTeamId(matchingId, teamId);

    // 이미 매칭 거절 이유가 존재하는 경우
    if (!!matchingRefuseReason) {
      throw new BadRequestException('matching refuse reason is already exists');
    }

    return this.matchingRefuseReasonsRepository.createMatchingRefuseReason(
      matching,
      team,
      createMatchingRefuseReasonDto,
    );
  }

  async updateMatchingRefuseReason(
    matchingId: number,
    teamId: number,
    updateMatchingRefuseReasonDto: UpdateMatchingRefuseReasonDto,
  ): Promise<void> {
    const matching = await this.getMatchingById(matchingId);

    if (!matching || !!matching.deletedAt) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    const team = await this.teamsService.getTeamById(teamId);

    if (!team || !!team.deletedAt) {
      throw new NotFoundException(`Can't find team with id ${teamId}`);
    }

    const matchingRefuseReason =
      await this.matchingRefuseReasonsRepository.getMatchingRefuseReasonByMatchingIdAndTeamId(matchingId, teamId);

    // 매칭 거절 이유가 없는 경우
    if (!matchingRefuseReason) {
      throw new NotFoundException(`Can't find matching refuse reason`);
    }

    return this.matchingRefuseReasonsRepository.updateMatchingRefuseReason(
      matchingId,
      teamId,
      updateMatchingRefuseReasonDto,
    );
  }

  async deleteMatchingById(matchingId: number): Promise<void> {
    const matching = await this.getMatchingById(matchingId);

    // 해당 매칭 정보가 없는 경우
    if (!matching || !!matching.deletedAt) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    // 매칭 soft delete
    await this.matchingsRepository.deleteMatchingById(matchingId);

    // 관련 데이터 soft delete
    const appliedTeamId = matching?.appliedTeam?.id;
    const appliedTeamIsDeleted = matching?.appliedTeam?.deletedAt;
    const receivedTeamId = matching?.receivedTeam?.id;
    const receivedTeamIsDeleted = matching?.receivedTeam?.deletedAt;
    // const appliedTeamTicketId = matching?.appliedTeamTicket?.id;
    // const receivedTeamTicketId = matching?.receivedTeamTicket?.id;

    if (!!appliedTeamId && !appliedTeamIsDeleted) {
      await this.teamsService.deleteTeamById(appliedTeamId);
    }

    if (!!receivedTeamId && !receivedTeamIsDeleted) {
      await this.teamsService.deleteTeamById(receivedTeamId);
    }

    // if (!!appliedTeamTicketId) {
    //   await this.ticketsService.deleteTicketById(appliedTeamTicketId);
    // }

    // if (!!receivedTeamTicketId) {
    //   await this.ticketsService.deleteTicketById(receivedTeamTicketId);
    // }
  }

  async getMatchingsByStatus(status: MatchingStatus): Promise<{ matchings: AdminGetMatchingDto[] }> {
    // 수락/거절 대기자 조회
    if (status === MatchingStatus.SUCCEEDED) {
      return this.matchingsRepository.getSucceededMatchings();
    }
  }

  async saveChatCreatedAtByMatchingId(matchingId: number): Promise<void> {
    const matching = await this.getMatchingById(matchingId);

    if (!matching || !!matching.deletedAt) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    return this.matchingsRepository.updateChatCreatedAtByMatchingId(matchingId);
  }

  async saveMatchings(matchings: Matching[]): Promise<Matching[]> {
    return this.matchingsRepository.createMatchings(matchings);
  }

  async createMatching(matching: Matching): Promise<Matching> {
    return this.matchingsRepository.createMatching(matching);
  }

  async getMatchingRefuseReasons(): Promise<{ teams: AdminGetOurteamRefusedTeamDto[] }> {
    return this.matchingRefuseReasonsRepository.getMatchingRefuseReasons();
  }

  async deleteMatchingRefuseReasonByTeamId(teamId: number): Promise<void> {
    return this.matchingRefuseReasonsRepository.deleteMatchingRefuseReasonByTeamId(teamId);
  }

  // async getAverageTimeOneWeek(): Promise<{ hours: number; minutes: number }> {
  //   const { averageMatchedSeconds } = await this.matchingsRepository.getMatchingAverageSecondsOneWeeks();

  //   const averageMatchedMinutes = Math.trunc(averageMatchedSeconds / 60);

  //   const hours = Math.trunc(averageMatchedMinutes / 60);
  //   const minutes = averageMatchedMinutes % 60;

  //   return { hours, minutes };
  // }

  async createMatchingByAppliedTeamIdAndReceivedTeamId(appliedTeamId: number, receivedTeamId: number): Promise<void> {
    const appliedTeam = await this.teamsService.getTeamById(appliedTeamId);
    const receivedTeam = await this.teamsService.getTeamById(receivedTeamId);

    // 해당 팀이 존재하지 않는 경우
    if (!appliedTeam || !!appliedTeam.deletedAt) {
      throw new NotFoundException(`Can't find team with id ${appliedTeamId}`);
    }

    if (!receivedTeam || !!receivedTeam.deletedAt) {
      throw new NotFoundException(`Can't find team with id ${receivedTeamId}`);
    }

    // 팀 성별이 같은 경우
    if (appliedTeam.gender === receivedTeam.gender) {
      throw new BadRequestException(`invalid team gender`);
    }

    // 팀 소유자가 같은 경우
    if (appliedTeam.ownerId === receivedTeam.ownerId) {
      throw new BadRequestException(`invalid access`);
    }

    // 이미 매칭 내역이 존재하는 팀인 경우 (삭제된 경우 제외)
    const existingMatching = await this.getMatchingByTeamId(appliedTeamId);

    if (!!existingMatching) {
      // 이미 신청한 팀인 경우
      if (existingMatching.appliedTeamId === appliedTeamId) {
        throw new BadRequestException(`already applied team`);
      }
      // 이미 신청받은 팀인 경우
      if (existingMatching.receivedTeamId === appliedTeamId) {
        throw new BadRequestException(`already received team`);
      }
    }

    // 보유하고 있는 팅이 모자란 경우
    const appliedUserId = appliedTeam.ownerId;
    const { tingCount } = await this.tingsService.getTingCountByUserId(appliedUserId);

    if (tingCount < TingNumberPerAction.APPLY) {
      throw new BadRequestException(`insufficient ting`);
    }

    // 매칭 신청하기
    const matching = new Matching();
    matching.appliedTeamId = appliedTeamId;
    matching.receivedTeamId = receivedTeamId;
    matching.appliedTeamIsAccepted = true;
    matching.appliedTeamIsPaid = true;

    await this.createMatching(matching);

    // 팅 차감하기
    await this.tingsService.useTingByUserIdAndTingCount(appliedUserId, TingNumberPerAction.APPLY);
  }

  async getReceivedTeamCardsByTeamId(teamId: number): Promise<{ teams: GetTeamCardDto[] }> {
    return this.matchingsRepository.getReceivedTeamCardsByTeamId(teamId);
  }
}
