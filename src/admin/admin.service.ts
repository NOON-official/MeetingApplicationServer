import { MatchingsService } from './../matchings/matchings.service';
import { TeamsService } from './../teams/teams.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(private teamsService: TeamsService, private matchingsService: MatchingsService) {}

  async deleteTeamByTeamId(teamId: number): Promise<void> {
    return this.teamsService.deleteTeamById(teamId);
  }

  async deleteMatchingByMatchingId(matchingId: number): Promise<void> {
    return this.matchingsService.deleteMatchingById(matchingId);
  }
}
