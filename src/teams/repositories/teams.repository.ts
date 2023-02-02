import { CreateMemberDto } from './../dtos/create-team.dto';
import { CreateTeam } from './../interfaces/create-team.interface';
import { TeamMember } from './../entities/team-member.entity';
import { TeamAvailableDate } from './../entities/team-available-date.entity';
import { Team } from './../entities/team.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { TeamStatus } from '../entities/team-status.enum';
import { TeamGender } from '../entities/team-gender.enum';
import { MatchingRound } from 'src/matchings/constants/matching-round';
import { UpdateTeam } from '../interfaces/update-team.interface';

@CustomRepository(Team)
export class TeamsRepository extends Repository<Team> {
  // 최대 라운드 조회
  async getMaxRound(): Promise<{ maxRound: number }> {
    let { maxRound } = await this.createQueryBuilder('team').select('MAX(team.currentRound)', 'maxRound').getRawOne();

    if (!maxRound) {
      maxRound = 0;
    }

    return { maxRound };
  }

  // 팀 정보 저장
  async createTeam(teamData: CreateTeam, user: User): Promise<{ teamId: number }> {
    const { maxRound } = await this.getMaxRound();

    const result = await this.createQueryBuilder()
      .insert()
      .into(Team)
      .values({
        ...teamData,
        startRound: maxRound,
        currentRound: maxRound,
        user,
      })
      .execute();
    return { teamId: result.identifiers[0].id };
  }

  // 팀 정보 조회
  async getTeamById(teamId: number): Promise<Team> {
    const team = this.findOne({
      where: {
        id: teamId,
      },
      withDeleted: true,
    });
    return team;
  }

  // 팀 가능 날짜 저장
  async createTeamAvailableDate(teamAvailableDates: Date[], team: Team): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(TeamAvailableDate)
      .values(
        teamAvailableDates.map((date) => {
          return { teamAvailableDate: date, team };
        }),
      )
      .execute();
  }

  // 팀 멤버 저장
  async createTeamMember(members: CreateMemberDto[], team: Team): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(TeamMember)
      .values(
        members.map((m) => {
          return { ...m, team };
        }),
      )
      .execute();
  }

  // 유저 신청 내역 조회
  async getTeamsByUserId(userId: number): Promise<{ teamsWithMatching: Team[] }> {
    // 팀 성별 가져오기
    const { gender: teamGender } = await this.createQueryBuilder('team')
      .select('team.gender')
      .where('team.ownerId = :userId', { userId })
      .withDeleted()
      .getOne();

    // 팀 + 매칭 기록 조회
    const teamsWithMatching = await this.createQueryBuilder('team')
      .leftJoinAndSelect(teamGender === 1 ? 'team.maleTeamMatching' : 'team.femaleTeamMatching', 'matching')
      .where('team.ownerId = :userId', { userId })
      .withDeleted()
      .getMany();

    return { teamsWithMatching };
  }

  async getTeamIdByUserId(userId: number): Promise<{ teamId: number }> {
    const result = await this.createQueryBuilder('team')
      .select('team.id')
      .where('team.ownerId = :userId', { userId })
      .getOne();

    const teamId = result?.id || null;

    return { teamId };
  }

  async getMembersCountOneWeek(): Promise<{ memberCount: number }> {
    let { memberCount } = await this.createQueryBuilder('team')
      .select('SUM(team.memberCount) AS memberCount')
      .where('DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= team.createdAt')
      .withDeleted()
      .getRawOne();

    memberCount ? (memberCount = Number(memberCount)) : (memberCount = 0);

    return { memberCount };
  }

  async getTeamsCountByStatusAndMembercountAndGender(
    status: TeamStatus.applied,
    membercount: '2' | '3',
    gender: TeamGender,
  ): Promise<{ teamCount: number }> {
    const qb = this.createQueryBuilder('team');

    // 인원수 & 성별 필터링
    qb.leftJoinAndSelect(`team.${gender}TeamMatching`, 'matching')
      .where('memberCount = :membercount', { membercount })
      .andWhere('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 });

    // 매칭 신청자인 경우
    if (status === TeamStatus.applied) {
      // 매칭 정보 X
      qb.andWhere('matching.id IS NULL');
      // 매칭 실패 횟수 3회 미만
      qb.andWhere('team.currentRound - team.startRound < :maxTrial', { maxTrial: MatchingRound.MAX_TRIAL });
    }

    const teamCount = await qb.getCount();

    return { teamCount };
  }

  async updateTeam(teamId: number, teamData: UpdateTeam): Promise<void> {
    await this.createQueryBuilder().update(Team).set(teamData).where('id = :teamId', { teamId }).execute();
  }

  async deleteTeamAvailableDateByTeamId(teamId: number): Promise<void> {
    await this.createQueryBuilder('team-available-date')
      .delete()
      .from(TeamAvailableDate)
      .where('teamId = :teamId', { teamId })
      .execute();
  }

  async deleteTeamMemberByTeamId(teamId: number): Promise<void> {
    await this.createQueryBuilder('team-available-date')
      .delete()
      .from(TeamMember)
      .where('teamId = :teamId', { teamId })
      .execute();
  }

  async deleteTeamByTeamId(teamId: number): Promise<void> {
    await this.createQueryBuilder('team').softDelete().from(Team).where('id = :teamId', { teamId }).execute();
  }
}
