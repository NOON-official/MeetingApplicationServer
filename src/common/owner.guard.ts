import { MatchingsService } from './../matchings/matchings.service';
import { TeamsService } from './../teams/teams.service';
import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common';

@Injectable()
// 팀 소유자에 따라 접근 허용
export class OwnerGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => TeamsService))
    private teamsService: TeamsService,
    @Inject(forwardRef(() => MatchingsService))
    private matchingsService: MatchingsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (!req.user || !req.params?.teamId) {
      return true;
    }

    const userId = req.user.sub;
    const teamId = Number(req.params.teamId);

    const team = await this.teamsService.getTeamById(teamId);

    // 1. 해당 팀 소유자인 경우 접근 가능
    if (team.user.id === userId) {
      return true;
    }
    // 2. GET request이고, 매칭 상대팀인 경우 접근 가능
    else if (req.method === 'GET') {
      const matching = await this.matchingsService.getMatchingByTeamId(teamId);

      if (!!matching) {
        const ourteamId = matching.maleTeam.id === teamId ? matching.femaleTeam.id : matching.maleTeam.id;

        const ourteam = await this.teamsService.getTeamById(ourteamId);

        if (ourteam.user.id === userId) {
          return true;
        }
      }
    }
  }
}
