import { Matching } from './../entities/matching.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(Matching)
export class MatchingsRepository extends Repository<Matching> {
  // 매칭 정보 조회(삭제된 팀 정보 포함)
  async getMatchingByTeamId(teamId: number): Promise<Matching> {
    const matching = await this.createQueryBuilder('matching')
      .withDeleted()
      .leftJoinAndSelect('matching.maleTeam', 'maleTeam')
      .leftJoinAndSelect('matching.femaleTeam', 'femaleTeam')
      .where('matching.maleTeamId = :teamId', { teamId })
      .orWhere('matching.femaleTeamId = :teamId', { teamId })
      .getOne();

    return matching;
  }

  async getMatchingIdByTeamId(teamId: number): Promise<{ matchingId: number }> {
    const result = await this.createQueryBuilder('matching')
      .select('matching.id')
      .where('matching.maleTeamId = :teamId', { teamId })
      .orWhere('matching.femaleTeamId = :teamId', { teamId })
      .getOne();

    const matchingId = result?.id || null;

    return { matchingId };
  }

  async getMatchingById(matchingId: number): Promise<Matching> {
    const matching = await this.createQueryBuilder('matching')
      .withDeleted()
      .leftJoinAndSelect('matching.maleTeam', 'maleTeam')
      .leftJoinAndSelect('matching.femaleTeam', 'femaleTeam')
      .where('matching.id = :matchingId', { matchingId })
      .getOne();

    return matching;
  }
}
