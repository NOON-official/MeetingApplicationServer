import { TicketsService } from 'src/tickets/tickets.service';
import { BadRequestException } from '@nestjs/common/exceptions';
import { MatchingsRepository } from './repositories/matchings.repository';
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Matching } from './entities/matching.entity';
import { GetMatchingDto } from './dtos/get-matching.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MatchingsService {
  constructor(
    private matchingsRepository: MatchingsRepository,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => TicketsService))
    private ticketsService: TicketsService,
  ) {}

  async getMatchingByTeamId(teamId: number): Promise<Matching> {
    return this.matchingsRepository.getMatchingByTeamId(teamId);
  }

  async getMatchingIdByTeamId(teamId: number): Promise<{ matchingId: number }> {
    return this.matchingsRepository.getMatchingIdByTeamId(teamId);
  }

  async getMatchingById(matchingId: number): Promise<Matching> {
    return await this.matchingsRepository.getMatchingById(matchingId);
  }

  async getMatchingInfoById(userId: number, matchingId: number): Promise<GetMatchingDto> {
    const matching = await this.getMatchingById(matchingId);

    if (!matching || !!matching.deletedAt) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    const { teamId } = await this.usersService.getTeamIdByUserId(userId);

    const ourteamGender =
      matching.maleTeam.id === teamId ? 'male' : matching.femaleTeam.id === teamId ? 'female' : null;

    if (!ourteamGender) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    const result = {
      ourteamId: ourteamGender === 'male' ? matching.maleTeam.id : matching.femaleTeam.id,
      partnerTeamId: ourteamGender === 'male' ? matching.femaleTeam.id : matching.maleTeam.id,
      ourteamIsAccepted: ourteamGender === 'male' ? matching.maleTeamIsAccepted : matching.femaleTeamIsAccepted,
      partnerTeamIsAccepted: ourteamGender === 'male' ? matching.femaleTeamIsAccepted : matching.maleTeamIsAccepted,
      chatCreatedAt: matching.chatCreatedAt,
      createdAt: matching.createdAt,
      updatedAt: matching.updatedAt,
      deletedAt: matching.deletedAt,
    };

    return result;
  }

  async acceptMatchingByTeamId(userId: number, matchingId: number, teamId: number): Promise<void> {
    const matching = await this.getMatchingById(matchingId);

    // 해당 매칭 정보가 없는 경우
    if (!matching || !!matching.deletedAt) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    const gender = matching.maleTeam.id === teamId ? 'male' : 'female';

    if (gender === 'male') {
      // 이미 수락 또는 거절한 경우
      if (matching.maleTeamIsAccepted === true || matching.maleTeamIsAccepted === false) {
        throw new BadRequestException(`already responded team`);
      }
      // 상대팀이 이미 거절한 경우
      if (matching.femaleTeamIsAccepted === false) {
        throw new BadRequestException(`partner team already refused`);
      }
    }

    if (gender === 'female') {
      // 이미 수락 또는 거절한 경우
      if (matching.femaleTeamIsAccepted === true || matching.femaleTeamIsAccepted === false) {
        throw new BadRequestException(`already responded team`);
      }
      // 상대팀이 이미 거절한 경우
      if (matching.maleTeamIsAccepted === false) {
        throw new BadRequestException(`partner team already refused`);
      }
    }

    const ticket = await this.ticketsService.getTicketByUserId(userId);

    // 이용권이 없는 경우
    if (!ticket) {
      throw new BadRequestException(`user doesn't have a ticket`);
    }

    // 이용권 사용 처리
    await this.ticketsService.useTicketById(ticket.id);

    return await this.matchingsRepository.acceptMatchingByGender(matchingId, gender, ticket);
  }

  async refuseMatchingByTeamId(matchingId: number, teamId: number): Promise<void> {
    const matching = await this.getMatchingById(matchingId);

    // 해당 매칭 정보가 없는 경우
    if (!matching || !!matching.deletedAt) {
      throw new NotFoundException(`Can't find matching with id ${matchingId}`);
    }

    const gender = matching.maleTeam.id === teamId ? 'male' : 'female';

    // 이미 수락 또는 거절한 경우
    if (gender === 'male' && (matching.maleTeamIsAccepted === true || matching.maleTeamIsAccepted === false)) {
      throw new BadRequestException(`already responded team`);
    }
    if (gender === 'female' && (matching.femaleTeamIsAccepted === true || matching.femaleTeamIsAccepted === false)) {
      throw new BadRequestException(`already responded team`);
    }

    if (gender === 'male') {
      // 상대팀이 이미 수락한 경우, 상대팀 이용권 환불
      if (matching.femaleTeamIsAccepted === true) {
        await this.ticketsService.refundTicketById(matching.femaleTeamTicket.id);
        await this.matchingsRepository.deleteTicketInfoByGender(matchingId, 'female');
      }
    }

    if (gender === 'female') {
      // 상대팀이 이미 수락한 경우, 상대팀 이용권 환불
      if (matching.maleTeamIsAccepted === true) {
        await this.ticketsService.refundTicketById(matching.maleTeamTicket.id);
        await this.matchingsRepository.deleteTicketInfoByGender(matchingId, 'male');
      }
    }

    return await this.matchingsRepository.refuseMatchingByGender(matchingId, gender);
  }
}
