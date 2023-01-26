import { CreateMemberDto } from './../dtos/create-team.dto';
import { CreateTeam } from './../interfaces/create-team.interface';
import { TeamMember } from './../entities/team-member.entity';
import { TeamAvailableDate } from './../entities/team-available-date.entity';
import { Team } from './../entities/team.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

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
  async getTeamByTeamId(teamId: number): Promise<Team> {
    const team = this.findOneBy({ id: teamId });
    return team;
  }

  // 팀 가능 날짜 저장
  async createTeamAvailableDate(teamAvailableDate: Date[], team: Team): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(TeamAvailableDate)
      .values(
        teamAvailableDate.map((date) => {
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
}
