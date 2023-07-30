import { RecommendedTeam } from '../entities/recommended-team.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@CustomRepository(RecommendedTeam)
export class RecommendedTeamsRepository extends Repository<RecommendedTeam> {
  async getRecommendedTeamByUserId(userId: number): Promise<RecommendedTeam> {
    let recommendedTeam = await this.createQueryBuilder('recommended_team')
      .select()
      .where('recommended_team.userId = :userId', { userId })
      .getOne();

    return recommendedTeam;
  }

  async upsertRecommendedTeamIdsByUserIdAndRecommendedTeamIds(
    userId: number,
    recommendedTeamIds: number[],
  ): Promise<void> {
    await this.upsert({ userId, recommendedTeamIds, updatedAt: () => 'NOW()' }, ['userId']);
  }
}
