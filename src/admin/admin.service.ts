import { InvitationsService } from './../invitations/invitations.service';
import { UsersService } from 'src/users/users.service';
import { AdminGetMatchingDto } from './dtos/admin-get-matching.dto';
import { MatchingsService } from './../matchings/matchings.service';
import { TeamsService } from './../teams/teams.service';
import { Injectable } from '@nestjs/common';
import { AdminGetTeamDto } from './dtos/admin-get-team.dto';
import { TeamGender } from 'src/teams/entities/team-gender.enum';
import { MatchingStatus } from 'src/matchings/interfaces/matching-status.enum';
import { AdminGetUserDto } from './dtos/admin-get-user.dto';
import { AdminGetInvitationSuccessUserDto } from './dtos/admin-get-invitation-success-user.dto';
import * as Universities from '../teams/constants/universities.json';
import { AREA_IGNORE_ID } from 'src/teams/constants/areas';
import { Matching } from 'src/matchings/entities/matching.entity';

@Injectable()
export class AdminService {
  constructor(
    private teamsService: TeamsService,
    private matchingsService: MatchingsService,
    private usersService: UsersService,
    private invitationsService: InvitationsService,
  ) {}

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

  async saveChatCreatedAtByMatchingId(matchingId: number): Promise<void> {
    return this.matchingsService.saveChatCreatedAtByMatchingId(matchingId);
  }

  async getAllUsers(): Promise<{ users: AdminGetUserDto[] }> {
    return this.usersService.getAllUsers();
  }

  async getInvitationSuccessUsers(): Promise<{ users: AdminGetInvitationSuccessUserDto[] }> {
    return this.usersService.getInvitationSuccessUsers();
  }

  async deleteInvitationSuccessByUserId(userId: number): Promise<void> {
    return this.invitationsService.deleteInvitationSuccessByUserId(userId);
  }

  async doMatching(): Promise<void> {
    const memberCounts: ('2' | '3')[] = ['2', '3'];
    const { maxRound } = await this.teamsService.getMaxRound();

    for (const memberCount of memberCounts) {
      // 1. 현재 라운드의 팀 가져오기 (매칭 3회 미만)
      // 2. 남/녀 팀으로 구분
      const { teams: maleTeams } = await this.teamsService.getTeamsByStatusAndMembercountAndGender(
        MatchingStatus.APPLIED,
        memberCount,
        TeamGender.male,
      );
      const maleTeamCount = maleTeams.length;
      const { teams: femaleTeams } = await this.teamsService.getTeamsByStatusAndMembercountAndGender(
        MatchingStatus.APPLIED,
        memberCount,
        TeamGender.female,
      );
      const femaleTeamCount = femaleTeams.length;

      const univIdToGrade = (id: number) => Universities.find((u) => u.id === id)?.grade;

      const matchings: Matching[] = [];
      const failedFemaleTeamIds: number[] = [];

      for (const femaleTeam of femaleTeams) {
        // 3. 대학 레벨 매칭 (동일대학 거부 여부 확인, 가장 높은 대학 기준)
        // 여성팀 기준으로 1 낮거나 이상인 대학 필터링
        const maxUnivLevel = Math.max(...femaleTeam.universities?.map(univIdToGrade));
        const univMatched = maleTeams.filter((maleTeam) => {
          if (femaleTeam.prefSameUniversity) {
            const hasSameUniv = maleTeam.universities.some((id) => femaleTeam.universities.includes(id));
            if (hasSameUniv) {
              return false;
            }
          }
          const maleUnivLevel = Math.max(...maleTeam.universities?.map(univIdToGrade));
          return maleUnivLevel >= maxUnivLevel - 1;
        });
        if (univMatched.length === 0) {
          console.log('Failed at University Match : ' + femaleTeam.teamId);
          failedFemaleTeamIds.push(femaleTeam.teamId);
          continue;
        }

        // 4. 선호 지역 매칭
        const areaMatched = univMatched.filter((maleTeam) => {
          return maleTeam.areas.some((area) => {
            // 상관없음의 경우
            if (area === AREA_IGNORE_ID) {
              return true;
            }
            return femaleTeam.areas.includes(area);
          });
        });
        if (areaMatched.length === 0) {
          console.log('Failed at Area Match : ' + femaleTeam.teamId);
          failedFemaleTeamIds.push(femaleTeam.teamId);
          continue;
        }

        // 5. 날짜 매칭
        const availableDates = await this.teamsService.getAvailableDates(femaleTeam.teamId);
        const dateMatchPromises = areaMatched.map(async (maleTeam) => {
          const maleAvailDates = await this.teamsService.getAvailableDates(maleTeam.teamId);
          return maleAvailDates.some((d) => availableDates.includes(d));
        });
        const dateMatchResults = await Promise.all(dateMatchPromises);
        const dateMatched = areaMatched.filter((_, i) => dateMatchResults[i]);
        if (dateMatched.length === 0) {
          console.log('Failed at Date Match : ' + femaleTeam.teamId);
          failedFemaleTeamIds.push(femaleTeam.teamId);
          continue;
        }

        // 6. 주량 레벨 매칭 (절대값 차이가 4 미만이도록)
        const drinkMatched = dateMatched.filter((maleTeam) => {
          return Math.abs(femaleTeam.drink - maleTeam.drink) < 4;
        });
        if (drinkMatched.length === 0) {
          console.log('Failed at Drink Match : ' + femaleTeam.teamId);
          failedFemaleTeamIds.push(femaleTeam.teamId);
          continue;
        }

        // 7. 나이 매칭 (서로의 선호 나이에 상대방 나이 매칭)
        const matched = drinkMatched.filter((maleTeam) => {
          if (femaleTeam.prefAge[0] <= maleTeam.averageAge && femaleTeam.prefAge[1] >= maleTeam.averageAge) {
            if (maleTeam.prefAge[0] <= femaleTeam.averageAge && maleTeam.prefAge[1] >= femaleTeam.averageAge) {
              return true;
            }
          }
          return false;
        });
        if (matched.length === 0) {
          console.log('Failed at Age Match : ' + femaleTeam.teamId);
          failedFemaleTeamIds.push(femaleTeam.teamId);
          continue;
        }

        // 매칭된 팀 연결
        if (matched.length > 0) {
          const maleTeam = matched[0];
          const matching = new Matching();
          matching.maleTeamId = maleTeam.teamId;
          matching.femaleTeamId = femaleTeam.teamId;

          matchings.push(matching);

          const deleteIndex = maleTeams.indexOf(maleTeam);
          maleTeams.splice(deleteIndex, 1);
        }
      }

      await this.matchingsService.saveMatchings(matchings);

      console.log(
        `${memberCount}:${memberCount}매칭 - 남 : ${maleTeamCount} / 여 : ${femaleTeamCount} / 성공 : ${matchings.length}쌍`,
      );
      // 남은 팀들 라운드 업데이트
      const failedMaleTeamIds = maleTeams.map((t) => t.teamId);
      await this.teamsService.updateCurrentRound([...failedMaleTeamIds, ...failedFemaleTeamIds], maxRound + 1);
    }
  }
}
