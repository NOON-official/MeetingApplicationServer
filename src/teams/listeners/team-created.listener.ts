import { MatchingRound } from 'src/matchings/constants/matching-round';
import { AdminService } from '../../admin/admin.service';
import { TeamsService } from '../teams.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MatchingStatus } from 'src/matchings/interfaces/matching-status.enum';
import { TeamGender } from '../entities/team-gender.enum';

@Injectable()
export class TeamCreatedListener {
  constructor(
    @Inject(forwardRef(() => AdminService))
    private adminService: AdminService,
    private teamsService: TeamsService,
  ) {}

  // 팀 정보 저장 시 현재 신청팀 수 확인 후 매칭 알고리즘 실행
  @OnEvent('team.created')
  async handleTeamCreatedEvent() {
    const { teamCount: male2 } = await this.teamsService.getTeamsCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '2',
      TeamGender.male,
    );
    const { teamCount: female2 } = await this.teamsService.getTeamsCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '2',
      TeamGender.female,
    );
    const { teamCount: male3 } = await this.teamsService.getTeamsCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '3',
      TeamGender.male,
    );
    const { teamCount: female3 } = await this.teamsService.getTeamsCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '3',
      TeamGender.female,
    );

    // 2:2, 3:3 남녀 신청팀 수를 모두 채운 경우 매칭 알고리즘 실행
    if (
      male2 >= MatchingRound.MAX_TEAM &&
      female2 >= MatchingRound.MAX_TEAM &&
      male3 >= MatchingRound.MAX_TEAM &&
      female3 >= MatchingRound.MAX_TEAM
    ) {
      await this.adminService.doMatching();
    }
  }
}
