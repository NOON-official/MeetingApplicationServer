import { MatchingsRepository } from './repositories/matchings.repository';
import { Injectable } from '@nestjs/common';
import { Matching } from './entities/matching.entity';

@Injectable()
export class MatchingsService {
  constructor(private matchingsRepository: MatchingsRepository) {}

  async getMatchingByTeamId(teamId: number): Promise<Matching> {
    return this.matchingsRepository.getMatchingByTeamId(teamId);
  }
}
