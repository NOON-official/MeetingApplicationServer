import { MatchingRound } from './../matchings/constants/matching-round';
import { CreateTeamDto } from './dtos/create-team.dto';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TeamsRepository } from './repositories/teams.repository';
import { UsersService } from 'src/users/users.service';
import { UserTeam } from 'src/users/interfaces/user-team.interface';
import { TeamStatus } from './entities/team-status.enum';
import { TeamGender } from './entities/team-gender.enum';

@Injectable()
export class TeamsService {
  constructor(
    private teamsRepository: TeamsRepository,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async createTeam(createTeamDto: CreateTeamDto, userId: number): Promise<void> {
    const {
      gender,
      memberCount,
      universities,
      areas,
      intro,
      drink,
      prefSameUniversity,
      prefAge,
      prefVibes,
      availableDates,
      members,
    } = createTeamDto;

    const user = await this.usersService.getUserById(userId);

    // 팀 정보 저장
    const { teamId } = await this.teamsRepository.createTeam(
      { gender, memberCount, universities, areas, intro, drink, prefSameUniversity, prefAge, prefVibes },
      user,
    );

    const team = await this.teamsRepository.getTeamById(teamId);

    // 팀 가능 날짜 저장
    await this.teamsRepository.createTeamAvailableDate(availableDates, team);

    // 팀 멤버 저장
    await this.teamsRepository.createTeamMember(members, team);
  }

  // 신청 내역 조회
  async getTeamsByUserId(userId: number): Promise<{ teams: UserTeam[] }> {
    const { teamsWithMatching } = await this.teamsRepository.getTeamsByUserId(userId);
    const teams = teamsWithMatching.map((t) => ({
      id: t.id,
      memberCount: t.memberCount,
      createdAt: t.createdAt,
      chatCreatedAt: (t.maleTeamMatching || t.femaleTeamMatching)?.chatCreatedAt ?? null,
    }));

    return { teams };
  }

  async getTeamIdByUserId(userId: number): Promise<{ teamId: number }> {
    return this.teamsRepository.getTeamIdByUserId(userId);
  }

  async getMembersCountOneWeek(): Promise<{ memberCount: number }> {
    return this.teamsRepository.getMembersCountOneWeek();
  }

  async getTeamsCountByStatusAndMembercountAndGender(
    status: TeamStatus.applied,
    membercount: '2' | '3',
    gender: TeamGender,
  ): Promise<{ teamCount: number }> {
    let { teamCount } = await this.teamsRepository.getTeamsCountByStatusAndMembercountAndGender(
      status,
      membercount,
      gender,
    );

    // 최소 팀 수 미만인 경우 OR 최대 팀 수 이상인 경우 값 조정
    if (teamCount < MatchingRound.MIN_TEAM) teamCount = MatchingRound.MIN_TEAM;
    if (teamCount > MatchingRound.MAX_TEAM) teamCount = MatchingRound.MAX_TEAM;

    return { teamCount };
  }
}
