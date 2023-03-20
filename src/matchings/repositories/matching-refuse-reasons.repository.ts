import { Team } from 'src/teams/entities/team.entity';
import { Matching } from 'src/matchings/entities/matching.entity';
import { MatchingRefuseReason } from '../entities/matching-refuse-reason.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { CreateMatchingRefuseReasonDto } from '../dtos/create-matching-refuse-reason.dto';
import { UpdateMatchingRefuseReasonDto } from '../dtos/update-matching-refuse-reason.dto';
import { AdminGetOurteamRefusedTeamDto } from 'src/admin/dtos/admin-get-ourteam-refused-team.dto';

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

  async updateMatchingRefuseReason(
    matchingId: number,
    teamId: number,
    updateMatchingRefuseReasonDto: UpdateMatchingRefuseReasonDto,
  ): Promise<void> {
    await this.createQueryBuilder()
      .update(MatchingRefuseReason)
      .set({ ...updateMatchingRefuseReasonDto })
      .where('teamId = :teamId', { teamId })
      .andWhere('matchingId = :matchingId', { matchingId })
      .execute();
  }

  async getMatchingRefuseReasons(): Promise<{ teams: AdminGetOurteamRefusedTeamDto[] }> {
    const teams = await this.createQueryBuilder('matchingRefuseReason')
      .withDeleted()
      .select([
        'team.id AS teamId',
        `IF(user.deletedAt IS NOT NULL, CONCAT(user.nickname, '(회원 탈퇴)'), user.nickname) AS nickname`,
        `IF(team.gender = 1, '남', '여') AS gender`,
        'user.phone AS phone',
        `IF(matchingRefuseReason.reason1 IS TRUE, '학교', null) AS reason1`,
        `IF(matchingRefuseReason.reason2 IS TRUE, '자기소개서', null) AS reason2`,
        `IF(matchingRefuseReason.reason3 IS TRUE, '내부 사정', null) AS reason3`,
        'matchingRefuseReason.other AS other',
        'matchingRefuseReason.createdAt AS refusedAt',
      ])
      .leftJoin(`matchingRefuseReason.team`, 'team')
      .leftJoin('team.user', 'user')
      .where('matchingRefuseReason.deletedAt IS NULL')
      .orderBy('matchingRefuseReason.createdAt', 'ASC')
      .getRawMany();

    teams.map((t) => {
      const reasons = [];

      if (t.reason1) reasons.push(t.reason1);
      if (t.reason2) reasons.push(t.reason2);
      if (t.reason3) reasons.push(t.reason3);
      if (t.other) reasons.push(t.other);

      if (reasons.length === 0) {
        t.matchingRefuseReason = '무응답';
      } else {
        t.matchingRefuseReason = reasons.join(' / ');
      }

      delete t.reason1;
      delete t.reason2;
      delete t.reason3;
      delete t.other;
    });

    return { teams };
  }

  async getMatchingRefuseReasonByMatchingIdAndTeamId(
    matchingId: number,
    teamId: number,
  ): Promise<MatchingRefuseReason> {
    const matchingRefuseReason = await this.createQueryBuilder('matchingRefuseReason')
      .withDeleted()
      .leftJoinAndSelect('matchingRefuseReason.matching', 'matching')
      .leftJoinAndSelect('matchingRefuseReason.team', 'team')
      .where('matchingRefuseReason.matchingId = :matchingId', { matchingId })
      .andWhere('matchingRefuseReason.teamId = :teamId', { teamId })
      .getOne();

    return matchingRefuseReason;
  }
}
