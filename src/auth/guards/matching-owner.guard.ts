import { UsersService } from 'src/users/users.service';
import { MatchingsService } from '../../matchings/matchings.service';
import { TeamsService } from '../../teams/teams.service';
import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common';

@Injectable()
// 매칭/팀 소유자에 따라 접근 허용
export class MatchingOwnerGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => TeamsService))
    private teamsService: TeamsService,
    @Inject(forwardRef(() => MatchingsService))
    private matchingsService: MatchingsService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (!req.user || !req.params?.matchingId) {
      return true;
    }

    const userId = req.user.sub;
    const matchingId = Number(req.params.matchingId);

    const matching = await this.matchingsService.getMatchingById(matchingId);

    if (!matching) {
      return true;
    }

    // teamId가 있는 경우
    if (!!req.params?.teamId) {
      const teamId = Number(req.params.teamId);
      const team = await this.teamsService.getTeamById(teamId);

      // 본인팀이고, 매칭 내 teamId와 일치하는 경우 접근 허용
      if (team?.user.id === userId && (matching.appliedTeam.id === teamId || matching.receivedTeam.id === teamId)) {
        return true;
      }
    }
    // matchingId만 있는 경우
    else {
      const { teamId } = await this.usersService.getTeamIdByUserId(userId);

      // 매칭 내 teamId와 유저의 teamId가 일치하는 경우 접근 허용
      if (matching.appliedTeam.id === teamId || matching.receivedTeam.id === teamId) {
        return true;
      }
    }
  }
}
