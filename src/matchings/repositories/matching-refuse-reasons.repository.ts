import { Team } from 'src/teams/entities/team.entity';
import { Matching } from 'src/matchings/entities/matching.entity';
import { MatchingRefuseReason } from '../entities/matching-refuse-reason.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { CreateMatchingRefuseReasonDto } from '../dtos/create-matching-refuse-reason.dto';

@CustomRepository(MatchingRefuseReason)
export class MatchingRefuseReasonsRepository extends Repository<MatchingRefuseReason> {
  async createMatchingRefuseReason(
    matching: Matching,
    team: Team,
    createMatchingRefuseReasonDto: CreateMatchingRefuseReasonDto,
  ): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(MatchingRefuseReason)
      .values({
        reason1: createMatchingRefuseReasonDto.reason1,
        reason2: createMatchingRefuseReasonDto.reason2,
        reason3: createMatchingRefuseReasonDto.reason3,
        other: createMatchingRefuseReasonDto.other,
        matching,
        team,
      })
      .execute();
  }
}
