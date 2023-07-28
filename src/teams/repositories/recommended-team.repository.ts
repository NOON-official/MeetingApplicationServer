import { RecommendedTeam } from '../entities/recommended-team.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@CustomRepository(RecommendedTeam)
export class RecommendedTeamsRepository extends Repository<RecommendedTeam> {
  async createRecommendedTeamWithUserAndRecommendedTeamIds(user: User, recommendedTeamIds: number[]): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(RecommendedTeam)
      .values({
        recommendedTeamIds,
        user,
      })
      .execute();
  }

  async getRecommendedTeamByUserId(userId: number): Promise<RecommendedTeam> {
    let recommendedTeam = await this.createQueryBuilder('recommended_team')
      .select()
      .where('recommended_team.userId = :userId', { userId })
      .getOne();

    return recommendedTeam;
  }

  async updateRecommendedTeamIdsByUserIdAndRecommendedTeamIds(
    userId: number,
    recommendedTeamIds: number[],
  ): Promise<void> {
    await this.update({ userId }, { recommendedTeamIds });
  }
}
