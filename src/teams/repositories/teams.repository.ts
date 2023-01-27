import { CreateMemberDto } from './../dtos/create-team.dto';
import { CreateTeam } from './../interfaces/create-team.interface';
import { TeamMember } from './../entities/team-member.entity';
import { TeamAvailableDate } from './../entities/team-available-date.entity';
import { Team } from './../entities/team.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { FindOptionsUtils, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserTeam } from 'src/users/interfaces/user-team.interface';

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
    const team = this.findOneBy({ id: teamId });
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
}
