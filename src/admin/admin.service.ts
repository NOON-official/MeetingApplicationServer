import { AdminGetMatchingDto } from './dtos/admin-get-matching.dto';
import { MatchingsService } from './../matchings/matchings.service';
import { TeamsService } from './../teams/teams.service';
import { Injectable } from '@nestjs/common';
import { AdminGetTeamDto } from './dtos/admin-get-team.dto';
import { TeamGender } from 'src/teams/entities/team-gender.enum';
import { MatchingStatus } from 'src/matchings/interfaces/matching-status.enum';

@Injectable()
export class AdminService {
  constructor(private teamsService: TeamsService, private matchingsService: MatchingsService) {}

  async deleteTeamByTeamId(teamId: number): Promise<void> {
    return this.teamsService.deleteTeamById(teamId);
  }

  async deleteMatchingByMatchingId(matchingId: number): Promise<void> {
    return this.matchingsService.deleteMatchingById(matchingId);
  }

  async getTeamsByStatusAndMembercountAndGender(
    status: MatchingStatus,
    membercount: '2' | '3',
    gender: TeamGender,
  ): Promise<{ teams: AdminGetTeamDto[] }> {
    return this.teamsService.getTeamsByStatusAndMembercountAndGender(status, membercount, gender);
  }

  async getMatchingsByStatus(status: MatchingStatus): Promise<{ matchings: AdminGetMatchingDto[] }> {
    return this.matchingsService.getMatchingsByStatus(status);
  }
}
