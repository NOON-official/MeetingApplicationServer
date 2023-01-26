import { CreateTeamDto } from './dtos/create-team.dto';
import { Injectable } from '@nestjs/common';
import { TeamsRepository } from './repositories/teams.repository';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TeamsService {
  constructor(private teamsRepository: TeamsRepository, private usersService: UsersService) {}

  async createTeam(createTeamDto: CreateTeamDto, userId: number): Promise<void> {
    const {
      gender,
      memberCount,
      university,
      area,
      intro,
      drink,
      prefSameUniversity,
      prefMinAge,
      prefMaxAge,
      prefVibe,
      availableDate,
      members,
    } = createTeamDto;

    const user = await this.usersService.getUserById(userId);

    // 팀 정보 저장
    const { teamId } = await this.teamsRepository.createTeam(
      { gender, memberCount, university, area, intro, drink, prefSameUniversity, prefMinAge, prefMaxAge, prefVibe },
      user,
    );

    const team = await this.teamsRepository.getTeamByTeamId(teamId);

    // 팀 가능 날짜 저장
    await this.teamsRepository.createTeamAvailableDate(availableDate, team);

    // 팀 멤버 저장
    await this.teamsRepository.createTeamMember(members, team);
  }
}
