import { TeamsService } from './../teams/teams.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(private teamsService: TeamsService) {}

  async deleteTeamByTeamId(teamId: number): Promise<void> {
    return this.teamsService.deleteTeamByTeamId(teamId);
  }
}
