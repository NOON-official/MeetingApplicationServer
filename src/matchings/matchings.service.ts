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
}
