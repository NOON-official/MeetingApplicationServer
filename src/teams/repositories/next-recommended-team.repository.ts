import { NextRecommendedTeam } from '../entities/next-recommended-team.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(NextRecommendedTeam)
export class NextRecommendedTeamsRepository extends Repository<NextRecommendedTeam> {
  async getTeamIdByUserId(userId: number): Promise<{ teamId: number }> {
    const result = await this.createQueryBuilder('team')
      .select('team.id')
      .where('team.ownerId = :userId', { userId })
      .getOne();

    const teamId = result?.id || null;

    return { teamId };
  }

  async getNextRecommendedTeamByUserId(userId: number): Promise<NextRecommendedTeam> {
    let nextRecommendedTeam = await this.createQueryBuilder('next_recommended_team')
      .select()
      .where('next_recommended_team.userId = :userId', { userId })
      .getOne();

    return nextRecommendedTeam;
  }

  async deleteNextRecommendedTeamIdsByUserId(userId: number): Promise<void> {
    await this.update({ userId }, { nextRecommendedTeamIds: null });
  }
}
