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
import { AdminGetAppliedTeamDto } from 'src/admin/dtos/admin-get-team.dto';

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

  async acceptMatchingByTeamId(userId: number, matchingId: number, appliedTeamId: number): Promise<void> {
    const matching = await this.getMatchingById(matchingId);

    // 해당 매칭 정보가 없는 경우
    if (!matching || !!matching.deletedAt) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    const appliedTeam = await this.teamsService.getTeamById(appliedTeamId);

    // 해당 팀이 존재하지 않는 경우
    if (!appliedTeam || !!appliedTeam.deletedAt) {
      throw new NotFoundException(`Can't find team with id ${appliedTeamId}`);
    }

    // 보유하고 있는 팅이 모자란 경우
    const { tingCount } = await this.tingsService.getTingCountByUserId(userId);

    if (tingCount < TingNumberPerAction.ACCEPT) {
      throw new BadRequestException(`insufficient ting`);
    }

    // 팅 차감하기
    await this.tingsService.useTingByUserIdAndTingCount(userId, TingNumberPerAction.ACCEPT);

    // 매칭 수락하기
    await this.matchingsRepository.acceptMatching(matchingId);

    // 상대팀이 이미 수락한 경우 두 팀 모두 매칭성공 문자 발송
    if (matching.appliedTeamIsAccepted === true || matching.receivedTeamIsAccepted === true) {
      const succeededTeamIds = [matching.appliedTeamId, matching.receivedTeamId];
      succeededTeamIds.forEach((id) => {
        const matchingSucceededEvent = new MatchingSucceededEvent();
        matchingSucceededEvent.teamId = id;
        this.eventEmitter.emit('matching.succeeded', matchingSucceededEvent);
      });
    }
  }

  async deleteTicketInfoByMatchingIdAndGender(matchingId: number, gender: TeamGender) {
    // return this.matchingsRepository.deleteTicketInfoByMatchingIdAndGender(matchingId, gender);
    return;
  }

  async refuseMatchingByTeamId(matchingId: number, refusedTeamId: number): Promise<void> {
    const matching = await this.getMatchingById(matchingId);
    // 해당 매칭 정보가 없는 경우
    if (!matching || !!matching.deletedAt) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    const appliedTeam = await this.teamsService.getTeamById(refusedTeamId);

    // 해당 팀이 존재하지 않는 경우
    if (!appliedTeam || !!appliedTeam.deletedAt) {
      throw new NotFoundException(`Can't find team with id ${refusedTeamId}`);
    }

    // 상대팀 팅 환불
    const appliedTeamOwnerId = matching.appliedTeam.ownerId;
    await this.tingsService.refundTingByUserIdAndTingCount(appliedTeamOwnerId, TingNumberPerAction.ACCEPT);

    // 매칭 거절 문자 보내기
    const matchingPartnerTeamRefusedEvent = new MatchingPartnerTeamRefusedEvent();
    matchingPartnerTeamRefusedEvent.teamId = matching.appliedTeamId;
    this.eventEmitter.emit('matching.partnerTeamRefused', matchingPartnerTeamRefusedEvent);

    // 거절한 상대를 기록하기
    await this.teamsService.updateExcludedTeamsByUserIdAndExcludedTeamId(matching.receivedTeam.ownerId, appliedTeam.id);

    // 상대방 거절하기
    return this.matchingsRepository.refuseMatching(matchingId);
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

  async deleteMatchingAndTeamByMatchingId(matchingId: number): Promise<void> {
    const matching = await this.getMatchingById(matchingId);

    // 해당 매칭 정보가 없는 경우
    if (!matching || !!matching.deletedAt) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    // 매칭 soft delete
    await this.matchingsRepository.deleteMatchingById(matchingId);
  }

  // 신청한/신청받은 팀 조회
  async getAdminMatchingsApplied(): Promise<{ appliedandreceiveds: AdminGetAppliedTeamDto[] }> {
    return this.matchingsRepository.getAdminMatchingsApplied();
  }

  async getMatchings(): Promise<{ matchings: AdminGetMatchingDto[] }> {
    return this.matchingsRepository.getAdminSucceededMatchings();
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
      if (existingMatching.appliedTeamId === appliedTeamId && existingMatching.receivedTeamId === receivedTeamId) {
        throw new BadRequestException(`already applied team`);
      }
      // 이미 신청받은 팀인 경우
      if (existingMatching.receivedTeamId === appliedTeamId && existingMatching.appliedTeamId === receivedTeamId) {
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

    // 상호 제외된 팀 목록에 추가하기
    await this.teamsService.updateExcludedTeamsByUserIdAndExcludedTeamId(appliedTeam.ownerId, receivedTeamId);

    // 해당 팀이 신청한 팀의 추천팀에 포함되는 경우 추천팀에서 삭제
    let { recommendedTeamIds: appliedTeamRecommendedTeamIds } =
      (await this.teamsService.getRecommendedTeamByUserId(appliedUserId)) || {};

    const appliedTeamExcludedRecommendedTeamIndex = appliedTeamRecommendedTeamIds?.indexOf(receivedTeamId);
    if (appliedTeamExcludedRecommendedTeamIndex !== undefined && appliedTeamExcludedRecommendedTeamIndex !== -1) {
      appliedTeamRecommendedTeamIds?.splice(appliedTeamExcludedRecommendedTeamIndex, 1);

      await this.teamsService.updateRecommendedTeamIdsByUserIdAndRecommendedTeamIds(
        appliedUserId,
        appliedTeamRecommendedTeamIds,
      );
    }

    // 해당 팀이 신청한 팀의 다음 추천팀에 포함되는 경우 추천팀에서 삭제
    let { nextRecommendedTeamIds: appliedTeamNextRecommendedTeamIds } =
      (await this.teamsService.getNextRecommendedTeamByUserId(appliedUserId)) || {};

    const appliedTeamExcludedNextRecommendedTeamIndex = appliedTeamNextRecommendedTeamIds?.indexOf(receivedTeamId);
    if (
      appliedTeamExcludedNextRecommendedTeamIndex !== undefined &&
      appliedTeamExcludedNextRecommendedTeamIndex !== -1
    ) {
      appliedTeamNextRecommendedTeamIds?.splice(appliedTeamExcludedNextRecommendedTeamIndex, 1);

      await this.teamsService.updateNextRecommendedTeamIdsByUserIdAndNextRecommendedTeamIds(
        appliedUserId,
        appliedTeamNextRecommendedTeamIds,
      );
    }

    // 해당 팀이 신청받은 팀의 추천팀에 포함되는 경우 추천팀에서 삭제
    let { recommendedTeamIds: receivedTeamRecommendedTeamIds } =
      (await this.teamsService.getRecommendedTeamByUserId(receivedTeam.ownerId)) || {};

    const receivedTeamExcludedRecommendedTeamIndex = receivedTeamRecommendedTeamIds?.indexOf(appliedTeamId);
    if (receivedTeamExcludedRecommendedTeamIndex !== undefined && receivedTeamExcludedRecommendedTeamIndex !== -1) {
      receivedTeamRecommendedTeamIds?.splice(receivedTeamExcludedRecommendedTeamIndex, 1);

      await this.teamsService.updateRecommendedTeamIdsByUserIdAndRecommendedTeamIds(
        receivedTeam.ownerId,
        receivedTeamRecommendedTeamIds,
      );
    }

    // 해당 팀이 신청받은 팀의 다음 추천팀에 포함되는 경우 추천팀에서 삭제
    let { nextRecommendedTeamIds: receivedTeamNextRecommendedTeamIds } =
      (await this.teamsService.getNextRecommendedTeamByUserId(receivedTeam.ownerId)) || {};

    const receivedTeamExcludedNextRecommendedTeamIndex = receivedTeamNextRecommendedTeamIds?.indexOf(appliedTeamId);
    if (
      receivedTeamExcludedNextRecommendedTeamIndex !== undefined &&
      receivedTeamExcludedNextRecommendedTeamIndex !== -1
    ) {
      receivedTeamNextRecommendedTeamIds?.splice(receivedTeamExcludedNextRecommendedTeamIndex, 1);

      await this.teamsService.updateNextRecommendedTeamIdsByUserIdAndNextRecommendedTeamIds(
        receivedTeam.ownerId,
        receivedTeamNextRecommendedTeamIds,
      );
    }
  }

  async getAppliedTeamCardsByTeamId(teamId: number): Promise<{ teams: GetTeamCardDto[] }> {
    return this.matchingsRepository.getAppliedTeamCardsByTeamId(teamId);
  }

  async getRefusedTeamCardsByTeamId(teamId: number): Promise<{ teams: GetTeamCardDto[] }> {
    return this.matchingsRepository.getRefusedTeamCardsByTeamId(teamId);
  }

  async getReceivedTeamCardsByTeamId(teamId: number): Promise<{ teams: GetTeamCardDto[] }> {
    return this.matchingsRepository.getReceivedTeamCardsByTeamId(teamId);
  }

  async getSucceededTeamCardsByUserId(userId: number): Promise<{ teams: GetTeamCardDto[] }> {
    return this.matchingsRepository.getSucceededTeamCardsByUserId(userId);
  }

  async getSucceededMatchings(): Promise<{ matchings: Matching[] }> {
    return this.matchingsRepository.getSucceededMatchings();
  }

  async deleteMatchingById(matchingId: number): Promise<void> {
    const matching = await this.getMatchingById(matchingId);

    // 해당 매칭 정보가 없는 경우
    if (!matching || !!matching.deletedAt) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    // 매칭 soft delete
    await this.matchingsRepository.deleteMatchingById(matchingId);
  }
}
